const express = require('express');
const healthCheck = require('./routes/health');
const defaultRoute = require('./routes/default');
const errorHandler = require('./middleware/errorHandler');
const allowedMethods = require('./middleware/allowedMethods');
const setHeaders = require('./middleware/setHeaders');

require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

app.use(setHeaders);

app.use(allowedMethods("GET"));
app.use(express.json());

// /healthz
app.get('/healthz', healthCheck);

// Default response for all other paths
app.all( "*",defaultRoute);

//middleware to handle all errors
app.use(errorHandler);


// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
