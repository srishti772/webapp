const statsd = require("../config/statsD");

const apiCounter = (req, res, next) => {
    const metricKey = `${req.method}_${req.originalUrl}_count`;

    res.on('finish', () => {
        statsd.increment(metricKey);
    });

    next();
};

const apiTimer = (req, res, next) => {
    const metricKey = `${req.method}_${req.originalUrl}`;
    const start=Date.now();
    res.on('finish', () => {
        const duration=Date.now()-start;
        statsd.timing(metricKey,duration, { label: "TotalTime" });
    });

    next();
};

module.exports = {apiCounter,apiTimer};
