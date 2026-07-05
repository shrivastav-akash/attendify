const logger = require("../config/logger");

// 404 for unmatched routes.
const notFound = (req, res) => {
  res.status(404).json({ msg: "Not found" });
};

// Central error handler. Controllers call next(err) for unexpected failures;
// Express 5 also forwards rejected async handlers here automatically.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Mongoose bad input surfaces as ValidationError / CastError — treat as 400,
  // not a server error (these can reach here as a backstop past controller checks).
  if (err.name === "ValidationError") {
    return res.status(400).json({ msg: "Invalid input" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ msg: "Invalid identifier" });
  }

  const status = err.status || 500;
  // Only surface a message we deliberately marked safe; otherwise stay generic.
  const msg = err.publicMessage || (status < 500 ? err.message : "Server error");

  if (status >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, "Unhandled error");
  }

  res.status(status).json({ msg });
};

module.exports = { notFound, errorHandler };
