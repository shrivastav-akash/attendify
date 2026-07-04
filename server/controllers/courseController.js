const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addCourse = async (req, res) => {
  const { name, code, totalClasses, attendedClasses, minAttendance } = req.body;
  if (attendedClasses > totalClasses) {
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateCourse = async (req, res) => {
  const { name, code, totalClasses, attendedClasses, minAttendance } = req.body;
  
  // Build contact object
  const courseFields = {};
  if (name) courseFields.name = name;
  if (code) courseFields.code = code;
  if (typeof totalClasses !== 'undefined') courseFields.totalClasses = totalClasses;
  if (typeof attendedClasses !== 'undefined') courseFields.attendedClasses = attendedClasses;
  if (minAttendance) courseFields.minAttendance = minAttendance;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // Make sure user owns course
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Validation: Check if attended > total
    const finalTotal = typeof totalClasses !== 'undefined' ? totalClasses : course.totalClasses;
    const finalAttended = typeof attendedClasses !== 'undefined' ? attendedClasses : course.attendedClasses;

    if (finalAttended > finalTotal) {
      return res.status(400).json({ msg: 'Attended classes cannot be more than total classes' });
    }

    // Atomic, ownership-scoped update (no TOCTOU between check and write)
    const updated = await Course.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: courseFields },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Course not found' });
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    // Atomic, ownership-scoped delete
    const deleted = await Course.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ msg: 'Course not found' });
    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
