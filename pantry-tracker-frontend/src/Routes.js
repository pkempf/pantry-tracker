import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Homepage from "./Homepage";
import IngredientsList from "./ingredients/IngredientsList";
import UserProfile from "./users/UserProfile";
import RecipeList from "./recipes/RecipeList";
import RecipeDetail from "./recipes/RecipeDetail";
import LoginForm from "./forms/LoginForm";
import SignUpForm from "./forms/SignUpForm";
import EditUserForm from "./forms/EditUserForm";
import Logout from "./Logout";

const Routes = ({ logIn, logOut, signUp, editUser, tempDevLoginHelpers }) => {
  return (
    <Switch>
      <Route exact path="/">
        <Homepage />
      </Route>
      <Route exact path="/ingredients">
        <IngredientsList />
      </Route>
      <Route exact path="/recipes">
        <RecipeList />
      </Route>
      <Route exact path="/recipes/:id">
        <RecipeDetail />
      </Route>
      <Route exact path="/login">
        <LoginForm logInFunction={logIn} />
      </Route>
      <Route exact path="/signup">
        <SignUpForm signUpFunction={signUp} />
      </Route>
      <Route exact path="/profile">
        <UserProfile />
      </Route>
      <Route exact path="/edit-profile">
        <EditUserForm editUserFunction={editUser} />
      </Route>
      <Route exact path="/logout">
        <Logout logOutFunction={logOut} />
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default Routes;
