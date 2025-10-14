// routes/seekerRoutes.js
import express from 'express';
import JobSeeker from '../models/jobSeeker.js';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

const router = express.Router();

router.put('/update/:uid', async (req, res) => {
  const { uid } = req.params;
  const updateData = req.body;

  try {
    const updated = await JobSeeker.findOneAndUpdate(
      { uid },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Seeker not found' });
    res.status(200).json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});





//await axios.put(`http://localhost:5000/api/seeker/update/${uid}`, formData);

// ✅ Get Seeker Full Dashboard Info (Profile + Applications)
router.get('/profile/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const seeker = await JobSeeker.findOne({ uid }).lean();
    if (!seeker) return res.status(404).json({ error: 'Seeker not found' });

    // Fetch applications in detail
     const applications = await Application.find({ applicant: seeker._id })
      .populate({
        path: 'job',
      })
      .lean();
      //  console.log('Applications with populated job & recruiter:', applications);

    const appliedJobs = applications.map(app => ({
      job: {
        title: app.job?.title,
        creator: app.job?.creator
      },
      score: app.score,
      stage: app.stage
    }));

    res.status(200).json({ profile: seeker, appliedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
});



export default router;
