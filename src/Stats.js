import React, { Component } from 'react';
import Navigation from './Navigation';
import StatsIcon from './icons/stats.svg';
import { Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from "react-bootstrap-table2-paginator";
import { Line, Radar, Bar } from "react-chartjs-2";
import './Stats.css';

const paginationOptions = {
    paginationSize: 10,
    hideSizePerPage: true
}

// colors are red, blue, orange, green, purple, yellow, grey
const colors = [["rgba(255, 134,159,0.4)", "rgba(255, 134,159,1)"], ["rgba(98,  182, 239,0.4)", "rgba(98,  182, 239,1)"], ["rgba(113, 205, 205,0.4)", "rgba(113, 205, 205,1)"], ["rgba(170, 128, 252,0.4)", "rgba(170, 128, 252,1)"], ["rgba(255, 177, 101,0.4)", "rgba(255, 177, 101,1)"], ["rgba(255, 218, 128,0.4)", "rgba(255, 218, 128,1)"], ['rgba(201, 203, 207, 0.4)', 'rgba(201, 203, 207, 1)']]

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
            label: "Average Intensity of Workout (based on Heart Rate)",
            backgroundColor: "rgba(71, 225, 167, 0.5)",
            borderColor: "rgb(71, 225, 167)",
            data: [0, 0, 0, 0, 0, 0, 0]
          }
        ]
      },
      dataBar: {
        labels: ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"],
        datasets: [
          {
            label: "Number of Activities",
            data: [],
            backgroundColor: [colors[0][0], colors[0][0], colors[0][0], colors[0][0], colors[1][0], colors[1][0], colors[1][0], colors[1][0], colors[1][0], colors[1][0], colors[1][0], colors[2][0], colors[2][0], colors[2][0], colors[3][0], colors[3][0], colors[3][0], colors[4][0], colors[4][0], colors[4][0], colors[4][0], colors[0][0], colors[0][0], colors[0][0]],
            borderWidth: 2,
            borderColor: [colors[0][1], colors[0][1], colors[0][1], colors[0][1], colors[1][1], colors[1][1], colors[1][1], colors[1][1], colors[1][1], colors[1][1], colors[1][1], colors[2][1], colors[2][1], colors[2][1], colors[3][1], colors[3][1], colors[3][1], colors[4][1], colors[4][1], colors[4][1], colors[4][1], colors[0][1], colors[0][1], colors[0][1]]
          }
        ]
      },
      dataLine: {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: []
      },
      dataCalled: false,
      day_mile_counts: []
    }

    getWorkoutStatsByMonth = () => {

      let user_activities = this.props.data.activities.reverse()
      let current_year = user_activities[0]["start_date_local"].split("-")[0]
      let year_data = new Array(12).fill(0)
      let user_datasets = []
      let curr_color = 0

      for (let i = 0; i < user_activities.length; i++) {
        let activity_year = user_activities[i]["start_date_local"].split("-")[0]
        let activity_month = parseInt(user_activities[i]["start_date_local"].split("-")[1]) - 1

        if (activity_year !== current_year) {
          user_datasets.push({
            label: current_year,
            fill: true,
            lineTension: 0.3,
            backgroundColor: colors[curr_color][0],
            borderColor: colors[curr_color][1],
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: colors[curr_color][1],
            pointBackgroundColor: colors[curr_color][1],
            pointBorderWidth: 10,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors[curr_color][0],
            pointHoverBorderColor: colors[curr_color][1],
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.convertMetersToMiles(year_data)
          })

          if (curr_color === 6) {
            curr_color = 0
          } else {
            curr_color += 1
          }
          year_data = new Array(12).fill(0)
          current_year = activity_year
        }

        year_data[activity_month] += user_activities[i]["distance"]

        if (i === user_activities.length - 1) {
          user_datasets.push({
            label: activity_year,
            fill: true,
            lineTension: 0.3,
            backgroundColor: colors[curr_color][0],
            borderColor: colors[curr_color][1],
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: colors[curr_color][1],
            pointBackgroundColor: colors[curr_color][1],
            pointBorderWidth: 10,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors[curr_color][0],
            pointHoverBorderColor: colors[curr_color][1],
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.convertMetersToMiles(year_data)
          })
        }
      }

      let dataLineState = this.state.dataLine
      dataLineState.datasets = user_datasets  
      this.setState({ dataLine: dataLineState})
    }

    convertMetersToMiles = (meters) => {
      let result = meters
      for (let i = 0; i < result.length; i++) {
        result[i] = parseFloat((result[i] / 1609.344).toFixed(2))
      }
      return result
    }

    getWorkoutStatsByDay = () => {
      let user_activities = this.props.data.activities.reverse()

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
      Monday is number of Monday activities divided by number of Mondays between the two dates. Also calculate
      the average workout intensity, pace and total miles for each day. */
      var used_dates = []
      var day_counts = [0, 0, 0, 0, 0, 0, 0]
      var intensity_counts = [0, 0, 0, 0, 0, 0, 0]
      var activity_counts = [0, 0, 0, 0, 0, 0, 0]
      var day_mile_counts = [{'id': 0, 'day': 'Monday', 'miles': 0, 'pace': ''}, {'id': 1, 'day': 'Tuesday', 'miles': 0, 'pace': ''}, {'id': 2, 'day': 'Wednesday', 'miles': 0, 'pace': ''}, {'id': 3, 'day': 'Thursday', 'miles': 0, 'pace': ''}, {'id': 4, 'day': 'Friday', 'miles': 0, 'pace': ''}, {'id': 5, 'day': 'Saturday', 'miles': 0, 'pace': ''}, {'id': 6, 'day': 'Sunday', 'miles': 0, 'pace': ''}]
      var pace_times = [0, 0, 0, 0, 0, 0, 0]
      var pace_distances = [0, 0, 0, 0, 0, 0, 0]
      for (let i = 0; i < user_activities.length; i++) {
        let activity_day = new Date(user_activities[i]["start_date_local"].split("T")[0])
        let activity_day_of_week = activity_day.getDay()
        if (!(used_dates.includes(activity_day))) {
            day_counts[activity_day_of_week] += 1
            used_dates.push(activity_day)
        }

        if (user_activities[i]["has_heartrate"]) {
          intensity_counts[activity_day_of_week] += this.getWorkoutIntensity(user_activities[i]["average_heartrate"])
          activity_counts[activity_day_of_week] += 1
        }

        day_mile_counts[activity_day_of_week]["miles"] += user_activities[i]["distance"]
        pace_times[activity_day_of_week] += user_activities[i]["moving_time"]
        pace_distances[activity_day_of_week] += user_activities[i]["distance"]
      }

      for (let i = 0; i < day_counts.length; i++) {
        day_counts[i] = parseFloat(((day_counts[i] / week_counts[i]) * 100).toFixed(2))
        intensity_counts[i] = parseFloat((intensity_counts[i] / activity_counts[i]).toFixed(2))
        day_mile_counts[i]["miles"] = (day_mile_counts[i]["miles"] / 1609).toFixed(2)
        day_mile_counts[i]["pace"] = this.paceConversionFormat(pace_times[i], pace_distances[i])
      }

      let dataRadarState = this.state.dataRadar
      dataRadarState.datasets[0].data = day_counts
      dataRadarState.datasets[1].data = intensity_counts
      this.setState({ dataRadar : dataRadarState })
      this.setState({ day_mile_counts })
    }

    // An activity with an average heart rate in zone 2 at least 40% intensity, zone 3 is at least 60% intensity, etc
    getWorkoutIntensity = (heart_rate) => {
      let heart_rate_zones = this.props.data.heart_rate_zones
      let workout_intensity = 0
      
      for (let i = 0; i < heart_rate_zones.length; i++) {
        if (heart_rate <= heart_rate_zones[i]["max"] || heart_rate_zones[i]["max"] === -1) {

          if (i === 0) {
            workout_intensity = 20
          } else if (i === 4) {
            workout_intensity = 100
          } else {
            let heart_zone_range = heart_rate_zones[i]["max"] - heart_rate_zones[i]["min"]
            workout_intensity = ((i + 1) * 20) + (((heart_rate - heart_rate_zones[i]["min"]) * 20) / heart_zone_range)
          }
          break;
        }
      }

      return workout_intensity
    }

    // Converts Seconds/Meters to Minutes per 1 mile
    paceConversionFormat = (time, distance) => {
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

    // Get number of workout activities started at each hour
    getWorkoutStatsByTimeOfDay = () => {
      let user_activities = this.props.data.activities
      let hours = new Array(24).fill(0)
      for (let i = 0; i < user_activities.length; i++) {
        let activity_hour = parseInt(user_activities[i]["start_date_local"].split(":")[0].slice(-2))
        hours[activity_hour] += 1
      }
      let dataBarState = this.state.dataBar
      dataBarState.datasets[0].data = hours
      this.setState({ dataBar : dataBarState})
    }

    render() {

      const city_columns = [
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

      const day_columns = [
        {
          dataField: "id",
          hidden: true
        },
        {
          dataField: "day",
          text: "Day"
        },
        {
          dataField: "miles",
          text: "Total Miles"
        },
        {
          dataField: "pace",
          text: "Average Pace"
        }
      ]

        if ((this.props.data.activities.length > 0 && this.props.data.heart_rate_zones.length > 0) && !this.state.dataCalled) {
          this.getWorkoutStatsByMonth()
          this.getWorkoutStatsByDay()
          this.getWorkoutStatsByTimeOfDay()
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
                  columns={ city_columns } 
                  bordecolors={ true }
                  striped
                  hover
                  condensed
                  pagination={paginationFactory(paginationOptions)}
                />
              </div>

              <h3 className="stats-header">Activities by Year and Month</h3>
              <div className="stats-chart">
                <Line 
                  data={this.state.dataLine} 
                  height={450}
                  options={{ responsive: true, maintainAspectRatio: false }} />
              </div>

              <h3 className="stats-header">Activities by Day of Week</h3>
              <div class="radar-chart">
                <Radar 
                  data={this.state.dataRadar} 
                  options={{ responsive: true, maintainAspectRatio: true }}
                />
              </div>
              <div class="day-table">
                <BootstrapTable 
                  keyField='id' 
                  data={ this.state.day_mile_counts } 
                  columns={ day_columns } 
                  bordecolors={ true }
                  striped
                  hover
                  condensed
                />
              </div>

              <h3 className="stats-header">Activities by Time of Day</h3>
              <div class="stats-chart">
                <Bar 
                  data={this.state.dataBar}
                  height={450}
                  options={{ maintainAspectRatio: false }} />
              </div>

          </div>
        )
    }
}

export default Stats;