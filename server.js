const express = require('express');
const healthCheck = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');
const allowedMethods = require('./middleware/allowedMethods');
const setHeaders = require('./middleware/setHeaders');

require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

app.use(setHeaders);
//only allows GET method
app.use(express.json());

app.use(/^\/healthz$/, allowedMethods("GET"));
app.get(/^\/healthz$/,healthCheck);

// Default response for all other paths
app.all( "*", async (req, res) => {
    console.error("Path not allowed.");   
    return res.status(404).end();  
});

//middleware to handle all errors
app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
