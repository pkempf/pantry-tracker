import React, { useContext } from "react";
import { Redirect, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import UserContext from "../UserContext";

const AdminDashboard = () => {
  const user = useContext(UserContext);

  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="AdminDashboard justify-content-center">
      <h1>Admin Control Panel</h1>
      <h3>Ingredients</h3>
      <ul>
        <li>
          <Link to="/addingredient">Add Ingredient</Link>
        </li>
        <li>
          <Link to="/removeingredient">Edit/Remove Ingredients</Link>
        </li>
      </ul>
      <h3>Recipes</h3>
      <ul>
        <li>
          <Link to="/addrecipe">Add Recipe</Link>
        </li>
        <li>
          <Link to="/removerecipe">Edit/Remove Recipes</Link>
        </li>
      </ul>
    </Container>
  );
};

export default AdminDashboard;
