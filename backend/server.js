const express = require('express');
const app = express();
const axios = require('axios');
const reverse_geocode = require('reverse-geocode');
const PORT = 3001

app.get("/activities/:athlete_id", async (req, res) => {
  const ACTIVITY_BATCH_SIZE = 200

  var num_core_activities = 0
  var min_activity_batches = 0
  var all_activities = []

  let token = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/);
  if (token && token[1]) { 
    token = token[1]
  } else if (!token) {
    // TODO: error handling
  }

  /*
    We can't directly deterimine the total number of Strava activities an athlete has. But
    we can determine the lowest possible total by adding up all their run, bike, and swim
    activities from the stats endpoint. This gives a baseline for how many times to hit the
    activities endpoint
  */
  var athlete_stats = await axios
  .get(`https://www.strava.com/api/v3/athletes/${req.params.athlete_id}/stats`, {
    params: {
      access_token: token
    }
  })
  athlete_stats = athlete_stats.data

  /*
    The activities endpoint only lets us retrieve 200 activities per call. So at minimum.
    we need to call it (num_core_activities/200) times. And we round up as the last batch
    is likely not full but still has necessary info
  */
  num_core_activities = athlete_stats["all_run_totals"]["count"] + athlete_stats["all_ride_totals"]["count"] + athlete_stats["all_swim_totals"]["count"]
  min_activity_batches = Math.ceil(num_core_activities / ACTIVITY_BATCH_SIZE)

  /*
    We run all requests to the activities endpoint at the same time rather than sequentially
    to save time as these requests can be slow. The .all() wrapper will ensure that even
    if the different requests finish at different times, the order will be preserved
  */
  var activity_requests = []
  for (let i = 1; i <= min_activity_batches; i++) {
    activity_requests.push(
      axios.get("https://www.strava.com/api/v3/athlete/activities?", {
        params: {
          per_page: ACTIVITY_BATCH_SIZE,
          page: i,
          access_token: token
        }
      })
    )
  }

  var activity_results = await axios.all(activity_requests)

  /*
    If the last batch of activities is full, most likely at least another batch must be fetched.
    This can occur as the stats endpoint does not tell us the number of non-core acitivies
    (ex. hiking, rowing, etc) that are present
  */
  while (activity_results && activity_results[min_activity_batches - 1].data.length === ACTIVITY_BATCH_SIZE) {
    min_activity_batches += 1
    var additional_batch = await axios.get("https://www.strava.com/api/v3/athlete/activities?", {
      params: {
        per_page: ACTIVITY_BATCH_SIZE,
        page: min_activity_batches,
        access_token: token
      }
    })

    if (additional_batch && additional_batch.data.length > 0) {
      activity_results.push(additional_batch)
    } else {
      break;
    }
  }

  activity_results.forEach((resp) => {
    all_activities.push(...resp.data)
  })

  /*
    The strava athletes endpoints provides various additional properties we don't need
  */
  all_activities = all_activities
  .map(({resource_state, athlete, sport_type, start_date, timezone, utc_offset, achievement_count,
    trainer, commute, manual, private, visibility, flagged, kudos_count, comment_count, photo_count, 
    upload_id, upload_id_str, external_id, from_accepted_tag, pr_count, average_watts, max_watts, 
    weighted_average_watts, device_watts, heartrate_opt_out, display_hide_heartrate_option,
    total_photo_count, has_kudoed, ...keepAttrrs}) => keepAttrrs)

  /*
    The location_city and location_state values in the activities endpoint are broken so we'll use a
    reverse geocoder package to determine these values from the activity start coordinates. The package
    only works for US, Canada and Australia.
  */
  let supported_countries_to_abbr = {
    "United States": "us",
    "Canada": "ca",
    "Australia": "au"
  }

  for (let i = 0; i < all_activities.length; i++) {
    let activity = all_activities[i]
    if (activity["start_latlng"].length > 0) {
      if (Object.keys(supported_countries_to_abbr).includes(activity["location_country"])) {
        let activity_cords = activity["start_latlng"]
        let activity_location = reverse_geocode.lookup(activity_cords[0], activity_cords[1], supported_countries_to_abbr[activity["location_country"]])

        all_activities[i]["location_city"] = activity_location["city"]
        all_activities[i]["location_state"] = activity_location["state"]
      }
    }
  }

  res.json(all_activities)
})

app.listen(PORT, () => { console.log("Server started on port 3001")})