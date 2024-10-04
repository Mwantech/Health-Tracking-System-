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

    console.log('Initial auth state:', { token, storedUserType, storedUserId });

    if (token && storedUserType && storedUserId) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUserId(storedUserId);
      console.log('User authenticated from local storage');
    } else {
      console.log('No valid authentication data in local storage');
    }
  }, []);

  const handleLogin = (type, id) => {
    console.log('Logging in:', { type, id });
    setIsAuthenticated(true);
    setUserType(type);
    setUserId(id);
    localStorage.setItem('token', 'some-token-value');
    localStorage.setItem('userType', type);
    localStorage.setItem('userId', id);
    console.log('Login successful, state updated');
  };

  const handleLogout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserType('');
    setUserId('');
    console.log('Logout complete, state reset');
  };

  const renderWithHeaderFooter = (Component) => (
    <>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Component />
      <Footer />
    </>
  );

  const renderWithoutHeader = (Component, props = {}) => {
    console.log('Rendering component without header:', Component.name, props);
    return (
      <>
        <Component {...props} />
        <Footer />
      </>
    );
  };

  console.log('Current auth state:', { isAuthenticated, userType, userId });

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
            element={
              (() => {
                console.log('Rendering admin route:', { isAuthenticated, userType });
                return isAuthenticated && userType === 'admin' 
                  ? renderWithoutHeader(AdminPage, { userId: userId }) 
                  : <Navigate to="/admin-login" />;
              })()
            } 
          />
          <Route 
            path="/doctor" 
            element={
              (() => {
                console.log('Rendering doctor route:', { isAuthenticated, userType, userId });
                return isAuthenticated && userType === 'doctor' 
                  ? renderWithoutHeader(DoctorsPanelPage, { doctorId: userId })
                  : <Navigate to="/admin-login" />;
              })()
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;