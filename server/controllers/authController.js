const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '15d' });
};

exports.signup = async (req, res) => {
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.googleAuth = async (req, res) => {
  const { credential } = req.body;
  // Reject non-string credential (consistent with signup/login input guards)
  if (typeof credential !== 'string') {
    return res.status(400).json({ msg: 'Invalid input' });
  }
  try {
    // Verify the Google ID token; audience must match our own client id
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, email_verified, name, picture } = payload;

    if (!email_verified) {
      return res.status(400).json({ msg: 'Google email not verified' });
    }

    // Prefer match by googleId, then link an existing local account by email
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link Google to the existing email/password account
        user.googleId = googleId;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      } else {
        // First-time Google sign-up: no password, provider = google
        user = await User.create({
          username: name || email,
          email,
          googleId,
          avatar: picture || '',
          provider: 'google',
        });
      }
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Invalid Google token' });
  }
};
