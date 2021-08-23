const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  await db.query("TRUNCATE TABLE ingredients CASCADE");
  console.log("TRUNCATED INGREDIENTS");
  await db.query("TRUNCATE TABLE recipes RESTART IDENTITY CASCADE");
  console.log("TRUNCATED RECIPES");
  await db.query("TRUNCATE TABLE users CASCADE");
  console.log("TRUNCATED USERS");

  let recipes = await db.query(`
    INSERT INTO recipes(name, instructions, category, area)
    VALUES ('R1', 'Inst1', 'Cat1', 'Area1'),
           ('R2', 'Inst2', 'Cat2', 'Area2'),
           ('R3', 'Inst3', 'Cat3', 'Area3')
           RETURNING name`);
  console.log(`ADDED ${recipes.rows.length} RECIPES`);

  let users = await db.query(
    `INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );
  console.log(`ADDED ${users.rows.length} USERS`);

  let ingredients = await db.query(`
        INSERT INTO ingredients(name, description, type)
        VALUES ('I1', 'Desc1', 'Type1'),
               ('I2', 'Desc2', 'Type2'),
               ('I3', 'Desc3', 'Type3')
               RETURNING name`);
  console.log(`ADDED ${ingredients.rows.length} INGREDIENTS`);

  let recipeIngredients = await db.query(`
        INSERT INTO recipe_ingredients(recipe_id, ingredient_name, ingredient_amount)
        VALUES (1, 'I1', 'Amount1'),
               (1, 'I2', 'Amount2')
               RETURNING recipe_id`);
  console.log(`ADDED ${recipeIngredients.rows.length} INGREDIENTS TO RECIPES`);

  let userIngredients = await db.query(`
        INSERT INTO users_ingredients(username, ingredient_name)
        VALUES ('u1', 'I2'),
               ('u1', 'I3')
               RETURNING username`);
  console.log(`ADDED ${userIngredients.rows.length} INGREDIENTS TO USERS`);

  let userRecipes = await db.query(`
        INSERT INTO users_recipes(username, recipe_id)
        VALUES ('u1', 1),
               ('u1', 2)
               RETURNING username`);
  console.log(`ADDED ${userRecipes.rows.length} RECIPES TO USERS`);
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
