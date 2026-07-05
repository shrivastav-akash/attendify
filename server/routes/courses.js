const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const { doubleCsrfProtection } = require('../middleware/csrf');

router.use(apiLimiter);

router.get('/', auth, courseController.getCourses);
router.post('/', auth, doubleCsrfProtection, courseController.addCourse);
router.put('/:id', auth, doubleCsrfProtection, courseController.updateCourse);
router.delete('/:id', auth, doubleCsrfProtection, courseController.deleteCourse);

module.exports = router;
