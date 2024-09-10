import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css'; // Import your CSS file
import '@fortawesome/fontawesome-free/css/all.min.css';
import banner from './assets/bg1.jpeg';
import logo from './assets/logo.png';
import OrderTestKits from './pages/ordertestkits'; // Import your Order Test Kits page
import Symptomchecker from './pages/SymptomChecker';

const App = () => {

  useEffect(() => {
    const menuIcon = document.getElementById('menu-icon');
    const nav = document.getElementById('main-nav');

    const toggleNav = () => {
      nav.classList.toggle('active');
    };

    if (menuIcon) {
      menuIcon.addEventListener('click', toggleNav);
    }

    return () => {
      if (menuIcon) {
        menuIcon.removeEventListener('click', toggleNav);
      }
    };
  }, []);

  return (
    <Router>
      <div>
        {/* Header */}
        <header>
          <div className="container">
            <div className="header-content">
              <img src={logo} alt="Health System Logo" className="logo" />
              <h1 className="heading">NOVAS HEALTH SYSTEM</h1>
            </div>
            <nav id="main-nav">
              <ul id="menu-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/order-test-kits">Order test kits</Link></li>
                <li><Link to="/Symptom-checker">Symptoms Checker</Link></li>
              </ul>
            </nav>
            <div className="menu-icon" id="menu-icon">
              <i className="fas fa-bars"></i>
            </div>
            <input type="text" placeholder="Search..." className="search-bar" />
          </div>
        </header>

        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order-test-kits" element={<OrderTestKits />} />
          <Route path="/Symptom-checker" element={<Symptomchecker />} />
        </Routes>

        {/* Footer */}
        <footer>
          <div className="container">
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
      </div>
    </Router>
  );
};

const Home = () => (
  <>
    {/* Hero Section */}
    <section className="banner">
      <div className="banner-left">
        <img src={banner} alt="Rhombus Image" className="rhombus-image" />
      </div>
      <div className="banner-right">
        <h1>Welcome to Our Health System</h1>
        <p>Your health, our priority. Book your appointment or search for doctors with ease.</p>
        <div className="buttons">
          <button className="btn-primary">Book Appointment</button>
          <button className="btn-secondary">Search Doctors</button>
        </div>
      </div>
    </section>

    {/* Services Section */}
    <section className="services">
      <div className="container">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-item">
            <i className="fas fa-stethoscope"></i>
            <h3>Primary Care</h3>
            <p>Comprehensive healthcare services for all ages.</p>
          </div>
          <div className="service-item">
            <i className="fas fa-heartbeat"></i>
            <h3>Specialty Care</h3>
            <p>Advanced care for specific health needs.</p>
          </div>
          <div className="service-item">
            <i className="fas fa-ambulance"></i>
            <h3>Emergency Services</h3>
            <p>24/7 emergency medical services.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Featured Doctors Section */}
    <section className="doctors">
      <div className="container">
        <h2>Meet Our Doctors</h2>
        <div className="doctor-profile">
          <img src="doctor1.jpg" alt="Doctor 1" />
          <h3>Dr. Jane Doe</h3>
          <p>Cardiologist</p>
        </div>
        <div className="doctor-profile">
          <img src="doctor2.jpg" alt="Doctor 2" />
          <h3>Dr. John Smith</h3>
          <p>Neurologist</p>
        </div>
        <div className="doctor-profile">
          <img src="doctor3.jpg" alt="Doctor 3" />
          <h3>Dr. Emma Brown</h3>
          <p>Pediatrician</p>
        </div>
      </div>
      <a href="#" className="btn btn-primary">View More Doctors</a>
    </section>

    {/* Testimonials Section */}
    <section className="testimonials">
      <div className="container">
        <h2>What Our Patients Say</h2>
        <div className="testimonial">
          <p>"The care I received was exceptional. The doctors and staff are incredibly kind and professional."</p>
          <p>- Mary Johnson</p>
          <div className="stars">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
          </div>
        </div>
      </div>
    </section>

    {/* Newsletter Signup Section */}
    <section className="newsletter">
      <div className="container">
        <h2>Stay Informed</h2>
        <p>Subscribe to receive the latest health tips and updates.</p>
        <form>
          <input type="email" placeholder="Enter your email" />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
      </div>
    </section>
  </>
);

export default App;
