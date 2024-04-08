import React, { useEffect } from "react";
import { Nav } from "react-bootstrap";
import Logo from "../assets/app-logo.svg";
import StravaButton from "../assets/connect_with_strava.png";
import Branding from "../assets/powered_by_strava.png";
import { requestStravaPermissions } from "../utils/api";
import "../styles/Welcome.css";

function Landing() {
  useEffect(() => {
    document.body.style.backgroundColor = "#5dbcd2";
  }, []);

  return(
    <div>
      <img className="img-center" src={Logo} alt="app logo"></img>
      <h1> Workout Heatmap </h1>
      <h5>
        Build an interactive heatmap of your outdoor activites from your
        Strava account!
      </h5>
      <h6>
        WorkoutHeatmap.me does not collect or externally store any of your
        data
      </h6>
      <div className="button-center">
        <img
          src={StravaButton}
          onClick={(e) => {
            requestStravaPermissions("local").bind(this);
          }}
          alt="connect with strava button"
        ></img>
      </div>
      <Nav.Link href="/map-sample">
        <h6 className="demo-text"> Not a Strava user? See a demo account </h6>
      </Nav.Link>
      <div id="branding">
        <img src={Branding} alt="powered by strava branding"/>
      </div>
    </div>
  )
}

export default Landing;
