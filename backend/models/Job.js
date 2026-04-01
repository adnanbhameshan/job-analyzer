const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Rejected', 'Offer'],
    default: 'Applied'
  },
  source: {
    type: String,
    trim: true,
    default: 'manual' // E.g., linkedin, naukri, manual
  },
  jobLink: {
    type: String,
    trim: true
  },
  isImported: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
