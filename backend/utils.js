const reverse_geocode = require('reverse-geocode');

module.exports.formatMilitaryTime = (time) => {
  var parts = time.split(':')
  var hour = parts[0]
  var minutes = parts[1]

  if (parseInt(hour) > 12) {
      return (hour - 12) + ":" + minutes + " PM"
  } else if (parseInt(hour) === 0) {
      return "12:" + minutes + " AM"
  } else if (parseInt(hour) === 12) {
      return time + " PM"
  } else if (parseInt(hour) < 10) {
      return hour.substring(1) + ":" + minutes + " AM"
  } else {
      return time + " AM"
  }
}

module.exports.formatDuration = (secs) => {
    var hours = Math.floor(secs / 3600)
    var minutes = Math.floor((secs - (hours * 3600)) / 60)
    var seconds = secs - (hours * 3600) - (minutes * 60)
    var duration = ""

    if (hours !== 0) {
        duration = hours + ":"
    }

    if (minutes !== 0 || duration !== "") {
        minutes = (minutes < 10 && duration !== "") ? "0" + minutes : String(minutes)
        duration += minutes + ":"
    }

    if (duration === "") {
        duration = seconds + "s"
    } else {
        duration += (seconds < 10) ? "0" + seconds : String(seconds)
    }

    return duration
}

module.exports.formatPace = (time, distance) => {
    let decimal_pace = (time / 60) / distance
    let remainder = decimal_pace % 1
    let minutes = Math.floor(decimal_pace)
    let seconds = Math.floor(remainder * 60)
    if (seconds < 10) {
      seconds = "0" + seconds.toFixed(0)
    } else {
      seconds = seconds.toFixed(0)
    }
    let result = minutes + ":" + seconds + " /mi"
    return result
}

/*
    The location_city and location_state values in the activities endpoint are broken so we'll use a
    reverse geocoder package to determine these values from the activity start coordinates. The package
    only works for US, Canada and Australia. We use the name of the activity's time zone city to
    to determine if it is in a supported country.
*/
module.exports.addCitiesToActivities = (activities) => {
    let supported_countries_to_timezone_cities = {
        "us": ["New_York", "Chicago", "Denver", "Los_Angeles"],
        "ca": ["St_Johns", "Toronto", "Winnipeg", "Regina", "Vancouver"],
        "au": ["Sydney", "Adelaide", "Perth"]
    }

    for (let i = 0; i < activities.length; i++) {
        let activity = activities[i]
        let activity_cords = activity["start_latlng"]

        if (activity_cords.length > 0) {
            let timezone_city = activity["timezone"].split("/").pop()

            for (const [country, timezone_cities] of Object.entries(supported_countries_to_timezone_cities)) {
                if (timezone_cities.includes(timezone_city)) {
                    let activity_location = reverse_geocode.lookup(activity_cords[0], activity_cords[1], country)

                    activities[i]["location_city"] = activity_location["city"]
                    activities[i]["location_state"] = activity_location["state_abbr"]

                    break
                }
            }
        }
    }

    return activities
}