/** Express backend for the Pantry Tracker */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

// not yet implemented:
// const { authenticateJWT } = require("./middleware/auth");
// const authRoutes = require("./routes/auth");
// const ingredientsRoutes = require("./routes/ingredients");
// const usersRoutes = require("./routes/users");
// const recipesRoutes = require("./routes/recipes");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
// app.use(authenticateJWT);

// app.use("/auth", authRoutes);
// app.use("/ingredients", ingredientsRoutes);
// app.use("/users", usersRoutes);
// app.use("/recipes", recipesRoutes);

/** 404 handler */
app.use((req, res, next) => {
  return next(new NotFoundError());
});

/** Catch-all unhandled error handler */
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
