import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import auth from '../Services/auth';

const Header = (props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to update current user state from localStorage and API if possible
  const updateCurrentUser = async () => {
    try {
      // First try to get the current user profile from API
      const token = auth.getToken();
      
      if (token) {
        try {
          // Try to get fresh user data from API
          const userData = await auth.getCurrentUserProfile();
          
          // Normalize the API response if needed
          const normalizedUserData = {
            ...userData,
            // Ensure role is in the expected format
            role: userData.role || (userData.roles && userData.roles.length > 0 
              ? userData.roles[0].replace('ROLE_', '') 
              : 'CUSTOMER'),
          };
          
          setCurrentUser(normalizedUserData);
          return;
        } catch (apiError) {
          console.error('API error in Header:', apiError);
          // Fall back to localStorage if API call fails
        }
      }
      
      // Fallback to localStorage
      const user = auth.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error updating user in Header:', error);
      setCurrentUser(null);
    }
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const header = document.querySelector('.header');
      
      if (header && !header.contains(event.target)) {
        // Close mobile menu if open
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        
        // Close service dropdown if open
        if (isServiceDropdownOpen) {
          setIsServiceDropdownOpen(false);
        }
        
        // Close user dropdown if open
        if (isUserDropdownOpen) {
          setIsUserDropdownOpen(false);
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isServiceDropdownOpen, isUserDropdownOpen]);

  // Handle localStorage changes (for when user logs in/out in another tab)
  const handleStorageChange = (e) => {
    if (e.key === 'role' || e.key === 'token' || e.key === 'name' || e.key === 'user' || e.key === null) {
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
    setIsServiceDropdownOpen((prev) => !prev);
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
    setIsServiceDropdownOpen(false);
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    
    // Redirect to login page after logout
    navigate('/login');
  };

  // Create navigation links based on authentication status
  const getNavLinks = () => {
    const isLoggedIn = auth.isLoggedIn();
    
    // Get user role from current user
    const userRole = currentUser?.role || '';
    
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
              // { path: '/customers', label: 'View Customers' },
              // { path: '/sessions', label: 'Active Sessions' }
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

  // Force re-render when currentUser changes by directly calling getNavLinks()
  const navLinks = props.navLinks || getNavLinks();

  useEffect(() => {
    const handleClickOutside = (event) => {
      const nav = document.querySelector('.header-nav');
      if (nav && !nav.contains(event.target)) {
        setIsServiceDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                            setIsServiceDropdownOpen(false);
                            setIsUserDropdownOpen(false);
                          }}>
                            {item.label}
                          </a>
                        ) : (
                          <Link to={item.path} onClick={() => { setIsServiceDropdownOpen(false); setIsUserDropdownOpen(false); }}>{item.label}</Link>
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
