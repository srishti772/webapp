const express = require("express");
const { checkDbConnection } = require("../config/dbConnection");
const logger = require("../config/logger/winston");
const logData = require("../config/logger/loggerUtil");
const statsd = require("../config/statsD");
const router = express.Router();
const { performance } = require('perf_hooks');

router.get("/", async (req, res, next) => {
  if (
    (req.body && Object.keys(req.body).length > 0) ||
    req._parsedUrl.search != null
  ) {
    const apiError = new Error("Request body and params should be empty.");
    apiError.statusCode = 400;
    return next(apiError);
  }

  // Check database connection
  const start = performance.now();

  try {
    await checkDbConnection();
    const duration = performance.now() - start;
    statsd.timing(`${req.method}_${req.originalUrl}.dbSetup_Success`, duration);

    console.log("Connectd to MySQL");
  } catch (error) {
    const duration = performance.now() - start;
    statsd.timing(`${req.method}_${req.originalUrl}.dbSetup_Failiure`, duration);

    console.error(error);
    const dbError = new Error(error.body);
    dbError.statusCode = 503;
    return next(dbError);
  }

  console.log("Service health check successful.");

  logData(req.method, req.originalUrl,  req.get('user-agent'), 'info', req.body, 200, 'Service is healthy', null);

  return res.status(200).end();
});

module.exports = router;
