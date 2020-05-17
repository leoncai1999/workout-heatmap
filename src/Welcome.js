import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import './Welcome.css';

class Welcome extends Component {

    authenticateUser = () => {
        // User is redirected to Strava's website to login and give site permission to access acount information
        window.location.assign('https://www.strava.com/oauth/authorize?client_id=27965&redirect_uri=http://localhost:3000/workout-heatmap/callback&response_type=code&scope=activity:read_all&approval_prompt=force&state=strava')
    }

    render() {
        return (
            <div>
                <h1> Workout Heatmap </h1>
                <h4> Build an interactive heatmap of your outdoor activites from your Strava account! </h4>
                <div class="button-center">
                    <Button onClick={(e) => { this.authenticateUser().bind(this) }}>
                        Connect with Strava
                    </Button>
                </div>
            </div>
        )
    }
}

export default Welcome;