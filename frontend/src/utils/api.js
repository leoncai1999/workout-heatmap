export const requestStravaPermissions = (mode) => {
  // Be sure to change the authorized callback url in the Strava API settings accordingly
  const base_url = (mode === "local") ? "http://localhost:3000/" : "https://workout-heatmap.herokuapp.com/"

  // User is redirected to Strava's website to login and give site permission to access acount information
  window.location.assign(
    "https://www.strava.com/oauth/authorize?client_id=27965&redirect_uri=" +
      base_url +
      "callback&response_type=code&scope=activity:read_all,profile:read_all&approval_prompt=force&state=strava"
  );
};
