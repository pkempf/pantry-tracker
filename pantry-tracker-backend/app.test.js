const request = require("supertest");

const app = require("./app");
const db = require("./db");

test("not found for site 404", async function () {
  const resp = await request(app).get("/fake-path");
  expect(resp.statusCode).toEqual(404);
});

test("404 - testing stack print", async function () {
  process.env.NODE_ENV = "";
  const resp = await request(app).get("/fake-path");
  expect(resp.statusCode).toEqual(404);
  delete process.env.NODE_ENV;
});

afterAll(function () {
  db.end();
});
