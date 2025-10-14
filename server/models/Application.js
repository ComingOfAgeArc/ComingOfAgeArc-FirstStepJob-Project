// models/Application.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true },

  coverLetter: String,
  resumeUrl: String,
  applicantMessage: String,

  score: { type: Number, default: 0 },
  stage: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected'],
    default: 'Applied'
  },


  appliedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
