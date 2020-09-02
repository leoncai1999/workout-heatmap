import React, { Component } from 'react';
import Navigation from './Navigation';
import StatsIcon from '../Icons/stats.svg';
import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from "react-bootstrap-table2-paginator";
import { Line, Radar, Bar, Doughnut } from "react-chartjs-2";
import Branding from '../Images/powered_by_strava.png';
import '../Styles/Stats.css';

const paginationOptions = {
    sizePerPage: 10,
    hideSizePerPage: true
}

// colors are red, blue, green, orange, purple, yellow, grey
const colors = [["rgba(255, 134,159,0.4)", "rgba(255, 134,159,1)"], ["rgba(98,  182, 239,0.4)", "rgba(98,  182, 239,1)"], ["rgba(113, 205, 205,0.4)", "rgba(113, 205, 205,1)"], ["rgba(255, 177, 101,0.4)", "rgba(255, 177, 101,1)"], ["rgba(170, 128, 252,0.4)", "rgba(170, 128, 252,1)"], ["rgba(255, 218, 128,0.4)", "rgba(255, 218, 128,1)"],['rgba(201, 203, 207, 0.4)', 'rgba(201, 203, 207, 1)']]

class Stats extends Component {

    state = {
      dataRadar: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        datasets: [
          {
            label: "Likelihood of Working Out",
            backgroundColor: colors[1][0],
            borderColor: colors[1][1],
            data: []
          },
          {
            label: "Average Intensity of Workout (based on Heart Rate)",
            backgroundColor: colors[0][0],
            borderColor: colors[0][1],
            data: []
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
      dataLineOptions: {
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              reverse: true
            }
          }]
        }
      },
      dataDoughnut: {
        labels: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
        datasets: [
          {
            data: [],
            backgroundColor: [colors[6][0], colors[2][0], colors[5][0], colors[3][0], colors[0][0]],
            borderColor: [colors[6][1], colors[2][1], colors[5][1], colors[3][1], colors[0][1]],
            hoverBackgroundColor: [colors[6][0], colors[2][0], colors[5][0], colors[3][0], colors[0][0]]
          }
        ]
      },
      dataCalled: false,
      day_mile_counts: [],
      selected_attr: 'Select Attribute',
      heart_rate_zone_counts: [],
      selected_attr_doughnut: 'Select Attirbute',
      total_distance: '',
      total_time: ''
    }

    getWorkoutStatsByMonth = (attr) => {

      let user_activities = this.props.data.activities.reverse()
      let current_year = user_activities[0]["start_date_local"].split("-")[0]
      let year_data = new Array(12).fill(0)
      let distance_per_month = new Array(12).fill(0)
      let user_datasets = []
      let curr_color = 0

      for (let i = 0; i < user_activities.length; i++) {
        let activity_year = user_activities[i]["start_date_local"].split("-")[0]
        let activity_month = parseInt(user_activities[i]["start_date_local"].split("-")[1]) - 1

        if (activity_year !== current_year) {
          if (attr === 'pace') {
            year_data = this.formatPaceData(year_data, distance_per_month)
          }
          user_datasets.push({
            label: current_year,
            fill: attr !== 'pace',
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
            data: this.formatData(year_data, attr)
          })

          if (curr_color === 6) {
            curr_color = 0
          } else {
            curr_color += 1
          }
          year_data = new Array(12).fill(0)
          distance_per_month = new Array(12).fill(0)
          current_year = activity_year
        }

        if (attr === 'miles') {
          year_data[activity_month] += user_activities[i]["distance"]
        } else if (attr === 'elevation') {
          year_data[activity_month] += user_activities[i]["total_elevation_gain"]
        } else if (attr === 'activities') {
          year_data[activity_month] += 1
        } else {
          year_data[activity_month] += user_activities[i]["moving_time"]
          distance_per_month[activity_month] += user_activities[i]["distance"]
        }

        if (i === user_activities.length - 1) {
          if (attr === 'pace') {
            year_data = this.formatPaceData(year_data, distance_per_month)
          }
          user_datasets.push({
            label: activity_year,
            fill: attr !== 'pace',
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
            data: this.formatData(year_data, attr)
          })
        }
      }

      let dataLineState = this.state.dataLine
      dataLineState.datasets = user_datasets
      let dataLineOptionsState = this.state.dataLineOptions
      if (attr === 'pace') {
        dataLineOptionsState.scales.yAxes[0].ticks.reverse = true
      } else {
        dataLineOptionsState.scales.yAxes[0].ticks.reverse = false
      }
      this.setState({ dataLine: dataLineState })
      this.setState({ dataLineOptions: dataLineOptionsState })

      if (attr === 'miles') {
        this.setState({ selected_attr: 'Distance (Miles)'})
      } else if (attr === 'elevation') {
        this.setState({ selected_attr: 'Elevation Gain (Feet)'})
      } else if (attr === 'activities') {
        this.setState({ selected_attr: 'Number of Activities'})
      } else {
        this.setState({ selected_attr: 'Pace (Minutes per Mile)'})
      }
    }

    formatData = (data, attr) => {
      let result = data
      for (let i = 0; i < result.length; i++) {
        if (result[i] === 0) {
          result[i] = NaN
        } else if (attr === 'miles') {
          result[i] = parseFloat((result[i] / 1609.344).toFixed(2))
        } else if (attr === 'elevation') {
          result[i] = parseFloat((result[i] * 3.28084).toFixed(2))
        }
      }
      return result
    }

    formatPaceData = (time, dist) => {
      let result = time
      for (let i = 0; i < result.length; i++) {
        result[i] = parseFloat(((time[i] / 60) / (dist[i] / 1609.344)).toFixed(2))
      }
      return result
    }

    getWorkoutStatsByDay = () => {
      let user_activities = this.props.data.activities.reverse()

      let first_day = new Date(user_activities[0]["start_date_local"].split("T")[0])
      let first_day_of_week = first_day.getDay()

      let last_day = new Date(user_activities[user_activities.length - 1]["start_date_local"].split("T")[0])

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

    // An activity with an average heart rate in zone 2 at least 60% intensity, zone 3 is at least 70% intensity, etc
    getWorkoutIntensity = (heart_rate) => {
      let heart_rate_zones = this.props.data.heart_rate_zones
      let workout_intensity = 0
      
      for (let i = 0; i < heart_rate_zones.length; i++) {
        if (heart_rate <= heart_rate_zones[i]["max"] || heart_rate_zones[i]["max"] === -1) {

          if (i === 0) {
            workout_intensity = 50
          } else if (i === 4) {
            workout_intensity = 100
          } else {
            let heart_zone_range = heart_rate_zones[i]["max"] - heart_rate_zones[i]["min"]
            workout_intensity = (50 + (i*10)) + (((heart_rate - heart_rate_zones[i]["min"]) * 10) / heart_zone_range)
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
      let total_miles = 0
      let total_seconds = 0
      for (let i = 0; i < user_activities.length; i++) {
        let activity_hour = parseInt(user_activities[i]["start_date_local"].split(":")[0].slice(-2))
        hours[activity_hour] += 1

        total_miles += user_activities[i]["distance"]
        total_seconds += user_activities[i]["moving_time"]
      }
      let dataBarState = this.state.dataBar
      dataBarState.datasets[0].data = hours
      this.setState({ dataBar : dataBarState })
      this.setState({ total_distance : (total_miles / 1609.344).toFixed(2)})
      this.setState({ total_time : (total_seconds / 3600).toFixed(0)})
    }

    getWorkoutStatsByIntensity = (mode, compute_table) => {
      let user_activities = this.props.data.activities
      let heart_rate_zones = this.props.data.heart_rate_zones
      var heart_rate_zone_counts = [{'id': 0, 'zone': 'Zone 1: Recovery / Cross Train'}, {'id': 1, 'zone': 'Zone 2: Endurance'}, {'id': 2, 'zone': 'Zone 3: Tempo Run'}, {'id': 3, 'zone': 'Zone 4: Speed Work / Distance Race'}, {'id': 4, 'zone': 'Zone 5: Sprint'}]
      var zone_counts = [0, 0, 0, 0, 0]
      var zone_time = [0, 0, 0, 0, 0]
      var zone_dist = [0, 0, 0, 0, 0]
      for (let i = 0; i < user_activities.length; i++) {
        if (user_activities[i]["has_heartrate"]) {
          let heart_rate = user_activities[i]["average_heartrate"]
          for (let j = 0; j < heart_rate_zones.length; j++) {
            if (heart_rate <= heart_rate_zones[j]["max"] || heart_rate_zones[j]["max"] === -1) {
              if (mode === 'activities') {
                zone_counts[j] += 1
              } else {
                zone_counts[j] += user_activities[i]["moving_time"]
              }
              if (compute_table) {
                zone_time[j] += user_activities[i]["moving_time"]
                zone_dist[j] += user_activities[i]["distance"]
              }
              break;
            }
          }
        }
      }

      if (compute_table) {
        for (let i = 0; i < heart_rate_zones.length; i++) {
          if (i === 4) {
            heart_rate_zone_counts[i]["heart_rate"] = heart_rate_zones[i]["min"] + "+ bpm"
          } else {
            heart_rate_zone_counts[i]["heart_rate"] = heart_rate_zones[i]["min"] + " to " + heart_rate_zones[i]["max"] + " bpm"
          }
          heart_rate_zone_counts[i]["intensity"] = (50 + (i*10)) + "% to " + (50 + ((i + 1)*10)) + "%"
          heart_rate_zone_counts[i]["pace"] = zone_time[i] === 0 ? "N/A" : this.paceConversionFormat(zone_time[i], zone_dist[i])
        }
        this.setState({ heart_rate_zone_counts })
      }

      if (mode === 'activities') {
        this.setState({ selected_attr_doughnut : 'Number of Activities' })
      } else {
        // converting total time in seconds to hours
        for (let i = 0; i < zone_counts.length; i++) {
          zone_counts[i] = parseFloat(((zone_counts[i]) / 3600).toFixed(2))
        }
        this.setState({ selected_attr_doughnut : 'Total Time (Hours)' })
      }

      let dataDoughnutState = this.state.dataDoughnut
      dataDoughnutState.datasets[0].data = zone_counts
      this.setState({ dataDoughnut : dataDoughnutState })
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

      const heart_rate_columns = [
        {
          dataField: "id",
          hidden: true
        },
        {
          dataField: "zone",
          text: "Zone"
        },
        {
          dataField: "intensity",
          text: "Intensity"
        },
        {
          dataField: "heart_rate",
          text: "Heart Rate"
        },
        {
          dataField: "pace",
          text: "Average Pace"
        }
      ]

        if ((this.props.data.activities.length > 0 && this.props.data.heart_rate_zones.length > 0) && !this.state.dataCalled) {
          this.getWorkoutStatsByMonth('miles')
          this.getWorkoutStatsByDay()
          this.getWorkoutStatsByTimeOfDay()
          this.getWorkoutStatsByIntensity('activities', true)
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

              <h2 className="stats-description">You've worked out {this.props.data.activities.length} times for a total of {this.state.total_time} hours, and traveled {this.state.total_distance} miles</h2>

              <h3 className="stats-header">Activities by City</h3>
              <div class="bootstrap-table">
                <BootstrapTable 
                  keyField='id' 
                  data={ this.props.data.cities } 
                  columns={ city_columns } 
                  bordercolors={ true }
                  striped
                  hover
                  condensed
                  pagination={paginationFactory(paginationOptions)}
                />
              </div>

              <h3 className="stats-header">Activities by Year and Month</h3>
              <div className="stats-chart">
              <DropdownButton id="dropdown-basic-button" title={this.state.selected_attr}>
                <Dropdown.Item onClick={(e) => {this.getWorkoutStatsByMonth('miles')}}>Distance (Miles)</Dropdown.Item>
                <Dropdown.Item onClick={(e) => {this.getWorkoutStatsByMonth('elevation')}}>Elevation Gain (Feet)</Dropdown.Item>
                <Dropdown.Item onClick={(e) => {this.getWorkoutStatsByMonth('activities')}}>Number of Activities</Dropdown.Item>
                <Dropdown.Item onClick={(e) => {this.getWorkoutStatsByMonth('pace')}}>Pace (Minutes per Mile)</Dropdown.Item>
              </DropdownButton>
                <Line 
                  data={this.state.dataLine} 
                  height={450}
                  options={this.state.dataLineOptions} />
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

              <h3 className="stats-header">Activities by Intensity</h3>
              <DropdownButton className="button-position" title={this.state.selected_attr_doughnut}>
                <Dropdown.Item onClick={(e) => {this.getWorkoutStatsByIntensity('activities', false)}}>Number of Activities</Dropdown.Item>
                <Dropdown.Item onClick={(e) => {this.getWorkoutStatsByIntensity('time', false)}}>Total Time (Hours)</Dropdown.Item>
              </DropdownButton>
              <div class="doughnut-chart">
                <Doughnut 
                  data={this.state.dataDoughnut} 
                  options={{ responsive: true, maintainAspectRatio: true  }} 
                />
              </div>
              <div class="heart-rate-table">
              <BootstrapTable 
                  keyField='id' 
                  data={ this.state.heart_rate_zone_counts } 
                  columns={ heart_rate_columns } 
                  bordecolors={ true }
                  striped
                  hover
                  condensed
                />
              </div>
              <div id="branding">
                <img src={Branding}/>
              </div>
          </div>
        )
    }
}

export default Stats;