const jwt = require("jsonwebtoken");

const secret = require("../secret");
const User = require("../models/user");

module.exports = (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization) {
    res.status(401).send("Unauthorized - Authorization header is missing");
  }

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  if (token) {
    try {
      const data = jwt.verify(token, secret.key);

      const user = User.findOne({ email: data.data.email }).lean();

      if (!user) {
        res.status(401).send(`Unauthorized`);
        return;
      }

      next();
    } catch (err) {
      console.error("Token verification failed", err);
      res.status(401).send(`Unauthorized - ${err.name}`);
    }
  } else {
    res.status(401).send("Unauthorized - auth token is missing");
  }
};
