import React, { useState, useEffect, useContext } from "react";
import { Redirect, Link } from "react-router-dom";
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

    async function populateIngredients() {
      try {
        if (isRendered && user.username) {
          let userIngredients = await PantryApi.getUserIngredients(
            user.username
          );
          if (userIngredients instanceof Array) setIngredients(userIngredients);
        }
      } catch (e) {
        console.log(e);
      }
    }

    populateIngredients();

    async function populateRecipes() {
      try {
        if (isRendered && user.username) {
          let userRecipes = await PantryApi.getUserRecipes(user.username);
          if (userRecipes instanceof Array) setRecipes(userRecipes);
        }
      } catch (e) {
        console.log(e);
      }
    }

    populateRecipes();

    return () => {
      isRendered = false;
    };
  }, [user.username, user]);

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
          return <li key={i}>{i}</li>;
        })}
      </ul>

      <h5>Favorite recipes:</h5>
      <ul>
        {recipes.map((r) => {
          return (
            <li key={r.id}>
              <Link to={`/recipes/${r.id}`}>{r.name}</Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
};

export default UserProfile;
