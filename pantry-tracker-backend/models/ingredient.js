const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Ingredient model for the Pantry Tracker */

class Ingredient {
  /** Create an ingredient from data, update db, return new ingredient
   *
   *  data should be { name, description, type };
   *  name is required
   *
   *  Returns { name, description, type }
   *
   *  Throws BadRequestError if ingredient already in database
   */

  static async create({ name, description = "", type = "" }) {
    if (!name) throw new BadRequestError("An ingredient must have a name");

    const dupeCheck = await db.query(
      `SELECT name
                FROM ingredients
                WHERE name = $1`,
      [name]
    );

    if (dupeCheck.rows[0])
      throw new BadRequestError(`Duplicate ingredient: ${name}`);

    const result = await db.query(
      `INSERT INTO ingredients
                (name, description, type)
                VALUES ($1, $2, $3)
                RETURNING name, description, type`,
      [name, description, type]
    );

    const ingredient = result.rows[0];

    return ingredient;
  }

  /** Return all ingredients.
   *
   *  Returns [{name, description, type}, ...]
   */

  static async findAll() {
    const ingredientsRes = await db.query(
      `SELECT name, description, type
                FROM ingredients
                ORDER BY name`
    );

    return ingredientsRes.rows;
  }

  /** Return some ingredients depending on criteria
   *
   *  Takes filter object, not all fields required: { nameLike, descriptionLike, typeLike }
   *
   *  Returns [{name, description, type}, ...]
   */

  static async findByCriteria(filters) {
    // destructuring the filters
    const { nameLike, descriptionLike, typeLike } = filters || {};

    // if empty just run findAll()
    if (!(nameLike || descriptionLike || typeLike)) return Ingredient.findAll();

    let filterString = "";
    let values = [];

    // building the string to put in the WHERE field of the query
    // and the params to send with it
    if (nameLike) {
      filterString += "name ILIKE $1";
      values.push(`%${nameLike}%`);
    }
    if (descriptionLike) {
      if (values.length > 0) filterString += " AND ";

      filterString += "description ILIKE $" + (values.length + 1);
      values.push(`%${descriptionLike}%`);
    }
    if (typeLike) {
      if (values.length > 0) filterString += " AND ";

      filterString += "type ILIKE $" + (values.length + 1);
      values.push(`%${typeLike}%`);
    }

    const ingredientsRes = await db.query(
      `SELECT name, description, type
            FROM ingredients
            WHERE ${filterString}
            ORDER BY name`,
      values
    );

    return ingredientsRes.rows;
  }

  /** Given ingredient name, return data about it
   *
   *  Returns { name, description, type }
   */

  static async get(name) {
    let ingredientRes;

    if (name) {
      ingredientRes = await db.query(
        `SELECT name, description, type
                FROM ingredients
                WHERE name = $1`,
        [name]
      );
    } else throw new BadRequestError("Please provide a search criterion.");

    let ingredient = ingredientRes.rows[0];

    if (!ingredient) throw new NotFoundError(`Ingredient not found: ${name}`);

    return ingredient;
  }

  /** Update ingredient data with data object.
   *  This is a partial update, so it's fine if data doesn't contain all fields.
   *
   *  Data can include { description [and/or] type}.
   *
   *  Returns {name, description, type}.
   *
   *  Throws NotFoundError if not found.
   *  Throws BadRequestError if no update data given.
   */
  static async update(name, data) {
    if (Object.entries(data).length === 0)
      throw new BadRequestError("No update data provided");

    const { setCols, values } = sqlForPartialUpdate(data, {});

    const nameVarIndex = "$" + (values.length + 1);

    const querySql = `UPDATE ingredients
                        SET ${setCols}
                        WHERE name = ${nameVarIndex}
                        RETURNING name,
                                  description,
                                  type`;

    const result = await db.query(querySql, [...values, name]);
    const ingredient = result.rows[0];

    if (!ingredient)
      throw new NotFoundError(`Ingredient with name '${name}' not found`);

    return ingredient;
  }

  /** Deletes an ingredient by name; returns undefined.
   *
   *  Throws NotFoundError if ingredient not found.
   */
  static async remove(name) {
    const result = await db.query(
      `DELETE
                FROM ingredients
                WHERE name = $1
                RETURNING name`,
      [name]
    );

    const ingredient = result.rows[0];

    if (!ingredient)
      throw new NotFoundError(`Ingredient with name ${name} not found`);
  }
}

module.exports = Ingredient;
