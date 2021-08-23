"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Recipe = require("../models/recipe");
const Ingredient = require("../models/ingredient");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  await db.query("TRUNCATE TABLE ingredients CASCADE");
  await db.query("TRUNCATE TABLE recipes RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE users CASCADE");

  await Recipe.create({
    name: "R1",
    instructions: "Inst1",
    category: "Cat1",
    area: "Area1",
  });
  await Recipe.create({
    name: "R2",
    instructions: "Inst2",
    category: "Cat2",
    area: "Area2",
  });
  await Recipe.create({
    name: "R3",
    instructions: "Inst3",
    category: "Cat3",
    area: "Area3",
  });

  await Ingredient.create({
    name: "I1",
    description: "Desc1",
    type: "Type1",
  });
  await Ingredient.create({
    name: "I2",
    description: "Desc2",
    type: "Type2",
  });
  await Ingredient.create({
    name: "I3",
    description: "Desc3",
    type: "Type3",
  });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  await Recipe.addIngredient(1, { name: "I1", amount: "Amount1" });
  await Recipe.addIngredient(1, { name: "I2", amount: "Amount2" });

  await User.addIngredient("u1", "I2");
  await User.addIngredient("u1", "I3");

  await User.addRecipe("u1", 1);
  await User.addRecipe("u1", 2);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
};
