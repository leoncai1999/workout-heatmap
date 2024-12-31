import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Nav, Modal, Button } from "react-bootstrap";
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
  const [askToStoreData, setAskToStoreData] = useState(false);

  const [savedAthleteInfo, setSavedAthleteInfo] = useState([]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [savedHeartRateZones, setSavedHeartRateZones] = useState([]);

  const fetchData = useCallback(async (mode) => {
    var activities = [];
    var heartRateZones = [];

    var access_token = "";
    var athlete_id = 0;

    if (mode === "callback") {
      const authenticatedUser = await getAuthenticatedUser(
        String(window.location.href)
      );
      access_token = authenticatedUser["access_token"];
      athlete_id = authenticatedUser["athlete"]["id"];

      activities = await axios.get(
        `${baseApiUrl}/activities/${athlete_id}/${access_token}`
      );
      activities = activities["data"];

      heartRateZones = await axios.get(
        `${baseApiUrl}/heartratezones/${athlete_id}/${access_token}`
      );
      heartRateZones = heartRateZones["data"];
    } else {
      activities = await axios.get(`${baseApiUrl}/sampleactivities`);
      activities = activities["data"];

      heartRateZones = await axios.get(`${baseApiUrl}/sampleheartratezones`);
      heartRateZones = heartRateZones["data"];
    }

    const cities = getCities(activities);
    sessionStorage.setItem("cities", JSON.stringify(cities));
    sessionStorage.setItem("activities", JSON.stringify(activities));
    sessionStorage.setItem("heartRateZones", JSON.stringify(heartRateZones));

    const userExistsResponse = await axios.get(`${baseApiUrl}/userexists/${athlete_id}`);
    const userExists = userExistsResponse.data.exists;

    if (userExists) {
      sessionStorage.setItem("savedAthleteId", athlete_id);
      setFetchComplete(true);
    } else {
      var athlete_info = await axios.get("https://www.strava.com/api/v3/athlete", {
        params: {
          access_token: access_token,
        },
      });

      setSavedAthleteInfo(athlete_info["data"]);
      setSavedActivities(activities);
      setSavedHeartRateZones(heartRateZones);

      setAskToStoreData(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = "#5dbcd2";
    if (!fetchComplete) {
      fetchData(mode);
    }
  }, [fetchData]);

  const handleStoreData = async (store) => {
    setAskToStoreData(false);
    setFetchComplete(true); // Redirect to the next page

    if (store) {
      try {
        /* 
        Since we're saving the user data for access at their next login,
        we can let the user proceed to the next page while this api
        call proceeds. Since this call only takes a few seconds, the data
        will be ready next time the user logs in.
        */
        await axios.post(`${baseApiUrl}/adduser`, {
          athleteInfo: savedAthleteInfo,
          activities: savedActivities,
          heartRateZones: savedHeartRateZones,
        });

        sessionStorage.setItem("savedAthleteId", savedAthleteInfo["id"]);
      } catch (error) {
        console.error("Error saving user data:", error);
      }
    } else {
      sessionStorage.setItem("savedAthleteId", 0);
    }
  }

  return (
    <div>
      {mode !== "normal" && fetchComplete && <Navigate to="/map" />}
      <Modal
        show={!fetchComplete && !askToStoreData}
        data-testid="loading-modal"
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

      <Modal
        show={askToStoreData}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <div className="loading-center">
            <p className="loading-text">
              Would you like to store your data for faster access next time?
            </p>
            <div className="store-data-button-group">
              <Button variant="primary" onClick={() => handleStoreData(true)}>
                Yes
              </Button>
              <Button variant="secondary" onClick={() => handleStoreData(false)}>
                No
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <img
        className="img-center"
        src={Logo}
        data-testid="app-logo"
        alt="app logo"/>
      <h1 data-testid="app-name">Workout Heatmap</h1>
      <h5 data-testid="app-description">
        Build an interactive heatmap of your outdoor activites from your Strava
        account!
      </h5>
      <div className="button-center">
        <img
          src={StravaButton}
          data-testid="connect-strava-button"
          onClick={(e) => {
            requestStravaPermissions(isLocalhost);
          }}
          alt="connect with strava button"
        ></img>
      </div>
      <Nav.Link href="/sample">
        <h6
          className="demo-text"
          data-testid="demo-account-text">
          Not a Strava user? See a demo account
        </h6>
      </Nav.Link>
      <Branding />
    </div>
  );
}

export default Landing;
