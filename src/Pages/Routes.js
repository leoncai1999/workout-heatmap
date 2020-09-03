import React, { Component } from 'react';
import Navigation from '../Components/Navigation';
import Modal from 'react-bootstrap/Modal';
import RoutesIcon from '../Icons/routes.svg';
import * as keys from '../Components/APIKeys';
import Branding from '../Images/powered_by_strava.png';
import { Card, CardDeck, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap';
import '../Styles/Routes.css';

class Routes extends Component {

    state = {
        routes: [],
        dataCalled: false
    }

    getSimilarRoutes() {
        let user_activities = this.props.data.activities.reverse()
        let route_groupings = []

        // determining which routes have been ran multiple times and how many times they've been repeated
        for (let i = 0; i < user_activities.length; i++) {
            if (user_activities[i]['map']['summary_polyline'] !== null && user_activities[i]['map']['summary_polyline'] !== undefined) {

                var repeat_route = false
                for (let j = 0; j < route_groupings.length; j++) {
                    // check if distance and elevation gain are similar before checking similarity of route path
                    if (Math.abs(route_groupings[j][0]['distance'] - user_activities[i]['distance']) <= 300) {
                        if (Math.abs(route_groupings[j][0]['total_elevation_gain'] - user_activities[i]['total_elevation_gain']) <= 40) {
                            if (this.isSimilarRoute(route_groupings[j][0]['map']['summary_polyline'], user_activities[i]['map']['summary_polyline'])) {
                                route_groupings[j].push(user_activities[i])
                                repeat_route = true
                                break;
                            }
                        }
                    }
                }

                if (!repeat_route) {
                    route_groupings.push([user_activities[i]])
                }
            }
        }

        // sorting routes from most frequent to least frequent
        route_groupings.sort(function (a, b) {
            return b.length - a.length;
        })

        console.log("route groupings are", route_groupings)

        this.setState({ routes : route_groupings })
    }

    isSimilarRoute = (route1, route2) => {
        const decodePolyline = require('decode-google-map-polyline')
        const geolib = require('geolib')

        let cords1 = decodePolyline(route1)
        let cords2 = decodePolyline(route2)

        let shorter_route = cords1.length < cords2.length ? cords1 : cords2
        let longer_route = shorter_route === cords1 ? cords2 : cords1
        var avg_dist = 0

        var idx_1 = 0
        var idx_2 = 0
        var total_length = 0

        // start comparison between two routes closest to where both routes begin
        var start_found = false
        var shortest_start_dist = Number.MAX_SAFE_INTEGER
        while (!start_found && (idx_1 < shorter_route.length && idx_2 < longer_route.length)) {
            var curr_start_dist = geolib.getDistance(shorter_route[idx_1], longer_route[idx_2])
            if (curr_start_dist <= shortest_start_dist) {
                shortest_start_dist = curr_start_dist
                idx_2 += 1
            } else {
                start_found = true
            }
        }

        // compare average distance between each point of the two different routes
        while (idx_1 < shorter_route.length && idx_2 < longer_route.length) {
            avg_dist += geolib.getDistance(shorter_route[idx_1], longer_route[idx_2])
            idx_1 += 1
            idx_2 += 1
            total_length += 1
        }

        avg_dist = avg_dist / total_length

        return avg_dist <= 500
    }

    displayRoutes = (routes) => {
        let rows = []
        var routes_left = true
        var r = 0
        while (routes_left) {
            let children = []
            for (let c = 0; c < 4; c++) {
                if (routes.length <= c + 4 * r) {
                    break;
                }
                var route = routes[c + 4 * r]
                if (route.length <= 2) {
                    routes_left = false
                    break;
                }
                children.push(
                    <Card className="route-card">
                        <Card.Img
                            variant="top"
                            src={"https://maps.googleapis.com/maps/api/staticmap?size=300x300&path=weight:3%7Ccolor:blue%7Cenc:" + escape(route[0]["map"]["summary_polyline"]) + "&key=" + keys.GOOGLE_MAPS_API_KEY}
                            style={{ height: '300px' }}
                        />
                        <Card.Body>       
                            <ListGroup>
                            <ListGroupItem>
                                <p><span id="bold-text">Distance:</span> {(route[0]['distance'] / 1609.344).toFixed(2)} mi</p>
                            </ListGroupItem>
                            <ListGroupItem>
                                <p><span id="bold-text">Elevation Gain:</span> {(route[0]['total_elevation_gain'] * 3.281).toFixed(2)} ft</p>
                            </ListGroupItem>
                            <ListGroupItem>
                                <p><span id="bold-text">Occurances:</span> {route.length}</p>
                            </ListGroupItem>
                            <ListGroupItem>
                                <p><span id="bold-text">Activity Type:</span> {route[0]['type']}</p>
                            </ListGroupItem>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                );
            }

            rows.push(<br></br>)
            rows.push(<div className="row">{children}</div>)
            if (routes.length < 4 * r) break;
            r += 1
        }

        return rows
    }

    render() {

        if (this.props.data.activities.length !== 0 && !this.state.dataCalled) {
            this.getSimilarRoutes()
            this.setState({ dataCalled: true })
        }

        return (
            <div>
                <Modal 
                    show={this.state.routes.length === 0}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    >
                    <Modal.Body>
                    <div className="loading-center">
                        <p className="loading-text">Calculating Similar Routes ...</p>
                        <Spinner animation="border" className="loading-spinner" />
                    </div>
                    </Modal.Body>
                </Modal>

                <Navigation />

                <img class="img-routes" src={RoutesIcon}></img>

                <h1 className="routes-header">Routes</h1>
                <h2 className="routes-description">Any similar routes that you have completed three or more times will appear below</h2>

                <div className="card-deck">
                    <CardDeck className="justify-content-center">
                        {this.displayRoutes(this.state.routes)}
                    </CardDeck>
                </div>

                <div id="branding">
                    <img src={Branding}/>
                </div>
            </div>
        )
    }

}

export default Routes;