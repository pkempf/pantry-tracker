const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: dataToUpdate and jsToSql provided", function () {
    const dataToUpdate = {
      name: "testuser",
      firstName: "test",
      lastName: "user",
    };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };
    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(setCols).toEqual('"name"=$1, "first_name"=$2, "last_name"=$3');
    expect(values).toEqual(["testuser", "test", "user"]);
  });
  test("works: dataToUpdate provided, empty jsToSql", function () {
    const dataToUpdate = {
      name: "testuser",
      email: "test@user.com",
    };
    const jsToSql = {};
    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(setCols).toEqual(`"name"=$1, "email"=$2`);
    expect(values).toEqual(["testuser", "test@user.com"]);
  });
  test("should throw BadRequestError: empty dataToUpdate", function () {
    try {
      const dataToUpdate = {};
      const jsToSql = {};
      const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
