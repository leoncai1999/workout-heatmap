import axios from "axios";

export const requestStravaPermissions = (isLocalhost) => {
  // Be sure to change the authorized callback url in the Strava API settings accordingly
  const base_url = isLocalhost
    ? "http://localhost:3000/"
    : "https://www.workoutheatmap.me/";

  // User is redirected to Strava's website to login and give site permission to access acount information
  window.location.assign(
    `https://www.strava.com/oauth/authorize?client_id=${process.env.REACT_APP_STRAVA_CLIENT_ID}&redirect_uri=${base_url}callback&response_type=code&scope=activity:read_all,profile:read_all&approval_prompt=force&state=strava`
  );
};

export const getAuthenticatedUser = async (url) => {
  let authenticatedUser = {};

  // Parse the callback URL for the authorization code
  const queryParams = new URLSearchParams(new URL(url).search);
  const code = queryParams.get("code");

  if (code) {
    try {
      // Exchange the authorization code for an access token
      const results = await axios.post(
        "https://www.strava.com/api/v3/oauth/token",
        {
          client_id: process.env.REACT_APP_STRAVA_CLIENT_ID,
          client_secret: process.env.REACT_APP_STRAVA_SECRET,
          code: code,
          grant_type: "authorization_code",
        }
      );
      authenticatedUser = results.data;
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  } else {
    console.error("Authorization code not found in the callback URL.");
  }

  return authenticatedUser;
};
