import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import PantryForm from "./PantryForm";
import UserContext from "../UserContext";

// TEMPORARY
import Button from "react-bootstrap/Button";
import PantryApi from "../api";

// UPON REMOVING THE ABOVE, ALSO REMOVE:
// tempDevLoginHelpers parameter
// devTempLogin() function
// <Button /> block in return statement
// tempDevLoginHelpers variable from App.js
// tempDevLoginHelpers variable from Routes.js

const LoginForm = ({ logInFunction, tempDevLoginHelpers }) => {
  const user = useContext(UserContext);

  if (user.username) {
    return <Redirect to="/" />;
  }

  const devTempLogin = () => {
    PantryApi._setDevTestingToken();
    tempDevLoginHelpers.setToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ" +
        "SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0." +
        "FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc"
    );
    tempDevLoginHelpers.setUser({
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      isAdmin: false,
    });
  };

  const formFields = [
    {
      name: "username",
      label: "Username",
      inputType: "text",
      placeholder: "Username",
      initialValue: "",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      inputType: "password",
      placeholder: "Password",
      initialValue: "",
      required: true,
    },
  ];

  return (
    <Container className="LoginForm justify-content-center">
      <PantryForm
        formTitle="Log in"
        fields={formFields}
        submitButtonText="Log in"
        processData={logInFunction}
      />
      <Button className="mt-3" onClick={devTempLogin}>
        DEV LOGIN (TEMPORARY)
      </Button>
    </Container>
  );
};

export default LoginForm;
