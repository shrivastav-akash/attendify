const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');

const googleClient = new OAuth2Client(config.googleClientId);

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_NAME = 'token';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Cross-site in prod (frontend and API are different origins) → SameSite=None+Secure.
// Dev goes through the Vite proxy over http → Lax without Secure.
const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
});

const generateToken = (user) => {
  return jwt.sign({ user: { id: user.id } }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Issue the auth JWT as an httpOnly cookie; the token never touches JS/localStorage.
// maxAge is derived from the JWT's own exp so the cookie and token expire together.
const setAuthCookie = (res, token) => {
  const decoded = jwt.decode(token);
  const maxAge = decoded?.exp ? decoded.exp * 1000 - Date.now() : undefined;
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge });
};

exports.signup = async (req, res, next) => {
  const { username, email, password, university } = req.body;
  // Reject non-string credentials to prevent NoSQL operator injection
  if (typeof email !== 'string' || typeof password !== 'string' || typeof username !== 'string') {
    return res.status(400).json({ msg: 'Invalid input' });
  }
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, email, password, university });
    await user.save();

    setAuthCookie(res, generateToken(user));
    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    // Unique index race: two concurrent signups with the same email
    if (err.code === 11000) return res.status(400).json({ msg: 'User already exists' });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // Reject non-string credentials to prevent NoSQL operator injection
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ msg: 'Invalid Credentials' });
  }
  try {
    const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');
    // No account, or a Google-only account with no password → same generic error.
    if (!user || !user.password) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Per-account lockout (complements the IP-based authLimiter).
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      return res.status(423).json({ msg: 'Account temporarily locked, try again later' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Atomically record the failure; lock the account once the threshold is hit.
      if ((user.failedLoginAttempts || 0) + 1 >= MAX_LOGIN_ATTEMPTS) {
        await User.updateOne(
          { _id: user._id },
          { $set: { failedLoginAttempts: 0, lockUntil: new Date(Date.now() + LOCK_WINDOW_MS) } },
        );
      } else {
        await User.updateOne({ _id: user._id }, { $inc: { failedLoginAttempts: 1 } });
      }
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Success: clear any failure/lock state.
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await User.updateOne(
        { _id: user._id },
        { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: 1 } },
      );
    }

    setAuthCookie(res, generateToken(user));
    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout — clears the auth cookie (must mirror the set options).
exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ msg: 'Logged out' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  const { credential } = req.body;
  // Reject non-string credential (consistent with signup/login input guards)
  if (typeof credential !== 'string') {
    return res.status(400).json({ msg: 'Invalid input' });
  }
  // Verify the Google ID token; audience must match our own client id.
  // A verification failure is a client problem (401); anything after this
  // point is a server/DB problem (500) and must not be masked as 401.
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid Google token' });
  }

  const { sub: googleId, email, email_verified, name, picture } = payload;
  if (!email_verified) {
    return res.status(400).json({ msg: 'Google email not verified' });
  }

  try {
    // Atomic upsert keyed on email: links an existing local account or creates
    // a Google account in one round trip, so concurrent first-time logins can't
    // race into duplicate inserts. googleId/avatar are always refreshed; the
    // create-only fields are applied via $setOnInsert.
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: { googleId, ...(picture ? { avatar: picture } : {}) },
        $setOnInsert: { username: name || email, email, provider: 'google' },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    setAuthCookie(res, generateToken(user));
    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    // Duplicate key here means a concurrent request created the same account
    // first; treat it as a conflict the client can safely retry.
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'Account conflict, please retry' });
    }
    next(err);
  }
};
