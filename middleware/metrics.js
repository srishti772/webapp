const StatsD = require('node-statsd');
require("dotenv").config();

//StatsD client
const statsd = new StatsD({
  host: process.env.STATSD_CLIENT || localhost,
  port: process.env.STATSD_PORT || 8125,       
});

const statsDMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    
    statsd.increment(`api.calls.${req.path}`);
  });

  next(); 
};

module.exports = statsDMiddleware;
