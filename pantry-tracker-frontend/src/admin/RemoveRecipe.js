import React, { useContext, useEffect, useState, useCallback } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";
import SearchBar from "../SearchBar";
import PantryApi from "../api";
import Button from "react-bootstrap/Button";

const RemoveIngredient = () => {
  const user = useContext(UserContext);

  const [recipes, setRecipes] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let isRendered = true;

    async function getRecipes(filterString = "") {
      try {
        if (isRendered && user.isAdmin) {
          let recipeResults = await PantryApi.getRecipes(filterString);
          setRecipes(recipeResults);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getRecipes(filter);

    return () => {
      isRendered = false;
    };
  }, [filter, user.isAdmin, recipes]);

  const remove = useCallback(
    async (recipe) => {
      let removeRes = await PantryApi.deleteRecipe(recipe.id);

      if (
        removeRes.message &&
        removeRes.message ===
          `Removed recipe ${recipe.id} from user ${user.username}'s favorites`
      ) {
        let updatedRecipes = [...recipes];
        let idx = recipes.findIndex((r) => r.name === recipe.name);

        updatedRecipes = updatedRecipes.splice(idx, 1);
        setRecipes(updatedRecipes);
      }
    },
    [user.username, recipes]
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
                <Button
                  className="btn-sm m-1"
                  href={`recipes/${recipe.id}/editattributes`}
                  variant="primary"
                >
                  Edit Attributes
                </Button>
                <Button
                  className="m-1 mr-3 btn-sm"
                  href={`recipes/${recipe.id}/editingredients`}
                  variant="primary"
                >
                  Edit Ingredients
                </Button>
                {recipe.name}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No ingredients found.</p>
      )}
    </Container>
  );
};

export default RemoveIngredient;
