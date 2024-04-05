import React, { Component } from "react";
import Navigation from "../Components/Navigation";
import MapScreen from "../Images/map_screen.png";
import GithubIcon from "../Icons/github.svg";
import StravaIcon from "../Icons/strava.svg";
import MailIcon from "../Icons/mail.svg";
import Branding from "../Images/powered_by_strava.png";
import "../Styles/About.css";

class About extends Component {
  componentDidMount() {
    document.body.style.background = "#e8e1eb";
  }

  render() {
    return (
      <div>
        <Navigation />
        <h1 className="about-header">About</h1>
        <img class="screenshot" src={MapScreen}></img>
        <p className="about-description">
          Workout Heatmap provides additional insights on your Strava activites
          including an interactive map of everywhere that you've exercised, and
          statistics describing when, where and how you workout. The data is
          retrieved by connecting your Strava account, and none of your data is
          uploaded externally to any servers. Additionally, you may revoke
          access to your Strava account at any time.
        </p>
        <p className="about-description">
          The Heatmap will only show workouts recorded with a GPS enabled device
          such as a Garmin or Apple Watch. The Statistics page however will
          include information regarding both GPS and non-GPS recorded
          activities. Enabling access to private workout activites is optional,
          but can provide additional data for the Heatmap and statistics page.
          Enabling access to your complete Strava Data will show Statistics
          information regarding Heart Rate zones and estimated workout
          intensity.
        </p>
        <p className="about-description">
          This web app is built with React and the Strava API, is completely
          free to use, and the code is publicly available on GitHub with more
          details on how to replicate this project. If you have suggestions for
          new features that should be added or issues that need to be fixed,
          please feel free to reach out to me via email!
        </p>
        <div className="icon-container">
          <a
            href="https://github.com/leoncai1999/workout-heatmap"
            target="_blank"
          >
            <div className="link">
              <img class="icon" src={GithubIcon}></img>
              <p className="icon-text">Github Repo</p>
            </div>
          </a>
          <a
            href="https://developers.strava.com/docs/reference/"
            target="_blank"
          >
            <div className="link">
              <img class="icon" src={StravaIcon}></img>
              <p className="icon-text">Strava API</p>
            </div>
          </a>
          <a href={"mailto:leoncai197@gmail.com"}>
            <div className="link">
              <img class="icon" src={MailIcon}></img>
              <p className="icon-text">Email Me</p>
            </div>
          </a>
        </div>
        <div id="branding">
          <img src={Branding} />
        </div>
      </div>
    );
  }
}

export default About;
