const authService = require("../service/authService");

const basicAuth = async (req, res, next) => {
    const authorization_header = req.headers.authorization;

    if (!authorization_header) {
        const err = new Error('Please login');
        err.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic');
        return next(err)
    }
    
    try{
    await authService.authorize(authorization_header);
   next(); 
}
    catch(err){
        const dbError = new Error();
        dbError.message = err.message ||  "Invalid Token";
        dbError.statusCode =err.statusCode ||  400;
        return next(dbError);    }
   
  };
  
  module.exports = basicAuth;
  