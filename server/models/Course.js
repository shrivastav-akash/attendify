const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  minAttendance: { type: Number, default: 75 },
}, { timestamps: true });

// Matches getCourses: find({ user }).sort({ createdAt: -1 })
courseSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
