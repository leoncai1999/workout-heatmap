import { filterActivities } from "./filter";

export const getPolylines = (filterType, filterValue, activities) => {
  const decodePolyline = require("decode-google-map-polyline");

  activities = filterActivities(filterType, filterValue, activities)

  var polylines = [];

  for (let i = 0; i < activities.length; i++) {
    const polyline = activities[i]["map"]["summary_polyline"];
    polylines.push(decodePolyline(polyline));
  }

  return polylines;
};

export const getActivityMemberType = (athlete_count) => {
  if (athlete_count === 2) {
    return "Partner";
  } else if (athlete_count > 2) {
    return "Group";
  } else {
    return "Solo";
  }
};

export const getActivityTimeOfDay = (timeOfDay) => {
  let start_hour = parseInt(timeOfDay.split(":")[0].slice(-2));

  if (start_hour >= 4 && start_hour < 11) {
    return "morning";
  } else if (start_hour >= 11 && start_hour < 14) {
    return "lunch";
  } else if (start_hour >= 14 && start_hour < 17) {
    return "afternoon";
  } else if (start_hour >= 17 && start_hour < 21) {
    return "evening";
  } else {
    return "night";
  }
};

export const getCities = (activities) => {
  var cities = [];

  for (let i = 0; i < activities.length; i++) {
    let activity = activities[i];
    let city_name = activity["location"]

    if (activity["location_city"]) {
      let city_obj = cities.find((city) => city.name === city_name);

      if (city_obj) {
        city_obj["activities"] += 1;
        city_obj["miles"] += activity["distance"];
        city_obj["elevation"] += activity["total_elevation_gain"];
        city_obj["hours"] += activity["moving_time"];
      } else {
        cities.push({
          name: city_name,
          activities: 1,
          miles: activity["distance"],
          elevation: activity["total_elevation_gain"],
          hours: activity["moving_time"],
          latlng: {
            lat: activity["start_latlng"][0],
            lng: activity["start_latlng"][1],
          },
        });
      }
    }
  }

  // Sort cities by number of activites descending, breaking ties by total mileage
  cities.sort(function (a, b) {
    return b.activities - a.activities || b.miles - a.miles;
  });

  for (let i = 0; i < cities.length; i++) {
    cities[i]["id"] = i;
    cities[i]["miles"] = parseFloat(cities[i]["miles"].toFixed(2));
    cities[i]["elevation"] = parseFloat(cities[i]["elevation"].toFixed(2));
    cities[i]["hours"] = parseInt(cities[i]["hours"] / 3600);
  }

  return cities;
};

export const getCountOfEachDayOfWeek = (activities) => {
  let first_day = new Date(activities[0]["formatted_start_date"]);
  let last_day = new Date(
    activities[activities.length - 1]["formatted_start_date"]
  );
  let first_day_of_week = activities[0]["day_of_week"];

  let days_between = Math.round((last_day - first_day) / (24 * 60 * 60 * 1000));
  let weeks_between = days_between / 7;
  let leftover_days = days_between % 7;
  var week_counts = new Array(7).fill(weeks_between);
  let curr_day = first_day_of_week;
  while (leftover_days > 0) {
    if (curr_day === 7) {
      curr_day = 0;
    }
    week_counts[curr_day] += 1;
    leftover_days -= 1;
  }

  return week_counts;
};

// An activity with an average heart rate in zone 2 at least 60% intensity, zone 3 is at least 70% intensity, etc
export const getWorkoutIntensity = (heart_rate) => {
  let heart_rate_zones = JSON.parse(sessionStorage.heartRateZones);
  let workout_intensity = 0;

  for (let i = 0; i < heart_rate_zones.length; i++) {
    if (
      heart_rate <= heart_rate_zones[i]["max"] ||
      heart_rate_zones[i]["max"] === -1
    ) {
      if (i === 0) {
        workout_intensity = 50;
      } else if (i === 4) {
        workout_intensity = 100;
      } else {
        let heart_zone_range =
          heart_rate_zones[i]["max"] - heart_rate_zones[i]["min"];
        workout_intensity =
          50 +
          i * 10 +
          ((heart_rate - heart_rate_zones[i]["min"]) * 10) / heart_zone_range;
      }
      break;
    }
  }

  return workout_intensity;
};

export const getPace = (time, distance) => {
  let decimal_pace = time / 60 / distance;
  let remainder = decimal_pace % 1;
  let minutes = Math.floor(decimal_pace);
  let seconds = remainder * 60;
  if (seconds < 10) {
    seconds = "0" + seconds.toFixed(0);
  } else {
    seconds = seconds.toFixed(0);
  }
  let result = minutes + ":" + seconds + " /mi";
  return result;
};

export const getTotalHours = (activities) => {
  const totalTime = activities
    .filter((activity) => activity["moving_time"])
    .reduce((total, activity) => {
      return total + activity["moving_time"];
    }, 0);

  return (totalTime / 3600).toFixed(0);
};

export const getTotalDistance = (activities) => {
  const totalDistance = activities
    .filter((activity) => activity["distance"])
    .reduce((total, activity) => {
      return total + activity["distance"];
    }, 0);

  return totalDistance.toFixed(2);
};
