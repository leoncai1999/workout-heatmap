import React from "react";
import Navigation from "../components/Navigation.js";
import ListIcon from "../assets/list.svg";
import Modal from "react-bootstrap/Modal";
import { Spinner } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { CSVExport } from "react-bootstrap-table2-toolkit";
import Branding from "../assets/powered_by_strava.png";
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

  function getCSVName() {
    if (localStorage.getItem("is_sample")) {
      let date = new Date();
      let date_string =
        date.getMonth() + 1 + "-" + date.getDate() + "-" + date.getFullYear();
      return "Strava Activity Data " + date_string + ".csv";
    } else {
      return "Sample Strava Activity Data.csv";
    }
  }

  const activities = JSON.parse(sessionStorage.activities)

  return (
    <div>
      <Modal
        show={activities.length === 0}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <div className="loading-center">
            <p className="loading-text">Loading List of Activities ...</p>
            <Spinner animation="border" className="loading-spinner" />
          </div>
        </Modal.Body>
      </Modal>

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
              data={activities}
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
      <div id="branding">
        <img src={Branding} alt="powered by strava branding" />
      </div>
    </div>
  );
}

export default List;
