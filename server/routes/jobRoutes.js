import express from 'express';
import JobSeeker from '../models/jobSeeker.js';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';


const router = express.Router();




router.get('/recruiter/:recruiterId', async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.params.recruiterId });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

//Get all jobs at jobavailable page
router.get('/all', async (req, res) => {
   try {
    const jobs = await Job.find().populate('createdBy'); // this brings full recruiter details
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ✅ 🔧 Add this route to get a single job by ID
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('createdBy');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// POST /api/jobs/create
router.post('/create', async (req, res) => {
  try {
    const { createdBy } = req.body;

    // Validate recruiter existence
    const recruiter = await Recruiter.findById(createdBy);
    if (!recruiter) {
      return res.status(400).json({ error: 'Recruiter not found.' });
    }

    // Create job
    const job = new Job({
      ...req.body,
    });
    await job.save();

    // Add job to recruiter's jobsPosted
    recruiter.jobsPosted.push(job._id);
    await recruiter.save();

    res.status(201).json({ job });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Server error while creating job.' });
  }
});


router.get('/applicants/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId }).populate('applicant');
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;