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
import Login from './components/LoginPage';
import Signup from './components/SignupPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [userId, setUserId] = useState('');
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    const storedUserType = localStorage.getItem('userType');
    const storedUserId = localStorage.getItem('userId');
    const storedDoctorId = localStorage.getItem('doctorId');

    if (token && tokenExpiration && new Date().getTime() < parseInt(tokenExpiration)) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUserId(storedUserId || '');

      if (storedUserType === 'doctor') {
        setDoctorId(storedDoctorId || storedUserId);
      }
    } else {
      handleLogout();
    }
  }, []);

  const handleLogin = (type, id, token, doctorId = null) => {
    const expirationTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour from now
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    localStorage.setItem('userType', type);
    localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setUserType(type);
    setUserId(id);
    if (type === 'doctor' && doctorId) {
      setDoctorId(doctorId);
      localStorage.setItem('doctorId', doctorId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('doctorId');
    setIsAuthenticated(false);
    setUserType('');
    setUserId('');
    setDoctorId('');
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const renderWithHeaderFooter = (Component, props = {}) => (
    <>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Component {...props} />
      <Footer />
    </>
  );

  const renderWithoutHeader = (Component, props = {}) => (
    <>
      <Component {...props} />
      <Footer />
    </>
  );

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={renderWithHeaderFooter(HomePage)} />
          <Route path="/login" element={renderWithHeaderFooter(() => <Login onLogin={handleLogin} />)} />
          <Route path="/signup" element={renderWithHeaderFooter(Signup)} />

          {/* Protected Routes */}
          <Route 
            path="/order-test-kits" 
            element={<PrivateRoute>{renderWithHeaderFooter(OrderTestKits)}</PrivateRoute>} 
          />
          <Route 
            path="/Symptom-checker" 
            element={<PrivateRoute>{renderWithHeaderFooter(Symptomchecker)}</PrivateRoute>} 
          />
          <Route 
            path="/Telemedicine" 
            element={<PrivateRoute>{renderWithHeaderFooter(Telemedicine)}</PrivateRoute>} 
          />

          {/* Admin and Doctor Routes */}
          <Route 
            path="/admin-login" 
            element={renderWithoutHeader(AdminLogin, { onLogin: handleLogin })} 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated && userType === 'admin' 
                ? renderWithoutHeader(AdminPage, { userId }) 
                : <Navigate to="/admin-login" />
            } 
          />
          <Route 
            path="/doctor" 
            element={
              isAuthenticated && userType === 'doctor' 
                ? <Navigate to={`/doctor/${doctorId}`} replace /> 
                : <Navigate to="/admin-login" />
            } 
          />
          <Route 
            path="/doctor/:id" 
            element={
              isAuthenticated && userType === 'doctor' 
                ? renderWithoutHeader(DoctorsPanelPage, { doctorId }) 
                : <Navigate to="/admin-login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;