const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Recipe model for the Pantry Tracker */

class Recipe {
  /** Create a recipe from data, update db, return new recipe
   *
   *  data should be { name, instructions, category, area };
   *  name and instructions are required
   *
   *  Returns { id, name, instructions, category, area }
   *
   */

  static async create({ name, instructions, category = "", area = "" }) {
    if (!name) throw new BadRequestError("A recipe must have a name");
    if (!instructions)
      throw new BadRequestError("A recipe must have instructions");

    const result = await db.query(
      `INSERT INTO recipes
                (name, instructions, category, area)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, instructions, category, area`,
      [name, instructions, category, area]
    );

    const recipe = result.rows[0];

    return recipe;
  }

  /** Return all recipes.
   *
   *  Returns [{id, name, instructions, category, area}, ...]
   */

  static async findAll() {
    const recipesRes = await db.query(
      `SELECT id, name, instructions, category, area
                FROM recipes
                ORDER BY name`
    );

    return recipesRes.rows;
  }

  /** Return some recipes depending on criteria
   *
   *  Takes filter object, not all fields required: { nameLike, instructionsLike, categoryLike, areaLike }
   *
   *  Returns [{id, name, instructions, category, area}, ...]
   */

  static async findByCriteria(filters) {
    // destructuring the filters
    const { nameLike, instructionsLike, categoryLike, areaLike } =
      filters || {};

    // if empty just run findAll()
    if (!(nameLike || instructionsLike || categoryLike || areaLike))
      return Recipe.findAll();

    let filterString = "";
    let values = [];

    // building the string to put in the WHERE field of the query
    // and the params to send with it
    if (nameLike) {
      filterString += "name ILIKE $1";
      values.push(`%${nameLike}%`);
    }
    if (instructionsLike) {
      if (values.length > 0) filterString += " AND ";

      filterString += "instructions ILIKE $" + (values.length + 1);
      values.push(`%${instructionsLike}%`);
    }
    if (categoryLike) {
      if (values.length > 0) filterString += " AND ";

      filterString += "category ILIKE $" + (values.length + 1);
      values.push(`%${categoryLike}%`);
    }
    if (areaLike) {
      if (values.length > 0) filterString += " AND ";

      filterString += "area ILIKE $" + (values.length + 1);
      values.push(`%${areaLike}%`);
    }

    const recipesRes = await db.query(
      `SELECT id, name, instructions, category, area
            FROM recipes
            WHERE ${filterString}
            ORDER BY name`,
      values
    );

    return recipesRes.rows;
  }

  /** Given recipe ID, return data about it
   *
   *  Returns { id, name, instructions, category, area, ingredients: [] }
   */

  static async get(id) {
    let recipeRes = await db.query(
      `SELECT id, name, instructions, category, area
                FROM recipes
                WHERE id = $1`,
      [id]
    );

    let recipe = recipeRes.rows[0];

    if (!recipe) throw new NotFoundError(`Recipe not found: ${id}`);

    let ingredientsRes = await db.query(
      `SELECT ingredient_name AS "ingredientName",
                ingredient_amount AS "amount"
                FROM recipe_ingredients
                WHERE recipe_id = $1`,
      [id]
    );

    recipe.ingredients = ingredientsRes.rows;

    return recipe;
  }

  /** Update recipe data with data object.
   *  This is a partial update, so it's fine if data doesn't contain all fields.
   *
   *  Data can include { name, instructions, category, [and/or] area }.
   *
   *  Returns { id, name, instructions, category, area }.
   *
   *  Throws NotFoundError if not found.
   *  Throws BadRequestError if run with no data.
   */
  static async update(id, data) {
    if (Object.entries(data).length === 0)
      throw new BadRequestError("No update data provided");

    const { setCols, values } = sqlForPartialUpdate(data, {});

    const idVarIndex = "$" + (values.length + 1);

    const querySql = `UPDATE recipes
                        SET ${setCols}
                        WHERE id = ${idVarIndex}
                        RETURNING id,
                                  name,
                                  instructions,
                                  category,
                                  area`;

    const result = await db.query(querySql, [...values, id]);
    const recipe = result.rows[0];

    if (!recipe) throw new NotFoundError(`Recipe with id '${id}' not found`);

    return recipe;
  }

