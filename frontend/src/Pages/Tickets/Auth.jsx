import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import auth from '../../Services/auth';

// Admin-only route component
const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate checking auth status
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  const user = auth.getCurrentUser();
  
  if (!auth.isLoggedIn()) {
    // Store the attempted URL to redirect after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    return (
      <div className="auth-message">
        <div className="auth-message-content">
          <div className="lock-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Authentication Required</h2>
          <p>You need to sign in to access this page.</p>
          <div className="auth-buttons">
            <Link to="/login" className="auth-button primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="auth-message">
        <div className="auth-message-content">
          <div className="lock-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this admin area.</p>
          <div className="auth-buttons">
            <Link to="/" className="auth-button primary">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

// Protected route component with message and improved UI
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate checking auth status
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!auth.isLoggedIn()) {
    // Store the attempted URL to redirect after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    return (
      <div className="auth-message">
        <div className="auth-message-content">
          <div className="lock-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Authentication Required</h2>
          <p>You need to sign in or sign up to access this page.</p>
          <div className="auth-buttons">
            <Link to="/login" className="auth-button primary">Sign In</Link>
            <Link to="/login?signup=true" className="auth-button secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }
  return children;
};

// Engineer-only route component
const EngineerRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate checking auth status
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  const user = auth.getCurrentUser();
  
  if (!auth.isLoggedIn()) {
    // Store the attempted URL to redirect after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    return (
      <div className="auth-message">
        <div className="auth-message-content">
          <div className="lock-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Authentication Required</h2>
          <p>You need to sign in to access this page.</p>
          <div className="auth-buttons">
            <Link to="/login" className="auth-button primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is engineer
  if (!user || (user.role !== 'ENGINEER' && user.role !== 'ADMIN')) {
    return (
      <div className="auth-message">
        <div className="auth-message-content">
          <div className="lock-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this engineer area.</p>
          <div className="auth-buttons">
            <Link to="/" className="auth-button primary">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

// Manager-only route component
const ManagerRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate checking auth status
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  const user = auth.getCurrentUser();
  
  if (!auth.isLoggedIn()) {
    // Store the attempted URL to redirect after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    return (
      <div className="auth-message">
        <div className="auth-message-content">
          <div className="lock-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Authentication Required</h2>
          <p>You need to sign in to access this page.</p>
          <div className="auth-buttons">
            <Link to="/login" className="auth-button primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is manager or admin (admins can access manager pages)
  if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
    return (
      <div className="auth-message">
        <div className="auth-message-content">
          <div className="lock-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this management area.</p>
          <div className="auth-buttons">
            <Link to="/" className="auth-button primary">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

export { AdminRoute, ProtectedRoute, EngineerRoute, ManagerRoute };
