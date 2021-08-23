import React, { useContext } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import { Link } from "react-router-dom";
import UserContext from "./UserContext";

const Homepage = () => {
  const user = useContext(UserContext);
  return (
    <Jumbotron className="mt-3 text-center">
      <h1 style={{ fontSize: "72px" }}>
        <strong>Pantry Tracker</strong>
      </h1>
      <h4 className="my-4">Let's get cooking!</h4>
      {user.username ? (
        <h2>Welcome back, {user.firstName}!</h2>
      ) : (
        <span>
          <Link className="btn btn-primary mr-1" to="/login">
            Log in
          </Link>
          <Link className="btn btn-primary ml-1" to="/signup">
            Sign up
          </Link>
        </span>
      )}
    </Jumbotron>
  );
};

export default Homepage;
