// CSRF protection (double-submit cookie, via csrf-csrf v4).
// Cookie auth means the browser attaches the JWT automatically, so mutating
// requests need a CSRF token that an attacker's site cannot read or forge.
const { doubleCsrf } = require("csrf-csrf");
const config = require("../config/env");

const isProd = process.env.NODE_ENV === "production";

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => config.jwtSecret,
  // Stateless: a constant identifier so one app-load token stays valid across
  // login/logout (binding it to the auth cookie would force a re-fetch on every
  // auth change). Double-submit protection still holds — the paired cookie is
  // httpOnly and per-browser, so a cross-site attacker can neither read nor forge it.
  getSessionIdentifier: () => "",
  // `__Host-` prefix hardens the prod cookie (requires Secure + path=/); it can't
  // be used over plain http, so dev uses an unprefixed name.
  cookieName: isProd ? "__Host-attendify.csrf" : "attendify.csrf",
  cookieOptions: {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  },
  getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

module.exports = { doubleCsrfProtection, generateCsrfToken };
