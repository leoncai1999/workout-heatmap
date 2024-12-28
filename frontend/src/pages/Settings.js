import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import Navigation from "../components/Navigation";
import Branding from "../components/Branding.js";
import SettingsIcon from "../assets/settings.svg";
import "../styles/Stats.css";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "";

const baseApiUrl = isLocalhost
  ? "http://localhost:3001"
  : "https://workout-heatmap-backend.onrender.com";

function Settings() {
  const [redirect, setRedirect] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  const athlete_id = sessionStorage.getItem("savedAthleteId");

  useEffect(() => {
    document.body.style.background = "#e8e1eb";
  }, []);

  const deleteAccount = async () => {
    await axios.get(`${baseApiUrl}/deleteathlete/${athlete_id}`);
    setAccountDeleted(true);
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return(
    <div>
      <Navigation />
      <img class="img-stats" src={SettingsIcon} alt="settings icon"></img>
      <h1 className="black-header">Settings</h1>
      <h3 className="stats-header">More settings coming soon</h3>
      {athlete_id !== "0" ? (
        <>
          <Button variant="danger" style={{ marginLeft: "20px" }} onClick={() => deleteAccount()}>
            Delete my account
          </Button>

          <Modal
            show={accountDeleted}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Body>
              <div className="loading-center">
                <p className="loading-text">Account Successfully Deleted</p>
                <Button variant="primary" onClick={() => setRedirect(true)}>
                  Return to Home
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <>
        </>
      )}
      <Branding />
    </div>
  )
}

export default Settings;
