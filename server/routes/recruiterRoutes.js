// server/routes/recruiterRoutes.js
import express from 'express';
import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

const router = express.Router();

router.get('/my-jobs/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const recruiter = await Recruiter.findOne({ uid });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const jobs = await Job.find({ createdBy: recruiter._id })
      .populate({
        path: 'applicants',
        populate: {
          path: 'applicant',
          model: 'JobSeeker',
          select: 'name email education skills resumeUrl'
        }
      });

    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs with applicants:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET recruiter profile by UID
router.get('/profile/:uid', async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ uid: req.params.uid });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.status(200).json({ profile: recruiter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// UPDATE recruiter profile
router.put('/update/:uid', async (req, res) => {
  try {
    const updated = await Recruiter.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Recruiter not found' });

    res.json({ profile: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
