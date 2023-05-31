const jwt = require("jsonwebtoken");

const reqAuth = (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (authorization) {
      const token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.id;

      req.userId = userId;

      next();
    } else {
      res.status(401).json({ error: "Authorization required" });
    }
  } catch (error) {
    res.status(401).json({ error });
  }
};

module.exports = reqAuth;
