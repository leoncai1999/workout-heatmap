import { getCountOfEachDayOfWeek, getPace, getWorkoutIntensity } from "./get";

const chartColors = {
  red: { regular: "rgba(255,134,159,0.4)", border: "rgba(255,134,159,1)" },
  blue: { regular: "rgba(98,182,239,0.4", border: "rgba(98,182,239,1)" },
  green: { regular: "rgba(113,205,205,0.4)", border: "rgba(113,205,205,1)" },
  orange: { regular: "rgba(255,177,101,0.4)", border: "rgba(255,177,101,1)" },
  purple: { regular: "rgba(170,128,252,0.4)", border: "rgba(170,128,252,1)" },
  yellow: { regular: "rgba(255,218,128,0.4)", border: "rgba(255,218,128,1)" },
  grey: { regular: "rgba(201,203,207,0.4)", border: "rgba(201,203,207,1)" },
};

export const getActivitiesByYearAndMonth = (activities, lineAttr) => {
  var dataLine = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [],
  };

  activities = activities.reverse();
  let current_year = activities[0]["start_date_local"].split("-")[0];
  let year_data = new Array(12).fill(0);
  let distance_per_month = new Array(12).fill(0);
  let user_datasets = [];
  let colors = Object.keys(chartColors);
  let curr_color = 0;

  activities.forEach((activity, idx) => {
    let activity_year = activity["start_date_local"].split("-")[0];
    let activity_month =
      parseInt(activity["start_date_local"].split("-")[1]) - 1;

    if (activity_year !== current_year) {
      user_datasets = addYearData(
        user_datasets,
        year_data,
        lineAttr,
        distance_per_month,
        current_year,
        colors[curr_color]
      );

      if (curr_color === 6) {
        curr_color = 0;
      } else {
        curr_color += 1;
      }
      year_data = new Array(12).fill(0);
      distance_per_month = new Array(12).fill(0);
      current_year = activity_year;
    }

    if (lineAttr === "Distance (Miles)") {
      year_data[activity_month] += activity["distance"];
    } else if (lineAttr === "Elevation Gain (Feet)") {
      year_data[activity_month] += activity["total_elevation_gain"];
    } else if (lineAttr === "Number of Activities") {
      year_data[activity_month] += 1;
    } else {
      year_data[activity_month] += activity["moving_time"];
      distance_per_month[activity_month] += activity["distance"];
    }

    if (idx === activities.length - 1) {
      user_datasets = addYearData(
        user_datasets,
        year_data,
        lineAttr,
        distance_per_month,
        current_year,
        colors[curr_color]
      );
    }
  });

  dataLine["datasets"] = user_datasets;

  return dataLine;
};

export const addYearData = (
  user_datasets,
  year_data,
  lineAttr,
  distance_per_month,
  current_year,
  color
) => {
  for (let i = 0; i < year_data.length; i++) {
    if (year_data[i] === 0) {
      year_data[i] = NaN;
    } else if (
      lineAttr === "Distance (Miles)" ||
      lineAttr === "Elevation Gain (Feet)"
    ) {
      year_data[i] = parseFloat(year_data[i].toFixed(2));
    } else if (lineAttr === "Pace (Minutes per Mile)") {
      year_data[i] = parseFloat(
        (year_data[i] / 60 / distance_per_month[i]).toFixed(2)
      );
    }
  }

  user_datasets.push({
    label: current_year,
    fill: lineAttr !== "Pace (Minutes per Mile)",
    lineTension: 0.3,
    backgroundColor: chartColors[color]["regular"],
    borderColor: chartColors[color]["border"],
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: "miter",
    pointBorderColor: chartColors[color]["border"],
    pointBackgroundColor: chartColors[color]["border"],
    pointBorderWidth: 10,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: chartColors[color]["regular"],
    pointHoverBorderColor: chartColors[color]["border"],
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: year_data,
  });

  return user_datasets;
};

