import React, { Component } from 'react';
import './Header.css';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobileMenuOpen: false
    };
  }

  toggleMobileMenu = () => {
    this.setState(prevState => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  }

  render() {
    const { isMobileMenuOpen } = this.state;
    
    const navLinks = this.props.navLinks || [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About Us' },
      { path: '/services', label: 'Our Service' },
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
              <li key={index}>
                <a href={link.path}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    );
  }
}
