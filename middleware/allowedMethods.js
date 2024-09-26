const allowedMethods = (...httpMethod) => {
  return (req, res, next) => {
    if (
      !httpMethod
        .map((method) => method.toUpperCase())
        .includes(req.method.toUpperCase())        
    ) {
      console.error(`${req.method.toUpperCase()} Method not allowed`);

      return res.status(405).end();
    }
    next();
  };
};


module.exports = allowedMethods;