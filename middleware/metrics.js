const statsd = require("../config/statsD.js");


const apiMetrics = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    
    const statsdTag = `${req.method}${req.baseUrl}${req.route.path}`;

    statsd.increment(`${statsdTag}.reqCount`);
});

  next(); 
};

module.exports = apiMetrics;
