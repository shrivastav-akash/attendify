const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  totalClasses: { type: Number, default: 0, min: 0 },
  attendedClasses: { type: Number, default: 0, min: 0 },
  minAttendance: { type: Number, default: 75, min: 0, max: 100 },
}, { timestamps: true });

// Matches getCourses: find({ user }).sort({ createdAt: -1 })
courseSchema.index({ user: 1, createdAt: -1 });

// Schema-level backstop for the core invariant: attended can never exceed total.
// Covers the .save() paths (addCourse / new docs); the update path enforces the
// same invariant atomically via an $expr guard in the controller. Using
// this.invalidate() surfaces a Mongoose ValidationError → the error handler maps
// it to 400 (not 500).
courseSchema.pre('validate', function () {
  if (this.attendedClasses > this.totalClasses) {
    this.invalidate('attendedClasses', 'Attended classes cannot be more than total classes');
  }
});

module.exports = mongoose.model('Course', courseSchema);
