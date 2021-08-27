import React, { useContext, useState, useEffect, useCallback } from "react";
import { useParams, Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";
import IngredientCard from "../ingredients/IngredientCard";
import Button from "react-bootstrap/Button";
import PantryApi from "../api";

const RecipeDetail = () => {
  const { id } = useParams();
  const user = useContext(UserContext);
  const [recipe, setRecipe] = useState({});
  const [needsUpdate, setNeedsUpdate] = useState(true);

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

          let favoriteRes = await PantryApi.checkFavorite(
            user.username,
            recipeId
          );

          setRecipe({
            ...recipeRes,
            ingredients: indicatedIngredients,
            isFavorite: favoriteRes,
          });
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
    async (ingredient) => {
      let addRes = await PantryApi.addIngredientToUser(
        user.username,
        ingredient.name
      );

      if (addRes.added && addRes.added === ingredient.name) {
        let updatedIngredients = [...recipe.ingredients];
        let idx = recipe.ingredients.findIndex(
          (i) => i.name === ingredient.name
        );

        let updatedIngredient = {
          ...ingredient,
          onHand: true,
        };

        updatedIngredients[idx] = updatedIngredient;
        setRecipe({ ...recipe, ingredients: updatedIngredients });
      }
    },
    [user.username, recipe]
  );

  const removeIngredient = useCallback(
    async (ingredient) => {
      let removeRes = await PantryApi.removeIngredientFromUser(
        user.username,
        ingredient.name
      );

      if (
        removeRes.message &&
        removeRes.message ===
          `Removed ingredient ${ingredient.name} from user ${user.username}`
      ) {
        let updatedIngredients = [...recipe.ingredients];
        let idx = recipe.ingredients.findIndex(
          (i) => i.name === ingredient.name
        );

        let updatedIngredient = {
          ...ingredient,
          onHand: false,
        };

        updatedIngredients[idx] = updatedIngredient;
        setRecipe({ ...recipe, ingredients: updatedIngredients });
      }
    },
    [user.username, recipe]
  );

  const addFavorite = useCallback(
    async (recipe) => {
      if (!recipe.isFavorite) {
        console.log(recipe);
        let addRes = await PantryApi.addRecipeToUser(user.username, recipe.id);
        console.log(addRes);

        if (addRes.added && addRes.added === recipe.id) {
          setRecipe({ ...recipe, isFavorite: true });
          setNeedsUpdate(true);
        }
      }
    },
    [user.username]
  );

  const removeFavorite = useCallback(
    async (recipe) => {
      if (recipe.isFavorite) {
        let removeRes = await PantryApi.removeRecipeFromUser(
          user.username,
          recipe.id
        );

        if (
          removeRes.message &&
          removeRes.message ===
            `Removed recipe ${recipe.id} from user ${user.username}'s favorites`
        ) {
          setRecipe({ ...recipe, isFavorite: false });
          setNeedsUpdate(true);
        }
      }
    },
    [user.username]
  );

  if (!user.username) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="RecipeDetail">
      <h2>
        {recipe.name}{" "}
        {recipe.isFavorite ? (
          <Button variant="text" onClick={() => removeFavorite(recipe)}>
            <i className="fa fa-heart" aria-label="Remove favorite"></i>
          </Button>
        ) : (
          <Button onClick={() => addFavorite(recipe)} variant="text">
            <i className="fa fa-heart-o" aria-label="Add favorite"></i>
          </Button>
        )}
      </h2>
      <h5>
        {recipe.category} - {recipe.area}{" "}
      </h5>
      <h3 className="mt-3">Ingredients:</h3>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
        recipe.ingredients.map((ingredient) => (
          <IngredientCard
            ingredient={ingredient}
            key={ingredient.name}
            add={() => addIngredient(ingredient)}
            remove={() => removeIngredient(ingredient)}
          />
        ))
      ) : (
        <p>This recipe has no listed ingredients.</p>
      )}
      <h3 className="mt-3">Instructions:</h3>
      <p>
        {recipe.instructions !== null
          ? recipe.instructions
          : "This recipe has no instructions."}
      </p>
    </Container>
  );
};

export default RecipeDetail;
