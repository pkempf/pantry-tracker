//** Shared config for the Pantry Tracker backend */

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev-key";

const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or production database (via env var)
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "pantry_tracker_test"
    : process.env.DATABASE_URL || "pantry_tracker";
}

// Speed up bcrypt during testing - no reason to use a high work factor for testing
// Note: reevaluate the production work factor in subsequent years (current year: 2021)
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 13;

console.log("Pantry Tracker Config:");
console.log("SECRET_KEY", SECRET_KEY);
console.log("PORT:", PORT.toString());
console.log("BCRYPT_WORK_FACTOR:", BCRYPT_WORK_FACTOR);
console.log("Database:", getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
