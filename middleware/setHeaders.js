const setHeaders = (req, res, next) => {
  if (req.method === "GET" && req.path === "/healthz") {
    res.set("Cache-Control", "no-cache");
  }

  if (["POST", "GET"].includes(req.method) && req.path === "/v1/user/self") {
    res.set("Accept", "image/jpeg, image/jpg, image/png");
  }

  next();
};

module.exports = setHeaders;
