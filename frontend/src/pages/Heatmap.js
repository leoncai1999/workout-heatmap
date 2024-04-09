import React, { useEffect, useState, useCallback } from "react";
import { Map, GoogleApiWrapper, Polyline } from "google-maps-react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import Navigation from "../components/Navigation.js";
import MapMenu from "../components/MapMenu.js";
import MapDropdown from "../components/MapDropdown.js";
import Branding from "../components/Branding.js";
import Modal from "react-bootstrap/Modal";
import "../styles/Heatmap.css";
import { getPolylines, getCities } from "../utils/get.js";
import { getAuthenticatedUser } from "../utils/authenticate.js";

const mapStyles = {
  width: "100%",
  height: "100%",
};

// url for production is https://workout-heatmap.herokuapp.com/, url for development is http://localhost:3000/
const base_url = "http://localhost:3000/";

function Heatmap() {
  const [filterValue, setFilterValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [mapCenter, setMapCenter] = useState({});
  const [selectedCity, setSelectedCity] = useState("Select City");
  const [zoom, setZoom] = useState(4);
  const [modalOpen, setModalOpen] = useState(true);

  const [activities, setActivites] = useState([])
  const [cities, setCities] = useState([])

  const fetchData = useCallback(async () => {
    document.body.style.backgroundColor = "#5dbcd2";

    const authenticatedUser = await getAuthenticatedUser(
      String(window.location.href)
    );
    sessionStorage.setItem(
      "autenticatedUser",
      JSON.stringify(authenticatedUser)
    );

    const access_token = authenticatedUser["access_token"];
    const athlete_id = authenticatedUser["athlete"]["id"];

    if (access_token !== "") {
      axios.defaults.headers.common = {
        Authorization: `Bearer ${access_token}`,
      };

      // Revert the url of the site to the default url after authentication is finished
      window.history.pushState({}, null, base_url + "map");

      var heart_rate_zones = await axios.get(
        "https://www.strava.com/api/v3/athlete/zones?",
        {
          params: {
            access_token: access_token,
          },
        }
      );
      heart_rate_zones = heart_rate_zones.data["heart_rate"]["zones"];

      sessionStorage.setItem(
        "heartRateZones",
        JSON.stringify(heart_rate_zones)
      );

      var activities_response = await axios.get(
        `activities/${athlete_id}/${access_token}`
      );
      activities_response = activities_response.data;

      setActivites(activities_response)
      sessionStorage.setItem("activities", JSON.stringify(activities_response));

      const cities_response = getCities(activities_response)
      setCities(cities_response)

      if (cities_response.length !== 0) {
        setZoom(13);
        setMapCenter(cities_response[0]["latlng"]);
      } else {
        // Default location is geographic center of the U.S.
        setMapCenter({ lat: 39.8283, lng: -98.5795 });
      }

      setModalOpen(false);

      sessionStorage.setItem("access_token", access_token);
    } else {
      window.history.pushState({}, null, base_url);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div id="container">
      <Modal
        show={modalOpen}
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

      <Navigation />

      <div id="map">
        <Map
          google={window.google}
          zoom={zoom}
          style={mapStyles}
          initialCenter={{ lat: 39.8283, lng: -98.5795 }}
          center={mapCenter}
        >
          {getPolylines(filterType, filterValue, activities).map((polyline) => {
            return (
              <Polyline
                path={polyline}
                strokeColor="#6F1BC6"
                strokeWeight="2"
              />
            );
          })}
        </Map>
      </div>

      <MapDropdown
        cities={cities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        setMapCenter={setMapCenter}
      />
      <MapMenu
        setFilterType={setFilterType}
        setFilterValue={setFilterValue}
      />
      <Branding />
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
})(Heatmap);
