import React from "react";
import { getActivitiesByYearAndMonth } from "../utils/chart.js";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import "../styles/Stats.css";

function YearlyLineChart({ lineAttr, setLineAttr, activities }) {
  return (
    <div className="stats-chart">
      <DropdownButton id="dropdown-basic-button" title={lineAttr}>
        {[
          "Distance (Miles)",
          "Elevation Gain (Feet)",
          "Number of Activities",
          "Pace (Minutes per Mile)",
        ].map((attr) => {
          return (
            <Dropdown.Item
              onClick={(e) => {
                setLineAttr(attr);
              }}
            >
              {attr}
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
      <Line
        data={getActivitiesByYearAndMonth(activities, lineAttr)}
        height={150}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            yAxes: [
              {
                ticks: {
                  reverse: lineAttr === "Pace (Minutes per Mile)",
                },
              },
            ],
          },
        }}
      />
    </div>
  );
}

export default YearlyLineChart;
