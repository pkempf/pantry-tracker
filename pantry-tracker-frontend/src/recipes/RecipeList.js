import React, { useContext, useState, useEffect, useCallback } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";
import RecipeCard from "./RecipeCard";
import SearchBar from "../SearchBar";
import PantryApi from "../api";

const RecipeList = () => {
  const user = useContext(UserContext);
  const [recipes, setRecipes] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let isRendered = true;

    async function getRecipes(filterString = "") {
      try {
        if (isRendered && user.username) {
          let recipeResults = await PantryApi.getRecipes(filterString);
          let indicatedRecipeResults = await PantryApi.indicateFavoriteRecipes(
            recipeResults,
            user.username
          );
          setRecipes(indicatedRecipeResults);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getRecipes(filter);

    return () => {
      isRendered = false;
    };
  }, [filter, user.username]);

  const add = useCallback(
    async (recipe) => {
      let addRes = await PantryApi.addRecipeToUser(user.username, recipe.id);

      if (addRes.added && addRes.added === recipe.id) {
        let updatedRecipes = [...recipes];
        let idx = recipes.findIndex((r) => r.id === recipe.id);

        let updatedRecipe = {
          ...recipe,
          isFavorite: true,
        };

        updatedRecipes[idx] = updatedRecipe;
        setRecipes(updatedRecipes);
      }
    },
    [user.username, recipes]
  );

  const remove = useCallback(
    async (recipe) => {
      let removeRes = await PantryApi.removeRecipeFromUser(
        user.username,
        recipe.id
      );

      if (
        removeRes.message &&
        removeRes.message ===
          `Removed recipe ${recipe.id} from user ${user.username}'s favorites`
      ) {
        let updatedRecipes = [...recipes];
        let idx = recipes.findIndex((r) => r.id === recipe.id);

        let updatedRecipe = {
          ...recipe,
          isFavorite: false,
        };

        updatedRecipes[idx] = updatedRecipe;
        setRecipes(updatedRecipes);
      }
    },
    [user.username, recipes]
  );

  if (!user.username) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="RecipeList">
      <SearchBar onSubmit={setFilter} />
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <RecipeCard
            recipe={recipe}
            key={recipe.id}
            add={() => add(recipe)}
            remove={() => remove(recipe)}
          />
        ))
      ) : (
        <p>No matching recipes found.</p>
      )}
    </Container>
  );
};

export default RecipeList;
