const express = require("express");
const healthCheck = require("./routes/health");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const errorHandler = require("./middleware/errorHandler");
const allowedMethods = require("./middleware/allowedMethods");
const setHeaders = require("./middleware/setHeaders");
const { checkDbConnection, syncDb } = require("./config/dbConnection");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(setHeaders);
app.use(express.json());

app.use(/^\/healthz$/, allowedMethods("GET"), healthCheck);
app.use("/v1/user", allowedMethods("GET", "PUT", "POST"), userRoutes);
app.use("/authenticated", allowedMethods( "POST"), authRoutes);

// Default response for all other paths
app.all("*", async (req, res, next) => {
  const error = new Error(`Path not found ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await checkDbConnection();
    await syncDb();
    console.log("Database synced successfully.");

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("Unable to sync the database:", error.message);
    const apiError = new Error("Unable to sync the database.");
    apiError.statusCode = 500;
    process.exit(1);
  }
};

startServer();
