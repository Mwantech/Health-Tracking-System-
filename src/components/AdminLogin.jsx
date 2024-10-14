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
  
      if (!token || !responseUserType || !responseUsername || !userId) {
        throw new Error('Invalid response structure from server');
      }
  
      console.log('Parsed response:', { token, responseUserType, responseUsername, userId, doctorId });
  
      localStorage.setItem('token', token);
      localStorage.setItem('userType', responseUserType);
      localStorage.setItem('username', responseUsername);
      localStorage.setItem('userId', userId);
      
      if (responseUserType === 'doctor') {
        if (doctorId) {
          localStorage.setItem('doctorId', doctorId);
          console.log('Stored doctorId in localStorage:', doctorId);
        } else {
          console.warn('Doctor ID not provided by server, using userId as fallback');
          localStorage.setItem('doctorId', userId);
        }
      }
  
      console.log('Calling onLogin with:', responseUserType, userId, doctorId || userId);
      onLogin(responseUserType, userId, doctorId || userId);
  
      if (responseUserType === 'admin') {
        navigate('/admin');
      } else if (responseUserType === 'doctor') {
        navigate(`/doctor/${doctorId || userId}`);
      } else {
        throw new Error('Unexpected user type');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data.message;

        switch (statusCode) {
          case 400:
            setError('Invalid input. Please check your username and password.');
            break;
          case 401:
            setError('Authentication failed. Please check your credentials.');
            break;
          case 403:
            setError('Access denied. You do not have permission to log in as this user type.');
            break;
          default:
            setError(errorMessage || 'An error occurred during login. Please try again later.');
        }
      } else if (error.request) {
        setError('No response received from the server. Please check your internet connection.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="adminlogin-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">{userType === 'admin' ? 'Admin' : 'Doctor'} Login</h1>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="alert">
                <span className="alert-description">{error}</span>
              </div>
            )}
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