const { checkDbConnection, syncDb } = require("./config/dbConnection");
const app = require("./app.js");
require("dotenv").config();

const port = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await checkDbConnection();
    await syncDb();
    console.log("Database synced successfully.");

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("Unable to connect the database", error.message);
    const apiError = new Error("Unable to sync the database.");
    apiError.statusCode = 500;
  }
};

startServer();
