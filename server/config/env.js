// Centralised, validated environment configuration.
// Loaded once at startup so the rest of the app never touches process.env directly.
require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  // Fail fast: the app cannot function without these.
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
      `See server/.env.example.`,
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === "production") {
    // A weak secret in production undermines every JWT — refuse to boot.
    console.error(
      "FATAL: JWT_SECRET must be at least 32 characters in production. " +
        "Generate one with: openssl rand -base64 48",
    );
    process.exit(1);
  }
  // In dev, warn but don't block so local runs aren't interrupted.
  console.warn(
    "WARNING: JWT_SECRET is shorter than 32 characters. Use a long, random secret in production.",
  );
}

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  clientOrigins: (process.env.CLIENT_ORIGINS ||
    "https://attendify-1-w2mu.onrender.com")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};

module.exports = config;
