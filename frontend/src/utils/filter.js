import { getActivityMemberType, getActivityTimeOfDay } from "./get";

export const filterActivities = (filterType, filterValue, activities) => {
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

  return activities;
};