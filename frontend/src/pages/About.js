import React, { useEffect } from "react";
import Navigation from "../components/Navigation";
import IconContainer from "../components/IconContainer";
import Branding from "../components/Branding.js";
import MapScreen from "../assets/map_screen.png";
import "../styles/About.css";

function About() {
  useEffect(() => {
    document.body.style.background = "#e8e1eb";
  }, []);

  return (
    <div>
      <Navigation />
      <h1 className="about-header">About</h1>
      <img class="screenshot" src={MapScreen} alt="app screenshot of heatmap"></img>
      <p className="about-description">
        Workout Heatmap provides additional insights on your Strava activites
        including an interactive map of everywhere that you've exercised, and
        statistics describing when, where and how you workout. The data is
        retrieved by connecting your Strava account, and you can optionally
        store your data in our databases for quicker access next time.
        Additionally, you can delete your data at any time.
      </p>
      <p className="about-description">
        The Heatmap will only show workouts recorded with a GPS enabled device
        such as a Garmin or Apple Watch. The Statistics page however will
        include information regarding both GPS and non-GPS recorded activities.
        Enabling access to private workout activites is optional, but can
        provide additional data for the Heatmap and statistics page. Enabling
        access to your complete Strava Data will show Statistics information
        regarding Heart Rate zones and estimated workout intensity.
      </p>
      <p className="about-description">
        This web app is built with React and the Strava API, is completely free
        to use, and the code is publicly available on GitHub with more details
        on how to replicate this project. If you have suggestions for new
        features that should be added or issues that need to be fixed, please
        feel free to reach out to me via email!
      </p>
      <IconContainer />
      <Branding />
    </div>
  );
}

export default About;
