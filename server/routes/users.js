const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { isNonEmptyString } = require('../utils/validate');
const { apiLimiter } = require('../middleware/rateLimit');
const { doubleCsrfProtection } = require('../middleware/csrf');

router.use(apiLimiter);

// Update the authenticated user's profile
router.put('/profile', auth, doubleCsrfProtection, async (req, res, next) => {
  const { username, name, university } = req.body;
  const userFields = {};

  // Accept either `username` or the legacy `name` alias for the display name
  const displayName = username ?? name;
  if (typeof displayName !== 'undefined') {
    if (!isNonEmptyString(displayName)) {
      return res.status(400).json({ msg: 'Name must be a non-empty string' });
    }
    userFields.username = displayName;
  }
  if (typeof university !== 'undefined') {
    if (typeof university !== 'string') {
      return res.status(400).json({ msg: 'University must be a string' });
    }
    userFields.university = university;
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
