// server/routes/applicationRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import JobSeeker from '../models/jobSeeker.js';

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/resumes';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF files are allowed'), false);
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

//Update stage
router.put('/update/:appId', async (req, res) => {
  const { appId } = req.params;
  const updateFields = req.body; // e.g., { stage: "Shortlisted" }

  try {
    const application = await Application.findByIdAndUpdate(
      appId,
      { $set: updateFields },
      { new: true } // return updated document
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Application updated successfully', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// POST /api/applications/apply
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { jobId, seekerId, coverLetter, applicantMessage } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) return res.status(400).json({ error: 'Resume file is required' });
    if (!jobId || !seekerId) return res.status(400).json({ error: 'Job ID and Seeker ID are required' });

    const job = await Job.findById(jobId);
    const seeker = await JobSeeker.findOne({ uid: seekerId });

    if (!job || !seeker) return res.status(404).json({ error: 'Job or seeker not found' });

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, applicant: seeker._id });
    if (existing) return res.status(400).json({ error: 'Already applied to this job' });

    // Save application WITHOUT score
    const newApp = new Application({
      job: jobId,
      applicant: seeker._id,
      coverLetter,
      applicantMessage,
      resumeUrl: `/uploads/resumes/${resumeFile.filename}`,
      stage: 'Applied',
      appliedAt: new Date()
    });

    await newApp.save();

    // Update seeker applications
    seeker.applications.push(newApp._id);
    await seeker.save();

    res.status(201).json({ message: 'Application submitted successfully', application: newApp });
  } catch (err) {
    console.error('Server error while applying:', err);
    res.status(500).json({ error: 'Server error while applying' });
  }
});

export default router;
