const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Not required for Google accounts (they authenticate via googleId, no password).
  // select:false so the hash never leaks through a normal query — reads that need
  // it (login) must opt in with .select('+password').
  password: { type: String, required: function () { return !this.googleId; }, select: false },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: '' },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  university: { type: String, default: '' },
  // Per-account login throttling (complements the IP-based authLimiter).
  failedLoginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
