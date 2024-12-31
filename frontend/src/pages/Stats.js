import React, { useEffect, useState } from "react";
import Navigation from "../components/Navigation.js";
import Branding from "../components/Branding.js";
import YearlyLineChart from "../components/YearlyLineChart.js";
import StatsIcon from "../assets/stats.svg";
import { Dropdown, DropdownButton } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Radar, Bar, Doughnut } from "react-chartjs-2";
import { getTotalHours, getTotalDistance } from "../utils/get.js";
import {
  getActivitiesByTimeOfDay,
  getActivitiesByDayOfWeekRadar,
  getActivitiesByDayOfWeekTable,
  getActivitiesByIntensityDoughnut,
  getActivitiesByIntensityTable,
} from "../utils/chart.js";
import "../styles/Stats.css";

const paginationOptions = {
  sizePerPage: 10,
  hideSizePerPage: true,
};

function Stats() {
  const [lineAttr, setLineAttr] = useState("Distance (Miles)");
  const [doughnutAttr, setDoughnutAttr] = useState("Number of Activities");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1258);

  const city_columns = [
    {
      dataField: "id",
      hidden: true,
    },
    {
      dataField: "name",
      text: "City",
    },
    {
      dataField: "activities",
      text: "Activities",
      sort: true,
    },
    {
      dataField: "miles",
      text: "Distance (Miles)",
      sort: true,
    },
    {
      dataField: "elevation",
      text: "Elevation Gain (Feet)",
      sort: true,
    },
    {
      dataField: "hours",
      text: "Time (Hours)",
      sort: true,
    },
  ];

  const day_columns = [
    {
      dataField: "id",
      hidden: true,
    },
    {
      dataField: "day",
      text: "Day",
    },
    {
      dataField: "miles",
      text: "Total Miles",
    },
    {
      dataField: "pace",
      text: "Average Pace",
    },
  ];

  const heart_rate_columns = [
    {
      dataField: "id",
      hidden: true,
    },
    {
      dataField: "zone",
      text: "Zone",
    },
    {
      dataField: "intensity",
      text: "Intensity",
    },
    {
      dataField: "heart_rate",
      text: "Heart Rate",
    },
    {
      dataField: "pace",
      text: "Average Pace",
    },
  ];

  const activities = JSON.parse(sessionStorage["activities"]);
  const cities = JSON.parse(sessionStorage["cities"]);
  const heartRateZones = JSON.parse(sessionStorage["heartRateZones"]);

  useEffect(() => {
    document.body.style.background = "#e8e1eb";

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1258);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <Navigation />

      <img className="img-stats" src={StatsIcon} alt="Icon of data graph"></img>
      <h1 className="black-header"> Workout Statistics </h1>

      <h2 className="stats-description">
        You've worked out {activities.length} times for a total of{" "}
        {getTotalHours(activities)} hours, and traveled{" "}
        {getTotalDistance(activities)} miles
      </h2>

      <h3 className="stats-header">Activities by City</h3>
      <div className="bootstrap-table" data-testid="cities-table">
        <BootstrapTable
          keyField="id"
          data={cities}
          columns={city_columns}
          bordercolors={true}
          striped
          hover
          condensed
          pagination={paginationFactory(paginationOptions)}
        />
      </div>

      <h3 className="stats-header">Activities by Year and Month</h3>
      <YearlyLineChart
        lineAttr={lineAttr}
        setLineAttr={setLineAttr}
        activities={activities}
      />

      {isLargeScreen && (
        <>
          <h3 className="stats-header">Activities by Day of Week</h3>
          <div className="radar-chart" data-testid="day-of-week-chart">
            <Radar
              data={getActivitiesByDayOfWeekRadar(activities)}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </div>
          <div className="day-table" data-testid="day-of-week-table">
            <BootstrapTable
              keyField="id"
              data={getActivitiesByDayOfWeekTable(activities)}
              columns={day_columns}
              bordecolors={true}
              striped
              hover
              condensed
            />
          </div>
        </>
      )}

      <h3 className="stats-header">Activities by Time of Day</h3>
      <div className="stats-chart" data-testid="activities-time-chart">
        <Bar
          data={getActivitiesByTimeOfDay(activities)}
          height={450}
          options={{ maintainAspectRatio: false }}
        />
      </div>

      {isLargeScreen && (
        <>
          <h3 className="stats-header">Activities by Intensity</h3>
          <DropdownButton className="button-position" title={doughnutAttr}>
            {["Number of Activities", "Total Time (Hours)"].map((attr, i) => {
              return (
                <Dropdown.Item
                  key={i}
                  onClick={(e) => {
                    setDoughnutAttr(attr);
                  }}
                >
                  {attr}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
          <div className="doughnut-chart" data-testid="intensity-chart">
            <Doughnut
              data={getActivitiesByIntensityDoughnut(
                activities,
                heartRateZones,
                doughnutAttr
              )}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </div>
          <div className="heart-rate-table" data-testid="intensity-table">
            <BootstrapTable
              keyField="id"
              data={getActivitiesByIntensityTable(activities, heartRateZones)}
              columns={heart_rate_columns}
              bordecolors={true}
              striped
              hover
              condensed
            />
          </div>
        </>
      )}
      <Branding />
    </div>
  );
}

export default Stats;
