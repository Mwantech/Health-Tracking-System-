import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

// Set the base URL for axios
axios.defaults.baseURL = 'http://localhost:3001'; // Adjust this to match your backend URL

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        userType
      });

      setIsLoading(false);

      if (response.data.token) {
        // Store the token and user info in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', response.data.userType);
        localStorage.setItem('username', response.data.username);

        // Call the onLogin function passed from the parent component
        onLogin(response.data.userType, response.data.username);

        // Navigate based on user type
        if (response.data.userType === 'admin') {
          navigate('/admin');
        } else if (response.data.userType === 'doctor') {
          navigate('/doctor');
        } else {
          setError('Invalid user type');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setError(error.response.data.error || 'An error occurred during login');
      } else {
        setError('Network error. Please try again.');
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
            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;






import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/homepage';
import OrderTestKits from './pages/ordertestkits';
import Symptomchecker from './pages/SymptomChecker';
import Telemedicine from './pages/Telemedicine';
import AdminPage from './pages/Admin page/Admin';
import AdminLogin from './components/AdminLogin';
import DoctorsPanelPage from './pages/Admin page/DoctorsPanelPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [userId, setUserId] = useState('');

  const handleLogin = (type, id) => {
    setIsAuthenticated(true);
    setUserType(type);
    setUserId(id);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', type);
    localStorage.setItem('userId', id);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType('');
    setUserId('');
    localStorage.clear();
  };

  // Load authentication state from localStorage when the app first loads
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
    const storedUserType = localStorage.getItem('userType');
    const storedUserId = localStorage.getItem('userId');

    if (storedAuth && storedUserType) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUserId(storedUserId);
    }
  }, []);

  const renderWithHeaderFooter = (Component) => (
    <>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Component />
      <Footer />
    </>
  );

  const renderWithoutHeader = (Component) => (
    <>
      <Component />
      <Footer />
    </>
  );

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={renderWithHeaderFooter(HomePage)} />
          <Route path="/order-test-kits" element={renderWithHeaderFooter(OrderTestKits)} />
          <Route path="/Symptom-checker" element={renderWithHeaderFooter(Symptomchecker)} />
          <Route path="/Telemedicine" element={renderWithHeaderFooter(Telemedicine)} />
          <Route 
            path="/admin-login" 
            element={<AdminLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated && userType === 'admin' 
              ? renderWithoutHeader(AdminPage) 
              : <Navigate to="/admin-login" />
            }
          />
          <Route 
            path="/doctor" 
            element={
              isAuthenticated && userType === 'doctor' 
              ? renderWithoutHeader(() => <DoctorsPanelPage doctorId={userId} />)
              : <Navigate to="/admin-login" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;







import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

axios.defaults.baseURL = 'http://localhost:3001'; // Adjust to match your backend

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        userType,
      });

      setIsLoading(false);

      if (response.data.token) {
        // Store token and user info in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', response.data.userType);
        localStorage.setItem('username', response.data.username);

        // Call onLogin from parent to update the state
        onLogin(response.data.userType, response.data.username);

        // Navigate based on user type
        if (response.data.userType === 'admin') {
          navigate('/admin');
        } else if (response.data.userType === 'doctor') {
          navigate('/doctor');
        } else {
          setError('Invalid user type');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setError(error.response.data.error || 'An error occurred during login');
      } else {
        setError('Network error. Please try again.');
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
            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
