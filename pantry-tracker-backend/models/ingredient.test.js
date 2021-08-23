"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Ingredient = require("./ingredient.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newIngredient = {
    name: "New Ingredient",
    description: "New Description",
    type: "New Type",
  };

  test("works", async function () {
    let ingredient = await Ingredient.create(newIngredient);
    expect(ingredient).toEqual(newIngredient);

    const result = await db.query(
      `SELECT name, description, type
           FROM ingredients
           WHERE name = 'New Ingredient'`
    );
    expect(result.rows[0]).toEqual(newIngredient);
  });

  test("bad request with dupe", async function () {
    try {
      await Ingredient.create(newIngredient);
      await Ingredient.create(newIngredient);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let ingredients = await Ingredient.findAll();
    expect(ingredients).toEqual([
      {
        name: "I1",
        description: "Desc1",
        type: "Type1",
      },
      {
        name: "I2",
        description: "Desc2",
        type: "Type2",
      },
      {
        name: "I3",
        description: "Desc3",
        type: "Type3",
      },
    ]);
  });
});

/************************************** findByCriteria */

describe("findByCriteria", function () {
  test("works: all filters", async function () {
    let filters = { nameLike: "I", descriptionLike: "c2", typeLike: "Type2" };
    let ingredients = await Ingredient.findByCriteria(filters);
    expect(ingredients).toEqual([
      {
        name: "I2",
        description: "Desc2",
        type: "Type2",
      },
    ]);
  });
  test("works: not all filters", async function () {
    let filters = { typeLike: "3" };
    let ingredients = await Ingredient.findByCriteria(filters);
    expect(ingredients).toEqual([
      {
        name: "I3",
        description: "Desc3",
        type: "Type3",
      },
    ]);
  });
  test("works: filters empty", async function () {
    let filters = {};
    let ingredients = await Ingredient.findByCriteria(filters);
    expect(ingredients).toEqual([
      {
        name: "I1",
        description: "Desc1",
        type: "Type1",
      },
      {
        name: "I2",
        description: "Desc2",
        type: "Type2",
      },
      {
        name: "I3",
        description: "Desc3",
        type: "Type3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let ingredient = await Ingredient.get("I2");
    expect(ingredient).toEqual({
      name: "I2",
      description: "Desc2",
      type: "Type2",
    });
  });

  test("throws error if no name provided", async function () {
    try {
      await Ingredient.get();
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no such ingredient", async function () {
    try {
      await Ingredient.get("fake ingredient");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    description: "New Description",
    type: "New Type",
  };

  test("works", async function () {
    let ingredient = await Ingredient.update("I1", updateData);
    expect(ingredient).toEqual({
      name: "I1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT name, description, type
           FROM ingredients
           WHERE name = 'I1'`
    );
    expect(result.rows).toEqual([
      {
        name: "I1",
        description: "New Description",
        type: "New Type",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      description: "New Description",
      type: null,
    };

    let ingredient = await Ingredient.update("I1", updateDataSetNulls);
    expect(ingredient).toEqual({
      name: "I1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT name, description, type
        FROM ingredients
        WHERE name = 'I1'`
    );
    expect(result.rows).toEqual([
      {
        name: "I1",
        description: "New Description",
        type: null,
      },
    ]);
  });

  test("not found if no such ingredient", async function () {
    try {
      await Ingredient.update("fake ingredient", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Ingredient.update("I1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Ingredient.remove("I1");
    const res = await db.query(
      "SELECT name FROM ingredients WHERE name = 'I1'"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such ingredient id", async function () {
    try {
      await Ingredient.remove("fake ingredient");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
