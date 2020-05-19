import React, { Component } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import Logo from './app-logo.svg';
import './Navigation.css';

class Navigation extends Component {
    render() {
        return (
            <>
              {/* <Navbar>
                <Navbar.Brand className="nav-brand" style={{ textDecoration: 'none' }} href="/">   
                  <img src={Logo} className="logo-button" style={{width: 27}} /> 
                  Workout Heatmap
                </Navbar.Brand>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none', float: "right" }} href="/">About</Nav.Link>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none', float: "right" }} href="/">Stats</Nav.Link>
                <Nav.Link className="nav-item" style={{ textDecoration: 'none', float: "right" }} href="/">Map</Nav.Link>
              </Navbar> */}
              <Navbar collapseOnSelect expand="lg" className="color-nav" variant="dark">
                <Navbar.Brand className="nav-brand" href="/">
                  <img src={Logo} className="logo-button" style={{width: 27}} /> 
                  Workout Heatmap
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="ml-auto">
                    <Nav.Link className="nav-item" href="/">Map</Nav.Link>
                    <Nav.Link className="nav-item" href="/">Stats</Nav.Link>
                    <Nav.Link className="nav-item" href="/">About</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Navbar>
            </>
        )
    }
}

export default Navigation;