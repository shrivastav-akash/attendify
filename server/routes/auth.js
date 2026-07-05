const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimit');
const { doubleCsrfProtection, generateCsrfToken } = require('../middleware/csrf');

// Hands the SPA a CSRF token (and sets its paired cookie). Called on app load
// and after login; the token is echoed back in the x-csrf-token header.
router.get('/csrf', (req, res) => res.json({ csrfToken: generateCsrfToken(req, res) }));

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleAuth);
router.get('/me', apiLimiter, auth, authController.getMe);
router.post('/logout', apiLimiter, doubleCsrfProtection, authController.logout);

module.exports = router;
