import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import PantryForm from "./PantryForm";
import UserContext from "../UserContext";

const LoginForm = ({ logInFunction }) => {
  const user = useContext(UserContext);

  if (user.username) {
    return <Redirect to="/" />;
  }

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
    </Container>
  );
};

export default LoginForm;
