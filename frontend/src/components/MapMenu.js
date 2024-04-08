import React from "react";
import {
  Button,
  ButtonGroup
} from "react-bootstrap";
import "../styles/Heatmap.css";

function MapMenu({ setFilterType, setFilterValue }) {

  return(
    <div id="map-menu">
      <h3>Options</h3>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={(e) => {
          setFilterType("")
        }}
      >
        All Activities
      </Button>
      <h4>Sport</h4>
      <ButtonGroup size="sm">
        {["Run", "Ride", "Swim", "Walk", "Hike"].map((sport) => {
          return(
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("sport")
                setFilterValue(sport)
              }}
            >
              <img
                src={require(`../assets/${sport.toLowerCase()}.svg`)}
                style={{ width: 25 }}
                alt="sport icon"
              />
            </Button>
          )
        })}
      </ButtonGroup>
      <h4>Workout</h4>
      <ButtonGroup size="sm" className="btn-group">
        {["Training", "Race"].map((workoutType) => {
          return (
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("workout")
                setFilterValue(workoutType)
              }}
            >
              {workoutType}
            </Button>
          );
        })}
      </ButtonGroup>
      <h4>Members</h4>
      <ButtonGroup size="sm" className="btn-group">
        {["Solo", "Partner", "Group"].map((memberType) => {
          return (
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("members")
                setFilterValue(memberType)
              }}
            >
              {memberType}
            </Button>
          );
        })}
      </ButtonGroup>
      <h4>Time of Day</h4>
      <ButtonGroup size="sm">
        {["morning", "lunch", "afternoon", "evening", "night"].map((timeOfDay) => {
          return (
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("time")
                setFilterValue(timeOfDay)
              }}
            >
              <img
                src={require(`../assets/${timeOfDay}.svg`)}
                style={{ width: 25 }}
                alt="time of day icon"
              />
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  )
}

export default MapMenu;
