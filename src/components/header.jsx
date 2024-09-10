import React, { useState } from 'react';
import './header.css'; // Ensure to create this CSS file for styling
import logo from '../assets/logo.png'; // Adjust the path according to your project structure

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <img src={logo} alt="Health System Logo" className="logo" />
          <h1 className="heading">NOVAS HEALTH SYSTEM</h1>
        </div>
        <nav id="main-nav" className={menuOpen ? 'open' : ''}>
          <ul id="menu-list">
            <li><a href="#">Home</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Doctors</a></li>
            <li><a href="#">Appointments</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Login/Sign Up</a></li>
          </ul>
        </nav>
        <div className="menu-icon" id="menu-icon" onClick={toggleMenu}>
          <i className="fas fa-bars"></i>
        </div>
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>
    </header>
  );
};

export default Header;
