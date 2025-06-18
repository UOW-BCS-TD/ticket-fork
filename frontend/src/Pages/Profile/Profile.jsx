import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import auth from '../../Services/auth';
import api from '../../Services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const navigate = useNavigate();

  // Handle input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  //Handle password input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  // Function to get user data from API and fallback to localStorage if needed
  const getUserDataFromLocalStorage = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = auth.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      try {
        // Call the API to get the current user profile
        const userData = await auth.getCurrentUserProfile();
        
        // Normalize the API response if needed
        const normalizedUserData = {
          ...userData,
          // Ensure role is in the expected format
          role: userData.role || (userData.roles && userData.roles.length > 0 
            ? userData.roles[0].replace('ROLE_', '') 
            : 'CUSTOMER'),
        };
        
        setUser(normalizedUserData);
        
        // Initialize form data with user data
        setFormData({
          name: normalizedUserData.name || '',
          phoneNumber: normalizedUserData.phoneNumber || ''
        });
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Fallback to localStorage if API call fails
        const currentAuthData = auth.getCurrentUser();
        if (currentAuthData) {
          setUser(currentAuthData);
          
          // Initialize form data with user data from localStorage
          setFormData({
            name: currentAuthData.name || '',
            phoneNumber: currentAuthData.phoneNumber || ''
          });
        } else {
          throw new Error('No user data available');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error getting user data:', error);
      setLoading(false);
      
      // If not authenticated, redirect to login
      if (error.message === 'Not authenticated' || error.message === 'No user data available') {
        navigate('/login');
      }
    }
  };

  // Handle save changes button in edit modal
  const handleSaveChanges = async () => {
    try {
      setError('');
      
      // Create update data object with only changed fields
      const updateData = {};
      
      // Only include fields that have changed
      if (formData.name !== user.name) {
        updateData.name = formData.name;
      }
      if (formData.phoneNumber !== user.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber;
      }
      
      // Only proceed if there are changes to save
      if (Object.keys(updateData).length === 0) {
        setShowEditModal(false);
        return;
      }
      
      // Call the API to update the user profile
      const updatedProfile = await auth.updateCurrentUserProfile(updateData);
      
      // Update the local state with the updated profile data
      setUser(prevUser => ({
        ...prevUser,
        ...updatedProfile
      }));
      
      // Close the modal
      setShowEditModal(false);
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + (error.message || 'Unknown error'));
    }
  };

  //Handle password change submission
  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      
      // Validate passwords
      if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('All password fields are required');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }
      
      // Call the auth service to change password
      const result = await auth.updateCurrentUserPassword(
        passwordData.oldPassword,
        passwordData.newPassword,
      );
      
      if (result.success) {
        // Clear form and show success message
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordSuccess('Password changed successfully');
        
        // Close modal after a delay
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('An unexpected error occurred. Please try again.');
    }
  };

  // Load user data on component mount
  useEffect(() => {
    getUserDataFromLocalStorage();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="profile-loading-state">
        <div className="profile-loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="profile-error-state">
        <div className="profile-error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h2>User not found</h2>
        <p>We couldn't find your profile information. Please log in again.</p>
        <button className="profile-btn profile-btn-logout" onClick={handleLogout}>Go to Login</button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };
  
  const formatActivityDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };

  // Replace the existing toggleDarkMode function with this enhanced version
  const toggleDarkMode = () => {
    // Add transition class to body
    document.body.classList.add('theme-transition');
    
    // Toggle dark mode after a small delay to allow animation to start
    setTimeout(() => {
      const newMode = !darkMode;
      setDarkMode(newMode);
      localStorage.setItem('darkMode', newMode);
      document.body.classList.toggle('dark-mode', newMode);
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 500);
    }, 50);
    
    // Create ripple effect on the button
    const button = document.querySelector('.profile-btn-theme');
    if (button) {
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.position = 'absolute';
      circle.style.borderRadius = '50%';
      circle.style.left = `${-diameter/4}px`;
      circle.style.top = `${-diameter/4}px`;
      circle.style.backgroundColor = darkMode ? '#f1f1f1' : '#2c3e50';
      circle.style.transform = 'scale(0)';
      circle.style.animation = 'ripple 0.6s linear';
      circle.style.opacity = '0.4';
      
      button.appendChild(circle);
      
      setTimeout(() => {
        button.removeChild(circle);
      }, 600);
    }
  };

  // Function to truncate token for display
  const truncateToken = (token) => {
    if (!token) return 'N/A';
    if (token.length <= 20) return token;
    return token.substring(0, 10) + '...' + token.substring(token.length - 10);
  };

  return (
    <div className="profile-container">
      {successMessage && (
        <div className="profile-success-message">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="profile-avatar-placeholder">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        <div className="profile-header-info">
          <h1>{user.name || 'User'}</h1>
          <p className="profile-role">{user.role || 'User'}</p>
          <div className="profile-actions">
            <button className="profile-btn profile-btn-edit" onClick={() => setShowEditModal(true)}>
              <i className="fas fa-edit"></i> Edit Profile
            </button>
            <button className="profile-btn profile-btn-change-password" onClick={() => setShowPasswordModal(true)}>
              <i className="fas fa-key"></i> Change Password
            </button>
            <button className="profile-btn profile-btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
            <button className="profile-btn profile-btn-theme" onClick={toggleDarkMode}>
              <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i> 
              <span className="theme-text">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <i className="fas fa-user"></i> Account
        </button>
        <button 
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-shield-alt"></i> Security
        </button>
        <button 
          className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <i className="fas fa-history"></i> Activity
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === 'account' && (
          <div className="profile-account-info">
            <div className="profile-info-card">
              <h2>Personal Information</h2>
              <div className="profile-info-item">
                <span className="profile-info-label">Name</span>
                <span className="profile-info-value">{user.name || 'Not set'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Phone</span>
                <span className="profile-info-value">{user.phoneNumber || 'Not set'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">{user.role || 'User'}</span>
              </div>
              {user.createdAt && (
                <div className="profile-info-item">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">{formatDate(user.createdAt)}</span>
                </div>
              )}
            </div>
            
            {user.role === 'CUSTOMER' && (
              <div className="profile-info-card">
                <h2>Customer Information</h2>
                <div className="profile-info-item">
                  <span className="profile-info-label">Preferred Contact</span>
                  <span className="profile-info-value">{user.preferredContact || 'Email'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Total Tickets</span>
                  <span className="profile-info-value">{user.ticketCount || 0}</span>
                </div>
              </div>
            )}
            
            {user.role === 'ENGINEER' && (
              <div className="profile-info-card">
                <h2>Engineer Information</h2>
                <div className="profile-info-item">
                  <span className="profile-info-label">Expertise</span>
                  <span className="profile-info-value">{user.expertise || 'Not specified'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Assigned Tickets</span>
                  <span className="profile-info-value">{user.assignedTickets || 0}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Resolved Tickets</span>
                  <span className="profile-info-value">{user.resolvedTickets || 0}</span>
                </div>
              </div>
            )}
            
            {user.role === 'MANAGER' && (
              <div className="profile-info-card">
                <h2>Manager Information</h2>
                <div className="profile-info-item">
                  <span className="profile-info-label">Department</span>
                  <span className="profile-info-value">{user.department || 'Not specified'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Managed Categories</span>
                  <span className="profile-info-value">{user.managedCategories || 'None'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Team Size</span>
                  <span className="profile-info-value">{user.teamSize || 0}</span>
                </div>
              </div>
            )}
            
            {user.role === 'ADMIN' && (
              <div className="profile-info-card">
                <h2>Admin Information</h2>
                <div className="profile-info-item">
                  <span className="profile-info-label">Admin Level</span>
                  <span className="profile-info-value">{user.adminLevel || 'Standard'}</span>
                </div>
                {/* <div className="profile-info-item">
                  <span className="profile-info-label">Last System Check</span>
                  <span className="profile-info-value">{formatDate(user.lastSystemCheck) || 'Never'}</span>
                </div> */}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="profile-security-info">
            <div className="profile-info-card">
              <h2>Security Information</h2>
              <div className="profile-info-item">
                <span className="profile-info-label">Last Login</span>
                <span className="profile-info-value">{formatActivityDate(user.lastLogin)}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Last Password Change</span>
                <span className="profile-info-value">{formatDate(user.lastPasswordChange)}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Two-Factor Authentication</span>
                <span className="profile-info-value">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            
            <div className="profile-info-card">
              <h2>Current Session</h2>
              <div className="profile-info-item">
                <span className="profile-info-label">Token</span>
                <span className="profile-info-value token">{truncateToken(auth.getToken())}</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="profile-activity-info">
            <div className="profile-info-card">
              <h2>Recent Activity</h2>
              {user.recentActivity && user.recentActivity.length > 0 ? (
                <div className="profile-activity-list">
                  {user.recentActivity.map((activity, index) => (
                    <div className="profile-activity-item" key={index}>
                      <div className="profile-activity-details">
                        <p className="profile-activity-description">{activity.description}</p>
                        <p className="profile-activity-time">{formatActivityDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-no-activity">
                  <i className="fas fa-info-circle"></i>
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
            
            <div className="profile-info-card">
              <h2>Login History</h2>
              {user.loginHistory && user.loginHistory.length > 0 ? (
                <div className="profile-login-history">
                  <table className="profile-login-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>IP Address</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.loginHistory.map((login, index) => (
                        <tr key={index}>
                          <td>{formatDate(login.timestamp)}</td>
                          <td>{login.ipAddress}</td>
                          <td>
                            <span className={`profile-login-status ${login.successful ? 'success' : 'failed'}`}>
                              {login.successful ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="profile-no-activity">
                  <i className="fas fa-info-circle"></i>
                  <p>No login history to display</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Simplified Edit Modal - Only for Name and Phone Number */}
      {showEditModal && (
        <div className="profile-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Edit Profile</h2>
              <button className="profile-modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="profile-modal-body">
              {error && <div className="profile-error-message">{error}</div>}
              <div className="profile-form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                />
              </div>
              <div className="profile-form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
                <small>Email cannot be changed</small>
              </div>
              <div className="profile-form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="profile-modal-footer">
              <button className="profile-btn profile-btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="profile-btn profile-btn-save" onClick={handleSaveChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="profile-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Change Password</h2>
              <button className="profile-modal-close" onClick={() => setShowPasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="profile-modal-body">
              {passwordError && <div className="profile-error-message">{passwordError}</div>}
              {passwordSuccess && <div className="profile-success-message">{passwordSuccess}</div>}
              <div className="profile-form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="profile-form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter new password"
                />
              </div>
              <div className="profile-form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Confirm new password"
                />
                <small>Password must be at least 8 characters long</small>
              </div>
            </div>
            <div className="profile-modal-footer">
              <button className="profile-btn profile-btn-cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="profile-btn profile-btn-save" onClick={handleChangePassword}>Change Password</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;

