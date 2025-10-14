import '../styles/MainProvider.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const MainProvider = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [expandedJobs, setExpandedJobs] = useState({});
  const [expandedApplicants, setExpandedApplicants] = useState({});

  const uid = localStorage.getItem('uid');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/recruiter/profile/${uid}`);
        setProfile(res.data.profile);
        setFormData(res.data.profile);
        await fetchJobs(res.data.profile._id);
      } catch (err) {
        console.error('Error fetching recruiter profile:', err);
      }
    };
    if (uid) fetchData();
  }, [uid]);

  const fetchJobs = async (recruiterId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/recruiter/${recruiterId}`);
      const jobsData = res.data.jobs;
      setJobs(jobsData);

      const applicantsByJobData = {};
      await Promise.all(
        jobsData.map(async (job) => {
          const applicantsRes = await axios.get(`http://localhost:5000/api/jobs/applicants/${job._id}`);
          applicantsByJobData[job._id] = applicantsRes.data.applications || [];
        })
      );
      setApplicantsByJob(applicantsByJobData);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const toggleApplicantDetails = (appId) => {
    setExpandedApplicants((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const toggleJobApplicants = (jobId) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/recruiter/update/${uid}`, formData);
      setProfile(res.data.profile);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating recruiter profile:', err);
    }
  };

  const handleStage = async (appId, field, value) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/update/${appId}`, { [field]: value });
      fetchJobs(profile._id);
    } catch (err) {
      console.error('Failed to update stage/score:', err);
    }
  };

  return (
    <>
      <Header />

      <div className="main-container">
        {/* PROFILE - FULL WIDTH */}
        <div className="profile-section">
          <h2>Welcome, {profile?.name || 'Recruiter'}</h2>
          {!editMode ? (
            <div className="profile-view">
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Name:</strong> {profile?.name}</p>
              <p><strong>Company:</strong> {profile?.company}</p>
              <p><strong>Position:</strong> {profile?.position}</p>
              <p><strong>Website:</strong> {profile?.companyDetails?.website}</p>
              <p><strong>Size:</strong> {profile?.companyDetails?.size}</p>
              <p><strong>Industry:</strong> {profile?.companyDetails?.industry}</p>
              <p><strong>Location:</strong> {profile?.companyDetails?.location}</p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
          ) : (
            <div className="profile-form">
              <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name" />
              <input name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" />
              <input name="company" value={formData.company || ''} onChange={handleChange} placeholder="Company" />
              <input name="position" value={formData.position || ''} onChange={handleChange} placeholder="Position" />
              <input name="companyDetails.website" value={formData.companyDetails?.website || ''} onChange={handleChange} placeholder="Website" />
              <input name="companyDetails.size" value={formData.companyDetails?.size || ''} onChange={handleChange} placeholder="Company Size" />
              <input name="companyDetails.industry" value={formData.companyDetails?.industry || ''} onChange={handleChange} placeholder="Industry" />
              <input name="companyDetails.location" value={formData.companyDetails?.location || ''} onChange={handleChange} placeholder="Location" />
              <div className="profile-buttons">
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* JOB LISTINGS - GRID */}
        <h3>Job Openings</h3>
        <button className="add-job-btn" onClick={() => navigate('/add-job', { state: { recruiterId: profile?._id } })}>
          Add New Job
        </button>

        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h4>{job.title}</h4>
              <strong>{job.description}</strong>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Type:</strong> {job.employmentType}</p>

              <button className="toggle-applicants-btn" onClick={() => toggleJobApplicants(job._id)}>
                {expandedJobs[job._id] ? 'Hide Applicants' : 'Show Applicants'}
              </button>

              {expandedJobs[job._id] && (
                <div className="applicants-list">
                  {(applicantsByJob[job._id] || []).map((app) => (
                    <div key={app._id} className="applicant-card">
                      <div className="applicant-header" onClick={() => toggleApplicantDetails(app._id)}>
                        <strong>{app.applicant?.name}</strong> ▼
                      </div>
                      {expandedApplicants[app._id] && (
                        <div className="applicant-details">
                          <p><strong>Email:</strong> {app.applicant?.email}</p>
                          <p><strong>Resume:</strong> <a href={`http://localhost:5000${app.resumeUrl}`} target="_blank" rel="noreferrer">View</a></p>
                          <p><strong>Cover Letter:</strong> {app.coverLetter}</p>
                          <p><strong>Score:</strong> {app.score || 0}</p>
                          <p>
                            <strong>Stage:</strong>
                            <select value={app.stage || 'Applied'} onChange={(e) => handleStage(app._id, 'stage', e.target.value)}>
                              <option>Applied</option>
                              <option>Shortlisted</option>
                              <option>Interview Scheduled</option>
                              <option>Offered</option>
                              <option>Rejected</option>
                            </select>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MainProvider;
