const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ExpressError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");

/** User model for the Pantry Tracker */

class User {
  /** authenticate with username, password
   *
   *  returns { username, first_name, last_name, email, is_admin }
   *
   *  throws an UnauthorizedError if no such user or bad password
   */

  static async authenticate(username, password) {
    // look for the user
    const result = await db.query(
      `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
                FROM users
                WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // check hashed password against new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username or password");
  }

  /** register with data
   *
   *  returns { username, firstName, lastName, email, isAdmin }
   *
   *  throws BadRequestError if duplicate
   */

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    isAdmin,
  }) {
    const dupeCheck = await db.query(
      `SELECT username
                FROM users
                WHERE username = $1`,
      [username]
    );

    if (dupeCheck.rows[0])
      throw new BadRequestError(`Duplicate username: ${username}`);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
            (username,
             password,
             first_name,
             last_name,
             email,
             is_admin)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, isAdmin]
    );

    const user = result.rows[0];
    return user;
  }

  /** find all users
   *
   *  returns [{username, firstName, lastName, email, isAdmin}, ...]
   */
  static async findAll() {
    const result = await db.query(
      `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
                FROM users
                ORDER BY username`
    );
    return result.rows;
  }

  /** gets one user by username
   *
   *  returns { username, firstName, lastName, isAdmin, ingredients, favoriteRecipes }
   *
   *  throws NotFoundError if user doesn't exist
   */
  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
                FROM users
                WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const ingredientsRes = await db.query(
      `SELECT username, ingredient_name AS "ingredientName"
                FROM users_ingredients
                WHERE username = $1
                ORDER BY ingredient_name`,
      [username]
    );

    user.ingredients = ingredientsRes.rows.map((i) => i.ingredientName);

    const recipesRes = await db.query(
      `SELECT username, recipe_id AS "recipeId"
                FROM users_recipes
                WHERE username = $1
                ORDER BY recipe_id`,
      [username]
    );

    user.recipes = recipesRes.rows.map((r) => r.recipeId);

    return user;
  }

  /** partial user update - updates whichever fields are provided
   *
   *  takes (username, data) as params: data object can include
   *  { firstName, lastName, password, email, [and/or] isAdmin }
   *
   *  returns { username, firstName, lastName, email, isAdmin }
   *
   *  NOTE: this function can change passwords and set admin privileges.
   *  Call with care.
   */
  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** delete user by username; returns undefined */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** get all of user's ingredients
   *  returns { ingredients: [ingredientName, ingredientName, ...] }
   */

  static async getUserIngredients(username) {
    let result = await db.query(
      `SELECT ingredient_name AS "ingredientName"
             FROM users_ingredients
            WHERE username = $1`,
      [username]
    );
    const ingredients = {
      ingredients: result.rows.map((r) => r.ingredientName),
    };
    return ingredients;
  }

  /** add ingredient to user's storage
   *
   *  returns { username, ingredientName }
   */

  static async addIngredient(username, ingredientName) {
    const ingredientExistsCheck = await db.query(
      `SELECT name FROM ingredients WHERE name = $1`,
      [ingredientName]
    );

    if (!ingredientExistsCheck.rows[0])
      throw new NotFoundError(`No ingredient: ${ingredientName}`);

    const userExistsCheck = await db.query(
      `SELECT username, first_name, last_name
            FROM users
            WHERE username = $1`,
      [username]
    );

    if (!userExistsCheck.rows[0])
      throw new NotFoundError(`No user: ${username}`);

    const duplicateCheck = await db.query(
      `SELECT username, ingredient_name
            FROM users_ingredients
            WHERE username = $1 AND ingredient_name = $2`,
      [username, ingredientName]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(
        `User ${username} already possesses ingredient '${ingredientName}'`
      );

    const result = await db.query(
      `INSERT INTO users_ingredients (username, ingredient_name)
            VALUES ($1, $2)
            RETURNING username, ingredient_name AS "ingredientName"`,
      [username, ingredientName]
    );

    const userIngredient = result.rows[0];
    return userIngredient;
  }

  /** remove ingredient from user's storage
   *  returns { message: removed ingredient <id> from user <username> }
   */
  static async removeIngredient(username, ingredientName) {
    const userHasIngredientCheck = await db.query(
      `SELECT username, ingredient_name
                FROM users_ingredients
                WHERE username = $1 AND ingredient_name = $2`,
      [username, ingredientName]
    );

    if (!userHasIngredientCheck.rows[0])
      throw new NotFoundError(
        `A match between user ${username} and ingredient ${ingredientName} was not found`
      );

    await db.query(
      `DELETE FROM users_ingredients
                WHERE username = $1 AND ingredient_name = $2`,
      [username, ingredientName]
    );

    return {
      message: `Removed ingredient ${ingredientName} from user ${username}`,
    };
  }

  /** get all of user's favorite recipes
   *  returns { recipes: [{id, name}, {id, name}, ...] }
   */

  static async getUserRecipes(username) {
    let result = await db.query(
      `SELECT ur.recipe_id AS id, r.name AS name
             FROM users_recipes AS ur LEFT JOIN recipes AS r
               ON ur.recipe_id = r.id
            WHERE ur.username = $1`,
      [username]
    );
    const recipes = {
      recipes: result.rows,
    };
    return recipes;
  }

  /** save recipe to user's favorites
   *
   *  returns { user, recipeId }
   */

  static async addRecipe(username, recipeId) {
    const recipeExistsCheck = await db.query(
      `SELECT id, name FROM recipes WHERE id = $1`,
      [recipeId]
    );

    if (!recipeExistsCheck.rows[0])
      throw new NotFoundError(`No recipe: ${recipeId}`);

    const userExistsCheck = await db.query(
      `SELECT username, first_name, last_name
            FROM users
            WHERE username = $1`,
      [username]
    );

    if (!userExistsCheck.rows[0])
      throw new NotFoundError(`No user: ${username}`);

    const duplicateCheck = await db.query(
      `SELECT username, recipe_id
            FROM users_recipes
            WHERE username = $1 AND recipe_id = $2`,
      [username, recipeId]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(
        `User ${username} has already favorited recipe ${recipeId}`
      );

    const result = await db.query(
      `INSERT INTO users_recipes (username, recipe_id)
            VALUES ($1, $2)
            RETURNING username, recipe_id AS "recipeId"`,
      [username, recipeId]
    );

    const userRecipe = result.rows[0];
    return userRecipe;
  }

  /** remove recipe from user's favorites
   *  returns { message: removed recipe <id> from user <username> }
   */
  static async removeRecipe(username, recipeId) {
    const userHasRecipeCheck = await db.query(
      `SELECT username, recipe_id
                FROM users_recipes
                WHERE username = $1 AND recipe_id = $2`,
      [username, recipeId]
    );

    if (!userHasRecipeCheck.rows[0])
      throw new NotFoundError(
        `A match between user ${username} and recipe ${recipeId} was not found`
      );

    await db.query(
      `DELETE FROM users_recipes
                WHERE username = $1 AND recipe_id = $2`,
      [username, recipeId]
    );

    return {
      message: `Removed recipe ${recipeId} from user ${username}'s favorites`,
    };
  }
}

module.exports = User;
