const allowedMethods = (...httpMethod) => {
  return (req, res, next) => {
    if (
      !httpMethod
        .map((method) => method.toUpperCase())
        .includes(req.method.toUpperCase())
    ) {
      const methoError = new Error();
      methoError.statusCode = 405;
      methoError.message = `${req.method.toUpperCase()} Method not allowed`;
      return next(methoError);
    }
    next();
  };
};

module.exports = allowedMethods;
