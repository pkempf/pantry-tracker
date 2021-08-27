import React, { useContext, useState, useEffect, useCallback } from "react";
import { useParams, Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";
import Button from "react-bootstrap/Button";
import PantryApi from "../api";
import Form from "react-bootstrap/Form";
import AlertContext from "../AlertContext";

const EditRecipeIngredients = () => {
  const { id } = useParams();
  const user = useContext(UserContext);
  const { setMessage } = useContext(AlertContext);
  const [recipe, setRecipe] = useState({});
  const [needsUpdate, setNeedsUpdate] = useState(true);

  const INITIAL_FORM_DATA = {
    ingredientName: "",
    amount: "",
  };

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  useEffect(() => {
    let isRendered = true;

    async function getRecipe(recipeId) {
      try {
        if (isRendered && user.username && needsUpdate) {
          let recipeRes = await PantryApi.getRecipe(recipeId);
          let indicatedIngredients = await PantryApi.indicateOnHandIngredients(
            recipeRes.ingredients.map((i) => {
              return { name: i.ingredientName, amount: i.amount };
            }),
            user.username
          );

          setRecipe({ ...recipeRes, ingredients: indicatedIngredients });
          setNeedsUpdate(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getRecipe(id);

    return () => {
      isRendered = false;
    };
  }, [user.username, id, needsUpdate]);

  const addIngredient = useCallback(
    async (data) => {
      try {
        let addRes = await PantryApi.addIngredientToRecipe(
          id,
          data.ingredientName,
          data.amount
        );

        if (
          addRes.added &&
          addRes.added.ingredientName === data.ingredientName
        ) {
          let updatedIngredients = [...recipe.ingredients];
          updatedIngredients.push({
            name: data.ingredientName,
            amount: data.amount,
          });

          setRecipe({ ...recipe, ingredients: updatedIngredients });
          setFormData({ ingredientName: "", amount: "" });
          setNeedsUpdate(true);
        } else {
          setMessage({
            text: "Couldn't add that ingredient. It may not exist - check spelling.",
            variant: "Danger",
          });
        }
      } catch (err) {
        setMessage({
          text: err.message,
          variant: "Danger",
        });
      }
    },
    [recipe, id, setMessage]
  );

  const getAddInput = (evt) => {
    evt.preventDefault();
    addIngredient(formData);
  };

  const removeIngredient = useCallback(
    async (ingredient) => {
      console.log(ingredient);
      let removeRes = await PantryApi.removeIngredientFromRecipe(
        id,
        ingredient.name
      );

      if (
        removeRes.deletedIngredient &&
        removeRes.deletedIngredient.ingredientName === ingredient.name
      ) {
        let updatedIngredients = [...recipe.ingredients];
        let idx = recipe.ingredients.findIndex(
          (i) => i.name === ingredient.name
        );

        updatedIngredients = updatedIngredients.splice(idx, 1);
        setRecipe({ ...recipe, ingredients: updatedIngredients });
        setNeedsUpdate(true);
      }
    },
    [id, recipe]
  );

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="RecipeDetail">
      <h2>
        {recipe.name}{" "}
        <Button
          variant="primary"
          className="btn-sm"
          href={`/recipes/${id}/editattributes`}
        >
          Edit Attributes
        </Button>
      </h2>
      <h5>
        {recipe.category} - {recipe.area}{" "}
      </h5>

      <h3 className="mt-3">Instructions:</h3>
      <p>
        {recipe.instructions !== null
          ? recipe.instructions
          : "This recipe has no instructions."}
      </p>

      <h3 className="mt-3">Ingredients:</h3>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
        <ul>
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.name}>
              <span>
                <b>Ingredient:</b> {ingredient.name} |{" "}
              </span>
              <span>
                <b>Amount:</b> {ingredient.amount}{" "}
              </span>
              <Button
                onClick={() => removeIngredient(ingredient)}
                className="button-sm ml-2"
                variant="danger"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>This recipe has no listed ingredients.</p>
      )}

      <h3>Add ingredient:</h3>
      <Form onSubmit={getAddInput}>
        <Form.Group key="ingredientName" controlId="ingredientName">
          <Form.Label>Ingredient name:</Form.Label>
          <Form.Control
            type="text"
            name="ingredientName"
            value={formData.ingredientName || ""}
            onChange={handleChange}
            required={true}
            placeholder="Enter a name here."
          />
        </Form.Group>
        <Form.Group key="amount" controlId="amount">
          <Form.Label>Amount:</Form.Label>
          <Form.Control
            type="text"
            name="amount"
            value={formData.amount || ""}
            onChange={handleChange}
            required={true}
            placeholder="Enter an amount here."
          />
        </Form.Group>
        <Button variant="primary button-sm" type="submit" className="mr-2">
          Add Ingredient to Recipe
        </Button>
      </Form>
    </Container>
  );
};

export default EditRecipeIngredients;
