"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
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

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: false,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("c1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
    isAdmin: false,
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, isAdmin: true });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        isAdmin: false,
      },
      {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "u2@email.com",
        isAdmin: false,
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works: user with recipes and ingredients", async function () {
    let user = await User.get("u1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: false,
      recipes: [1, 2],
      ingredients: ["I2", "I3"],
    });
  });

  test("works: user without recipes or ingredients", async function () {
    let user = await User.get("u2");
    expect(user).toEqual({
      username: "u2",
      firstName: "U2F",
      lastName: "U2L",
      email: "u2@email.com",
      isAdmin: false,
      recipes: [],
      ingredients: [],
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    firstName: "NewF",
    lastName: "NewF",
    email: "new@email.com",
    isAdmin: true,
  };

  test("works", async function () {
    let user = await User.update("u1", updateData);
    expect(user).toEqual({
      username: "u1",
      ...updateData,
    });
  });

  test("works: set password", async function () {
    let user = await User.update("u1", {
      password: "new",
    });
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: false,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await User.remove("u1");
    const res = await db.query("SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** addIngredient */

describe("add ingredient", function () {
  test("works", async function () {
    const userIngredient = await User.addIngredient("u1", "I1");
    expect(userIngredient).toEqual({ username: "u1", ingredientName: "I1" });

    const res = await db.query(
      "SELECT * FROM users_ingredients WHERE username='u1' AND ingredient_name='I1'"
    );
    expect(res.rows[0]).toEqual({ username: "u1", ingredient_name: "I1" });
  });

  test("not found if no such user", async function () {
    try {
      await User.addIngredient("nope", "I1");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such ingredient", async function () {
    try {
      await User.addIngredient("u1", "fake ingredient");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if dupe", async function () {
    try {
      await User.addIngredient("u1", "I2");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** removeIngredient */

describe("remove ingredient", function () {
  test("works", async function () {
    const removedUserIngredient = await User.removeIngredient("u1", "I2");
    expect(removedUserIngredient).toEqual({
      message: "Removed ingredient I2 from user u1",
    });

    const res = await db.query(
      "SELECT * FROM users_ingredients WHERE username='u1' AND ingredient_name='I2'"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no user/ingredient combo", async function () {
    try {
      await User.removeIngredient("nope", "also nope");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** addRecipe */

describe("add recipe", function () {
  test("works", async function () {
    const userRecipe = await User.addRecipe("u1", 3);
    expect(userRecipe).toEqual({ username: "u1", recipeId: 3 });

    const res = await db.query(
      "SELECT * FROM users_recipes WHERE username='u1' AND recipe_id=3"
    );
    expect(res.rows[0]).toEqual({ username: "u1", recipe_id: 3 });
  });

  test("not found if no such user", async function () {
    try {
      await User.addRecipe("nope", 3);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such recipe", async function () {
    try {
      await User.addRecipe("u1", 525600);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if dupe", async function () {
    try {
      await User.addRecipe("u1", 1);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** removeRecipe */

describe("remove recipe", function () {
  test("works", async function () {
    const removedUserRecipe = await User.removeRecipe("u1", 2);
    expect(removedUserRecipe).toEqual({
      message: "Removed recipe 2 from user u1's favorites",
    });

    const res = await db.query(
      "SELECT * FROM users_recipes WHERE username='u1' AND recipe_id=2"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no user/recipe combo", async function () {
    try {
      await User.removeRecipe("nope", 525600);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
