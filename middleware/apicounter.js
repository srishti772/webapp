const statsd = require("../config/statsD");
const { performance } = require("perf_hooks");
const logger = require("../config/logger/winston");

const apiCounter = (req, res, next) => {
    const metricKey = `${req.method}_${req.originalUrl}.count`;

    res.on('finish', () => {
        statsd.increment(metricKey);
        logger.debug(`${metricKey}: Counter incremented by 1`);

    });

    next();
};

const apiTimer = (req, res, next) => {
    const metricKey = `${req.method}_${req.originalUrl}.apiTime`;
    const start=performance.now();
    res.on('finish', () => {
        const duration=performance.now()-start;
        statsd.timing(metricKey,duration);
        logger.debug(`${metricKey}: ${duration}`);

    });

    next();
};

module.exports = {apiCounter,apiTimer};
