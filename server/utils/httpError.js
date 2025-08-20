function httpError(status, message, code) {
  const err = new Error(message || "Error");
  err.status = status;
  if (code) err.code = code;
  return err;
}

httpError.badRequest = (msg, code = "BAD_REQUEST") => httpError(400, msg, code);
httpError.unauthorized = (msg = "Unauthorized") => httpError(401, msg, "UNAUTHORIZED");
httpError.forbidden = (msg = "Forbidden") => httpError(403, msg, "FORBIDDEN");
httpError.notFound = (msg = "Not Found") => httpError(404, msg, "NOT_FOUND");

module.exports = { httpError };