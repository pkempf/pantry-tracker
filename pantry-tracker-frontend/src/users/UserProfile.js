import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import UserContext from "../UserContext";
import PantryApi from "../api";

const UserProfile = () => {
  const user = useContext(UserContext);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    let isRendered = true;

    async function populateIngredientDetail() {
      try {
        if (isRendered && user.username) {
          let populatedIngredients = [];
          for (let i = 0; i < user.ingredients.length; i++) {
            let ingredientDetail = await PantryApi.getIngredient(
              user.ingredients[i]
            );
            populatedIngredients.push(ingredientDetail);
          }
          populatedIngredients.sort((ingredient1, ingredient2) => {
            return ingredient1.name < ingredient2.name
              ? -1
              : ingredient1.name > ingredient2.name
              ? 1
              : 0;
          });
          console.log(populatedIngredients);
          setIngredients(populatedIngredients);
        }
      } catch (e) {
        console.log(e);
      }
    }

    populateIngredientDetail();

    async function populateRecipeDetail() {
      try {
        if (isRendered && user.username) {
          let populatedRecipes = [];
          for (let i = 0; i < user.recipes.length; i++) {
            let recipeDetail = await PantryApi.getRecipe(user.recipes[i]);
            populatedRecipes.push(recipeDetail);
          }
          populatedRecipes.sort((recipe1, recipe2) => {
            return recipe1.name < recipe2.name
              ? -1
              : recipe1.name > recipe2.name
              ? 1
              : 0;
          });
          console.log(populatedRecipes);
          setRecipes(populatedRecipes);
        }
      } catch (e) {
        console.log(e);
      }
    }

    populateRecipeDetail();

    return () => {
      isRendered = false;
    };
  }, [user.username, user.ingredients, user.recipes]);

  if (!user.username) return <Redirect to="/" />;

  return (
    <Container className="UserProfile">
      <Row>
        <Col sm={8}>
          <h2>{user.username}</h2>
          <h5>
            {user.firstName} {user.lastName}
          </h5>
          <p>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </p>
        </Col>
        <Col sm={4}>
          <Container className="d-flex justify-content-end">
            <LinkContainer to="/edit-profile">
              <Button variant="primary" className="ml-auto">
                Edit Profile
              </Button>
            </LinkContainer>
          </Container>
        </Col>
      </Row>

      <h5>Ingredients on hand:</h5>
      <ul>
        {ingredients.map((i) => {
          return (
            <li key={i.name}>
              {i.name} <i>{i.type !== null ? `(${i.type})` : null}</i>
            </li>
          );
        })}
      </ul>

      <h5>Favorite recipes:</h5>
      <ul>
        {recipes.map((r) => {
          return <li key={r.id}>{r.name}</li>;
        })}
      </ul>
    </Container>
  );
};

export default UserProfile;
