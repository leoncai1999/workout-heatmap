import React, { Component } from 'react';
import { HashRouter } from "react-router-dom";
import { Map, GoogleApiWrapper, Polyline } from 'google-maps-react';
import axios from 'axios';
import * as keys from './APIKeys';

const mapStyles = {
  width: '100%',
  height: '90%'
};

export class MapContainer extends Component {

  state = {
    activities: [],
    polylines: [],
    access_token: ''
  };

  async componentDidMount() {
    var user_activities = []
    var user_polylines = []

    var activities_left = true
    var page_num = 1;

    while (activities_left) {
      const activities = await this.getActivities(page_num);

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

  getActivities = async(page_num) => {
    let results = await axios
      .get("https://www.strava.com/api/v3/athlete/activities?", {
        params: {
          per_page: '200',
          page: page_num,
          access_token: keys.STRAVA_API_KEY
        }
      })

    return results.data
  }

  render() {
    
    return (
      <HashRouter basename='/'>
        <div>
          <Map google={this.props.google}
          zoom={13} 
          style={mapStyles}
          initialCenter={{ lat: 30.277920, lng: -97.739139 }}>
            {this.state.polylines.map(polyline => {
              return (
                <Polyline
                  path={polyline}
                  strokeColor='#6F1BC6'
                  strokeWeight='2'
                />
                )} 
            )}
          </Map>
        </div>
      </HashRouter>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: keys.GOOGLE_MAPS_API_KEY
})(MapContainer);
