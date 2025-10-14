// src/routes/Routes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfileSetup from '../pages/ProfileSetup';
import MainSeeker from '../pages/MainSeeker';
import MainProvider from '../pages/MainProvider';
import AddJobForm from '../pages/AddJobForm';
import AvailableJobs from '../pages/AvailableJobs';
import ApplyJob from '../pages/ApplyJob';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Show LoginPage on root */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
         <Route path="/main-seeker" element={<MainSeeker />} />
        <Route path="/main-provider" element={<MainProvider />} /> 
         <Route path="/add-job" element={<AddJobFormWrapper />} />
         <Route path="/available-jobs" element={<AvailableJobs />} />
         <Route path="/apply/:jobId" element={<ApplyJob />} />
      </Routes>
    </Router>
  );
};

const AddJobFormWrapper = () => {
  const recruiterId = localStorage.getItem('uid');
  const navigate = useNavigate();

  const handleJobAdded = () => {
    navigate('/main-provider');
  };

  return (
    <AddJobForm recruiterId={recruiterId} onJobAdded={handleJobAdded} />
  );
};

export default AppRoutes;
