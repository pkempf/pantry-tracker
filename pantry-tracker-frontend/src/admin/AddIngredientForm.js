import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import PantryForm from "../forms/PantryForm";
import UserContext from "../UserContext";
import AlertContext from "../AlertContext";
import PantryApi from "../api";

const AddIngredientForm = () => {
  const user = useContext(UserContext);
  const { setMessage } = useContext(AlertContext);

  const formFields = [
    {
      name: "name",
      label: "Name:",
      inputType: "text",
      initialValue: "",
      placeholder: "Example: Maple syrup",
      required: true,
    },
    {
      name: "description",
      label: "Description:",
      inputType: "text",
      initialValue: "",
      placeholder: "Enter the ingredient's description here",
      required: false,
      asOverride: "textarea",
      styleOverride: { height: "100px" },
    },
    {
      name: "type",
      label: "Type:",
      inputType: "text",
      initialValue: "",
      placeholder: "Example: vegetable",
      required: false,
    },
  ];

  async function add(ingredient) {
    try {
      let newIngredient = await PantryApi.addIngredient(ingredient);
      if (newIngredient.name && newIngredient.name === ingredient.name) {
        setMessage({
          text: `Added ingredient ${newIngredient.name}!`,
          variant: "success",
        });
      }
    } catch (err) {
      setMessage({
        text: `Error adding ingredient ${ingredient.name}`,
        variant: "danger",
      });
    }
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="AddIngredientForm justify-content-center">
      <PantryForm
        formTitle={`Add Ingredient`}
        fields={formFields}
        submitButtonText="Add Ingredient"
        processData={(data) => add(data)}
        backButtonTo={user.isAdmin ? "/admin" : "/ingredients"}
      />
    </Container>
  );
};

export default AddIngredientForm;
