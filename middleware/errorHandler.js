// errorHandler.js
const errorHandler = (err, req, res, next) => {
    if (err) {
      return res.status(400).end();
    }
    next(); 
  };
  
  module.exports = errorHandler;
  