  /** Deletes a recipe by id; returns undefined.
   *
   *  Throws NotFoundError if recipe not found.
   */
  static async remove(id) {
    const result = await db.query(
      `DELETE
                FROM recipes
                WHERE id = $1
                RETURNING id`,
      [id]
    );

    const recipe = result.rows[0];

    if (!recipe) throw new NotFoundError(`Recipe with id ${id} not found`);
  }

  /** Adds one ingredient to a recipe.
   *
   *  Takes recipe ID and an ingredient of format { name, amount }
   *
   *  Throws NotFoundError if ingredient or recipe doesn't exist.
   *
   *  If this recipe already has this ingredient, throws BadRequestError
   */
  static async addIngredient(recipeId, ingredient) {
    const { name, amount } = ingredient || {};

    if (!name)
      throw new BadRequestError("Cannot add an ingredient without a name");

    if (!amount)
      throw new BadRequestError("Cannot add an ingredient without an amount");

    let recipeCheck = await db.query(
      `SELECT id, name
                FROM recipes
                WHERE id = $1`,
      [recipeId]
    );

    if (!recipeCheck.rows[0])
      throw new NotFoundError(`Recipe with id ${recipeId} not found`);

    let ingredientCheck = await db.query(
      `SELECT name
                FROM ingredients
                WHERE name = $1`,
      [name]
    );

    if (!ingredientCheck.rows[0])
      throw new NotFoundError(`Ingredient '${name}' not found`);

    let dupeCheck = await db.query(
      `SELECT recipe_id, ingredient_name
                FROM recipe_ingredients
                WHERE recipe_id = $1 AND ingredient_name = $2`,
      [recipeId, name]
    );

    if (dupeCheck.rows[0])
      throw new BadRequestError(
        `Recipe ${recipeId} already contains ingredient '${name}'`
      );

    let result = await db.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_name, ingredient_amount)
                VALUES ($1, $2, $3)
                RETURNING recipe_id AS "recipeId",
                          ingredient_name AS "ingredientName",
                          ingredient_amount AS "ingredientAmount"`,
      [recipeId, name, amount]
    );

    return result.rows[0];
  }

  /** Removes one ingredient from a recipe.
   *  Returns { removed: { recipeId, ingredientName }}
   *
   *  Takes recipe ID and ingredient name.
   *
   *  Throws NotFoundError if recipe does not contain ingredient.
   */

  static async removeIngredient(recipeId, ingredientName) {
    if (!recipeId || !ingredientName)
      throw new BadRequestError(
        "Please specify an ingredient and a recipe from which to remove it"
      );

    let recipeCheck = await db.query(
      `SELECT id, name
                  FROM recipes
                  WHERE id = $1`,
      [recipeId]
    );

    if (!recipeCheck.rows[0])
      throw new NotFoundError(`Recipe with id ${recipeId} not found`);

    let recipeHasIngredientCheck = await db.query(
      `SELECT recipe_id, ingredient_name
                  FROM recipe_ingredients
                  WHERE recipe_id = $1 AND ingredient_name = $2`,
      [recipeId, ingredientName]
    );

    if (!recipeHasIngredientCheck.rows[0])
      throw new NotFoundError(
        `Recipe ${recipeId} does not contain ingredient ${ingredientName}`
      );

    let deletionRes = await db.query(
      `DELETE FROM recipe_ingredients
            WHERE recipe_id = $1 AND ingredient_name = $2
            RETURNING recipe_id AS "recipeId", ingredient_name AS "ingredientName"`,
      [recipeId, ingredientName]
    );

    if (!deletionRes.rows[0])
      throw new Error("Removal could not be processed.");

    return { removed: deletionRes.rows[0] };
  }
}

module.exports = Recipe;
