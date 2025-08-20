// middlewares/errorHandler.js
module.exports = function errorHandler(err, req, res, next) {
  // Default
  let status = err.status || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Internal Server Error";
  let details;

  // ---- Axios / External API (News API, dll)
  if (err.isAxiosError) {
    status = err.response?.status || 502;
    code = "EXTERNAL_API_ERROR";
    message = err.response?.data?.message || err.message || "External API Error";
    details = {
      upstreamStatus: err.response?.status,
      upstreamData: err.response?.data,
      url: err.config?.url,
      params: err.config?.params,
      method: err.config?.method
    };
  }

  // ---- JWT / Auth
  if (err.name === "JsonWebTokenError") {
    status = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    code = "TOKEN_EXPIRED";
    message = "Authentication token has expired";
  }

  // ---- Google Auth
  if (err.name === "GoogleAuthError") {
    status = 401;
    code = "GOOGLE_AUTH_ERROR";
    message = err.message || "Google authentication failed";
  }

  // ---- Sequelize
  if (err.name === "SequelizeValidationError") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Validation error";
    details = err.errors?.map(e => ({ field: e.path, message: e.message }));
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    status = 409;
    code = "UNIQUE_CONSTRAINT";
    message = "Duplicate value violates unique constraint";
    details = err.errors?.map(e => ({ field: e.path, message: e.message }));
  }
  if (err.name === "SequelizeForeignKeyConstraintError") {
    status = 400;
    code = "FK_CONSTRAINT";
    message = "Invalid reference to related resource";
    details = { table: err.table, fields: err.fields };
  }
  if (err.name === "SequelizeDatabaseError") {
    status = 400;
    code = "DB_ERROR";
    message = "Database error";
  }

  // ---- Payload/Request error simplifikasi
  if (err.code === "BAD_REQUEST") {
    status = 400;
  }
  if (err.code === "NOT_FOUND") {
    status = 404;
  }
  if (err.code === "FORBIDDEN") {
    status = 403;
  }
  if (err.code === "UNAUTHORIZED") {
    status = 401;
  }

  // Response payload standar
  const payload = {
    error: {
      code,
      message
    }
  };

  // Tambah details di non-production untuk debugging cepat
  if (process.env.NODE_ENV !== "production") {
    if (details) payload.error.details = details;
    if (err.stack) payload.error.stack = err.stack;
  }

  // Log ringkas ke console
  console.error(`[${new Date().toISOString()}] ${code} ${status}:`, message);

  res.status(status).json(payload);
};
