import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from 'react-router-dom';
import axios from "axios";
import { Nav, Modal } from "react-bootstrap";
import Logo from "../assets/app-logo.svg";
import { Spinner } from "react-bootstrap";
import StravaButton from "../assets/connect_with_strava.png";
import Branding from "../components/Branding.js";
import { getCities } from "../utils/get.js";
import { requestStravaPermissions, getAuthenticatedUser } from "../utils/authenticate.js";
import "../styles/Welcome.css";


function Landing({ isCallback }) {
  const [fetchComplete, setFetchComplete] = useState(!isCallback);

  const fetchData = useCallback(async () => {

    const authenticatedUser = await getAuthenticatedUser(
      String(window.location.href)
    );
    const access_token = authenticatedUser["access_token"];
    const athlete_id = authenticatedUser["athlete"]["id"];

    var heartRateZones = await axios.get(
      "https://www.strava.com/api/v3/athlete/zones?",
      {
        params: {
          access_token: access_token,
        },
      }
    );
    heartRateZones = heartRateZones["data"]["heart_rate"]["zones"];
    sessionStorage.setItem(
      "heartRateZones",
      JSON.stringify(heartRateZones)
    );

    var activities = await axios.get(
      `activities/${athlete_id}/${access_token}`
    );
    activities = activities["data"];
    sessionStorage.setItem("activities", JSON.stringify(activities));

    const cities = getCities(activities)
    sessionStorage.setItem("cities", JSON.stringify(cities))

    setFetchComplete(true)
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = "#5dbcd2";
    if (!fetchComplete) {
      fetchData();
    }
  }, [fetchData]);

  return(
    <div>
      {
        isCallback && fetchComplete && (
          <Navigate to="/map" />
        )
      }
      <Modal
        show={!fetchComplete}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <div className="loading-center">
            <p className="loading-text">
              Fetching activities from Strava ...
            </p>
            <p className="loading-subtext">
              Loading may take a while for a large number of activites
            </p>
            <Spinner animation="border" className="loading-spinner" />
          </div>
        </Modal.Body>
      </Modal>

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
      <Branding />
    </div>
  )
}

export default Landing;