export const getActivitiesByTimeOfDay = (activities) => {
  var activities_data = {
    labels: ["12 AM"],
    datasets: [
      {
        label: "Number of Activities",
        data: new Array(24).fill(0),
        backgroundColor: [],
        borderWidth: 2,
        borderColor: [],
      },
    ],
  };

  // Initalize x-axis of hours from 12 AM to 11 PM
  var hour = 1;
  var isAM = true;

  while (hour < 12 || isAM) {
    if (hour === 12) {
      isAM = false;
    }

    activities_data["labels"].push(`${hour} ${isAM ? "AM" : "PM"}`);
    hour = hour === 12 ? 1 : hour + 1;
  }

  // Configure bar colors based on time of day
  const periodColorToLength = [
    { color: "red", length: 4 },
    { color: "blue", length: 7 },
    { color: "green", length: 3 },
    { color: "orange", length: 3 },
    { color: "purple", length: 4 },
    { color: "red", length: 4 },
  ];

  periodColorToLength.forEach((obj) => {
    for (let i = 0; i < obj["length"]; i++) {
      activities_data["datasets"][0]["backgroundColor"].push(
        chartColors[obj["color"]]["regular"]
      );
      activities_data["datasets"][0]["borderColor"].push(
        chartColors[obj["color"]]["border"]
      );
    }
  });

  // populate data on activities per hour
  activities.forEach((activity) => {
    activities_data["datasets"][0]["data"][activity["start_hour"]] += 1;
  });

  return activities_data;
};

export const getActivitiesByDayOfWeekRadar = (activities) => {
  activities = activities.reverse();
  var dataRadar = {
    labels: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    datasets: [
      {
        label: "Likelihood of Working Out",
        backgroundColor: chartColors["blue"]["regular"],
        borderColor: chartColors["blue"]["border"],
        data: [],
      },
      {
        label: "Average Intensity of Workout (based on Heart Rate)",
        backgroundColor: chartColors["red"]["regular"],
        borderColor: chartColors["red"]["border"],
        data: [],
      },
    ],
  };

  // count number of each type of day of first and last activity
  let week_counts = getCountOfEachDayOfWeek(activities);

  /* Calculate percent likelihood of working out each day. For example, likelihood of working out on
      Monday is number of Monday activities divided by number of Mondays between the two dates. Also calculate
      the average workout intensity, pace and total miles for each day. */
  var used_dates = [];
  var day_counts = new Array(7).fill(0);
  var intensity_counts = new Array(7).fill(0);
  var activity_counts = new Array(7).fill(0);

  activities.forEach((activity) => {
    if (!used_dates.includes(activity["formatted_start_date"])) {
      day_counts[activity["day_of_week"]] += 1;
      used_dates.push(activity["formatted_start_date"]);
    }

    if (activity["has_heartrate"]) {
      intensity_counts[activity["day_of_week"]] += getWorkoutIntensity(
        activity["average_heartrate"]
      );
      activity_counts[activity["day_of_week"]] += 1;
    }
  });

  for (let i = 0; i < day_counts.length; i++) {
    day_counts[i] = parseFloat(
      ((day_counts[i] / week_counts[i]) * 100).toFixed(2)
    );
    intensity_counts[i] = parseFloat(
      (intensity_counts[i] / activity_counts[i]).toFixed(2)
    );
  }

  dataRadar["datasets"][0]["data"] = day_counts;
  dataRadar["datasets"][1]["data"] = intensity_counts;

  return dataRadar;
};

