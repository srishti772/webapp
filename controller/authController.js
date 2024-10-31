const logData = require("../config/logger/loggerUtil");
const logger = require("../config/logger/winston");
const authService = require("../service/authService");
const { validateUserFields } = require("./userController");

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

module.exports = {
  login,
};
