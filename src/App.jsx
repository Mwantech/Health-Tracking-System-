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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserType && storedUserId) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUserId(storedUserId);
    }
  }, []);

  const handleLogin = (type, id) => {
    setIsAuthenticated(true);
    setUserType(type);
    setUserId(id);
    localStorage.setItem('token', 'some-token-value');
    localStorage.setItem('userType', type);
    localStorage.setItem('userId', id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserType('');
    setUserId('');
  };

  const renderWithHeaderFooter = (Component) => (
    <>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Component />
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
          <Route path="/" element={renderWithHeaderFooter(HomePage)} />
          <Route path="/order-test-kits" element={renderWithHeaderFooter(OrderTestKits)} />
          <Route path="/Symptom-checker" element={renderWithHeaderFooter(Symptomchecker)} />
          <Route path="/Telemedicine" element={renderWithHeaderFooter(Telemedicine)} />
          <Route path="/admin-login" element={renderWithoutHeader(AdminLogin, { onLogin: handleLogin })} />
          <Route 
            path="/admin" 
            element={isAuthenticated && userType === 'admin' 
              ? renderWithoutHeader(AdminPage, { userId: userId }) 
              : <Navigate to="/admin-login" />} 
          />
          <Route 
            path="/doctor" 
            element={isAuthenticated && userType === 'doctor' 
              ? renderWithoutHeader(DoctorsPanelPage, { doctorId: userId })
              : <Navigate to="/admin-login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;