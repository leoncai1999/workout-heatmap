import React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import "../styles/Heatmap.css";

function MapDropdown({cities, selectedCity, setSelectedCity, setMapCenter}) {
  return (
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
                setSelectedCity(city["name"]);
                setMapCenter(city["latlng"]);
              }}
            >
              {city["name"]}
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
    </div>
  );
}

export default MapDropdown;
