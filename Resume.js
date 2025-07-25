const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  education: [String],
  experience: [String],
  skills: [String],
  certifications: [String],
  raw_text: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema); 