import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import auth from '../Services/auth';
import './Header.css';

const Header = (props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Function to update current user state from localStorage only
  const updateCurrentUser = () => {
    // Get user data from localStorage only, not from API
    const user = {
      name: localStorage.getItem('name'),
      role: localStorage.getItem('role'),
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('email')
    };
    
    setCurrentUser(user);
  };

  // Check if user is logged in when component mounts
  useEffect(() => {
    updateCurrentUser();
    
    // Add event listener to update header when auth state changes
    window.addEventListener('storage', handleStorageChange);
    
    // Add a custom event listener for auth changes within the same tab
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Handle localStorage changes (for when user logs in/out in another tab)
  const handleStorageChange = (e) => {
    if (e.key === 'role' || e.key === 'token' || e.key === 'name' || e.key === null) {
      updateCurrentUser();
    }
  };

  // Handle auth changes within the same tab
  const handleAuthChange = () => {
    updateCurrentUser();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleServiceDropdown = () => {
    setIsServiceDropdownOpen(!isServiceDropdownOpen);
    // Close user dropdown if open
    if (isUserDropdownOpen) {
      setIsUserDropdownOpen(false);
    }
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    // Close service dropdown if open
    if (isServiceDropdownOpen) {
      setIsServiceDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
  };

  // Create navigation links based on authentication status
  const getNavLinks = () => {
    const isLoggedIn = auth.isLoggedIn();
    // Fix: Add getUserRoleDisplay function if it doesn't exist
    const userRoleDisplay = auth.getUserRoleDisplay ? auth.getUserRoleDisplay() : null;
    
    // Get user role from localStorage directly
    const userRole = localStorage.getItem('role');
    
    const baseLinks = [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About Us' },
    ];
    
    // Different service dropdown items based on user role
    if (isLoggedIn) {
      switch(userRole) {
        case 'ADMIN':
          // Admin-specific service items
          baseLinks.push({ 
            label: 'Admin Panel', 
            hasDropdown: true,
            dropdownItems: [
              { path: '/admin/users', label: 'User Management' },
              { path: '/admin/settings', label: 'System Settings' },
              { path: '/admin/logs', label: 'View Logs' }
            ]
          });
          break;
          
        case 'MANAGER':
          // Manager-specific service items
          baseLinks.push({ 
            label: 'Management', 
            hasDropdown: true,
            dropdownItems: [
              { path: '/tickets', label: 'All Tickets' },
              { path: '/engineers', label: 'Manage Engineers' },
              { path: '/customers', label: 'View Customers' },
              { path: '/sessions', label: 'Active Sessions' }
            ]
          });
          break;
          
        case 'ENGINEER':
          // Engineer-specific service items
          baseLinks.push({ 
            label: 'Support Tasks', 
            hasDropdown: true,
            dropdownItems: [
              { path: '/tickets/assigned', label: 'My Assigned Tickets' },
              { path: '/tickets/create', label: 'Create Support Ticket' },
              { path: '/knowledge-base', label: 'Knowledge Base' }
            ]
          });
          break;
          
        default: // CUSTOMER or any other role
          // Regular service items for customers
          baseLinks.push({ 
            label: 'Our Service', 
            hasDropdown: true,
            dropdownItems: [
              { path: '/chatbot', label: 'Virtual Support Assistant' },
              { path: '/view-tickets', label: 'My Support Tickets' },
              { path: '/create-ticket', label: 'Request Technical Support' }
            ]
          });
      }
    } else {
      // Regular service items for non-admin users
      baseLinks.push({ 
        label: 'Our Service', 
        hasDropdown: true,
        dropdownItems: [
          { path: '/chatbot', label: 'Virtual Support Assistant' },
          { path: '/view-tickets', label: 'Track Support Tickets' },
          { path: '/create-ticket', label: 'Request Technical Support' }
        ]
      });
    }
    
    // Add Resources link for all users
    baseLinks.push({ path: '/resources', label: 'Resources & Guides' });

    // If user is logged in, show "Profile" dropdown
    if (isLoggedIn) {
      return [
        ...baseLinks,
        { 
          label: 'Profile', 
          hasDropdown: true,
          dropdownItems: [
            { path: '/profile', label: `My Profile` },
            { path: '#', label: 'Sign Out', onClick: handleLogout }
          ]
        }
      ];
    } else {
      // If not logged in, show Sign In link
      return [
        ...baseLinks,
        { path: '/login', label: 'Sign In' }
      ];
    }
  };

  const navLinks = props.navLinks || getNavLinks();

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
                      if (link.label === 'Our Service' || link.label === 'Admin Panel' ||
                          link.label === 'Management' || link.label === 'Support Tasks'
                      ) {
                        toggleServiceDropdown();
                      } else {
                        toggleUserDropdown();
                      }
                    }} 
                    className="dropdown-toggle"
                  >
                    {link.label}
                    <span className="dropdown-arrow">▼</span>
                  </a>
                  <ul className={`dropdown-menu ${
                    link.label === 'Our Service' || link.label === 'Admin Panel' ||
                    link.label === 'Management' || link.label === 'Support Tasks'
                      ? (isServiceDropdownOpen ? 'active' : '') 
                      : (isUserDropdownOpen ? 'active' : '')
                  }`}>
                    {link.dropdownItems.map((item, idx) => (
                      <li key={idx}>
                        {item.onClick ? (
                          <a href="#" onClick={(e) => {
                            e.preventDefault();
                            item.onClick();
                          }}>
                            {item.label}
                          </a>
                        ) : (
                          <Link to={item.path}>{item.label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link to={link.path}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
