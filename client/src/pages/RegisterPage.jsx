import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import '../styles/Login.css';
import Header from '../components/Header';


const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seeker');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Save to MongoDB
       await axios.post('http://localhost:5000/api/users/register', {
        uid: user.uid,
        email: user.email,
        role,
        name, // collect from a new input
        resumeUrl: '', // seeker only
        company: '',   // recruiter only
        position: '',  // recruiter only
      });


      localStorage.setItem('userRole', role);
      alert('Registration successful!');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <><Header></Header>
    <div className="page-container">
    <div className="login-container">
      <h2>Register</h2>
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input placeholder="Name" type="text" value={name} onChange={e => setName(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="seeker">Job Seeker</option>
        <option value="recruiter">Recruiter</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      {error && <p className="error">{error}</p>}
    </div></div></>
  );
};

export default RegisterPage;
































// import React, { useState } from 'react';
// import { auth } from '../firebase/firebase';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import axios from 'axios';
// import '../styles/Login.css';

// const RegisterPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('seeker');
//   const [error, setError] = useState('');

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // ✅ Register user with Firebase
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // ✅ Save user role to localStorage
//       localStorage.setItem('userRole', role);

//       // ✅ Save user info to MongoDB
//       await axios.post('http://localhost:5000/api/users', {
//         uid: user.uid,
//         email: user.email,
//         role,
//       });

//       alert('Registration successful!');
//       window.location.href = '/login';
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>Register</h2>
//       <input
//         placeholder="Email"
//         type="email"
//         value={email}
//         onChange={e => setEmail(e.target.value)}
//       />
//       <input
//         placeholder="Password"
//         type="password"
//         value={password}
//         onChange={e => setPassword(e.target.value)}
//       />
//       <select value={role} onChange={e => setRole(e.target.value)}>
//         <option value="seeker">Job Seeker</option>
//         <option value="recruiter">Recruiter</option>
//       </select>
//       <button onClick={handleRegister}>Register</button>
//       {error && <p className="error">{error}</p>}
//     </div>
//   );
// };

// export default RegisterPage;
