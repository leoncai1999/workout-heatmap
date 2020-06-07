import React, { Component } from 'react';
import Navigation from './Navigation';
import Modal from 'react-bootstrap/Modal';
import { Card, CardDeck, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap';
import './Routes.css';

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
            if (user_activities[i]['map']['summary_polyline'] !== undefined) {

                var repeat_route = false
                for (let j = 0; j < route_groupings.length; j++) {
                    // check if distance and elevation gain are similar before checking similarity of route path
                    if (Math.abs(route_groupings[j][0]['distance'] - user_activities[i]['distance']) <= 500) {
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

        for (let i = 0; i < shorter_route.length; i++) {
            avg_dist += geolib.getDistance(shorter_route[i], longer_route[i])
        }

        avg_dist = avg_dist / shorter_route.length

        return avg_dist <= 200
    }

    displayRoutes = (routes) => {
        let rows = []
        for (let r = 0; r < 5; r++) {
            let children = []
            for (let c = 0; c < 4; c++) {
                if (routes.length <= c + 4 * r) {
                    break;
                }
                var route = routes[c + 4 * r]
                children.push(
                    <Card className="route-card">
                        <Card.Body>
                            <ListGroup className="list-group-flush">
                            <ListGroupItem>
                                <p>Distance: {(route[0]['distance'] / 1609.344).toFixed(2)} mi</p>
                            </ListGroupItem>
                            <ListGroupItem>
                                <p>Elevation Gain: {(route[0]['total_elevation_gain'] * 3.281).toFixed(2)} ft</p>
                            </ListGroupItem>
                            <ListGroupItem>
                                <p>Occurances: {route.length}</p>
                            </ListGroupItem>
                            <ListGroupItem>
                                <p>Activity Type: {route[0]['type']}</p>
                            </ListGroupItem>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                );
            }

            rows.push(<br></br>)
            rows.push(<div className="row">{children}</div>)
            if (routes.length < 4 * r) break;
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
                        <p className="loading-text">Loading Routes ...</p>
                        <Spinner animation="border" className="loading-spinner" />
                    </div>
                    </Modal.Body>
                </Modal>

                <Navigation />

                <h1 className="routes-header"> Routes </h1>

                <CardDeck className="justify-content-center">
                    {this.displayRoutes(this.state.routes)}
                </CardDeck>

            </div>
        )
    }

}

export default Routes;