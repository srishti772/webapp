const allowedMethods = (routePermissions) => {
  return (req, res, next) => {
    const allowedMethodsForPath = routePermissions[req.path];
    
    if (allowedMethodsForPath && !allowedMethodsForPath.includes(req.method.toUpperCase())) {
      const methodError = new Error();
      methodError.statusCode = 405;
      methodError.message = `${req.method.toUpperCase()} Method not allowed on ${req.path}`;
      return next(methodError);
    }

    next();
  };
};

const routePermissions = {
  "/healthz": ["GET"],
  "/v1/user": ["POST"],
  "/v1/user/self": ["GET", "PUT"],
  "/v1/user/self/pic": ["GET", "POST", "DELETE"],
  "/healthz": ["GET"],
};

module.exports = allowedMethods(routePermissions);
