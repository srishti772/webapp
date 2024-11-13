const logData = require("../config/logger/loggerUtil");
const logger = require("../config/logger/winston");
const authService = require("../service/authService");
const userService = require("../service/userService");

const { validateUserFields, validateQueryParams } = require("./userController");


const verify = (req, res, next) => {
  // Check if there is a request body
  if (req.body && Object.keys(req.body).length > 0) {
    const error = new Error("Request body not allowed in GET requests");
    error.statusCode = 400;
    return next(error);
  }

  // Check if Content-Type is multipart/form-data
  const contentType = req.headers["content-type"];
  if ((contentType && contentType.startsWith("multipart/form-data")) ) {
    const error = new Error("Multipart form data not allowed in GET requests");
    error.statusCode = 400;
    return next(error);
  }
  const allowedParams = ['email', 'token'];
  if(!validateQueryParams(req,res,next,allowedParams)){
    return;
  };
  

  const user = req.query.email;
  const token = req.query.token;


  authService
    .verify(user, token)
    .then((userData) => {
      userService.updateUser(user, userData, `${req.method}_${req.originalUrl}`)
      
    })
    .then((updatedUser) => {
      logData(
        req.method,
        req.originalUrl,
        req.get("user-agent"),
        "info",
        req.body,
        200,
        "User verified successfully",
        updatedUser
      );

      return res.status(200).end();
    })
    .catch((err) => {

      return next(err);
    });

};


const login = (req, res, next) => {
  const userData = req.body;
  const allowedField = new Set(["email", "password"]);

  const isValid = validateUserFields(
    userData,
    allowedField,
    next,
    allowedField
  );
  if (!isValid) return;

  authService
    .login(userData.email, userData.password)
    .then((token) => {
      res.set("Authorization", `Basic ${token}`);
      logData(req.method, req.originalUrl, req.get('user-agent'), 'info', req.body, 200, 'User logged in successfully', token);

      return res.status(200).end();
    })
    .catch((err) => {
      return next(err);
    });
};

const reverify = (req,res,next) => {
  const allowedField = new Set(["email"]);
  const userData = req.body;

  const isValid = validateUserFields(
    userData,
    allowedField,
    next,
    allowedField
  ) && validateQueryParams(req,res,next,null);

  if(!isValid){
    return;
  }

  authService.reverify(userData.email)
  .then((created)=>{
    console.log(created);
    logData(req.method, req.originalUrl, req.get('user-agent'), 'info', req.body, 200, 'Reverification Message Sent');

    return res.status(200).end();
  }).catch((err) => {
    return next(err);
  });


}

module.exports = {
  login,
  verify,
  reverify
};
