import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import Logo from '../assets/logo.png';

const Header = () => {
  const [isNavActive, setIsNavActive] = useState(false);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if the current path is the secret admin access path
    setShowAdminLink(location.pathname === '/admin-access');
  }, [location]);

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-title">
            <img src={Logo} alt="Health System Logo" className="logo" />
            <h1 className="heading">NOVAS HEALTH SYSTEM</h1>
          </div>
          <div className="menu-icon" onClick={toggleNav}>
            <i className="fas fa-bars"></i>
          </div>
          <nav className={`main-nav ${isNavActive ? 'active' : ''}`}>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/order-test-kits">Order test kits</Link></li>
              <li><Link to="/symptom-checker">Symptoms Checker</Link></li>
              <li><Link to="/telemedicine">Telemedicine</Link></li>
              {showAdminLink && (
                <li className="admin-link">
                  <Link to="/admin-login">Admin Login</Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;