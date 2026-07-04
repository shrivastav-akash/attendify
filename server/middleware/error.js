const logger = require("../config/logger");

// 404 for unmatched routes.
const notFound = (req, res) => {
  res.status(404).json({ msg: "Not found" });
};

// Central error handler. Controllers call next(err) for unexpected failures;
// Express 5 also forwards rejected async handlers here automatically.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  // Only surface a message we deliberately marked safe; otherwise stay generic.
  const msg = err.publicMessage || (status < 500 ? err.message : "Server error");

  if (status >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, "Unhandled error");
  }

  res.status(status).json({ msg });
};

module.exports = { notFound, errorHandler };
