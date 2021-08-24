import React, { useContext, useState, useEffect, useCallback } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";
import IngredientCard from "./IngredientCard";
import SearchBar from "../SearchBar";
import PantryApi from "../api";

const IngredientsList = () => {
  const user = useContext(UserContext);
  const [ingredients, setIngredients] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let isRendered = true;

    async function getIngredients(filterString = "") {
      try {
        if (isRendered && user.username) {
          let ingredientResults = await PantryApi.getIngredients(filterString);
          let indicatedIngredientResults =
            await PantryApi.indicateOnHandIngredients(
              ingredientResults,
              user.username
            );
          setIngredients(indicatedIngredientResults);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getIngredients(filter);

    return () => {
      isRendered = false;
    };
  }, [filter, user.username]);

  const add = useCallback(
    async (ingredient) => {
      let addRes = await PantryApi.addIngredientToUser(
        user.username,
        ingredient.name
      );

      if (addRes.added && addRes.added === ingredient.name) {
        let updatedIngredients = [...ingredients];
        let idx = ingredients.findIndex((i) => i.name === ingredient.name);

        let updatedIngredient = {
          ...ingredient,
          onHand: true,
        };

        updatedIngredients[idx] = updatedIngredient;
        setIngredients(updatedIngredients);
      }
    },
    [user.username, ingredients]
  );

  const remove = useCallback(
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
        let updatedIngredients = [...ingredients];
        let idx = ingredients.findIndex((i) => i.name === ingredient.name);

        let updatedIngredient = {
          ...ingredient,
          onHand: false,
        };

        updatedIngredients[idx] = updatedIngredient;
        setIngredients(updatedIngredients);
      }
    },
    [user.username, ingredients]
  );

  if (!user.username) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="JobList">
      <SearchBar onSubmit={setFilter} />
      {ingredients.length > 0 ? (
        ingredients.map((ingredient) => (
          <IngredientCard
            ingredient={ingredient}
            key={ingredient.name}
            add={() => add(ingredient)}
            remove={() => remove(ingredient)}
          />
        ))
      ) : (
        <p>No matching ingredients found.</p>
      )}
    </Container>
  );
};

export default IngredientsList;
