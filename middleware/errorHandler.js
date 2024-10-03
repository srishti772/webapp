const errorHandler = (err, req, res, next) => {
    if (err) {
        console.log("Error middleware : ",err.message, err.statusCode);
        const status = err.statusCode || 500;
        const message = err.message || "Some error occured";
      return res.status(status).end();
    }
    next(); 
  };
  
  module.exports = errorHandler;
  