const logData = require("../config/logger/loggerUtil");
const logger = require("../config/logger/winston");
const upload = require("../config/multer");
const userService = require("../service/userService");

const validateUserFields = (userData, requiredfields, next, allowedField) => {
  if (requiredfields) {
    for (const field of requiredfields) {
      if (!userData[field]) {
        const error = new Error(`Missing required field: ${field}`);
        error.statusCode = 400;
        return next(error);
      }
    }
  }

  if (allowedField) {
    for (const field of Object.keys(userData)) {
      if (!allowedField.has(field)) {
        const error = new Error(` ${field} Not allowed`);
        error.statusCode = 400;
        return next(error);
      }
    }
  }

  // Validate first_name and last_name (non-null strings)
  if (
    userData.first_name &&
    (typeof userData.first_name !== "string" ||
      userData.first_name.trim() === "")
  ) {
    const error = new Error("first_name must be a non-empty string");
    error.statusCode = 400;
    return next(error);
  }

  if (
    userData.last_name &&
    (typeof userData.last_name !== "string" || userData.last_name.trim() === "")
  ) {
    const error = new Error("last_name must be a non-empty string");
    error.statusCode = 400;
    return next(error);
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (userData.email && !emailRegex.test(userData.email)) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    return next(error);
  }

  // Validate password
  if (userData.password && typeof userData.password !== "string") {
    const error = new Error("password must be a string");
    error.statusCode = 400;
    return next(error);
  }

  return true;
};

const createUser = (req, res, next) => {
  const userData = req.body;

  const requiredfields = new Set([
    "first_name",
    "last_name",
    "email",
    "password",
  ]);

  const isValid = validateUserFields(
    userData,
    requiredfields,
    next,
    requiredfields
  );
  if (!isValid) return;

  userService
    .createUser(userData)
    .then((response) => {
   
      logData(req.method, req.originalUrl,  req.get('user-agent'), 'info', req.body, 200, 'User created successfully', response);

      return res.status(201).json({ message: "User Created", data: response });
    })
    .catch((err) => {
      return next(err);
    });
};

const getAUser = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const error = new Error("Req Body not allowed");
    error.statusCode = 400;
    return next(error);
  }
  const email = req.authenticatedUser;

  userService
    .getAUser(email)
    .then((user) => {

      logData(req.method, req.originalUrl,  req.get('user-agent'), 'info', req.body, 200, 'User fetched successfully', user);

      return res.status(200).json(user);
    })
    .catch((err) => {
      return next(err);
    });
};

const updateUser = (req, res, next) => {
  const userData = req.body;
  const userId = req.authenticatedUser;
  const allowedField = new Set(["first_name", "last_name", "password"]);
  const isValid = validateUserFields(userData, null, next, allowedField);
  if (!isValid) return;
  userService
    .updateUser(userId, userData)
    .then((updatedUser) => {
  
      logData(req.method, req.originalUrl, req.get('user-agent'), 'info', req.body, 200,'User updated successfully', updatedUser);

      return res.status(204).end();
    })
    .catch((err) => {
      return next(err);
    });
};


const uploadProfilePic = (req, res, next) => {

  const file = req.file
  const userEmail = req.authenticatedUser;
  const allowedImageTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    if (!file) 
    {
      const error = new Error("File not received");
      error.statusCode = 400;
      return next(error);
    }
    if (!allowedImageTypes.includes(file.mimetype)) {

      const error = new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed!");
      error.statusCode = 400;
      return next(error);
    }

    userService
    .uploadProfilePic(userEmail, file)
    .then((data) => {
      console.log("***s3data",data);
      logData(req.method, req.originalUrl, req.get('user-agent'), 'info', req.body, 201,'Profile pic uploaded successfully', data);
      
      res.setHeader("X-Accept", "image/jpeg, image/jpg, image/png");
      return res.status(201).json(data);
    })
    .catch((err) => {
      return next(err);
    });

}


const getProfilePic = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const error = new Error("Req Body not allowed");
    error.statusCode = 400;
    return next(error);
  }
  const userEmail = req.authenticatedUser; 

  userService
    .getProfilePic(userEmail)
    .then((data) => {
      logData(req.method, req.originalUrl, req.get('user-agent'), 'info', req.body, 200, 'Profile picture retrieved successfully', data);
      
      return res.status(200).json(data);
    })
    .catch((err) => {
      return next(err);
    });
};

module.exports = {
  createUser,
  getAUser,
  updateUser,
  validateUserFields,
  uploadProfilePic,
  getProfilePic
};
