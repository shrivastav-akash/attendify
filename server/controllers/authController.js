const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');

const googleClient = new OAuth2Client(config.googleClientId);

const generateToken = (user) => {
  return jwt.sign({ user: { id: user.id } }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
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

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
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
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
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

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    // Duplicate key here means a concurrent request created the same account
    // first; treat it as a conflict the client can safely retry.
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'Account conflict, please retry' });
    }
    next(err);
  }
};