export const getActivitiesByDayOfWeekTable = (activities) => {
  var day_mile_counts = [
    { id: 0, day: "Monday", miles: 0 },
    { id: 1, day: "Tuesday", miles: 0 },
    { id: 2, day: "Wednesday", miles: 0 },
    { id: 3, day: "Thursday", miles: 0 },
    { id: 4, day: "Friday", miles: 0 },
    { id: 5, day: "Saturday", miles: 0 },
    { id: 6, day: "Sunday", miles: 0 },
  ];

  var pace_times = new Array(7).fill(0);
  var pace_distances = new Array(7).fill(0);

  activities.forEach((activity) => {
    day_mile_counts[activity["day_of_week"]]["miles"] += activity["distance"];
    pace_times[activity["day_of_week"]] += activity["moving_time"];
    pace_distances[activity["day_of_week"]] += activity["distance"];
  });

  day_mile_counts.forEach((obj, idx) => {
    obj["miles"] = obj["miles"].toFixed(2);
    obj["pace"] = getPace(pace_times[idx], pace_distances[idx]);
  });

  return day_mile_counts;
};

export const getActivitiesByIntensityDoughnut = (
  activities,
  heartRateZones,
  doughnutAttr
) => {
  var dataDoughnut = {
    labels: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        hoverBackgroundColor: [],
      },
    ],
  };

  ["grey", "green", "yellow", "orange", "red"].forEach((color) => {
    dataDoughnut["datasets"][0]["backgroundColor"].push(
      chartColors[color]["regular"]
    );
    dataDoughnut["datasets"][0]["hoverBackgroundColor"].push(
      chartColors[color]["regular"]
    );
    dataDoughnut["datasets"][0]["borderColor"].push(
      chartColors[color]["border"]
    );
  });

  var zone_counts = new Array(5).fill(0);

  activities.forEach((activity) => {
    if (activity["has_heartrate"]) {
      for (let i = 0; i < heartRateZones.length; i++) {
        if (
          activity["average_heartrate"] <= heartRateZones[i]["max"] ||
          heartRateZones[i]["max"] === -1
        ) {
          if (doughnutAttr === "Number of Activities") {
            zone_counts[i] += 1;
          } else {
            zone_counts[i] += activity["moving_time"];
          }
          break;
        }
      }
    }
  });

  // converting total time in seconds to hours
  zone_counts.forEach((zone) => {
    zone = parseFloat((zone / 3600).toFixed(2));
  });

  dataDoughnut["datasets"][0]["data"] = zone_counts;

  return dataDoughnut;
};

export const getActivitiesByIntensityTable = (activities, heartRateZones) => {
  var heart_rate_zone_counts = [
    { id: 0, zone: "Zone 1: Recovery / Cross Train" },
    { id: 1, zone: "Zone 2: Endurance" },
    { id: 2, zone: "Zone 3: Tempo Run" },
    { id: 3, zone: "Zone 4: Speed Work / Distance Race" },
    { id: 4, zone: "Zone 5: Sprint" },
  ];

  var zone_time = new Array(5).fill(0);
  var zone_dist = new Array(5).fill(0);

  activities.forEach((activity) => {
    if (activity["has_heartrate"]) {
      for (let i = 0; i < heartRateZones.length; i++) {
        if (
          activity["average_heartrate"] <= heartRateZones[i]["max"] ||
          heartRateZones[i]["max"] === -1
        ) {
          zone_time[i] += activity["moving_time"];
          zone_dist[i] += activity["distance"];
          break;
        }
      }
    }
  });

  heartRateZones.forEach((zone, idx) => {
    if (idx === 4) {
      heart_rate_zone_counts[idx]["heart_rate"] = zone["min"] + "+ bpm";
    } else {
      heart_rate_zone_counts[idx]["heart_rate"] =
        zone["min"] + " to " + zone["max"] + " bpm";
    }

    heart_rate_zone_counts[idx]["intensity"] =
      50 + idx * 10 + "% to " + (50 + (idx + 1) * 10) + "%";
    heart_rate_zone_counts[idx]["pace"] =
      zone_time[idx] === 0 ? "N/A" : getPace(zone_time[idx], zone_dist[idx]);
  });

  return heart_rate_zone_counts;
};
