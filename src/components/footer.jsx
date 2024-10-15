// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-links">
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Service</Link>
          <Link to="#">FAQ</Link>
        </div>
        <div className="contact-info">
          <p>Address: 123 Health St, Wellness City</p>
          <p>Phone: (123) 456-7890</p>
          <p>Email: contact@healthsystem.com</p>
        </div>
        <div className="social-media">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
