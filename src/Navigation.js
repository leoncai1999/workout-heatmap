import React, { Component } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import './Navigation.css';

class Navigation extends Component {
    render() {
        return (
            <>
              <Navbar>
                <Navbar.Brand className="nav-item" style={{ textDecoration: 'none' }} href="/">Workout Heatmap</Navbar.Brand>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none' }} href="/">Map</Nav.Link>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none' }} href="/">Stats</Nav.Link>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none' }} href="/">About</Nav.Link>
              </Navbar>
            </>
        )
    }
}

export default Navigation;