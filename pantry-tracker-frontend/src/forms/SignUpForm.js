import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import PantryForm from "./PantryForm";
import UserContext from "../UserContext";

const SignUpForm = ({ signUpFunction }) => {
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
    {
      name: "firstName",
      label: "First Name",
      inputType: "text",
      placeholder: "First",
      initialValue: "",
      required: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      inputType: "text",
      placeholder: "Last",
      initialValue: "",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      inputType: "email",
      placeholder: "(e.g. handle@website.com)",
      initialValue: "",
      required: true,
    },
  ];

  return (
    <Container className="SignUpForm justify-content-center">
      <PantryForm
        formTitle="Register for Pantry Tracker"
        fields={formFields}
        submitButtonText="Sign up"
        processData={signUpFunction}
      />
    </Container>
  );
};

export default SignUpForm;
