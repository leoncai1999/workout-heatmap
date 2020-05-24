import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';
import './Welcome.css';
import Logo from './app-logo.svg';
import StravaButton from './strava-button.png';

// url for production is https://workoutheatmap.me/, url for development is http://localhost:3000/
// change the authorized callback url in the Strava API settings accordingly
const base_url = "http://localhost:3000/"

class Welcome extends Component {

    componentDidMount() {
        document.body.style.backgroundColor = "#5dbcd2"
    }

    authenticateUser = () => {
        // User is redirected to Strava's website to login and give site permission to access acount information
        window.location.assign('https://www.strava.com/oauth/authorize?client_id=27965&redirect_uri='+ base_url + 'callback&response_type=code&scope=activity:read_all&approval_prompt=force&state=strava')
    }

    render() {
        return (
            <div>
                <img class="img-center" src={Logo}></img>
                <h1> Workout Heatmap </h1>
                <h5> Build an interactive heatmap of your outdoor activites from your Strava account! </h5>
                <h6> WorkoutHeatmap.me does not collect or store any of your data </h6>
                <div class="button-center">
                    <img src={StravaButton} onClick={(e) => { this.authenticateUser().bind(this) }}></img>
                </div>
                <Nav.Link href="/map-sample">
                    <h6 class="demo-text"> Not a Strava user? See a demo account </h6>
                </Nav.Link>
            </div>
        )
    }
}

export default Welcome;