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

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password,
        userType
      });

      const { token, userType: responseUserType, userId } = response.data;

      console.log('Login response:', response.data); // Add this line for debugging

      if (!userId) {
        throw new Error('User ID is missing from the login response');
      }

      // Call the onLogin function with the user information
      onLogin(responseUserType, userId);

      // Navigate to the appropriate panel
      if (responseUserType === 'admin') {
        navigate('/admin');
      } else if (responseUserType === 'doctor') {
        navigate('/doctor');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'An error occurred during login');
      } else {
        setError('An error occurred during login');
      }
      console.error('Login error:', error);
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