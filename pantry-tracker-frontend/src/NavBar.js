import React, { useContext } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import UserContext from "./UserContext";

const NavBar = () => {
  const user = useContext(UserContext);

  return (
    <Navbar bg="primary" variant="dark" expand="md">
      <Navbar.Brand as={Link} to="/">
        Pantry Tracker
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="pantry-navbar-nav" />
      <Navbar.Collapse className="justify-content-end" id="pantry-navbar-nav">
        {user.username ? (
          <Nav>
            <Nav.Link as={Link} to="/ingredients">
              Ingredients
            </Nav.Link>
            <Nav.Link as={Link} to="/recipes">
              Recipes
            </Nav.Link>
            <Nav.Link as={Link} to="/profile">
              Profile
            </Nav.Link>
            <Nav.Link as={Link} to="/logout">
              Log out {user.username}
            </Nav.Link>
          </Nav>
        ) : (
          <Nav>
            <Nav.Link as={Link} to="/login">
              Login
            </Nav.Link>
            <Nav.Link as={Link} to="/signup">
              Sign Up
            </Nav.Link>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
