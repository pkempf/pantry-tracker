"use strict";

/** Routes for ingredients. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const Ingredient = require("../models/ingredient");

const ingredientNewSchema = require("../schemas/ingredientNew.json");
const ingredientUpdateSchema = require("../schemas/ingredientUpdate.json");
const ingredientGetSchema = require("../schemas/ingredientGet.json");

const router = new express.Router();

/** POST / { ingredient } =>  { ingredient }
 *
 * ingredient object should be { name, description, type }
 *
 * Returns { name, description, type }
 *
 * Authorization required: logged-in user
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, ingredientNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const ingredient = await Ingredient.create(req.body);
    return res.status(201).json({ ingredient });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { ingredients: [ { name, description, type }, ...] }
 *
 * Can filter on provided search filters (from query string):
 * - nameLike
 * - descriptionLike
 * - typeLike
 *
 * Returns any partial case-insensitive match.
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const query = req.query;

    const validator = jsonschema.validate(query, ingredientGetSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    let ingredients;

    if (!query) {
      ingredients = await Ingredient.findAll();
    } else {
      ingredients = await Ingredient.findByCriteria(query);
    }
    return res.json({ ingredients });
  } catch (err) {
    return next(err);
  }
});

/** GET /[name]  =>  { ingredient }
 *
 *  ingredient is { name, description, type }
 *
 * Authorization required: none
 */

router.get("/:name", async function (req, res, next) {
  try {
    const ingredient = await Ingredient.get(req.params.name);
    return res.json({ ingredient });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[name] { fld1, fld2, ... } => { ingredient }
 *
 * Patches ingredient data.
 *
 * fields can be: { description, type }
 *
 * Returns { name, description, type }
 *
 * Authorization required: admin
 */

router.patch("/:name", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, ingredientUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const ingredient = await Ingredient.update(req.params.name, req.body);
    return res.json({ ingredient });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[name]  =>  { deleted: name }
 *
 * Authorization: admin
 */

router.delete("/:name", ensureAdmin, async function (req, res, next) {
  try {
    await Ingredient.remove(req.params.name);
    return res.json({ deleted: req.params.name });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
