export const getPolylines = (filterType, filterValue, activities) => {
  const decodePolyline = require("decode-google-map-polyline");

  if (filterType === "sport") {
    activities = activities.filter(
      (activity) => activity["type"] && activity["type"] === filterValue
    );
  } else if (filterType === "workout") {
    activities = activities.filter(
      (activity) =>
        (activity["workout_type"] === 1 ? "Race" : "Training") === filterValue
    );
  } else if (filterType === "members") {
    activities = activities.filter(
      (activity) =>
        activity["athlete_count"] &&
        getActivityMemberType(activity["athlete_count"]) === filterValue
    );
  } else if (filterType === "time") {
    activities = activities.filter(
      (activity) =>
        activity["start_date_local"] &&
        getActivityTimeOfDay(activity["start_date_local"]) === filterValue
    );
  }

  var polylines = [];

  for (let i = 0; i < activities.length; i++) {
    const polyline = activities[i]["map"]["summary_polyline"];
    polylines.push(decodePolyline(polyline));
  }

  return polylines;
}

export const getActivityMemberType = (athlete_count) => {
  if (athlete_count === 2) {
    return "Partner";
  } else if (athlete_count > 2) {
    return "Group";
  } else {
    return "Solo";
  }
}

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
}

export const getCities = (activities) => {
  var cities = []

  for (let i = 0; i < activities.length; i++) {
    let activity = activities[i];
    if (activity["location_city"]) {
      let city_name =
        activity["location_city"] + ", " + activity["location_state"];

      let city_obj = cities.find(city => city.name === city_name)
      if (city_obj) {
        city_obj["count"] += 1
        city_obj["distance"] += activity["distance"]
      } else {
        cities.push(
          {
            name: city_name,
            count: 1,
            distance: activity["distance"],
            latlng: {
              lat: activity["start_latlng"][0],
              lng: activity["start_latlng"][1],
            }
          }
        )
      }
    }
  }

  // Sort cities by number of activites descending, breaking ties by total mileage
  cities.sort(function (a, b) {
    return b.count - a.count || b.distance - a.distance;
  });

  return cities;
}
