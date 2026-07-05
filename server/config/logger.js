// Shared structured logger. Pretty output in dev, JSON in production.
const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  // Never log secrets/tokens if they ever appear on req/res.
  redact: ["req.headers.authorization", 'req.headers["x-auth-token"]'],
});

module.exports = logger;
