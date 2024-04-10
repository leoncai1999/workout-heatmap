import axios from "axios";
const reverse_geocode = require("reverse-geocode");

export const getActivities = async(athlete_id, access_token) => {
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
    `https://www.strava.com/api/v3/athletes/${athlete_id}/stats`,
    {
      params: {
        access_token: access_token,
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
          access_token: access_token,
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
          access_token: access_token,
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

  return all_activities;
}

export const removeUnwantedFields = (activities) => {
  activities = activities.map(
    ({
      resource_state,
      athlete,
      sport_type,
      start_date,
      utc_offset,
      achievement_count,
      location_country,
      trainer,
      commute,
      manual,
      // private,
      visibility,
      flagged,
      kudos_count,
      comment_count,
      photo_count,
      upload_id,
      upload_id_str,
      external_id,
      from_accepted_tag,
      pr_count,
      average_watts,
      max_watts,
      weighted_average_watts,
      device_watts,
      heartrate_opt_out,
      display_hide_heartrate_option,
      total_photo_count,
      has_kudoed,
      ...keepAttrrs
    }) => keepAttrrs
  );

  return activities;
};

export const formatMilitaryTime = (time) => {
  var parts = time.split(":");
  var hour = parts[0];
  var minutes = parts[1];

  if (parseInt(hour) > 12) {
    return hour - 12 + ":" + minutes + " PM";
  } else if (parseInt(hour) === 0) {
    return "12:" + minutes + " AM";
  } else if (parseInt(hour) === 12) {
    return time + " PM";
  } else if (parseInt(hour) < 10) {
    return hour.substring(1) + ":" + minutes + " AM";
  } else {
    return time + " AM";
  }
};

export const formatDuration = (secs) => {
  var hours = Math.floor(secs / 3600);
  var minutes = Math.floor((secs - hours * 3600) / 60);
  var seconds = secs - hours * 3600 - minutes * 60;
  var duration = "";

  if (hours !== 0) {
    duration = hours + ":";
  }

  if (minutes !== 0 || duration !== "") {
    minutes = minutes < 10 && duration !== "" ? "0" + minutes : String(minutes);
    duration += minutes + ":";
  }

  if (duration === "") {
    duration = seconds + "s";
  } else {
    duration += seconds < 10 ? "0" + seconds : String(seconds);
  }

  return duration;
};

export const formatPace = (time, distance) => {
  let decimal_pace = time / 60 / distance;
  let remainder = decimal_pace % 1;
  let minutes = Math.floor(decimal_pace);
  let seconds = Math.floor(remainder * 60);
  if (seconds < 10) {
    seconds = "0" + seconds.toFixed(0);
  } else {
    seconds = seconds.toFixed(0);
  }
  let result = minutes + ":" + seconds + " /mi";
  return result;
};

/*
    The location_city and location_state values in the activities endpoint are broken so we'll use a
    reverse geocoder package to determine these values from the activity start coordinates. The package
    only works for US, Canada and Australia. We use the name of the activity's time zone city to
    to determine if it is in a supported country.
*/
export const addCitiesToActivities = (activities) => {
  let supported_countries_to_timezone_cities = {
    us: ["New_York", "Chicago", "Denver", "Los_Angeles"],
    ca: ["St_Johns", "Toronto", "Winnipeg", "Regina", "Vancouver"],
    au: ["Sydney", "Adelaide", "Perth"],
  };

  for (let i = 0; i < activities.length; i++) {
    let activity = activities[i];
    let activity_cords = activity["start_latlng"];

    if (activity_cords.length > 0) {
      let timezone_city = activity["timezone"].split("/").pop();

      for (const [country, timezone_cities] of Object.entries(
        supported_countries_to_timezone_cities
      )) {
        if (timezone_cities.includes(timezone_city)) {
          let activity_location = reverse_geocode.lookup(
            activity_cords[0],
            activity_cords[1],
            country
          );

          activities[i]["location_city"] = activity_location["city"];
          activities[i]["location_state"] = activity_location["state_abbr"];

          break;
        }
      }
    }
  }

  return activities;
};
