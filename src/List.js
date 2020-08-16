import React, { Component } from 'react';
import Navigation from './Navigation';
import ListIcon from './icons/list.svg';
import Modal from 'react-bootstrap/Modal';
import { Spinner } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import './Stats.css';

const { ExportCSVButton } = CSVExport;

const paginationOptions = {
    sizePerPage: 50,
    hideSizePerPage: true
}

class List extends Component {

    state = {
        formatted_activities: [],
        dataCalled: false
    }

    formatData = () => {
        var user_activities = this.props.data.activities
        for (let i = 0; i < user_activities.length; i++) {

            let time_and_date = user_activities[i]["start_date_local"]
            let date = time_and_date.substring(0, time_and_date.indexOf('T'))
            let year = date.substring(0, 4)
            let day_month = date.substring(5, date.length)
            user_activities[i]["date"] = day_month + "-" + year
            user_activities[i]["time"] = this.convertMilitaryTime(time_and_date.substring(time_and_date.indexOf('T') + 1, time_and_date.indexOf('T') + 6))

            if (user_activities[i]["moving_time"].toString().match(/^[0-9]+$/) != null) {
                user_activities[i]["pace"] = this.formatPace(user_activities[i]["moving_time"],  user_activities[i]["distance"])
                user_activities[i]["moving_time"] = this.formatTime(user_activities[i]["moving_time"])
                user_activities[i]["elapsed_time"] = this.formatTime(user_activities[i]["elapsed_time"])
                user_activities[i]["distance"] = (user_activities[i]["distance"] / 1609.344).toFixed(2)
            }

            if (user_activities[i]["max_heartrate"] === undefined) {
                user_activities[i]["max_heartrate"] = "N/A"
            }

            if (user_activities[i]["average_heartrate"] === undefined) {
                user_activities[i]["average_heartrate"] = "N/A"
            }
        }

        this.setState({ formatted_activities : user_activities})
    }

    convertMilitaryTime = (time) => {
        var parts = time.split(':')
        var hour = parts[0]
        var minutes = parts[1]

        if (hour > 12) {
            return (hour - 12) + ":" + minutes + " PM"
        } else if (hour === 0) {
            return "12:" + minutes + "AM"
        } else if (hour === 12) {
            return time + " PM"
        } else if (hour < 10) {
            return hour.substring(1) + ":" + minutes + " AM"
        } else {
            return time + " AM"
        }
    }

    formatTime = (secs) => {
        var hours = Math.floor(secs / 3600)
        var minutes = Math.floor((secs - (hours * 3600)) / 60)
        var seconds = secs - (hours * 3600) - (minutes * 60)
        var time = ""

        console.log('hour min sec', hours, minutes, seconds)

        if (hours != 0) {
            time = hours + ":"
        }

        if (minutes != 0 || time !== "") {
            minutes = (minutes < 10 && time !== "") ? "0" + minutes : String(minutes)
            time += minutes + ":"
        }

        if (time === "") {
            time = seconds + "s"
        } else {
            time += (seconds < 10) ? "0" + seconds : String(seconds)
        }

        return time
    }

    formatPace = (time, distance) => {
        let decimal_pace = (time / 60) / (distance / 1609.344)
        let remainder = decimal_pace % 1
        let minutes = Math.floor(decimal_pace)
        let seconds = (remainder * 60)
        if (seconds < 10) {
          seconds = "0" + seconds.toFixed(0)
        } else {
          seconds = seconds.toFixed(0)
        }
        let result = minutes + ":" + seconds + " /mi"
        return result
    }

    getCSVName = () => {
        if (localStorage.getItem('is_sample')) {
            let date = new Date()
            let date_string = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear()
            return 'Strava Activity Data ' + date_string + '.csv'
        } else {
            return 'Sample Strava Activity Data.csv'
        }
    }

    render () {

        if (this.props.data.activities.length > 0 && !this.state.dataCalled) {
            this.formatData()
            this.setState({ dataCalled : true })
        }

        const columns = [
            {
                dataField: "id",
                hidden: true
            },
            {
                dataField: "name",
                text: "Name"
            },
            {
                dataField: "date",
                text: "Date",
                sort: true
            },
            {
                dataField: "time",
                text: "Start Time",
                sort: true
            },
            {
                dataField: "distance",
                text: "Distance (Mi)",
                sort: true
            },
            {
                dataField: "moving_time",
                text: "Moving Time",
                sort: true
            },
            {
                dataField: "elapsed_time",
                text: "Elapsed Time",
                sort: true
              },
              {
                dataField: "pace",
                text: "Pace",
                sort: true
              },
            {
                dataField: "total_elevation_gain",
                text: "Elevation Gain (Ft)",
                sort: true
            },
            {
                dataField: "type",
                text: "Type",
                sort: true
            },
            {
                dataField: "athlete_count",
                text: "Athletes",
                sort: true
              },
            {
                dataField: "average_heartrate",
                text: "Average Heart Rate",
                sort: true
            },
            {
                dataField: "max_heartrate",
                text: "Max Heart Rate",
                sort: true
            }
        ]

        return (
            <div>
                <Modal 
                    show={this.state.formatted_activities.length === 0}
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

                <img class="img-stats" src={ListIcon}></img>
                <h1 className="black-header"> List of Activities </h1>

                <ToolkitProvider
                    keyField='id' 
                    data={ this.state.formatted_activities } 
                    columns={ columns }
                    exportCSV={ {
                        fileName: this.getCSVName()
                    } }
                >
                    {
                        props => (
                            <div class="bootstrap-table">
                                <ExportCSVButton { ...props.csvProps } class="csv-btn">
                                    Export to CSV
                                </ExportCSVButton>
                                <BootstrapTable 
                                    keyField='id' 
                                    data={ this.state.formatted_activities } 
                                    columns={ columns } 
                                    bordercolors={ true }
                                    striped
                                    hover
                                    condensed
                                    pagination={paginationFactory(paginationOptions)}
                                    { ...props.baseProps }
                                />
                            </div>
                        )
                    }
                </ToolkitProvider>
            </div>
        )

    }
}

export default List;