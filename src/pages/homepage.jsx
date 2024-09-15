// src/pages/HomePage.jsx
import React from 'react';
import banner from '../assets/bg1.jpeg';
import './HomePage.css';

const HomePage = () => {
  return (
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
        <div className="services-container">
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
        <div className="doctors-container">
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
        <div className="testmonials-container">
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
        <div className="newsletter-container">
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
};

export default HomePage;
