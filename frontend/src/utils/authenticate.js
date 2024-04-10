import axios from "axios";

export const requestStravaPermissions = (isLocalhost) => {
  // Be sure to change the authorized callback url in the Strava API settings accordingly
  const base_url = isLocalhost
    ? "http://localhost:3000/"
    : "https://workout-heatmap-frontend.onrender.com/";

  // User is redirected to Strava's website to login and give site permission to access acount information
  window.location.assign(
    `https://www.strava.com/oauth/authorize?client_id=${process.env.REACT_APP_STRAVA_CLIENT_ID}&redirect_uri=${base_url}callback&response_type=code&scope=activity:read_all,profile:read_all&approval_prompt=force&state=strava`
  );
};

export const getAuthenticatedUser = async (url) => {
  var authenticatedUser = {};

  // Retrieve the code from the authenication process, then exchange the code for a token to access the Strava API
  const tokenized_url = url.split("/");
  if (
    tokenized_url[3] !== null &&
    tokenized_url[3].substring(0, 8) === "callback"
  ) {
    let code_and_scope = tokenized_url[3].substring(27);
    let code = code_and_scope.substring(0, code_and_scope.indexOf("&"));

    let results = await axios.post(
      "https://www.strava.com/api/v3/oauth/token?",
      {
        client_id: process.env.REACT_APP_STRAVA_CLIENT_ID,
        client_secret: process.env.REACT_APP_STRAVA_SECRET,
        code: code,
        grant_type: "authorization_code",
      }
    );

    authenticatedUser = results.data;
  }

  return authenticatedUser;
};
