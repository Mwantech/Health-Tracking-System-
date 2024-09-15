import React, { useState } from 'react';
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

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/admin-login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div>
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/order-test-kits" element={<OrderTestKits />} />
          <Route path="/Symptom-checker" element={<Symptomchecker />} />
          <Route path="/Telemedicine" element={<Telemedicine />} />
          <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
};

export default App;