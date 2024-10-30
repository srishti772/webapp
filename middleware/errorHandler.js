const logData = require("../config/logger/loggerUtil");
const logger = require("../config/logger/winston");
const multer = require('multer'); 
const errorHandler = (err, req, res, next) => {
  if (err) {
    console.log("Error middleware : ", err.message, err.statusCode);
    let status = err.statusCode || 500;
    let message = err.message || "Some error occured";

    if (err instanceof multer.MulterError) {
      switch (err.code) {
        case 'LIMIT_UNEXPECTED_FILE':
          status = 400;
          message = `${err.message}`; 
          break;

        case 'LIMIT_FILE_SIZE':
          status = 400;
          message = `${err.message}`; 
          break;
          
        default:
          status = 400; 
          message = 'An error occurred with the file upload.';
          break;
      }
    }

    logData(req.method, req.originalUrl,  req.get('user-agent'), 'error', req.body, status, message, null);

    return res.status(status).end();
  }
  next();
};

module.exports = errorHandler;
