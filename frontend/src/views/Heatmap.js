import React, { useEffect, useState, useCallback } from "react";
import { Map, GoogleApiWrapper, Polyline } from "google-maps-react";
// import {APIProvider, Map, Polyline} from '@vis.gl/react-google-maps';
import axios from "axios";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownButton,
  Spinner,
} from "react-bootstrap";
import Landing from "./Landing.js";
import List from "./List.js";
import Stats from "./Stats.js";
import Routes from "./Routes.js";
import Navigation from "../components/Navigation.js";
import Modal from "react-bootstrap/Modal";
import Branding from "../assets/powered_by_strava.png";
import "../styles/Heatmap.css";

const mapStyles = {
  width: "100%",
  height: "100%",
};

// url for production is https://workout-heatmap.herokuapp.com/, url for development is http://localhost:3000/
const base_url = "http://localhost:3000/";

function Heatmap() {
  const [activities, setActivities] = useState([]);
  const [polylines, setPolylines] = useState([]);
  const [filterType, setFilterType] = useState(0);
  const [activityType, setActivityType] = useState(0);
  const [athleteId, setAthleteId] = useState(0);
  const [accessToken, setAccessToken] = useState("");
  const [mapCenter, setMapCenter] = useState({});
  const [heartRateZones, setHeartRateZones] = useState([]);
  const [selectedCity, setSelectedCity] = useState("Select City");
  const [cities, setCities] = useState([]);
  const [zoom, setZoom] = useState(4);
  const [modalOpen, setModalOpen] = useState(true);
  const [mode, setMode] = useState("map");
  const [isSample, setIsSample] = useState(false);

  const fetchData = useCallback(async() => {
    var is_map = false;
    let url_elements = String(window.location.href).split("/");

    if (url_elements.slice(-1)[0] === "stats") {
      document.body.style.background = "#e8e1eb";
      setMode("stats")
    } else if (url_elements.slice(-1)[0] === "routes") {
      document.body.style.background = "#e8e1eb";
      setMode("routes")
    } else if (url_elements.slice(-1)[0] === "list") {
      document.body.style.background = "#e8e1eb";
      setMode("list")
    } else {
      document.body.style.background = "#5dbcd2";
      setMode("map")
      is_map = true;
    }

    var user_activities = [];
    var user_polylines = [
      { id: 0, type: "All", elements: [] },
      { id: 1, type: "Sport", elements: [] },
      { id: 2, type: "Workout", elements: [] },
      { id: 3, type: "Members", elements: [] },
      { id: 4, type: "Time", elements: [] },
    ];

    user_polylines[0]["elements"].push({ polylines: [] });

    // Sport types
    user_polylines[1]["elements"].push({
      id: 0,
      type: "Run",
      img: require("../assets/run.svg"),
      polylines: [],
    });
    user_polylines[1]["elements"].push({
      id: 1,
      type: "Ride",
      img: require("../assets/ride.svg"),
      polylines: [],
    });
    user_polylines[1]["elements"].push({
      id: 2,
      type: "Swim",
      img: require("../assets/swim.svg"),
      polylines: [],
    });
    user_polylines[1]["elements"].push({
      id: 3,
      type: "Walk",
      img: require("../assets/walk.svg"),
      polylines: [],
    });
    user_polylines[1]["elements"].push({
      id: 4,
      type: "Hike",
      img: require("../assets/hike.svg"),
      polylines: [],
    });

    // Workout types
    user_polylines[2]["elements"].push({
      id: 0,
      type: "Training",
      polylines: [],
    });
    user_polylines[2]["elements"].push({
      id: 1,
      type: "Race",
      polylines: [],
    });

    // Member types
    user_polylines[3]["elements"].push({
      id: 0,
      type: "Solo",
      polylines: [],
    });
    user_polylines[3]["elements"].push({
      id: 1,
      type: "Partner",
      polylines: [],
    });
    user_polylines[3]["elements"].push({
      id: 2,
      type: "Group",
      polylines: [],
    });

    // Time of Day types
    user_polylines[4]["elements"].push({
      id: 0,
      type: require("../assets/morning.svg"),
      polylines: [],
    });
    user_polylines[4]["elements"].push({
      id: 1,
      type: require("../assets/lunch.svg"),
      polylines: [],
    });
    user_polylines[4]["elements"].push({
      id: 2,
      type: require("../assets/afternoon.svg"),
      polylines: [],
    });
    user_polylines[4]["elements"].push({
      id: 3,
      type: require("../assets/evening.svg"),
      polylines: [],
    });
    user_polylines[4]["elements"].push({
      id: 4,
      type: require("../assets/night.svg"),
      polylines: [],
    });

    setPolylines(user_polylines)

    const access_token = await updateAccessToken(
      String(window.location.href)
    );

    if (access_token !== "") {
      console.log("*****My Token", access_token, athleteId)
      setAccessToken(access_token)

      axios.defaults.headers.common = {
        Authorization: `Bearer ${access_token}`,
      };

      // Revert the url of the site to the default url after authentication is finished
      if (is_map) {
        window.history.pushState({}, null, base_url + "map");
      }

      var heart_rate_zones = await getHeartRateZones(access_token);
      sessionStorage.setItem(
        "heartRateZones",
        JSON.stringify(heart_rate_zones)
      );
      setHeartRateZones(heart_rate_zones)

      const activities = await getActivities("32573537", access_token);

      const decodePolyline = require("decode-google-map-polyline");

      for (let i = 0; i < activities.length; i++) {
        user_activities.push(activities[i]);

        var polyline = activities[i]["map"]["summary_polyline"];
        if (polyline != null) {
          user_polylines[0]["elements"][0]["polylines"].push(
            decodePolyline(polyline)
          );

          // Store polylines grouped by Sport
          var unique_activity_type = true;
          var type_num = 0;

          // Sports other than the default 5 can also be added
          while (
            unique_activity_type &&
            type_num < user_polylines[1]["elements"].length
          ) {
            if (
              user_polylines[1]["elements"][type_num]["type"] ===
              activities[i].type
            ) {
              user_polylines[1]["elements"][type_num]["polylines"].push(
                decodePolyline(polyline)
              );
              unique_activity_type = false;
            } else {
              type_num += 1;
            }
          }

          if (unique_activity_type) {
            user_polylines[1]["elements"].push({
              id: user_polylines[1]["elements"].length,
              type: activities[i].type,
              polylines: [decodePolyline(polyline)],
            });
          }

          // Store polylines grouped by Workout Type (Could result in error if certain activity doesn't have type)
          if (activities[i]["workout_type"] === 1) {
            user_polylines[2]["elements"][1]["polylines"].push(
              decodePolyline(polyline)
            );
          } else {
            user_polylines[2]["elements"][0]["polylines"].push(
              decodePolyline(polyline)
            );
          }

          // Store polylines grouped by Member Type
          if (activities[i]["athlete_count"] === 2) {
            user_polylines[3]["elements"][1]["polylines"].push(
              decodePolyline(polyline)
            );
          } else if (activities[i]["athlete_count"] > 2) {
            user_polylines[3]["elements"][2]["polylines"].push(
              decodePolyline(polyline)
            );
          } else {
            user_polylines[3]["elements"][0]["polylines"].push(
              decodePolyline(polyline)
            );
          }

          // Store polylines grouped by Time of Day
          let start_hour = parseInt(
            activities[i]["start_date_local"].split(":")[0].slice(-2)
          );

          if (start_hour >= 4 && start_hour < 11) {
            user_polylines[4]["elements"][0]["polylines"].push(
              decodePolyline(polyline)
            );
          } else if (start_hour >= 11 && start_hour < 14) {
            user_polylines[4]["elements"][1]["polylines"].push(
              decodePolyline(polyline)
            );
          } else if (start_hour >= 14 && start_hour < 17) {
            user_polylines[4]["elements"][2]["polylines"].push(
              decodePolyline(polyline)
            );
          } else if (start_hour >= 17 && start_hour < 21) {
            user_polylines[4]["elements"][3]["polylines"].push(
              decodePolyline(polyline)
            );
          } else {
            user_polylines[4]["elements"][4]["polylines"].push(
              decodePolyline(polyline)
            );
          }
        }
      }

      sessionStorage.setItem("activities", JSON.stringify(user_activities));
      setActivities(user_activities)
      setPolylines(user_polylines)

      const city_counts = getCityActivityCounts(user_activities);

      sessionStorage.setItem("cities", JSON.stringify(city_counts));
      setCities(city_counts)

      if (city_counts.length !== 0) {
        setZoom(13)
        setMapCenter(city_counts[0]["cords"])
      } else {
        // Default location is geographic center of the U.S.
        setMapCenter({ lat: 39.8283, lng: -98.5795 })
      }

      setModalOpen(false)

      sessionStorage.setItem("access_token", access_token);
    } else {
      window.history.pushState({}, null, base_url);
    }
  }, [])

  useEffect(() => {
    console.log("window", window.google)
    fetchData()
  }, [fetchData]);

  async function getHeartRateZones(access_token) {
    let results = await axios
      .get("https://www.strava.com/api/v3/athlete/zones?", {
        params: {
          access_token: access_token,
        },
      })
      .catch((error) => {
        // TODO: Account for scenario where user denies permission
      });

    return results.data["heart_rate"]["zones"];
  };

  function getCityActivityCounts(user_activities) {
    var city_counts = [];

    // need to account for other countries where State may be null
    for (let i = 0; i < user_activities.length; i++) {
      let activity = user_activities[i];

      if (activity["location_city"]) {
        let city_name =
          activity["location_city"] + ", " + activity["location_state"];

        let activity_miles = activity["distance"];
        let activity_elevation = activity["total_elevation_gain"];
        let activity_time = activity["moving_time"];
        let activity_cords = { lat: activity["start_latlng"][0], lng: activity["start_latlng"][1] }

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
            cords: activity_cords
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
  };

  async function getActivities(athlete_id, access_token) {
    var invalid_token = false;

    let results = await axios.get(`activities/${athlete_id}/${access_token}`).catch((error) => {
      invalid_token = true;
    });

    return invalid_token ? [] : results.data;
  };

  async function updateAccessToken(url) {
    var token = "";

    // Retrieve the code from the authenication process, then exchange the code for a token to access the Strava API
    const tokenized_url = url.split("/");
    if (
      tokenized_url[3] !== null &&
      tokenized_url[3].substring(0, 10) === "map-sample"
    ) {
      token = "sample";
    } else if (
      tokenized_url[3] !== null &&
      tokenized_url[3].substring(0, 8) === "callback"
    ) {
      let code_and_scope = tokenized_url[3].substring(27);
      let code = code_and_scope.substring(0, code_and_scope.indexOf("&"));

      let results = await axios.post(
        "https://www.strava.com/api/v3/oauth/token?",
        {
          client_id: "27965",
          client_secret: process.env.REACT_APP_STRAVA_SECRET,
          code: code,
          grant_type: "authorization_code",
        }
      );

      setAthleteId(results.data.athlete.id)

      token = results.data.access_token;
    } else if (sessionStorage.access_token !== null) {
      token = sessionStorage.access_token
    }

    return token;
  };

  function polylineElements(polyline_elements) {
    if (polyline_elements !== undefined) {
      return polyline_elements;
    } else {
      return [];
    }
  };

  if (
    accessToken === "" &&
    JSON.parse(sessionStorage.activities) === null
  ) {
    return (
      <div>
        <Landing />
      </div>
    );
  } else if (mode === "map" && accessToken !== "") {
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
            {polylineElements(
              polylines[filterType]["elements"][activityType]["polylines"]
            ).map((polyline) => {
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

        <div id="map-menu">
          <h3>Options</h3>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={(e) => {
              setFilterType(0)
              setActivityType(0)
            }}
          >
            All Activities
          </Button>
          <h4>Sport</h4>
          <ButtonGroup size="sm">
            {polylines[1]["elements"].map((activity_type) => {
              return (
                <Button
                  variant="outline-secondary"
                  onClick={(e) => {
                    setFilterType(1)
                    setActivityType(activity_type["id"])
                  }}
                >
                  <img
                    src={activity_type["img"]}
                    style={{ width: 25 }}
                    alt="sport icon"
                  />
                </Button>
              );
            })}
          </ButtonGroup>
          <h4>Workout</h4>
          <ButtonGroup size="sm" className="btn-group">
            {polylines[2]["elements"].map((activity_type) => {
              return (
                <Button
                  variant="outline-secondary"
                  onClick={(e) => {
                    setFilterType(2)
                    setActivityType(activity_type["id"])
                  }}
                >
                  {activity_type["type"]}
                </Button>
              );
            })}
          </ButtonGroup>
          <h4>Members</h4>
          <ButtonGroup size="sm" className="btn-group">
            {polylines[3]["elements"].map((activity_type) => {
              return (
                <Button
                  variant="outline-secondary"
                  onClick={(e) => {
                    setFilterType(3)
                    setActivityType(activity_type["id"])
                  }}
                >
                  {activity_type["type"]}
                </Button>
              );
            })}
          </ButtonGroup>
          <h4>Time of Day</h4>
          <ButtonGroup size="sm">
            {polylines[4]["elements"].map((activity_type) => {
              return (
                <Button
                  variant="outline-secondary"
                  onClick={(e) => {
                    setFilterType(4)
                    setActivityType(activity_type["id"])
                  }}
                >
                  <img
                    src={activity_type["type"]}
                    style={{ width: 25 }}
                    alt="time of day icon"
                  />
                </Button>
              );
            })}
          </ButtonGroup>
        </div>
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
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(Heatmap);
