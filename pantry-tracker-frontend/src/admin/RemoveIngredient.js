import React, { useContext, useEffect, useState, useCallback } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";
import SearchBar from "../SearchBar";
import PantryApi from "../api";
import Button from "react-bootstrap/Button";

const RemoveIngredient = () => {
  const user = useContext(UserContext);

  const [ingredients, setIngredients] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let isRendered = true;

    async function getIngredients(filterString = "") {
      try {
        if (isRendered && user.isAdmin) {
          let ingredientResults = await PantryApi.getIngredients(filterString);
          setIngredients(ingredientResults);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getIngredients(filter);

    return () => {
      isRendered = false;
    };
  }, [filter, user.isAdmin, ingredients]);

  const remove = useCallback(
    async (ingredient) => {
      let removeRes = await PantryApi.deleteIngredient(ingredient.name);

      if (
        removeRes.message &&
        removeRes.message ===
          `Removed ingredient ${ingredient.name} from user ${user.username}`
      ) {
        let updatedIngredients = [...ingredients];
        let idx = ingredients.findIndex((i) => i.name === ingredient.name);

        updatedIngredients = updatedIngredients.splice(idx, 1);
        setIngredients(updatedIngredients);
      }
    },
    [user.username, ingredients]
  );

  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="RemoveIngredient">
      <SearchBar onSubmit={setFilter} />
      {ingredients.length > 0 ? (
        <ul>
          {ingredients.map((ingredient) => {
            return (
              <li key={ingredient.name}>
                <Button
                  onClick={() => remove(ingredient)}
                  className="m-1"
                  variant="danger"
                >
                  Remove
                </Button>
                <Button
                  className="m-1 mr-4"
                  href={`ingredients/${ingredient.name}/edit`}
                  variant="primary"
                >
                  Edit Attributes
                </Button>
                {ingredient.name}
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
