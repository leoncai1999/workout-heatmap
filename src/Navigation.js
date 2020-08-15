import React, { Component } from 'react';
import { Button, Nav, Navbar } from 'react-bootstrap';
import Logo from './app-logo.svg';
import './Navigation.css';

class Navigation extends Component {
    render() {
        return (
            <>
              <Navbar collapseOnSelect expand="lg" className="color-nav" variant="dark">
                <Navbar.Brand className="nav-brand" href="/">
                  <img src={Logo} className="logo-button" style={{width: 27}} /> 
                  Workout Heatmap
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="ml-auto">
                    <Nav.Link className="nav-item" href="/">Map</Nav.Link>
                    <Nav.Link className="nav-item" href="/list">List</Nav.Link>
                    <Nav.Link className="nav-item" href="/stats">Stats</Nav.Link>
                    <Nav.Link className="nav-item" href="/routes">Routes</Nav.Link>
                    <Nav.Link className="nav-item" href="/about">About</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Navbar>
            </>
        )
    }
}

export default Navigation;