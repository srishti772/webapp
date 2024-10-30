// middleware/apiCounter.js
const statsd = require("../config/statsD");
const logger = require("../config/logger/winston");

const apiCounter = (req, res, next) => {
    const metricKey = `${req.method}_${req.originalUrl}_count`;

    res.on('finish', () => {
        statsd.increment(metricKey);
        logger.info(`[info] - counter incremented ${metricKey}`);
    });

    next();
};

const apiTimer = (req, res, next) => {
    const metricKey = `${req.method}_${req.originalUrl}_apiTime`;
    const start=Date.now();
    res.on('finish', () => {
        const duration=Date.now()-start;
        statsd.timing(metricKey,duration);
        logger.info(`[info] - api timer updated ${metricKey} with duration: ${duration}ms`);
    });

    next();
};

module.exports = {apiCounter,apiTimer};
