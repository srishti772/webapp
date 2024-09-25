const express = require('express');
//const { openDbConnection } = require('../config/dbConnection');
const router = express.Router();

router.get('/healthz', async (req, res) => {
    // Check if request has any payload
    if (Object.keys(req.body).length>0) {
        console.log("req body",req.body);
        return res.status(400).end();
    }
    if (Object.keys(req.query).length>0) {
        console.log("req params");
        return res.status(400).end();
    }
    console.log('health route');


    // Check database connection
    //const isDbConnected = await checkDbConnection();

    // Set cache-control headers
    
    return res.status(200).end();

  
});


module.exports = router;
