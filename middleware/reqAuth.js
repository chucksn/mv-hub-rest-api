const jwt = require("jsonwebtoken");

const reqAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) res.status(401).json({ error: "Authorization required" });

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = reqAuth;
