import React from "react";
import GithubIcon from "../assets/github.svg";
import StravaIcon from "../assets/strava.svg";
import MailIcon from "../assets/mail.svg";
import "../styles/About.css";

function IconContainer() {
  return (
    <div className="icon-container">
      <a
        href="https://github.com/leoncai1999/workout-heatmap"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="link">
          <img class="icon" src={GithubIcon} alt="github icon"></img>
          <p className="icon-text">Github Repo</p>
        </div>
      </a>
      <a
        href="https://developers.strava.com/docs/reference/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="link">
          <img class="icon" src={StravaIcon} alt="strava icon"></img>
          <p className="icon-text">Strava API</p>
        </div>
      </a>
      <a href={"mailto:leoncai197@gmail.com"}>
        <div className="link">
          <img class="icon" src={MailIcon} alt="email icon"></img>
          <p className="icon-text">Email Me</p>
        </div>
      </a>
    </div>
  );
}

export default IconContainer;
