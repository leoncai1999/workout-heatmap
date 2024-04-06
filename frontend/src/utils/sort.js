export const sortDates = (a, b, order) => {
  let b_month = parseInt(b.split("-")[0]);
  let b_day = parseInt(b.split("-")[1]);
  let b_year = parseInt(b.split("-")[2]);
  let a_month = parseInt(a.split("-")[0]);
  let a_day = parseInt(a.split("-")[1]);
  let a_year = parseInt(a.split("-")[2]);

  if (order === "asc") {
    return b_year - a_year || b_month - a_month || b_day - a_day;
  } else {
    return a_year - b_year || a_month - b_month || a_day - b_day;
  }
};

export const sortTimesOfDay = (a, b, order) => {
  var b_hour = parseInt(b.split(":")[0]);
  let b_minutes = parseInt(b.split(":")[1].substring(0, 2));
  let b_am_pm = b.split(":")[1].substring(3, 5);
  var a_hour = parseInt(a.split(":")[0]);
  let a_minutes = parseInt(a.split(":")[1].substring(0, 2));
  let a_am_pm = a.split(":")[1].substring(3, 5);

  if (b_am_pm === "PM" && b_hour !== 12) {
    b_hour += 12;
  }

  if (a_am_pm === "PM" && a_hour !== 12) {
    a_hour += 12;
  }

  /* Earliest runs shown begin as early as 4 AM. Latest runs
    shown begin as late as 3:59 AM */
  if ((b_hour < 4 || b_hour === 12) && b_am_pm === "AM") {
    b_hour += b_hour === 12 ? 12 : 24;
  }

  if ((a_hour < 4 || a_hour === 12) && a_am_pm === "AM") {
    a_hour += a_hour === 12 ? 12 : 24;
  }

  return order === "asc"
    ? b_hour - a_hour || b_minutes - a_minutes
    : a_hour - b_hour || a_minutes - b_minutes;
};

export const sortDuration = (a, b, order) => {
  var b_hours = 0;
  var b_minutes = 0;
  var b_seconds = 0;
  var a_hours = 0;
  var a_minutes = 0;
  var a_seconds = 0;

  if (b.split(":").length === 3) {
    b_hours = parseInt(b.split(":")[0]);
    b_minutes = parseInt(b.split(":")[1]);
    b_seconds = parseInt(b.split(":")[2]);
  } else {
    b_minutes = parseInt(b.split(":")[0]);
    b_seconds = parseInt(b.split(":")[1]);
  }
  if (a.split(":").length === 3) {
    a_hours = parseInt(a.split(":")[0]);
    a_minutes = parseInt(a.split(":")[1]);
    a_seconds = parseInt(a.split(":")[2]);
  } else {
    a_minutes = parseInt(a.split(":")[0]);
    a_seconds = parseInt(a.split(":")[1]);
  }

  if (order === "asc") {
    return b_hours - a_hours || b_minutes - a_minutes || b_seconds - a_seconds;
  } else {
    return a_hours - b_hours || a_minutes - b_minutes || a_seconds - b_seconds;
  }
};

export const sortPace = (a, b, order) => {
  let b_minutes = parseInt(b.split(":")[0]);
  let b_seconds = parseInt(b.split(":")[1].substring(0, 2));
  let a_minutes = parseInt(a.split(":")[0]);
  let a_seconds = parseInt(a.split(":")[1].substring(0, 2));

  return order === "asc"
    ? b_minutes - a_minutes || b_seconds - a_seconds
    : a_minutes - b_minutes || a_seconds - b_seconds;
};
