import React from "react";
import {
  Button,
  ButtonGroup
} from "react-bootstrap";
import "../styles/Heatmap.css";

function MapMenu({ setFilterType, setFilterValue }) {

  return(
    <div id="map-menu" data-testid="options-menu">
      <h3>Options</h3>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={(e) => {
          setFilterType("")
        }}
        data-testid="all-activities-button"
      >
        All Activities
      </Button>
      <h4>Sport</h4>
      <ButtonGroup size="sm">
        {["Run", "Ride", "Swim", "Walk", "Hike"].map((sport, i) => {
          return(
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("sport")
                setFilterValue(sport)
              }}
              key={i}
              data-testid={`sport-button-${sport}`}
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
        {["Training", "Race"].map((workoutType, i) => {
          return (
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("workout")
                setFilterValue(workoutType)
              }}
              key={i}
              data-testid={`workout-button-${workoutType}`}
            >
              {workoutType}
            </Button>
          );
        })}
      </ButtonGroup>
      <h4>Members</h4>
      <ButtonGroup size="sm" className="btn-group">
        {["Solo", "Partner", "Group"].map((memberType, i) => {
          return (
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("members")
                setFilterValue(memberType)
              }}
              key={i}
              data-testid={`members-button-${memberType}`}
            >
              {memberType}
            </Button>
          );
        })}
      </ButtonGroup>
      <h4>Time of Day</h4>
      <ButtonGroup size="sm">
        {["morning", "lunch", "afternoon", "evening", "night"].map((timeOfDay, i) => {
          return (
            <Button
              variant="outline-secondary"
              onClick={(e) => {
                setFilterType("time")
                setFilterValue(timeOfDay)
              }}
              key={i}
              data-testid={`time-button-${timeOfDay}`}
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
