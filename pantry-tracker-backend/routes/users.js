"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin, ensureAdminOrCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: admin or logged in as this user
 **/

router.get(
  "/:username",
  ensureAdminOrCorrectUser,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or logged in as this user
 **/

router.patch(
  "/:username",
  ensureAdminOrCorrectUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or logged in as this user
 **/

router.delete(
  "/:username",
  ensureAdminOrCorrectUser,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/ingredients/[name] => { added: ingredientName }
 *
 *  Adds a user/ingredient linkage with specified username/ingredient name
 *
 *  Authorization required: admin or logged in as this user
 */

router.post(
  "/:username/ingredients/:name",
  ensureAdminOrCorrectUser,
  async function (req, res, next) {
    try {
      const ingredientRes = await User.addIngredient(
        req.params.username,
        req.params.name
      );

      if (ingredientRes) {
        return res.json({ added: ingredientRes.ingredientName });
      }
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/ingredients/[name] => { message: message }
 *
 *  Removes a user/ingredient linkage with specified username/ingredient name
 *
 *  Authorization required: admin or logged in as this user
 */

router.delete(
  "/:username/ingredients/:name",
  ensureAdminOrCorrectUser,
  async function (req, res, next) {
    try {
      const ingredientRes = await User.removeIngredient(
        req.params.username,
        req.params.name
      );

      if (ingredientRes) {
        return res.json({ message: ingredientRes.message });
      }
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/recipes/[id] => { added: recipeId }
 *
 *  Adds a user/recipe linkage with specified username/recipe id
 *
 *  Authorization required: admin or logged in as this user
 */

router.post(
  "/:username/recipes/:id",
  ensureAdminOrCorrectUser,
  async function (req, res, next) {
    try {
      const recipeRes = await User.addRecipe(
        req.params.username,
        req.params.id
      );

      if (recipeRes) {
        return res.json({ added: recipeRes.recipeId });
      }
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/recipes/[id] => { message: message }
 *
 *  Removes a user/recipe linkage with specified username/recipe id
 *
 *  Authorization required: admin or logged in as this user
 */

router.delete(
  "/:username/recipes/:id",
  ensureAdminOrCorrectUser,
  async function (req, res, next) {
    try {
      const recipeRes = await User.removeRecipe(
        req.params.username,
        req.params.id
      );

      if (recipeRes) {
        return res.json({ message: recipeRes.message });
      }
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
