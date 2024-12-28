const express = require("express");
const mongoose = require("mongoose");
const app = express();
const axios = require("axios");
const cors = require("cors");
const utils = require("./utils");
const PORT = process.env.PORT || 3001;

const User = require("./schemas/User");
const Activity = require("./schemas/Activity");

require('dotenv').config()
const uri = process.env.MONGO_DB_URI

async function connect() {
  try {
    await mongoose.connect(uri, {
      dbName: "user-data"
    });
    console.log("Connnected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}

connect();

app.use(cors());

// Use the built-in body-parser middleware
app.use(express.json({ limit: "10mb" })); // For parsing application/json
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // For parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
  res.json("Welcome to the Workout Heatmap API");
});

app.get("/userexists/:athlete_id", async (req, res) => {
  let user = await User.findOne({ athlete_id: req.params.athlete_id })

  if (user) {
    return res.json({ exists: true })
  } else {
    return res.json({ exists: false })
  }
})

app.post("/adduser", async (req, res) => {
  const { athleteInfo, activities, heartRateZones } = req.body;

  const user = new User({
    athlete_id: athleteInfo["id"],
    username: athleteInfo["username"],
    profile: athleteInfo["profile"],
    heartRateZones: heartRateZones
  })
  await user.save();

  activities.forEach((activity) => {
    activity["user_id"] = user._id
  })
  await Activity.insertMany(activities)

  res.json("User and activities saved successfully")
})

app.get("/sampleactivities", async (req, res) => {
  let user = await User.findOne({ athlete_id: 0 })
  let activities = await Activity.find({ user_id: user._id }).sort({ 'idx': -1 })

  res.json(activities)
})

app.get("/sampleheartratezones", async (req, res) => {
  let user = await User.findOne({ athlete_id: 0 })

  res.json(user.heartRateZones)
})

app.get("/heartratezones/:athlete_id/:access_token", async (req, res) => {
  var heart_rate_zones = await axios.get(
    "https://www.strava.com/api/v3/athlete/zones?",
    {
      params: {
        access_token: req.params.access_token,
      },
    }
  );

  if (heart_rate_zones === undefined || heart_rate_zones.length === 0) {
    res.json([])
  } else {
    heart_rate_zones = heart_rate_zones["data"]["heart_rate"]["zones"]
    /*
      Keep track of the order of the heart rate zones for MongoDB
    */
    heart_rate_zones.forEach((heart_rate_zone, idx) => {
      heart_rate_zone["idx"] = idx
    })

    let user = await User.findOne({ athlete_id: req.params.athlete_id })

    if (user) {
      user.heartRateZones = heart_rate_zones
      await user.save();
    }

    res.json(heart_rate_zones)
  }
});

app.get("/deleteathlete/:athlete_id", async (req, res) => {
  // Find and delete the user
  const user = await User.findOneAndDelete({ athlete_id: req.params.athlete_id})

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const activities = await Activity.deleteMany({ user_id: user._id })

  if (activities.deletedCount > 0) {
    res.status(200).json("User and associated activities deleted successfully.")
  } else {
    res.status(404).json("No activities found for given user.")
  }
});

app.get("/activities/:athlete_id/:access_token", async (req, res) => {
  const ACTIVITY_BATCH_SIZE = 200;
  const FEET_IN_MILE = 1609.344;
  const FEET_IN_METER = 3.28084;

  var num_core_activities = 0;
  var min_activity_batches = 0;
  var saved_activities = [];
  var new_activities = [];

  var last_saved_activity_epoch = 0;

  /*
    Check if the user has already logged in before and chose to save their activities.
    If not, add that user to the database for future reference.
  */
  let user = await User.findOne({ athlete_id: req.params.athlete_id })

  if (user) {
    saved_activities = await Activity.find({ user_id: user._id }).sort({ 'idx': 1 })

    if (saved_activities.length === 0) {
      last_saved_activity_epoch = 0
    } else {
      last_saved_activity = saved_activities[saved_activities.length - 1]
      last_saved_activity_epoch = utils.getEpochTime(last_saved_activity["start_date_local"], last_saved_activity["timezone"])
    }
  }

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
    we need to call it ((num_core_activities - already saved activities)/200) times. 
    And we round up as the last batch is likely not full but still has necessary info.
  */
  num_core_activities =
    athlete_stats["all_run_totals"]["count"] +
    athlete_stats["all_ride_totals"]["count"] +
    athlete_stats["all_swim_totals"]["count"];
  num_core_activities -= saved_activities.length;
  num_core_activities = (num_core_activities < 1) ? 1 : num_core_activities;
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
          after: last_saved_activity_epoch,
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
    new_activities.push(...resp.data);
  });

  /*
    The strava athletes endpoints provides various additional properties we don't need
  */
  new_activities = utils.removeUnwantedFields(new_activities);

  /*
    Metric to imperial conversions
  */
  for (let i = 0; i < new_activities.length; i++) {
    let activity = new_activities[i];

    new_activities[i]["distance"] = activity["distance"] / FEET_IN_MILE;
    new_activities[i]["total_elevation_gain"] =
      activity["total_elevation_gain"] * FEET_IN_METER;

    let time_and_date = new_activities[i]["start_date_local"];
    let date = time_and_date.substring(0, time_and_date.indexOf("T"));
    let year = date.substring(0, 4);
    let day_month = date.substring(5, date.length);

    new_activities[i]["formatted_start_date"] = day_month + "-" + year;
    new_activities[i]["formatted_start_time"] = utils.formatMilitaryTime(
      time_and_date.substring(
        time_and_date.indexOf("T") + 1,
        time_and_date.indexOf("T") + 6
      )
    );

    new_activities[i]["start_hour"] = parseInt(
      time_and_date.split(":")[0].slice(-2)
    );
    new_activities[i]["day_of_week"] = new Date(time_and_date).getDay();

    if (new_activities[i]["moving_time"].toString().match(/^[0-9]+$/) != null) {
      new_activities[i]["pace"] = utils.formatPace(
        activity["moving_time"],
        activity["distance"]
      );
      new_activities[i]["formatted_moving_time"] = utils.formatDuration(
        activity["moving_time"]
      );
      new_activities[i]["formatted_elapsed_time"] = utils.formatDuration(
        activity["elapsed_time"]
      );
    }
  }

  new_activities = utils.addCitiesToActivities(new_activities);

  new_activities.forEach((activity, idx) => {
    activity["idx"] = idx + saved_activities.length
  })

  if (user) {
    new_activities.forEach((activity) => {
      activity["user_id"] = user._id
    })

    await Activity.insertMany(new_activities)
  }

  activities = [...saved_activities, ...new_activities];

  /*
    Once the old and new activities are combined into one array, reverse
    the full result so we return a complete list of activities from
    newest to oldest
  */
  res.json(activities.reverse());
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started at PORT ${PORT}`);
});
