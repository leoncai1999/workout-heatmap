const reverse_geocode = require("reverse-geocode");
const cities = require("cities");

module.exports.removeUnwantedFields = (activities) => {
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
      private,
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

module.exports.formatMilitaryTime = (time) => {
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

module.exports.formatDuration = (secs) => {
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

module.exports.formatPace = (time, distance) => {
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
    only works for US. We use the name of the activity's time zone city to determin if it's in the US.
*/
module.exports.addCitiesToActivities = (activities) => {
  let us_timezones = ["New_York", "Chicago", "Denver", "Los_Angeles"];

  activities
    .filter((activity) => activity["start_latlng"])
    .forEach((activity) => {
      let timezone_city = activity["timezone"].split("/").pop();

      if (us_timezones.includes(timezone_city)) {
        let activity_location = cities.gps_lookup(
          activity["start_latlng"][0],
          activity["start_latlng"][1]
        );

        activity["location_city"] = activity_location["city"];
        activity["location_state"] = activity_location["state_abbr"];
      }
    });

  return activities;
};
