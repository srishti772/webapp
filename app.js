const express = require("express");
const healthCheck = require("./routes/health");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const errorHandler = require("./middleware/errorHandler");
const allowedMethods = require("./middleware/allowedMethods");
const setHeaders = require("./middleware/setHeaders");
const { apiTimer, apiCounter } = require("./middleware/apicounter");

const app = express();

app.use(setHeaders);
app.use(express.json());

app.use(allowedMethods);
app.use(apiCounter);
app.use(apiTimer);
app.use(/^\/healthz$/, healthCheck);

app.use("/v1/user", userRoutes);

app.use("/authenticated", authRoutes);

// Default response for all other paths
app.all("*", async (req, res, next) => {
  const error = new Error(`Path not found ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);
module.exports = app;
