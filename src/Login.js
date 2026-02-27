import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [form, setForm] = useState({
    studentName: '',
    age: '',
    email: '',
    password: '',
    qualification: ''
  });

  const [showQualifications, setShowQualifications] = useState(false);

  const qualifications = ['SCHOOLING', 'INTERMEDIATE', 'UNDERGRADUATION', 'POSTGRADUATION'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const selectQualification = (q) => {
    setForm(prev => ({ ...prev, qualification: q }));
    setShowQualifications(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { studentName, age, email, password, qualification } = form;
    if (!studentName || !age || !email || !password || !qualification) {
      alert('Please complete all fields.');
      return;
    }
    // callback to parent if provided
    if (onLogin) onLogin(form);
    console.log('Logged in:', form);
    // simple success feedback
    alert(`Welcome, ${studentName}!`);
  };

  return (
    <div className="lm-container">
      <div className="lm-card">
        <h1 className="lm-title">MindMate</h1>
        <p className="lm-sub">Sign in to continue</p>

        <form className="lm-form" onSubmit={handleSubmit}>
          <label>Student Name</label>
          <input name="studentName" value={form.studentName} onChange={handleChange} placeholder="Enter your name" />

          <label>Age</label>
          <input name="age" type="number" min="1" value={form.age} onChange={handleChange} placeholder="Age" />

          <label>Email ID</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />

          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />

          <label>Education Qualification</label>
          <div className="lm-dropdown">
            <button type="button" className="lm-dropdown-toggle" onClick={() => setShowQualifications(s => !s)}>
              {form.qualification || 'Select Qualification'}
              <span className="arrow">▾</span>
            </button>

            {showQualifications && (
              <div className="lm-dropdown-menu">
                {qualifications.map(q => (
                  <div key={q} className="lm-dropdown-item" onClick={() => selectQualification(q)}>{q}</div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="lm-submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
