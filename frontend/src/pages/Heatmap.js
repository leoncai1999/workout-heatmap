import React, { useEffect, useState, useCallback } from "react";
import { Map, GoogleApiWrapper, Polyline } from "google-maps-react";
import axios from "axios";
import { Dropdown, DropdownButton, Spinner } from "react-bootstrap";
import Landing from "./Landing.js";
import List from "./List.js";
import Stats from "./Stats.js";
import Routes from "./Routes.js";
import Navigation from "../components/Navigation.js";
import MapMenu from "../components/MapMenu.js";
import Modal from "react-bootstrap/Modal";
import Branding from "../assets/powered_by_strava.png";
import "../styles/Heatmap.css";
import { getAuthenticatedUser } from "../utils/api.js";

const mapStyles = {
  width: "100%",
  height: "100%",
};

const decodePolyline = require("decode-google-map-polyline");

// url for production is https://workout-heatmap.herokuapp.com/, url for development is http://localhost:3000/
const base_url = "http://localhost:3000/";

function Heatmap() {
  const [filterValue, setFilterValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [mapCenter, setMapCenter] = useState({});
  const [selectedCity, setSelectedCity] = useState("Select City");
  const [cities, setCities] = useState([]);
  const [zoom, setZoom] = useState(4);
  const [modalOpen, setModalOpen] = useState(true);
  const [mode, setMode] = useState("map");
  const [isSample, setIsSample] = useState(false);

  const fetchData = useCallback(async () => {
    var is_map = false;
    let url_elements = String(window.location.href).split("/");

    document.body.style.background = "#e8e1eb";
    const url_end = url_elements.slice(-1)[0];
    const non_map_modes = ["stats", "routes", "list"];

    if (non_map_modes.includes(url_end)) {
      setMode(url_end);
    } else {
      document.body.style.backgroundColor = "#5dbcd2";
      setMode("map");
      is_map = true;
    }

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
      if (is_map) {
        window.history.pushState({}, null, base_url + "map");
      }

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

      var activities = await axios.get(
        `activities/${athlete_id}/${access_token}`
      );
      activities = activities.data;

      sessionStorage.setItem("activities", JSON.stringify(activities));

      const city_counts = getCityActivityCounts(activities);

      sessionStorage.setItem("cities", JSON.stringify(city_counts));
      setCities(city_counts);

      if (city_counts.length !== 0) {
        setZoom(13);
        setMapCenter(city_counts[0]["cords"]);
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

  function getCityActivityCounts(activities) {
    var city_counts = [];

    // need to account for other countries where State may be null
    for (let i = 0; i < activities.length; i++) {
      let activity = activities[i];

      if (activity["location_city"]) {
        let city_name =
          activity["location_city"] + ", " + activity["location_state"];

        let activity_miles = activity["distance"];
        let activity_elevation = activity["total_elevation_gain"];
        let activity_time = activity["moving_time"];
        let activity_cords = {
          lat: activity["start_latlng"][0],
          lng: activity["start_latlng"][1],
        };

        var unique_city = true;
        var city_num = 0;

        while (unique_city && city_num < city_counts.length) {
          if (city_counts[city_num]["city"] === city_name) {
            city_counts[city_num]["activities"] += 1;
            city_counts[city_num]["miles"] += activity_miles;
            city_counts[city_num]["elevation"] += activity_elevation;
            city_counts[city_num]["hours"] += activity_time;
            unique_city = false;
          } else {
            city_num += 1;
          }
        }

        if (unique_city) {
          city_counts.push({
            city: city_name,
            activities: 1,
            miles: activity_miles,
            elevation: activity_elevation,
            hours: activity_time,
            cords: activity_cords,
          });
        }
      }
    }

    // Sort cities by number of activites descending, breaking ties by total mileage
    city_counts.sort(function (a, b) {
      return b.activities - a.activities || b.miles - a.miles;
    });

    for (let i = 0; i < city_counts.length; i++) {
      city_counts[i]["id"] = i;
      city_counts[i]["miles"] = parseFloat(city_counts[i]["miles"].toFixed(2));
      city_counts[i]["elevation"] = parseFloat(
        city_counts[i]["elevation"].toFixed(2)
      );
      city_counts[i]["hours"] = parseInt(city_counts[i]["hours"] / 3600);
    }

    return city_counts;
  }

  function getActivityTimeOfDay(timeOfDay) {
    let start_hour = parseInt(timeOfDay.split(":")[0].slice(-2));

    if (start_hour >= 4 && start_hour < 11) {
      return "morning";
    } else if (start_hour >= 11 && start_hour < 14) {
      return "lunch";
    } else if (start_hour >= 14 && start_hour < 17) {
      return "afternoon";
    } else if (start_hour >= 17 && start_hour < 21) {
      return "evening";
    } else {
      return "night";
    }
  }

  function getActivityMemberType(athlete_count) {
    if (athlete_count === 2) {
      return "Partner";
    } else if (athlete_count > 2) {
      return "Group";
    } else {
      return "Solo";
    }
  }

  function getPolylines(filterType, filterValue) {
    var activities = JSON.parse(sessionStorage.activities);

    if (filterType === "sport") {
      activities = activities.filter(
        (activity) => activity["type"] && activity["type"] === filterValue
      );
    } else if (filterType === "workout") {
      activities = activities.filter(
        (activity) =>
          (activity["workout_type"] === 1 ? "Race" : "Training") === filterValue
      );
    } else if (filterType === "members") {
      activities = activities.filter(
        (activity) =>
          activity["athlete_count"] &&
          getActivityMemberType(activity["athlete_count"]) === filterValue
      );
    } else if (filterType === "time") {
      activities = activities.filter(
        (activity) =>
          activity["start_date_local"] &&
          getActivityTimeOfDay(activity["start_date_local"]) === filterValue
      );
    }

    var polylines = [];

    for (let i = 0; i < activities.length; i++) {
      const polyline = activities[i]["map"]["summary_polyline"];
      polylines.push(decodePolyline(polyline));
    }

    return polylines;
  }

  if (
    sessionStorage.authenticatedUser === undefined &&
    JSON.parse(sessionStorage.activities) === null
  ) {
    return (
      <div>
        <Landing />
      </div>
    );
  } else if (mode === "map") {
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
            {getPolylines(filterType, filterValue).map((polyline) => {
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

        <div id="cities-search">
          <DropdownButton
            alignRight
            title={selectedCity}
            id="dropdown-menu-align-right"
          >
            {cities.map((city) => {
              return (
                <Dropdown.Item
                  onClick={() => {
                    setZoom(13);
                    setMapCenter(city["cords"]);
                    setSelectedCity(city["city"]);
                  }}
                >
                  {city["city"]}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </div>

        <MapMenu
          setFilterType={setFilterType}
          setFilterValue={setFilterValue}
        />

        <div id="branding">
          <img src={Branding} alt="powered by strava branding" />
        </div>
      </div>
    );
  } else if (mode === "list") {
    return (
      <div>
        <List />
      </div>
    );
  } else if (mode === "stats") {
    return (
      <div>
        <Stats />
      </div>
    );
  } else {
    return <div></div>;
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
})(Heatmap);
