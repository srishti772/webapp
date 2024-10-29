const logData = require("../config/logger/loggerUtil");
const logger = require("../config/logger/winston");

const errorHandler = (err, req, res, next) => {
  if (err) {
    console.log("Error middleware : ", err.message, err.statusCode);
    const status = err.statusCode || 500;
    const message = err.message || "Some error occured";

    logData(req.method, req.originalUrl,  req.get('user-agent'), 'error', req.body, status, message, null);

    return res.status(status).end();
  }
  next();
};

module.exports = errorHandler;
