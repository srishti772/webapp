const { checkDbConnection, syncDb } = require("./config/dbConnection");
const app = require("./app.js");
const statsd = require("./config/statsD.js");
require("dotenv").config();
const { performance } = require('perf_hooks');
const port = process.env.PORT || 3000;
const startServer = async () => {
  const start = performance.now();

  try {

    await checkDbConnection();
    await syncDb();

    const duration = performance.now() - start;
    statsd.timing("Server.js", duration, { label: "dbInitializationTime_Success" });
    
    console.log("Database synced successfully.");

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (error) {
    const duration = performance.now() - start;
    statsd.timing("Server.js", duration, { label: "dbInitializationTime_Failure" });

    console.error("Unable to connect the database", error.message);
    const apiError = new Error("Unable to sync the database.");
    apiError.statusCode = 500;
  }
};

startServer();
