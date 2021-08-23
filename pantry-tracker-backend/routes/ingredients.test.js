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

/************************************** POST /ingredients */

describe("POST /ingredients", function () {
  const newIngredient = {
    name: "New Ingredient",
    description: "New Description",
    type: "New Type",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/ingredients")
      .send(newIngredient)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      ingredient: { ...newIngredient },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post("/ingredients")
      .send(newIngredient)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/ingredients")
      .send({})
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/ingredients")
      .send({
        name: "New Ingredient",
        description: "New Description",
        type: "New Type",
        extraField: "Extra Field",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /ingredients */

describe("GET /ingredients", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/ingredients");
    expect(resp.body).toEqual({
      ingredients: [
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
      ],
    });
  });

  test("works: all filters", async function () {
    const query = { nameLike: "I", descriptionLike: "2", typeLike: "Type" };
    const resp = await request(app).get("/ingredients").query(query);
    expect(resp.body).toEqual({
      ingredients: [
        {
          name: "I2",
          description: "Desc2",
          type: "Type2",
        },
      ],
    });
  });

  test("works: some filters", async function () {
    const query = { nameLike: "3" };
    const resp = await request(app).get("/ingredients").query(query);
    expect(resp.body).toEqual({
      ingredients: [
        {
          name: "I3",
          description: "Desc3",
          type: "Type3",
        },
      ],
    });
  });

  test("fails: bad filters", async function () {
    const query = { name: "1" };
    const resp = await request(app).get("/ingredients").query(query);
    expect(resp.statusCode).toEqual(400);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE ingredients CASCADE");
    const resp = await request(app)
      .get("/ingredients")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /ingredients/:name */

describe("GET /ingredients/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/ingredients/I1`);
    expect(resp.body).toEqual({
      ingredient: {
        name: "I1",
        description: "Desc1",
        type: "Type1",
      },
    });
  });

  test("not found for no such ingredient", async function () {
    const resp = await request(app).get(`/ingredients/fake`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /ingredients/:name */

describe("PATCH /ingredients/:name", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/ingredients/I1`)
      .send({
        description: "New Description 1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      ingredient: {
        name: "I1",
        description: "New Description 1",
        type: "Type1",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch(`/ingredients/I1`)
      .send({
        description: "New Description 1",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/ingredients/I1`).send({
      description: "New Description 1",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such ingredient", async function () {
    const resp = await request(app)
      .patch(`/ingredients/fake`)
      .send({
        description: "New Description fake",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on name change attempt", async function () {
    const resp = await request(app)
      .patch(`/ingredients/I1`)
      .send({
        name: "New Name 1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /ingredients/:id */

describe("DELETE /ingredients/:name", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/ingredients/I1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "I1" });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/ingredients/I1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/ingredients/I1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such ingredient", async function () {
    const resp = await request(app)
      .delete(`/ingredients/fake`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
