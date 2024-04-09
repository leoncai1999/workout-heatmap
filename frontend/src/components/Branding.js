import React from "react";
import PoweredByStrava from "../assets/powered_by_strava.png";
import "../styles/Heatmap.css";

function Branding() {
  return(
    <div id="branding">
      <img src={PoweredByStrava} alt="powered by strava branding" />
    </div>
  )
}

export default Branding;
