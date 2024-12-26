import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Nav, Modal } from "react-bootstrap";
import Logo from "../assets/app-logo.svg";
import { Spinner } from "react-bootstrap";
import StravaButton from "../assets/connect_with_strava.png";
import Branding from "../components/Branding.js";
import { getCities } from "../utils/get.js";
import {
  requestStravaPermissions,
  getAuthenticatedUser,
} from "../utils/authenticate.js";
import "../styles/Landing.css";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "";

const baseApiUrl = isLocalhost
  ? "http://localhost:3001"
  : "https://workout-heatmap-backend.onrender.com";

function Landing({ mode }) {
  const [fetchComplete, setFetchComplete] = useState(mode === "normal");

  const fetchData = useCallback(async (mode) => {
    var activities = [];
    var heartRateZones = [];

    if (mode === "callback") {
      const authenticatedUser = await getAuthenticatedUser(
        String(window.location.href)
      );
      const access_token = authenticatedUser["access_token"];
      const athlete_id = authenticatedUser["athlete"]["id"];

      heartRateZones = await axios.get(
        "https://www.strava.com/api/v3/athlete/zones?",
        {
          params: {
            access_token: access_token,
          },
        }
      );
      heartRateZones = heartRateZones["data"]["heart_rate"]["zones"];

      activities = await axios.get(
        `${baseApiUrl}/activities/${athlete_id}/${access_token}`
      );
      activities = activities["data"];
    } else {
      // heartRateZones = await axios.get(`${baseApiUrl}/sampleheartratezones`);
      // heartRateZones = heartRateZones["data"];

      activities = await axios.get(`${baseApiUrl}/sampleactivities`);
      activities = activities["data"];
    }

    const cities = getCities(activities);
    sessionStorage.setItem("cities", JSON.stringify(cities));
    sessionStorage.setItem("activities", JSON.stringify(activities));
    sessionStorage.setItem("heartRateZones", JSON.stringify(heartRateZones));

    setFetchComplete(true);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = "#5dbcd2";
    if (!fetchComplete) {
      fetchData(mode);
    }
  }, [fetchData]);

  return (
    <div>
      {mode !== "normal" && fetchComplete && <Navigate to="/map" />}
      <Modal
        show={!fetchComplete}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <div className="loading-center">
            {mode === "callback" ? (
              <>
                <p className="loading-text">
                  Fetching activities from Strava ...
                </p>
                <p className="loading-subtext">
                  Loading can take two or more minutes for a large number of
                  activities
                </p>
              </>
            ) : (
              <p className="loading-text">Fetching sample athlete data ...</p>
            )}
            <Spinner animation="border" className="loading-spinner" />
          </div>
        </Modal.Body>
      </Modal>

      <img className="img-center" src={Logo} alt="app logo"></img>
      <h1> Workout Heatmap </h1>
      <h5>
        Build an interactive heatmap of your outdoor activites from your Strava
        account!
      </h5>
      {/* <h6>
        WorkoutHeatmap.me does not collect or externally store any of your data
      </h6> */}
      <div className="button-center">
        <img
          src={StravaButton}
          onClick={(e) => {
            requestStravaPermissions(isLocalhost).bind(this);
          }}
          alt="connect with strava button"
        ></img>
      </div>
      <Nav.Link href="/sample">
        <h6 className="demo-text"> Not a Strava user? See a demo account </h6>
      </Nav.Link>
      <Branding />
    </div>
  );
}

export default Landing;
