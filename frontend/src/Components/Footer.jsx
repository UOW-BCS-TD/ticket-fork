import React, { Component } from 'react';
import './Footer.css';

export default class Footer extends Component {
  render() {
    return (
      <footer className="footer-container">
        <div className="footer-main">
          <div className="footer-column">
            <div className="footer-logo">
              <img className="circular-logo" src="/techcare-logo.jpg" alt="Techcare Logo" />
              <h3>Techcare Consulting Services Limited</h3>
            </div>
            <div className="company-address">
              <p>Fashion Centre, 51-53 Wing Hong St</p>
              <p>Cheung Sha Wan, Hong Kong</p>
            </div>
          </div>
                    
          <div className="footer-column quick-links-container">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/services">Our Service</a></li>
              <li><a href="/resources">Resources & Guides</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>
         
          <div className="footer-column">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p><i className="phone-icon"></i> +234 123 456 7890</p>
              <p><i className="email-icon"></i> support@techcare.com</p>
              <p><i className="email-icon"></i> info@techcare.com</p>
            </div>
          </div>

          <div className="footer-column">
          <h4>Follow Us</h4>
            <ul className="social-media-list">
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i class="social-icon facebook-icon"></i> Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i class="social-icon twitter-icon"></i> Twitter</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i class="social-icon linkedin-icon"></i> LinkedIn</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i class="social-icon instagram-icon"></i> Instagram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="copyright-container">
          <p className="copyright">© 2025 Techcare Consulting Services Limited. All rights reserved.</p>
        </div>
      </footer>
    );
  }
}
