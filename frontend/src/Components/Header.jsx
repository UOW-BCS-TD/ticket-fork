import React, { Component } from 'react';
import './Header.css';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobileMenuOpen: false,
      isServiceDropdownOpen: false
    };
  }

  toggleMobileMenu = () => {
    this.setState(prevState => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  }

  toggleServiceDropdown = () => {
    this.setState(prevState => ({
      isServiceDropdownOpen: !prevState.isServiceDropdownOpen
    }));
  }

  render() {
    const { isMobileMenuOpen, isServiceDropdownOpen } = this.state;
    
    const navLinks = this.props.navLinks || [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About Us' },
      { 
        label: 'Our Service', 
        hasDropdown: true,
        dropdownItems: [
          { path: '/chatbot', label: 'Chat with Support Bot' },
          { path: '/view-tickets', label: 'View Ticket Information' },
          { path: '/create-ticket', label: 'Submit a Ticket' }
        ]
      },
      { path: '/resources', label: 'Resources & Guides' },
      { path: '/login', label: 'Login' }
    ];

    return (
      <header className="header">
        <div className="header-logo">
          <img className="circular-logo" src={this.props.logoSrc || "/techcare-logo.jpg"} alt={this.props.logoAlt || "Techcare Logo"} />
          <h2>{this.props.company || "Techcare Consulting Services Limited"}</h2>
        </div>
        
        <div className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} onClick={this.toggleMobileMenu}>
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
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      this.toggleServiceDropdown();
                    }} className="dropdown-toggle">
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
  }
}
