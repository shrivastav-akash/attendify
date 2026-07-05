const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(apiLimiter);

router.get('/', auth, courseController.getCourses);
router.post('/', auth, courseController.addCourse);
router.put('/:id', auth, courseController.updateCourse);
router.delete('/:id', auth, courseController.deleteCourse);

module.exports = router;
