import React, { useContext, useEffect, useState, useCallback } from "react";
import { Redirect } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";
import SearchBar from "../SearchBar";
import PantryApi from "../api";
import Button from "react-bootstrap/Button";

const RemoveIngredient = () => {
  const user = useContext(UserContext);

  const [recipes, setRecipes] = useState([]);
  const [filter, setFilter] = useState("");
  const [needsUpdate, setNeedsUpdate] = useState(true);

  useEffect(() => {
    let isRendered = true;

    async function getRecipes(filterString = "") {
      try {
        if (isRendered && needsUpdate && user.isAdmin) {
          let recipeResults = await PantryApi.getRecipes(filterString);
          setRecipes(recipeResults);
          setNeedsUpdate(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getRecipes(filter);

    return () => {
      isRendered = false;
    };
  }, [filter, user.isAdmin, recipes, needsUpdate]);

  const remove = useCallback(
    async (recipe) => {
      let removeRes = await PantryApi.deleteRecipe(recipe.id);
      console.log(removeRes);

      if (removeRes.deleted && removeRes.deleted === `${recipe.id}`) {
        let updatedRecipes = [...recipes];
        let idx = recipes.findIndex((r) => r.name === recipe.name);

        updatedRecipes = updatedRecipes.splice(idx, 1);
        setRecipes(updatedRecipes);
        setNeedsUpdate(true);
      }
    },
    [recipes]
  );

  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="RemoveRecipe">
      <SearchBar onSubmit={setFilter} />
      {recipes.length > 0 ? (
        <ul>
          {recipes.map((recipe) => {
            return (
              <li key={recipe.id}>
                <Button
                  onClick={() => remove(recipe)}
                  className="btn-sm m-1"
                  variant="danger"
                >
                  Remove
                </Button>
                <LinkContainer to={`recipes/${recipe.id}/editattributes`}>
                  <Button className="btn-sm m-1" variant="primary">
                    Edit Attributes
                  </Button>
                </LinkContainer>
                <LinkContainer to={`recipes/${recipe.id}/editingredients`}>
                  <Button className="m-1 mr-3 btn-sm" variant="primary">
                    Edit Ingredients
                  </Button>
                </LinkContainer>
                {recipe.name}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No ingredients found.</p>
      )}
      <br />
      <LinkContainer to={`admin`}>
        <Button>Back</Button>
      </LinkContainer>
    </Container>
  );
};

export default RemoveIngredient;
