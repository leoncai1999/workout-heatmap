import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import Logo from "../assets/app-logo.svg";
import "../styles/Navigation.css";

function Navigation({ toggleNavbar }) {
  return (
    <>
      <Navbar collapseOnSelect expand="lg" className="color-nav" variant="dark" onToggle={toggleNavbar}>
        <Navbar.Brand className="nav-brand" href="/">
          <img src={Logo} className="logo-button" style={{ width: 27 }} alt = "app logo"/>
          Workout Heatmap
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" data-testid="navbar-hamburger"/>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link className="nav-item" href="/map">
              Map
            </Nav.Link>
            <Nav.Link className="nav-item" href="/list">
              List
            </Nav.Link>
            <Nav.Link className="nav-item" href="/stats">
              Stats
            </Nav.Link>
            <Nav.Link className="nav-item" href="/settings">
              Settings
            </Nav.Link>
            <Nav.Link className="nav-item" href="/about">
              About
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
}

export default Navigation;
