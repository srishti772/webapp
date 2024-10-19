const express = require("express");
const healthCheck = require("./routes/health");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const errorHandler = require("./middleware/errorHandler");
const allowedMethods = require("./middleware/allowedMethods");
const setHeaders = require("./middleware/setHeaders");

const app = express();

app.use(setHeaders);
app.use(express.json());

app.use(/^\/healthz$/, allowedMethods("GET"), healthCheck);
app.use("/v2/user", allowedMethods("GET", "PUT", "POST"), userRoutes);
app.use("/authenticated", allowedMethods("POST"), authRoutes);

// Default response for all other paths
app.all("*", async (req, res, next) => {
  const error = new Error(`Path not found ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);
module.exports = app;
