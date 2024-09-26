const express = require("express");
const checkDbConnection = require("../config/dbConnection");
const router = express.Router();

router.get("/healthz", async (req, res) => {
    
  if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
    console.error("Request body and params should be empty.");
    return res.status(400).end();
  }

  // Check database connection
  try {
    await checkDbConnection();
    console.log("Connectd to MySQL");
  } catch (error) {
    console.error("Unable to connect to MySQL");
    return res.status(503).end();
  }

  console.log("Service health check successful.");
  return res.status(200).end();
});

module.exports = router;
