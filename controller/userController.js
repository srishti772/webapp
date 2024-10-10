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
      return res.status(200).json(user)_
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
      return res.status(204).end();
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
};
