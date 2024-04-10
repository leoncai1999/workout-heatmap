const express = require("express");
const app = express();
const axios = require("axios");
const utils = require("./utils");
const PORT = 3001;

app.get("/activities/:athlete_id/:access_token", async (req, res) => {
  const ACTIVITY_BATCH_SIZE = 200;
  const FEET_IN_MILE = 1609.344;
  const FEET_IN_METER = 3.28084;

  var num_core_activities = 0;
  var min_activity_batches = 0;
  var all_activities = [];

  /*
    We can't directly deterimine the total number of Strava activities an athlete has. But
    we can determine the lowest possible total by adding up all their run, bike, and swim
    activities from the stats endpoint. This gives a baseline for how many times to hit the
    activities endpoint
  */
  var athlete_stats = await axios.get(
    `https://www.strava.com/api/v3/athletes/${req.params.athlete_id}/stats`,
    {
      params: {
        access_token: req.params.access_token,
      },
    }
  );
  athlete_stats = athlete_stats.data;

  /*
    The activities endpoint only lets us retrieve 200 activities per call. So at minimum.
    we need to call it (num_core_activities/200) times. And we round up as the last batch
    is likely not full but still has necessary info
  */
  num_core_activities =
    athlete_stats["all_run_totals"]["count"] +
    athlete_stats["all_ride_totals"]["count"] +
    athlete_stats["all_swim_totals"]["count"];
  min_activity_batches = Math.ceil(num_core_activities / ACTIVITY_BATCH_SIZE);

  /*
    We run all requests to the activities endpoint at the same time rather than sequentially
    to save time as these requests can be slow. The .all() wrapper will ensure that even
    if the different requests finish at different times, the order will be preserved
  */
  var activity_requests = [];
  for (let i = 1; i <= min_activity_batches; i++) {
    activity_requests.push(
      axios.get("https://www.strava.com/api/v3/athlete/activities?", {
        params: {
          per_page: ACTIVITY_BATCH_SIZE,
          page: i,
          access_token: req.params.access_token,
        },
      })
    );
  }

  var activity_results = await axios.all(activity_requests);

  /*
    If the last batch of activities is full, most likely at least another batch must be fetched.
    This can occur as the stats endpoint does not tell us the number of non-core acitivies
    (ex. hiking, rowing, etc) that are present
  */
  while (
    activity_results &&
    activity_results[min_activity_batches - 1].data.length ===
      ACTIVITY_BATCH_SIZE
  ) {
    min_activity_batches += 1;
    var additional_batch = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities?",
      {
        params: {
          per_page: ACTIVITY_BATCH_SIZE,
          page: min_activity_batches,
          access_token: req.params.access_token,
        },
      }
    );

    if (additional_batch && additional_batch.data.length > 0) {
      activity_results.push(additional_batch);
    } else {
      break;
    }
  }

  activity_results.forEach((resp) => {
    all_activities.push(...resp.data);
  });

  /*
    The strava athletes endpoints provides various additional properties we don't need
  */
  all_activities = utils.removeUnwantedFields(all_activities);

  /*
    Metric to imperial conversions
  */
  for (let i = 0; i < all_activities.length; i++) {
    let activity = all_activities[i];

    all_activities[i]["distance"] = activity["distance"] / FEET_IN_MILE;
    all_activities[i]["total_elevation_gain"] =
      activity["total_elevation_gain"] * FEET_IN_METER;

    let time_and_date = all_activities[i]["start_date_local"];
    let date = time_and_date.substring(0, time_and_date.indexOf("T"));
    let year = date.substring(0, 4);
    let day_month = date.substring(5, date.length);

    all_activities[i]["formatted_start_date"] = day_month + "-" + year;
    all_activities[i]["formatted_start_time"] = utils.formatMilitaryTime(
      time_and_date.substring(
        time_and_date.indexOf("T") + 1,
        time_and_date.indexOf("T") + 6
      )
    );

    all_activities[i]["start_hour"] = parseInt(time_and_date.split(":")[0].slice(-2));
    all_activities[i]["day_of_week"] = new Date(time_and_date).getDay();

    if (all_activities[i]["moving_time"].toString().match(/^[0-9]+$/) != null) {
      all_activities[i]["pace"] = utils.formatPace(
        activity["moving_time"],
        activity["distance"]
      );
      all_activities[i]["formatted_moving_time"] = utils.formatDuration(
        activity["moving_time"]
      );
      all_activities[i]["formatted_elapsed_time"] = utils.formatDuration(
        activity["elapsed_time"]
      );
    }

    if (all_activities[i]["max_heartrate"] === undefined) {
      all_activities[i]["max_heartrate"] = "N/A";
    }

    if (all_activities[i]["average_heartrate"] === undefined) {
      all_activities[i]["average_heartrate"] = "N/A";
    }
  }

  all_activities = utils.addCitiesToActivities(all_activities);

  res.json(all_activities);
});

app.listen(PORT, () => {
  console.log("Server started on port 3001");
});
