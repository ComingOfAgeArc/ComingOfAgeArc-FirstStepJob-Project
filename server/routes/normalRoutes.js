import express from 'express';
import JobSeeker from '../models/jobSeeker.js';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';


const router = express.Router();

router.put('/applications/:id', async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ application: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;