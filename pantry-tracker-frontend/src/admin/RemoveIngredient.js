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

  const [ingredients, setIngredients] = useState([]);
  const [filter, setFilter] = useState("");
  const [needsUpdate, setNeedsUpdate] = useState(true);

  useEffect(() => {
    let isRendered = true;

    async function getIngredients(filterString = "") {
      try {
        if (isRendered && needsUpdate && user.isAdmin) {
          let ingredientResults = await PantryApi.getIngredients(filterString);
          setIngredients(ingredientResults);
          setNeedsUpdate(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getIngredients(filter);

    return () => {
      isRendered = false;
    };
  }, [filter, user.isAdmin, needsUpdate, ingredients]);

  const remove = useCallback(
    async (ingredient) => {
      let removeRes = await PantryApi.deleteIngredient(ingredient.name);

      if (removeRes.deleted && removeRes.deleted === ingredient.name) {
        let updatedIngredients = [...ingredients];
        let idx = ingredients.findIndex((i) => i.name === ingredient.name);

        updatedIngredients = updatedIngredients.splice(idx, 1);
        setIngredients(updatedIngredients);
        setNeedsUpdate(true);
      }
    },
    [ingredients]
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
                <LinkContainer to={`ingredients/${ingredient.name}/edit`}>
                  <Button className="m-1 mr-4" variant="primary">
                    Edit Attributes
                  </Button>
                </LinkContainer>
                {ingredient.name}
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
