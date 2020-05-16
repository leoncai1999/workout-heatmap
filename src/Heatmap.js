import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Polyline } from 'google-maps-react';
import axios from 'axios';
import * as keys from './APIKeys';
import { Button } from 'react-bootstrap';

const mapStyles = {
  width: '100%',
  height: '90%'
};

class Heatmap extends Component {

  state = {
    activities: [],
    polylines: [],
    access_token: '',
    map_center: {},
    cities: []
  };

  async componentDidMount() {

    const access_token = await this.updateAccessToken(String(window.location.href))

    window.history.pushState({}, null, 'http://localhost:3000/workout-heatmap')

    var user_activities = []
    var user_polylines = []

    var activities_left = true
    var page_num = 1;

    if (access_token !== '') {
      while (activities_left) {
        const activities = await this.getActivities(page_num, access_token)
  
        if (activities.length === 0) {
          activities_left = false
        } else {
          const decodePolyline = require('decode-google-map-polyline');
  
          for (let i = 0; i < activities.length; i++) {
            user_activities.push(activities[i])
  
            var polyline = activities[i]['map']['summary_polyline']
            if (polyline != null) {
              user_polylines.push(decodePolyline(polyline))
            }
          }
  
          this.setState({ activities : user_activities})
          this.setState({ polylines : user_polylines})
          page_num += 1
        }
      }
    }

    const cities = await this.getCitiesFromActivites(user_activities)
    console.log(cities)
    this.getCityActivityCounts(cities, user_activities)

    this.setState({ access_token })
    this.setState({ map_center: this.getMapCenter(user_activities) })
  }

  getCitiesFromActivites = async(user_activities) => {

    var message_bodies = []
    var curr_message_body = ''
    var activity_num = 1

    // format activity coordinates into batches of 100 for the Reverse Geocoding API
    for (let i = 0; i < user_activities.length; i++) {
      let activity_cords = user_activities[i].start_latlng
      if (activity_cords !== null) {
        let curr_message = 'id=' + activity_num + '&prox=' + activity_cords[0] + ',' + activity_cords[1] + ',500\n'
        curr_message_body += curr_message

        if (activity_num === 100) {
          activity_num = 1
          message_bodies.push(curr_message_body)
          curr_message_body = ''
        } else {
          activity_num += 1
        }
      }
    }

    const options = {
      'Content-Type': '*',
      'Cache-Control': 'no-cache'
    }

    const proxy_url = "https://cors-anywhere.herokuapp.com/"
    const api_url = "https://reverse.geocoder.ls.hereapi.com/6.2/multi-reversegeocode.json?mode=retrieveAreas&apiKey=" + keys.HERE_API_KEY

    var all_results = []

    for (let i = 0; i < message_bodies.length; i++) {
      let results = await axios
        .post(proxy_url + api_url, message_bodies[i], { headers: options })

      Array.prototype.push.apply(all_results, results.data.Response.Item)
    }

    return all_results
  }

  getCityActivityCounts = (cities, user_activities) => {
    var city_counts = []
    var last_activity_with_location = 0

    // need to account for other countries where State may be null
    for (let i = 0; i < cities.length; i++) {
      let address = cities[i].Result[0].Location.Address
      let city_name = address.City + ", " + address.State

      // Map the geocoding information of an activity to it's Strava details
      let lat = cities[i].Result[0].Location.DisplayPosition.Latitude
      let lng = cities[i].Result[0].Location.DisplayPosition.Longitude

      var activity = {}
      var activity_found = false
      var x = last_activity_with_location

      while (!activity_found) {
        let curr_activity = user_activities[x]
        if (curr_activity["start_latitude"] === lat && curr_activity["start_longitude"] === lng) {
          activity_found = true
          activity = curr_activity
          last_activity_with_location = x + 1
        } else {
          x += 1
        }
      }

      let activity_miles = activity["distance"] / 1609

      var unique_city = true
      var city_num = 0

      while (unique_city && city_num < city_counts.length) {
        if (city_counts[city_num]["city"] === city_name) {
          city_counts[city_num]["activities"] += 1
          city_counts[city_num]["miles"] += activity_miles
          unique_city = false
        } else {
          city_num += 1
        }
      }

      if (unique_city) {
        city_counts.push({'city' : city_name, 'activities' : 1, 'miles' : activity_miles })
      } 

    }

    // Sort cities by number of activites descending, breaking ties by total mileage
    city_counts.sort(function(a,b) {
      return b.activities - a.activities || b.miles - a.miles
    })

    console.log("city_counts")
    console.log(city_counts)
  }

  getActivities = async(page_num, access_token) => {
    var invalid_token = false

    let results = await axios
      .get("https://www.strava.com/api/v3/athlete/activities?", {
        params: {
          per_page: '200',
          page: page_num,
          access_token: access_token
        }
      }).catch(error => {
        invalid_token = true
      })

    return invalid_token ? [] : results.data
  }

  authenticateUser = () => {
    window.location.assign('https://www.strava.com/oauth/authorize?client_id=27965&redirect_uri=http://localhost:3000/workout-heatmap/callback&response_type=code&scope=activity:read_all&approval_prompt=force&state=strava')
  }

  updateAccessToken = async(url) => {
    var token = ''

    const tokenized_url = url.split('/')
    if (tokenized_url[4] !== null && tokenized_url[4].substring(0,8) === 'callback') {
        let code_and_scope = tokenized_url[4].substring(27);
        let code = code_and_scope.substring(0, code_and_scope.indexOf('&'))

        let results = await axios
            .post("https://www.strava.com/api/v3/oauth/token?", {
                client_id: '27965',
                client_secret: keys.STRAVA_SECRET,
                code: code,
                grant_type: 'authorization_code'
        })

        token = results.data.access_token
    }

    return token
  }

  getMapCenter = (activities) => {
    // center map at starting point of most recent activity with location
    let location_found = false
    let activity_num = 0
    let center_cords = {}

    while (!location_found && activity_num < activities.length) {
      let activity_cords = activities[activity_num].start_latlng
      if (activity_cords !== null) {
        center_cords = { lat: activity_cords[0], lng: activity_cords[1] }
        location_found = true
      } else {
        activity_num += 1
      }
    }

    if (!location_found) {
      // Default location is Austin, TX
      center_cords = { lat: 30.277920, lng: -97.739139 }
    }

    return center_cords
  }

  render() {

    return (
        <div>
          <Button onClick={(e) => { this.authenticateUser().bind(this) }}>
            Authenticate
          </Button>
          <Map
            clasName="google-map"
            google={this.props.google}
            zoom={13} 
            style={mapStyles}
            initialCenter={ { lat: 30.277920, lng: -97.739139 } }
            center={this.state.map_center}
            ref={(ref) => { this.map = ref; }}
          >
            {this.state.polylines.map(polyline => {
              return (
                <Polyline
                    path={polyline}
                    strokeColor='#6F1BC6'
                    strokeWeight='2'
                />
              )
            })}
          </Map>
        </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: keys.GOOGLE_MAPS_API_KEY
})(Heatmap);