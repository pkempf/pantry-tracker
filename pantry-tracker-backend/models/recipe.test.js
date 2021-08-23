"use strict";

const { fail } = require("assert");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Recipe = require("./recipe.js");
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
  const newRecipe = {
    name: "New",
    instructions: "New Instructions",
    category: "New Category",
    area: "New Area",
  };

  test("works", async function () {
    let recipe = await Recipe.create(newRecipe);
    expect(recipe).toEqual({ id: 4, ...newRecipe });

    const result = await db.query(
      `SELECT id, name, instructions, category, area
           FROM recipes
           WHERE name = 'New'`
    );
    expect(result.rows).toEqual([
      {
        id: 4,
        name: "New",
        instructions: "New Instructions",
        category: "New Category",
        area: "New Area",
      },
    ]);
  });

  // allows duplicates; no need to check duplication behavior
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let recipes = await Recipe.findAll();
    expect(recipes).toEqual([
      {
        id: 1,
        name: "R1",
        instructions: "Inst1",
        category: "Cat1",
        area: "Area1",
      },
      {
        id: 2,
        name: "R2",
        instructions: "Inst2",
        category: "Cat2",
        area: "Area2",
      },
      {
        id: 3,
        name: "R3",
        instructions: "Inst3",
        category: "Cat3",
        area: "Area3",
      },
    ]);
  });
});

/************************************** findByCriteria */

describe("findByCriteria", function () {
  test("works: all filters", async function () {
    let filters = {
      nameLike: "R2",
      instructionsLike: "nst2",
      categoryLike: "t2",
      areaLike: "2",
    };
    let recipes = await Recipe.findByCriteria(filters);
    expect(recipes).toEqual([
      {
        id: 2,
        name: "R2",
        instructions: "Inst2",
        category: "Cat2",
        area: "Area2",
      },
    ]);
  });
  test("works: not all filters", async function () {
    let filters = {
      instructionsLike: "Inst",
    };
    let recipes = await Recipe.findByCriteria(filters);
    expect(recipes).toEqual([
      {
        id: 1,
        name: "R1",
        instructions: "Inst1",
        category: "Cat1",
        area: "Area1",
      },
      {
        id: 2,
        name: "R2",
        instructions: "Inst2",
        category: "Cat2",
        area: "Area2",
      },
      {
        id: 3,
        name: "R3",
        instructions: "Inst3",
        category: "Cat3",
        area: "Area3",
      },
    ]);
  });
  test("works: filters empty", async function () {
    let filters = {};
    let recipes = await Recipe.findByCriteria(filters);
    expect(recipes).toEqual([
      {
        id: 1,
        name: "R1",
        instructions: "Inst1",
        category: "Cat1",
        area: "Area1",
      },
      {
        id: 2,
        name: "R2",
        instructions: "Inst2",
        category: "Cat2",
        area: "Area2",
      },
      {
        id: 3,
        name: "R3",
        instructions: "Inst3",
        category: "Cat3",
        area: "Area3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let recipe = await Recipe.get(1);
    expect(recipe).toEqual({
      id: 1,
      name: "R1",
      instructions: "Inst1",
      category: "Cat1",
      area: "Area1",
      ingredients: [
        {
          ingredientName: "I1",
          amount: "Amount1",
        },
        {
          ingredientName: "I2",
          amount: "Amount2",
        },
      ],
    });
  });

  test("not found if no such recipe", async function () {
    try {
      await Recipe.get(525600);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New Name",
    instructions: "New Instructions",
    category: "New Category",
    area: "New Area",
  };

  test("works", async function () {
    let recipe = await Recipe.update(1, updateData);
    expect(recipe).toEqual({
      id: 1,
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, name, instructions, category, area
           FROM recipes
           WHERE id = 1`
    );
    expect(result.rows).toEqual([
      {
        id: 1,
        name: "New Name",
        instructions: "New Instructions",
        category: "New Category",
        area: "New Area",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New Name",
      instructions: "New Instructions",
      category: null,
      area: null,
    };

    let recipe = await Recipe.update(2, updateDataSetNulls);
    expect(recipe).toEqual({
      id: 2,
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT id, name, instructions, category, area
      FROM recipes
      WHERE id = 2`
    );
    expect(result.rows).toEqual([
      {
        id: 2,
        name: "New Name",
        instructions: "New Instructions",
        category: null,
        area: null,
      },
    ]);
  });

  test("not found if no such recipe", async function () {
    try {
      await Recipe.update(525600, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Recipe.update(3, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Recipe.remove(1);
    const res = await db.query("SELECT id FROM recipes WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such recipe", async function () {
    try {
      await Recipe.remove(525600);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** addIngredient */

describe("add ingredient", function () {
  test("works", async function () {
    const newRecipeIngredient = await Recipe.addIngredient(1, {
      name: "I3",
      amount: "Amount3",
    });
    expect(newRecipeIngredient).toEqual({
      recipeId: 1,
      ingredientName: "I3",
      ingredientAmount: "Amount3",
    });
    const updatedRecipe = await Recipe.get(1);
    expect(updatedRecipe.ingredients).toEqual([
      {
        ingredientName: "I1",
        amount: "Amount1",
      },
      {
        ingredientName: "I2",
        amount: "Amount2",
      },
      {
        ingredientName: "I3",
        amount: "Amount3",
      },
    ]);
  });

  test("fails with bad ingredient data", async function () {
    try {
      await Recipe.addIngredient(2, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("fails with nonexistent recipe", async function () {
    try {
      await Recipe.addIngredient(525600, {
        name: "I3",
        amount: "Amount3",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("fails with nonexistent ingredient", async function () {
    try {
      await Recipe.addIngredient(1, {
        name: "not a real ingredient",
        amount: "Amount",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("fails if recipe already contains ingredient", async function () {
    try {
      await Recipe.addIngredient(1, {
        name: "I1",
        amount: "Amount1",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** removeIngredient */

describe("remove ingredient", function () {
  test("works", async function () {
    const deletion = await Recipe.removeIngredient(1, "I2");
    expect(deletion.removed).toEqual({
      recipeId: 1,
      ingredientName: "I2",
    });
    const updatedRecipe = await Recipe.get(1);
    expect(updatedRecipe.ingredients).toEqual([
      {
        ingredientName: "I1",
        amount: "Amount1",
      },
    ]);
  });

  test("fails without recipe or ingredient name", async function () {
    try {
      await Recipe.removeIngredient();
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("fails with nonexistent recipe", async function () {
    try {
      await Recipe.removeIngredient(525600, "I1");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("fails if recipe doesn't contain ingredient", async function () {
    try {
      await Recipe.removeIngredient(1, "I3");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
