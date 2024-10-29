const logger = require("../config/winston");

const errorHandler = (err, req, res, next) => {
  if (err) {
    console.log("Error middleware : ", err.message, err.statusCode);
    const status = err.statusCode || 500;
    const message = err.message || "Some error occured";
  

    logger.error({
      requestMethod: req.method,
      originalUrl: req.originalUrl,
      isAuthenticated: !!req.authenticatedUser || false,
      message: message,
      status: status,
    });
    return res.status(status).end();
  }
  next();
};

module.exports = errorHandler;
