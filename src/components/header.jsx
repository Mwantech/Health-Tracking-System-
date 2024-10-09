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

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
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
              <li className={isActive('/')}><Link to="/">Home</Link></li>
              <li className={isActive('/order-test-kits')}><Link to="/order-test-kits">Order test kits</Link></li>
              <li className={isActive('/symptom-checker')}><Link to="/symptom-checker">Symptoms Checker</Link></li>
              <li className={isActive('/telemedicine')}><Link to="/telemedicine">Telemedicine</Link></li>
              {showAdminLink && (
                <li className={`admin-link ${isActive('/admin-login')}`}>
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