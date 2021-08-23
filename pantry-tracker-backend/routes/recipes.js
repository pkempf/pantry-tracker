"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Recipe = require("../models/recipe");

const recipeNewSchema = require("../schemas/recipeNew.json");
const recipeUpdateSchema = require("../schemas/recipeUpdate.json");
const recipeyGetSchema = require("../schemas/recipeGet.json");

const router = new express.Router();

/** POST / { recipe } =>  { recipe }
 *
 * company should be { name, instructions, category, area }
 * name and instructions are required
 *
 * Returns { id, name, instructions, category, area }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, routerNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const recipe = await Recipe.create(req.body);
    return res.status(201).json({ recipe });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { recipes: [ { id, name, instructions, category, area }, ...] }
 *
 * Can filter on provided search filters (from query string):
 * - nameLike
 * - instructionsLike
 * - categoryLike
 * - areaLike
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const query = req.query;

    const validator = jsonschema.validate(query, recipeGetSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    let recipes;

    if (!query) {
      recipes = await Recipe.findAll();
    } else {
      recipes = await Recipe.findByCriteria(query);
    }
    return res.json({ recipes });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { recipe }
 *
 *  Recipe is { id, name, instructions, category, area, recipeIngredients: [] }
 *   where recipeIngredients is [{ ingredientName, amount }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const recipe = await Recipe.get(req.params.id);
    return res.json({ recipe });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { recipe }
 *
 * Patches recipe data.
 *
 * fields can be: { name, instructions, category, area }
 *
 * Returns { id, name, instructions, category, area }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, recipeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const recipe = await Recipe.update(req.params.handle, req.body);
    return res.json({ recipe });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Recipe.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

/** POST /[id]/ingredients/[name] =>
 *     { added: { recipeId, ingredientName, ingredientAmount } }
 *
 *  Body should include { amount: [amount] }
 *
 *  Adds an ingredient to the recipe
 *
 *  Authorization: admin
 */

router.post(
  "/:id/ingredients/:name",
  ensureAdmin,
  async function (req, res, next) {
    try {
      let { amount } = req.body;
      if (!amount || amount === "")
        throw new BadRequestError("Please specify an amount");

      const recipeIngredient = await Recipe.addIngredient(req.params.id, {
        name: req.params.name,
        amount: amount,
      });

      return res.json({ added: recipeIngredient });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[id]/ingredients/[name] => { deletedIngredient: {id, name} }
 *
 *  Removes an ingredient from the recipe
 *
 *  Authorization: admin
 */

router.delete(
  "/:id/ingredients/:name",
  ensureAdmin,
  async function (req, res, next) {
    try {
      await Recipe.removeIngredient(req.params.id, req.params.name);
      return res.json({
        deletedIngredient: { id: req.params.id, name: req.params.name },
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
