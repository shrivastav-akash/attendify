const rateLimit = require("express-rate-limit");

const common = { standardHeaders: true, legacyHeaders: false };

// Tight limiter for credential endpoints: 10 attempts / 15 min per IP.
const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { msg: "Too many attempts, please try again later" },
});

// Generous limiter for authenticated API traffic: 100 requests / 15 min per IP.
// High enough that normal dashboard use never trips it.
const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: "Too many requests, please try again later" },
});

module.exports = { authLimiter, apiLimiter };
