import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

const API_BASE_URL = 'http://localhost:3001'; // Adjust this to match your backend URL

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('admin');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Login attempt:', { username, userType });
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password,
        userType,
      });
  
      console.log('Full login response:', response.data);
  
      const { token, userType: responseUserType, username: responseUsername, userId, doctorId } = response.data;
  
      if (!token || !responseUserType || !responseUsername) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
  
      console.log('Parsed response:', { token, responseUserType, responseUsername, userId, doctorId });
  
      localStorage.setItem('token', token);
      localStorage.setItem('userType', responseUserType);
      localStorage.setItem('username', responseUsername);
      
      if (userId) {
        localStorage.setItem('userId', userId);
      } else {
        console.warn('userId not provided by server');
      }
      
      if (responseUserType === 'doctor') {
        if (doctorId) {
          localStorage.setItem('doctorId', doctorId);
          console.log('Stored doctorId in localStorage:', doctorId);
        } else {
          console.warn('Doctor ID not provided by server, using userId as fallback');
          localStorage.setItem('doctorId', userId || '');
        }
      }
  
      console.log('Calling onLogin with:', responseUserType, userId || '', doctorId || userId || '');
      onLogin(responseUserType, userId || '', doctorId || userId || '');
  
      if (responseUserType === 'admin') {
        navigate('/admin');
      } else if (responseUserType === 'doctor') {
        navigate(`/doctor/${doctorId || userId || ''}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred during login');
    }
  };

  // ... rest of the component (return statement) remains the same
   return (
    <div className="adminlogin-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">{userType === 'admin' ? 'Admin' : 'Doctor'} Login</h1>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                Login As
              </label>
              <select
                id="userType"
                className="input"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="alert">
                <span className="alert-description">{error}</span>
              </div>
            )}
            <button type="submit" className="button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;