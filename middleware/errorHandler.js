const errorHandler = (err, req, res, next) => {
    if (err) {
        console.error("Error occured : ",err.type);
      return res.status(400).end();
    }
    next(); 
  };
  
  module.exports = errorHandler;
  