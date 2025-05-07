import React, { useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [showServices, setShowServices] = useState(false);

  const toggleServicesDropdown = () => {
    setShowServices(!showServices);
  };

  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-column">
          <div className="footer-logo">
            <img className="circular-logo" src="/logo.png" alt="Techcare Logo" />
            <h3>Techcare Consulting Services Limited</h3>
          </div>
          <div className="company-address">
            <p><i className="fas fa-map-marker-alt location-icon"></i> Fashion Centre, 51-53 Wing Hong St </p>
            <p>Cheung Sha Wan, Hong Kong</p>
          </div>
        </div>
                    
        <div className="footer-column quick-links-container">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/"><i className="fas fa-home"></i> Home</a></li>
            <li><a href="/about"><i className="fas fa-info-circle"></i> About Us</a></li>
            <li className="services-dropdown">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  toggleServicesDropdown();
                }}
              >
                <i className="fas fa-cogs"></i> Our Service 
                <span className="dropdown-arrow">{showServices ? '▲' : '▼'}</span>
              </a>
              {showServices && (
                <ul className="services-submenu">
                  <li><a href="/chatbot"><i className="fas fa-check-circle"></i> Virtual Support Assistant</a></li>
                  <li><a href="/view-tickets"><i className="fas fa-server"></i> Track Support Tickets</a></li>
                  <li><a href="/create-ticket"><i className="fas fa-shield-alt"></i> Request Technical Support</a></li>
                </ul>
              )}
            </li>
            <li><a href="/resources"><i className="fas fa-book"></i> Resources & Guides</a></li>
            <li><a href="/login"><i className="fas fa-sign-in-alt"></i> Sign In</a></li>
          </ul>
        </div>
         
        <div className="footer-column">
          <h4>Contact Us</h4>
          <div className="contact-info">
            <p><i className="fas fa-phone-alt phone-icon"></i> +234 123 456 7890</p>
            <p><i className="fas fa-envelope email-icon"></i> support@techcare.com</p>
            <p><i className="fas fa-envelope email-icon"></i> info@techcare.com</p>
            <p><i className="fas fa-clock"></i> Mon-Fri: 9:00 AM - 5:00 PM</p>
          </div>
        </div>

        <div className="footer-column">
          <h4>Follow Us</h4>
          <ul className="social-media-list">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <div className="social-icon facebook-icon"><i className="fab fa-facebook-f"></i></div>
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <div className="social-icon twitter-icon"><i className="fab fa-twitter"></i></div>
                <span>Twitter</span>
              </a>
            </li>
            <li>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <div className="social-icon linkedin-icon"><i className="fab fa-linkedin-in"></i></div>
                <span>LinkedIn</span>
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <div className="social-icon instagram-icon"><i className="fab fa-instagram"></i></div>
                <span>Instagram</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="copyright-container">
        <div className="footer-divider"></div>
        <p className="copyright">© 2025 Techcare Consulting Services Limited. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
