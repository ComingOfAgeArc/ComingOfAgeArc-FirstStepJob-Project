// routes/userRoutes.js
import express from 'express';
import JobSeeker from '../models/jobSeeker.js';
import Recruiter from '../models/Recruiter.js';

const router = express.Router();


// ✅ Register User
router.post('/register', async (req, res) => {
  const { uid, email, role, name, resumeUrl, company, position } = req.body;

  try {
    if (role === 'seeker') {
      const existing = await JobSeeker.findOne({ uid });
      if (existing) return res.status(200).json({ message: 'Job seeker already exists' });

      const newSeeker = new JobSeeker({
        uid,
        email,
        name,
        resumeUrl: resumeUrl || '',
        personalDetails: {},
        education: [],
        experience: [],
        skills: [],
        certifications: [],
        projects: [],
        externalLinks: {},
        applications: []
      });

      await newSeeker.save();
      return res.status(201).json({ message: 'Job seeker registered' });
    }

    if (role === 'recruiter') {
      const existing = await Recruiter.findOne({ uid });
      if (existing) return res.status(200).json({ message: 'Recruiter already exists' });

      const newRecruiter = new Recruiter({
        uid,
        email,
        name,
        company: company || '',
        position: position || '',
        jobsPosted: []
      });

      await newRecruiter.save();
      return res.status(201).json({ message: 'Recruiter registered' });
    }

    res.status(400).json({ error: 'Invalid role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ✅ Login User by UID (Firebase UID)
router.post('/login', async (req, res) => {
  const { uid } = req.body;

  try {
    const seeker = await JobSeeker.findOne({ uid });
    if (seeker) {
      return res.status(200).json({ role: 'seeker', name: seeker.name });
    }

    const recruiter = await Recruiter.findOne({ uid });
    if (recruiter) {
      return res.status(200).json({ role: 'recruiter', name: recruiter.name });
    }

    res.status(404).json({ error: 'User not found. Please register.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
