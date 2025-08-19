const { User } = require("../models");
const jwt = require("jsonwebtoken");

module.exports = async function auth(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw { status: 401, message: "Unauthorized" };

    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(payload.id);
    if (!user) throw { status: 401, message: "Unauthorized" };

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
