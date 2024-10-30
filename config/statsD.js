const StatsD = require('node-statsd');
require("dotenv").config();

//StatsD client
const statsd = new StatsD({
  host: process.env.STATSD_CLIENT || localhost,
  port: process.env.STATSD_PORT || 8125,       
});

statsd.socket.on('error', function (error) {
    const statsDError = new Error("StatsD socket error");
    statsDError.statusCode = 503;
    return next(statsDError);
});

module.exports = statsd;
