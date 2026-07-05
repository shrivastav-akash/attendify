const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimit');

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleAuth);
router.get('/me', apiLimiter, auth, authController.getMe);

module.exports = router;
