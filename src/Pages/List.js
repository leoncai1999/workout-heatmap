import React, { Component } from 'react';
import Navigation from '../Components/Navigation';
import ListIcon from '../Icons/list.svg';
import Modal from 'react-bootstrap/Modal';
import { Spinner } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import Branding from '../Images/powered_by_strava.png';
import '../Styles/Stats.css';

const { ExportCSVButton } = CSVExport;

const paginationOptions = {
    sizePerPage: 50,
    hideSizePerPage: true
}

class List extends Component {

    state = {
        dataCalled: false
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

    sortDates = (a, b, order) => {
        let b_month = parseInt(b.split("-")[0])
        let b_day = parseInt(b.split("-")[1])
        let b_year = parseInt(b.split("-")[2])
        let a_month = parseInt(a.split("-")[0])
        let a_day = parseInt(a.split("-")[1])
        let a_year = parseInt(a.split("-")[2])

        if (order === 'asc') {
            return (b_year - a_year) || (b_month - a_month) || (b_day - a_day)
        } else {
            return (a_year - b_year) || (a_month - b_month) || (a_day - b_day)
        }
    }

    sortTimesOfDay = (a, b, order) => {
        var b_hour = parseInt(b.split(":")[0])
        let b_minutes = parseInt(b.split(":")[1].substring(0,2))
        let b_am_pm = b.split(":")[1].substring(3,5)
        var a_hour = parseInt(a.split(":")[0])
        let a_minutes = parseInt(a.split(":")[1].substring(0,2))
        let a_am_pm = a.split(":")[1].substring(3,5)

        if (b_am_pm === "PM" && b_hour !== 12) {
            b_hour += 12
        }

        if (a_am_pm === "PM" && a_hour !== 12) {
            a_hour += 12
        }

        /* Earliest runs shown begin as early as 4 AM. Latest runs
            shown begin as late as 3:59 AM */
        if ((b_hour < 4 || b_hour === 12) && b_am_pm === "AM") {
            b_hour += b_hour === 12 ? 12 : 24
        }

        if ((a_hour < 4 || a_hour === 12) && a_am_pm === "AM") {
            a_hour += a_hour === 12 ? 12 : 24
        }

        return order === 'asc' ? (b_hour - a_hour || b_minutes - a_minutes) : (a_hour - b_hour || a_minutes - b_minutes)
    }

    sortDuration = (a, b, order) => {
        var b_hours = 0
        var b_minutes = 0
        var b_seconds = 0
        var a_hours = 0
        var a_minutes = 0
        var a_seconds = 0

        if (b.split(":").length === 3) {
            b_hours = parseInt(b.split(":")[0])
            b_minutes = parseInt(b.split(":")[1])
            b_seconds = parseInt(b.split(":")[2])
        } else {
            b_minutes = parseInt(b.split(":")[0])
            b_seconds = parseInt(b.split(":")[1])
        }
        if (a.split(":").length === 3) {
            a_hours = parseInt(a.split(":")[0])
            a_minutes = parseInt(a.split(":")[1])
            a_seconds = parseInt(a.split(":")[2])
        } else {
            a_minutes = parseInt(a.split(":")[0])
            a_seconds = parseInt(a.split(":")[1])
        }

        if (order === 'asc') {
            return (b_hours - a_hours) || (b_minutes - a_minutes) || (b_seconds - a_seconds)
        } else {
            return (a_hours - b_hours) || (a_minutes - b_minutes) || (a_seconds - b_seconds)
        }

    }

    sortPace = (a, b, order) => {
        let b_minutes = parseInt(b.split(":")[0])
        let b_seconds = parseInt(b.split(":")[1].substring(0,2))
        let a_minutes = parseInt(a.split(":")[0])
        let a_seconds = parseInt(a.split(":")[1].substring(0,2))

        return order === 'asc' ? (b_minutes - a_minutes || b_seconds - a_seconds) : (a_minutes - b_minutes || a_seconds - b_seconds)
    }

    render () {

        if (this.props.data.activities.length > 0 && !this.state.dataCalled) {
            this.setState({ dataCalled : true })
        }

        const columns = [
            {
                dataField: "id",
                hidden: true
            },
            {
                dataField: "name",
                text: "Name",
                classes: "linked-activity",
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {  window.open("https://www.strava.com/activities/" + row.id) }
                }
            },
            {
                dataField: "formatted_start_date",
                text: "Date",
                sort: true,
                sortFunc: (a, b, order) => {
                    return this.sortDates(a, b, order)
                }
            },
            {
                dataField: "formatted_start_time",
                text: "Start Time",
                sort: true,
                sortFunc: (a, b, order) => {
                    return this.sortTimesOfDay(a, b, order)
                }
            },
            {
                dataField: "distance",
                text: "Distance (Mi)",
                sort: true,
                sortFunc: (a, b, order) => {
                    return order === 'asc' ? b - a : a - b
                }
            },
            {
                dataField: "formatted_moving_time",
                text: "Moving Time",
                sort: true,
                sortFunc: (a, b, order) => {
                    return this.sortDuration(a, b, order)
                }
            },
            {
                dataField: "formatted_elapsed_time",
                text: "Elapsed Time",
                sort: true,
                sortFunc: (a, b, order) => {
                    return this.sortDuration(a, b, order)
                }
              },
              {
                dataField: "pace",
                text: "Pace",
                sort: true,
                sortFunc: (a, b, order) => {
                    return this.sortPace(a, b, order)
                }
              },
            {
                dataField: "total_elevation_gain",
                text: "Elevation Gain (Ft)",
                sort: true,
                sortFunc: (a, b, order) => {
                    return order === 'asc' ? b - a : a - b
                }
            },
            {
                dataField: "type",
                text: "Type",
                sort: true
            },
            {
                dataField: "athlete_count",
                text: "Athletes",
                sort: true,
                sortFunc: (a, b, order) => {
                    return order === 'asc' ? b - a : a - b
                }
              },
            {
                dataField: "average_heartrate",
                text: "Average Heart Rate",
                sort: true,
                sortFunc: (a, b, order) => {
                    return order === 'asc' ? b - a : a - b
                }
            },
            {
                dataField: "max_heartrate",
                text: "Max Heart Rate",
                sort: true,
                sortFunc: (a, b, order) => {
                    return order === 'asc' ? b - a : a - b
                }
            }
        ]

        return (
            <div>
                <Modal 
                    show={this.props.data.activities.length === 0}
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
                    data={ this.props.data.activities } 
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
                                    data={ this.props.data.activities } 
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
                <div id="branding">
                    <img src={Branding}/>
                </div>
            </div>
        )

    }
}

export default List;