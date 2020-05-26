import React, { Component } from 'react';
import Navigation from './Navigation';
import StatsIcon from './icons/stats.svg';
import { Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from "react-bootstrap-table2-paginator";
import { Radar } from "react-chartjs-2";
import './Stats.css';

const paginationOptions = {
    paginationSize: 10,
    hideSizePerPage: true
}

class Stats extends Component {

    state = {
        dataRadar: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "Likelihood of Working Out",
              backgroundColor: "rgba(194, 116, 161, 0.5)",
              borderColor: "rgb(194, 116, 161)",
              data: [0, 0, 0, 0, 0, 0, 0]
            },
            {
              label: "My Second dataset",
              backgroundColor: "rgba(71, 225, 167, 0.5)",
              borderColor: "rgb(71, 225, 167)",
              data: [28, 48, 40, 19, 96, 27,100]
            }
          ]
        },
        dataCalled: false
    }

    getWorkoutLikelihoodByDay = () => {
        let user_activities = this.props.data.activities.reverse()
        console.log("user activities are ", user_activities)

        let first_day = new Date(user_activities[0]["start_date_local"].split("T")[0])
        let first_day_of_week = first_day.getDay()

        // last day is either the current date, or day of last activity if sample account is used
        let last_day = new Date()
        if (this.props.data.is_sample === true) {
            last_day = new Date(user_activities[user_activities.length - 1]["start_date_local"].split("T")[0])
        }

        // count number of each type of day between between two days
        let days_between = Math.round((first_day - last_day) / (24 * 60 * 60 * 1000))
        let weeks_between = days_between / 7
        let leftover_days = days_between % 7
        var week_counts = [weeks_between, weeks_between, weeks_between, weeks_between, weeks_between, weeks_between, weeks_between]
        let curr_day = first_day_of_week
        while (leftover_days > 0) {
            if (curr_day === 7) {
                curr_day = 0
            }
            week_counts[curr_day] += 1
            leftover_days -= 1
        }

        /* Calculate percent likelihood of working out each day. For example, likelihood of working out on
        Monday is number of Monday activities divided by number of Mondays between the two dates */
        var used_dates = []
        var day_counts = [0, 0, 0, 0, 0, 0, 0]
        for (let i = 0; i < user_activities.length; i++) {
            let activity_day = new Date(user_activities[i]["start_date_local"].split("T")[0])
            let activity_day_of_week = activity_day.getDay()
            console.log("getting day of week", activity_day_of_week )
            if (!(used_dates.includes(activity_day))) {
                day_counts[activity_day_of_week] += 1
                used_dates.push(activity_day)
            }
        }
        for (let i = 0; i < day_counts.length; i++) {
            day_counts[i] = (day_counts[i] / week_counts[i]) * 100
        }

        console.log("day counts were", day_counts)

        let dataRadarState = this.state.dataRadar
        dataRadarState.datasets[0].data = day_counts
        console.log("day counts are", day_counts)
        this.setState({ dataRadar : dataRadarState })
    }

    render() {

        const columns = [
            {
              dataField: "id",
              hidden: true
            },
            {
              dataField: "city",
              text: "City"
            },
            {
              dataField: "activities",
              text: "Activities",
              sort: true
            },
            {
              dataField: "miles",
              text: "Distance (Miles)",
              sort: true
            },
            {
              dataField: "elevation",
              text: "Elevation Gain (Feet)",
              sort: true
            },
            {
              dataField: "hours",
              text: "Time (Hours)",
              sort: true
            }
        ]

        if (this.props.data.activities.length > 0 && !this.state.dataCalled) {
            this.getWorkoutLikelihoodByDay()
            this.setState({ dataCalled: true})
        }
        
        return (
            <div>
                <Modal 
                    show={this.props.data.cities.length === 0}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Body>
                    <div className="loading-center">
                        <p className="loading-text">Loading Statistics ...</p>
                        <Spinner animation="border" className="loading-spinner" />
                    </div>
                    </Modal.Body>
                </Modal>

                <Navigation />

                <img class="img-stats" src={StatsIcon}></img>
                <h1 className="black-header"> Workout Statistics </h1>

                <h3 className="stats-header">Activities by City</h3>

                <div class="bootstrap-table">
                    <BootstrapTable 
                        keyField='id' 
                        data={ this.props.data.cities } 
                        columns={ columns } 
                        bordered={ true }
                        striped
                        hover
                        condensed
                        pagination={paginationFactory(paginationOptions)}
                    />
                </div>

                <h3 className="stats-header">Activities by Day of Week</h3>
                <Radar data={this.state.dataRadar} options={{ responsive: true }} />

            </div>
        )
    }
}

export default Stats;