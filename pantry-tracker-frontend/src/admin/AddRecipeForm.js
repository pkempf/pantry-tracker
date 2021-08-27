import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import PantryForm from "../forms/PantryForm";
import UserContext from "../UserContext";
import AlertContext from "../AlertContext";
import PantryApi from "../api";

const AddRecipeForm = () => {
  const user = useContext(UserContext);
  const { setMessage } = useContext(AlertContext);

  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  const formFields = [
    {
      name: "name",
      label: "Name",
      inputType: "text",
      initialValue: "",
      placeholder: "Example: Banana pancakes",
      required: true,
    },
    {
      name: "instructions",
      label: "Instructions",
      inputType: "text",
      initialValue: "",
      placeholder: "Enter recipe instructions here",
      required: true,
      asOverride: "textarea",
      styleOverride: { height: "100px" },
    },
    {
      name: "category",
      label: "Category",
      inputType: "text",
      initialValue: "",
      placeholder: "Example: Dessert",
      required: false,
    },
    {
      name: "area",
      label: "Area",
      inputType: "text",
      initialValue: "",
      placeholder: "Example: Italian",
      required: false,
    },
  ];

  async function add(recipe) {
    try {
      let newRecipe = await PantryApi.addRecipe(recipe);
      if (newRecipe.name && newRecipe.name === recipe.name) {
        setMessage({
          text: `Added recipe ${newRecipe.name}!`,
          variant: "success",
        });
      }
    } catch (err) {
      setMessage({
        text: `Error adding recipe ${recipe.name}`,
        variant: "danger",
      });
    }
  }

  return (
    <Container className="AddRecipeForm justify-content-center">
      <PantryForm
        formTitle={`Add Recipe`}
        fields={formFields}
        submitButtonText="Add Recipe"
        processData={(data) => add(data)}
        backButtonTo="/admin"
      />
    </Container>
  );
};

export default AddRecipeForm;
