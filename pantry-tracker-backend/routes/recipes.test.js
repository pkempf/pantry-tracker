"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /recipes */

describe("POST /recipes", function () {
  const newRecipe = {
    name: "New Recipe",
    instructions: "New Instructions",
    category: "New Category",
    area: "New Area",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/recipes")
      .send(newRecipe)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ recipe: { id: 4, ...newRecipe } });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post("/recipes")
      .send(newRecipe)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/recipes")
      .send({
        name: "New Recipe",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /recipes */

describe("GET /recipes", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/recipes");
    expect(resp.body).toEqual({
      recipes: [
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
      ],
    });
  });

  test("works: all filters", async function () {
    const query = {
      nameLike: "R",
      instructionsLike: "Inst",
      categoryLike: "Cat",
      areaLike: "1",
    };
    const resp = await request(app).get("/recipes").query(query);
    expect(resp.body).toEqual({
      recipes: [
        {
          id: 1,
          name: "R1",
          instructions: "Inst1",
          category: "Cat1",
          area: "Area1",
        },
      ],
    });
  });

  test("works: some filters", async function () {
    const query = { nameLike: "2" };
    const resp = await request(app).get("/recipes").query(query);
    expect(resp.body).toEqual({
      recipes: [
        {
          id: 2,
          name: "R2",
          instructions: "Inst2",
          category: "Cat2",
          area: "Area2",
        },
      ],
    });
  });

  test("fails: bad filters", async function () {
    const query = { douglasAdams: 42 };
    const resp = await request(app).get("/recipes").query(query);
    expect(resp.statusCode).toEqual(400);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE recipes CASCADE");
    const resp = await request(app)
      .get("/recipes")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /recipes/:id */

describe("GET /recipes/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/recipes/1`);
    expect(resp.body).toEqual({
      recipe: {
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
      },
    });
  });

  test("works for anon: recipe w/o ingredients", async function () {
    const resp = await request(app).get(`/recipes/3`);
    expect(resp.body).toEqual({
      recipe: {
        id: 3,
        name: "R3",
        instructions: "Inst3",
        category: "Cat3",
        area: "Area3",
        ingredients: [],
      },
    });
  });

  test("not found for no such recipe", async function () {
    const resp = await request(app).get(`/recipes/525600`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /recipes/:id */

describe("PATCH /recipes/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/recipes/1`)
      .send({
        name: "R1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      recipe: {
        id: 1,
        name: "R1-new",
        instructions: "Inst1",
        category: "Cat1",
        area: "Area1",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch(`/recipes/1`)
      .send({
        name: "R1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/recipes/1`).send({
      name: "R1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such recipe", async function () {
    const resp = await request(app)
      .patch(`/recipes/525600`)
      .send({
        name: "R525600-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/recipes/c1`)
      .send({
        id: 99999999,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /recipes/:id */

describe("DELETE /recipes/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/recipes/1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/recipes/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/recipes/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such recipe", async function () {
    const resp = await request(app)
      .delete(`/recipes/525600`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/******************************* POST /recipes/:id/ingredients/:name */

describe("POST /recipes/:id/ingredients/:name", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .post(`/recipes/1/ingredients/I3`)
      .send({ amount: "Amount3" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      added: {
        recipeId: 1,
        ingredientName: "I3",
        ingredientAmount: "Amount3",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post(`/recipes/1/ingredients/I3`)
      .send({ amount: "Amount3" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post(`/recipes/1/ingredients/I3`)
      .send({ amount: "Amount3" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if recipe missing", async function () {
    const resp = await request(app)
      .post(`/recipes/525600/ingredients/I1`)
      .send({ amount: "Amount1" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if ingredient missing", async function () {
    const resp = await request(app)
      .post(`/recipes/1/ingredients/fake`)
      .send({ amount: "AmountFake" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if dupe", async function () {
    const resp = await request(app)
      .post(`/recipes/1/ingredients/I1`)
      .send({ amount: "Amount1" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/******************************* DELETE /recipes/:id/ingredients/:name */

describe("DELETE /recipes/:id/ingredients/:name", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/recipes/1/ingredients/I1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      deletedIngredient: { recipeId: "1", ingredientName: "I1" },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/recipes/1/ingredients/I1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/recipes/1/ingredients/I1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if recipe missing", async function () {
    const resp = await request(app)
      .delete(`/recipes/525600/ingredients/I1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if ingredient doesn't exist", async function () {
    const resp = await request(app)
      .delete(`/recipes/1/ingredients/fake`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if ingredient exists but not in recipe", async function () {
    const resp = await request(app)
      .delete(`/recipes/1/ingredients/I3`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
