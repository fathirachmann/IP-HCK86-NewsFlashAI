"use strict";

const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) throw Object.assign(new Error("Unauthorized"), { status: 401, code: "UNAUTHORIZED" });

    const payload = verifyToken(token); // { id, email }
    const user = await User.findByPk(payload.id);
    if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401, code: "UNAUTHORIZED" });

    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    // Biarkan centralized errorHandler yang format response
    err.status = err.status || 401;
    err.code = err.code || "UNAUTHORIZED";
    next(err);
  }
};

