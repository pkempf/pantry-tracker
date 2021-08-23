import { useState } from "react";
import PantryApi from "./api";

/** Returns logIn, logOut, signUp, and editUser functions to pass to routes */

const getHelperFunctions = (user, setUser, setMessage, setToken) => {
  async function logIn({ username, password }) {
    try {
      let loginRes = await PantryApi.doLogin(username, password);
      if (loginRes) {
        let newUser = await PantryApi.getUser(username);
        setToken(loginRes);
        setUser(newUser);
        setMessage({
          text: "Login successful!",
          variant: "success",
        });
      } else {
        throw new Error("bad credentials");
      }
    } catch {
      setMessage({
        text: "We couldn't log you in with those credentials.",
        variant: "danger",
      });
    }
  }

  const logOut = () => {
    if (user.username) {
      setUser({});
      PantryApi.setToken("");
      setMessage({ text: "Logged out!", variant: "danger" });
    }
  };

  async function signUp(signUpData) {
    const { username, password, firstName, lastName, email } = signUpData;
    try {
      let newUserRes = await PantryApi.createUser(
        username,
        password,
        firstName,
        lastName,
        email
      );
      setUser(newUserRes.user);
      setToken(newUserRes.token);

      setMessage({
        text: `Welcome to Pantry Tracker, ${username}!`,
        variant: "success",
      });
    } catch (e) {
      console.log(e);
      setMessage({
        text: `Couldn't create user. This may be because username ${username} is already in use.`,
        variant: "danger",
      });
    }
  }

  async function editUser(editUserData) {
    const { username, firstName, lastName, email, password } = editUserData;
    try {
      let editRes = await PantryApi.updateUser(
        username,
        firstName,
        lastName,
        email,
        password
      );
      setUser(editRes.user);
      setMessage({ text: "User updated successfully!", variant: "success" });
    } catch (e) {
      console.log(e);
      setMessage({
        text: "Couldn't update user. Please make sure you correctly enter your password.",
        variant: "danger",
      });
    }
  }

  return [logIn, logOut, signUp, editUser];
};

/** Basically useState, but it puts the value in localStorage */

const useLocalStorage = (key, initialValue) => {
  const [storedVal, setStoredVal] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.log(err);
      return initialValue;
    }
  });

  const setVal = (val) => {
    try {
      const valToStore = val instanceof Function ? val(storedVal) : val;
      setStoredVal(valToStore);
      localStorage.setItem(key, JSON.stringify(valToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedVal, setVal];
};

export default getHelperFunctions;

export { useLocalStorage };
