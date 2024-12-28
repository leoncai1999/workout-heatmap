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

function Heatmap() {
  const [filterValue, setFilterValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 });
  const [selectedCity, setSelectedCity] = useState("Select City");
  const [zoom, setZoom] = useState(4);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);

  const activities = JSON.parse(sessionStorage["activities"]);
  const cities = JSON.parse(sessionStorage["cities"]);

  useEffect(() => {
    if (cities.length !== 0) {
      setZoom(13);
      setMapCenter(cities[0]["latlng"]);
    }

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleNavbar = () => {
    setIsNavbarCollapsed((prevState) => !prevState);
  };

  return (
    <div id="container">
      <Navigation toggleNavbar={toggleNavbar} />

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

      {(isLargeScreen || isNavbarCollapsed) && (
        <MapDropdown
          cities={cities}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          setMapCenter={setMapCenter}
        />
      )}

      {isLargeScreen && (
        <MapMenu
          setFilterType={setFilterType}
          setFilterValue={setFilterValue}
        />
      )}

      <Branding />
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
})(Heatmap);
