import React, { useState } from 'react';
import './Header.css';

const Header = (props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleServiceDropdown = () => {
    setIsServiceDropdownOpen(!isServiceDropdownOpen);
  };

  const navLinks = props.navLinks || [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { 
      label: 'Our Service', 
      hasDropdown: true,
      dropdownItems: [
        { path: '/chatbot', label: 'Virtual Support Assistant' },
        { path: '/view-tickets', label: 'Track Support Tickets' },
        { path: '/create-ticket', label: 'Request Technical Support' }
      ]
    },
    { path: '/resources', label: 'Resources & Guides' },
    { path: '/login', label: 'Sign In' }
  ];

  return (
    <header className="header">
      <div className="header-logo">
        <img 
          className="circular-logo" 
          src={props.logoSrc || "/logo.png"} 
          alt={props.logoAlt || "Techcare Logo"} 
        />
        <h2>{props.company || "Techcare Consulting Services Limited"}</h2>
      </div>
      
      <div 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={toggleMobileMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <nav className={`header-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul>
          {navLinks.map((link, index) => (
            <li key={index} className={link.hasDropdown ? 'has-dropdown' : ''}>
              {link.hasDropdown ? (
                <>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleServiceDropdown();
                    }} 
                    className="dropdown-toggle"
                  >
                    {link.label}
                    <span className="dropdown-arrow">▼</span>
                  </a>
                  <ul className={`dropdown-menu ${isServiceDropdownOpen ? 'active' : ''}`}>
                    {link.dropdownItems.map((item, idx) => (
                      <li key={idx}>
                        <a href={item.path}>{item.label}</a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <a href={link.path}>{link.label}</a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
