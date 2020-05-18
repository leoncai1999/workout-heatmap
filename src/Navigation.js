import React, { Component } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import Logo from './app-logo.svg';
import './Navigation.css';

class Navigation extends Component {
    render() {
        return (
            <>
              <Navbar>
                <Navbar.Brand className="nav-brand" style={{ textDecoration: 'none' }} href="/">   
                  <img src={Logo} className="logo-button" style={{width: 27}} /> 
                  Workout Heatmap
                </Navbar.Brand>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none', float: "right" }} href="/">About</Nav.Link>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none', float: "right" }} href="/">Stats</Nav.Link>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none', float: "right" }} href="/">Map</Nav.Link>
              </Navbar>
            </>
        )
    }
}

export default Navigation;