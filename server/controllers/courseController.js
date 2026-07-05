const Course = require('../models/Course');
const { isNonEmptyString, isIntInRange, isNumberInRange } = require('../utils/validate');

const MAX_CLASSES = 100000; // generous upper bound to reject absurd/overflow values

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.addCourse = async (req, res, next) => {
  const { name, code, totalClasses, attendedClasses, minAttendance } = req.body;

  // Field validation
  if (!isNonEmptyString(name) || !isNonEmptyString(code)) {
    return res.status(400).json({ msg: 'Name and code are required' });
  }
  if (!isIntInRange(totalClasses, 0, MAX_CLASSES) || !isIntInRange(attendedClasses, 0, MAX_CLASSES)) {
    return res.status(400).json({ msg: 'Total and attended classes must be whole numbers >= 0' });
  }
  if (typeof minAttendance !== 'undefined' && !isNumberInRange(minAttendance, 0, 100)) {
    return res.status(400).json({ msg: 'Minimum attendance must be between 0 and 100' });
  }
  if (Number(attendedClasses) > Number(totalClasses)) {
    return res.status(400).json({ msg: 'Attended classes cannot be more than total classes' });
  }

  try {
    const newCourse = new Course({
      user: req.user.id,
      name,
      code,
      totalClasses,
      attendedClasses,
      minAttendance
    });
    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  const { name, code, totalClasses, attendedClasses, minAttendance } = req.body;

  // Build & validate the set of fields being updated (partial update)
  const courseFields = {};
  if (typeof name !== 'undefined') {
    if (!isNonEmptyString(name)) return res.status(400).json({ msg: 'Name must be a non-empty string' });
    courseFields.name = name;
  }
  if (typeof code !== 'undefined') {
    if (!isNonEmptyString(code)) return res.status(400).json({ msg: 'Code must be a non-empty string' });
    courseFields.code = code;
  }
  if (typeof totalClasses !== 'undefined') {
    if (!isIntInRange(totalClasses, 0, MAX_CLASSES)) return res.status(400).json({ msg: 'Total classes must be a whole number >= 0' });
    courseFields.totalClasses = Number(totalClasses);
  }
  if (typeof attendedClasses !== 'undefined') {
    if (!isIntInRange(attendedClasses, 0, MAX_CLASSES)) return res.status(400).json({ msg: 'Attended classes must be a whole number >= 0' });
    courseFields.attendedClasses = Number(attendedClasses);
  }
  if (typeof minAttendance !== 'undefined') {
    if (!isNumberInRange(minAttendance, 0, 100)) return res.status(400).json({ msg: 'Minimum attendance must be between 0 and 100' });
    courseFields.minAttendance = Number(minAttendance);
  }

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // Make sure user owns course
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Enforce the attended <= total invariant atomically. Use the incoming value
    // when a field is being set, otherwise the value already stored in the doc.
    // The $expr guard means the write only lands if the RESULTING state is valid,
    // closing the interleaving hole between two concurrent partial updates.
    const attExpr = 'attendedClasses' in courseFields ? courseFields.attendedClasses : '$attendedClasses';
    const totExpr = 'totalClasses' in courseFields ? courseFields.totalClasses : '$totalClasses';

    const updated = await Course.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, $expr: { $lte: [attExpr, totExpr] } },
      { $set: courseFields },
      { new: true, runValidators: true }
    );

    // The doc exists and is owned (checked above), so null here means the guard
    // rejected the write: the resulting attended would exceed total.
    if (!updated) {
      return res.status(400).json({ msg: 'Attended classes cannot be more than total classes' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    // Atomic, ownership-scoped delete
    const deleted = await Course.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ msg: 'Course not found' });
    res.json({ msg: 'Course removed' });
  } catch (err) {
    next(err);
  }
};
