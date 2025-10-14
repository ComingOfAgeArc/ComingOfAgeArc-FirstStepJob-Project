import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import '../styles/Login.css';
import Header from '../components/Header';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 🚀 NEW FUNCTION: Check profile completeness before redirect
  const redirectToDashboard = async (role, uid) => {
    if (role === 'seeker') {
      try {
        const profileRes = await axios.get(`http://localhost:5000/api/seeker/profile/${uid}`);
        const seeker = profileRes.data.profile;
        if (!seeker?.personalDetails?.phone) {
          window.location.href = '/profile-setup';
        } else {
          window.location.href = '/main-seeker';
        }
      } catch (err) {
        console.error('Profile check failed:', err.message);
        window.location.href = '/profile-setup';
      }
    } else if (role === 'recruiter') {
      window.location.href = '/main-provider';
    } else {
      alert('No role found. Please register.');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const response = await axios.post('http://localhost:5000/api/users/login', { uid });
      const role = response.data.role;

      localStorage.setItem('userRole', role);
      localStorage.setItem('uid', uid);
      await redirectToDashboard(role, uid); // 🔄 use new redirect logic
    } catch (err) {
      console.error(err);
      setError('Login failed: user not found or not registered.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const uid = user.uid;
      const email = user.email;
      const name = user.displayName;

      localStorage.setItem('uid', uid);

      // 🔍 Try logging in first
      const loginResponse = await axios.post('http://localhost:5000/api/users/login', { uid });

      if (loginResponse.data.role) {
        const role = loginResponse.data.role;
        localStorage.setItem('userRole', role);
        await redirectToDashboard(role, uid);
      } else {
        throw new Error('Unexpected login response');
      }

    } catch (loginError) {
      if (loginError.response && loginError.response.status === 404) {
        // ❗User not found, register as seeker
        try {
          await axios.post('http://localhost:5000/api/users/register', {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            role: 'seeker',
            name: auth.currentUser.displayName,
            resumeUrl: '',
          });

          localStorage.setItem('userRole', 'seeker');
          localStorage.setItem('uid', auth.currentUser.uid);

          window.location.href = '/profile-setup'; // ⬅️ New user goes to profile setup
        } catch (registerError) {
          console.error('Registration failed:', registerError.message);
          setError('Registration failed.');
        }
      } else {
        console.error('Google login failed:', loginError.message);
        setError('Login failed.');
      }
    }
  };

  return (
    <>
    <Header></Header>
     <div className="page-container">
    <div className="login-container">
      <h2>Login to FirstStep Jobs</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleEmailLogin}>Login with Email</button>
      <hr />
      <button onClick={handleGoogleLogin}>Continue with Google</button>
      {error && <p>{error}</p>}
      <p className="switch-option">Don't have an account? <a href="/register">Register</a></p>
    </div></div></>

  );
};

export default LoginPage;
