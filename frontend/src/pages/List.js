import React, { useEffect } from "react";
import Navigation from "../components/Navigation.js";
import Branding from "../components/Branding.js";
import ListIcon from "../assets/list.svg";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { CSVExport } from "react-bootstrap-table2-toolkit";
import {
  sortDates,
  sortTimesOfDay,
  sortDuration,
  sortPace,
} from "../utils/sort.js";
import "../styles/Stats.css";

function List() {
  const { ExportCSVButton } = CSVExport;

  const paginationOptions = {
    sizePerPage: 50,
    hideSizePerPage: true,
  };

  const columns = [
    {
      dataField: "id",
      hidden: true,
    },
    {
      dataField: "name",
      text: "Name",
      classes: "linked-activity",
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          window.open("https://www.strava.com/activities/" + row.id);
        },
      },
    },
    {
      dataField: "formatted_start_date",
      text: "Date",
      sort: true,
      sortFunc: (a, b, order) => {
        return sortDates(a, b, order);
      },
    },
    {
      dataField: "formatted_start_time",
      text: "Start Time",
      sort: true,
      sortFunc: (a, b, order) => {
        return sortTimesOfDay(a, b, order);
      },
    },
    {
      dataField: "distance",
      text: "Distance (Mi)",
      sort: true,
      sortFunc: (a, b, order) => {
        return order === "asc" ? b - a : a - b;
      },
    },
    {
      dataField: "formatted_moving_time",
      text: "Moving Time",
      sort: true,
      sortFunc: (a, b, order) => {
        return sortDuration(a, b, order);
      },
    },
    {
      dataField: "formatted_elapsed_time",
      text: "Elapsed Time",
      sort: true,
      sortFunc: (a, b, order) => {
        return sortDuration(a, b, order);
      },
    },
    {
      dataField: "pace",
      text: "Pace",
      sort: true,
      sortFunc: (a, b, order) => {
        return sortPace(a, b, order);
      },
    },
    {
      dataField: "total_elevation_gain",
      text: "Elevation Gain (Ft)",
      sort: true,
      sortFunc: (a, b, order) => {
        return order === "asc" ? b - a : a - b;
      },
    },
    {
      dataField: "type",
      text: "Type",
      sort: true,
    },
    {
      dataField: "athlete_count",
      text: "Athletes",
      sort: true,
      sortFunc: (a, b, order) => {
        return order === "asc" ? b - a : a - b;
      },
    },
    {
      dataField: "average_heartrate",
      text: "Average Heart Rate",
      sort: true,
      sortFunc: (a, b, order) => {
        return order === "asc" ? b - a : a - b;
      },
    },
    {
      dataField: "max_heartrate",
      text: "Max Heart Rate",
      sort: true,
      sortFunc: (a, b, order) => {
        return order === "asc" ? b - a : a - b;
      },
    },
  ];

  const activities = JSON.parse(sessionStorage["activities"]);

  useEffect(() => {
    document.body.style.background = "#e8e1eb";
  }, []);

  function getCSVName() {
    if (sessionStorage.getItem("is_sample")) {
      let date = new Date();
      let date_string =
        date.getMonth() + 1 + "-" + date.getDate() + "-" + date.getFullYear();
      return "Strava Activity Data " + date_string + ".csv";
    } else {
      return "Sample Strava Activity Data.csv";
    }
  }

  function formatData(activities) {
    var formatted_activities = activities.forEach((activity) => {
      activity["distance"] = parseFloat(activity["distance"].toFixed(2))
      activity["total_elevation_gain"] = parseFloat(activity["total_elevation_gain"].toFixed(2))

      if (activity["max_heartrate"] === undefined) {
        activity["max_heartrate"] = "N/A"
      }

      if (activity["average_heartrate"] === undefined) {
        activity["average_heartrate"] = "N/A"
      }
    })

    return formatted_activities
  }

  return (
    <div>
      <Navigation />

      <img class="img-stats" src={ListIcon} alt="spreadsheet icon"></img>
      <h1 className="black-header"> List of Activities </h1>

      <ToolkitProvider
        keyField="id"
        data={activities}
        columns={columns}
        exportCSV={{
          fileName: getCSVName(),
        }}
      >
        {(props) => (
          <div class="bootstrap-table">
            <ExportCSVButton {...props.csvProps} class="csv-btn">
              Export to CSV
            </ExportCSVButton>
            <BootstrapTable
              keyField="id"
              data={formatData(activities)}
              columns={columns}
              bordercolors={true}
              striped
              hover
              condensed
              pagination={paginationFactory(paginationOptions)}
              {...props.baseProps}
            />
          </div>
        )}
      </ToolkitProvider>
      <Branding />
    </div>
  );
}

export default List;
