import React, { useEffect, useState } from "react";
import { Map, GoogleApiWrapper, Polyline } from "google-maps-react";
import Navigation from "../components/Navigation.js";
import MapMenu from "../components/MapMenu.js";
import MapDropdown from "../components/MapDropdown.js";
import Branding from "../components/Branding.js";
import "../styles/Heatmap.css";
import { getPolylines } from "../utils/get.js";

const mapStyles = {
  width: "100%",
  height: "100%",
};

function Heatmap({ mode }) {
  const [filterValue, setFilterValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [mapCenter, setMapCenter] = useState({});
  const [selectedCity, setSelectedCity] = useState("Select City");
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    document.body.style.backgroundColor = "#5dbcd2";

    if (!sessionStorage["activities"]) {
      if (mode === "sample") {
        // TODO: fetch activities from MongoDB and set session storage
      } else {
        // TODO: Redirect back to main and have pop-up saying user must connect with strava first
      }
    }

    // const cities = JSON.parse(sessionStorage["cities"])
    // if (cities.length !== 0) {
    //   setZoom(13);
    //   setMapCenter(cities[0]["latlng"]);
    // } else {
    //   // Default location is geographic center of the U.S.
    //   setMapCenter({ lat: 39.8283, lng: -98.5795 });
    // }
    setMapCenter({ lat: 39.8283, lng: -98.5795 });
  }, []);

  return (
    <div id="container">
      <Navigation />

      <div id="map">
        <Map
          google={window.google}
          zoom={zoom}
          style={mapStyles}
          initialCenter={{ lat: 39.8283, lng: -98.5795 }}
          center={mapCenter}
        >
          {getPolylines(filterType, filterValue, JSON.parse(sessionStorage["activities"])).map((polyline) => {
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
        cities={[]}
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
