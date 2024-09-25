const express = require('express');
//const { openDbConnection } = require('../config/dbConnection');
const router = express.Router();

router.get('/healthz', async (req, res) => {
    if (Object.keys(req.body).length>0) { //check contents of request body
        console.error("Reques body should be empty.");
        return res.status(400).end();
    }
    if (Object.keys(req.query).length>0) { //check contents of request query parameters
        console.error("Query parameters not allowed.");
        return res.status(400).end();
    }    


    // Check database connection
    //const isDbConnected = await checkDbConnection();

    // Set cache-control headers
    console.log('Service health check successful.');    
    return res.status(200).end();

  
});


module.exports = router;
