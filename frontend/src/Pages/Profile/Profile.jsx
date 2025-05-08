import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import auth from '../../Services/auth';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    openTickets: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
    escalatedTickets: 0
  });
  
  // Add form state for edit profile
  const [formData, setFormData] = useState({
    name: '',
    preferredContact: 'Email',
    expertise: '',
    department: '',
    managedCategories: ''
  });
  
  // Add state for operations
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    // Get user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Log authentication state
        console.log("Auth state:", {
          isAuthenticated: auth.isLoggedIn(),
          token: localStorage.getItem('token') ? 'Token exists' : 'No token',
          user: auth.getCurrentUser()
        });
        
        // Get user data from local storage
        const currentUser = auth.getCurrentUser();
        console.log("Local user data:", currentUser);
        
        if (!currentUser) {
          throw new Error("No user data available. Please log in again.");
        }
        
        // Create a simulated user object based on local storage data
        let userData = {
          ...currentUser,
          createdAt: currentUser.createdAt || new Date().toISOString(),
          email: currentUser.email || 'user@example.com',
          preferredContact: 'Email',
          recentActivity: [
            { id: 1, type: 'login', action: 'logged in', date: new Date().toISOString(), details: 'From browser' }
          ]
        };
        
        // Add role-specific data
        if (currentUser.role === 'ENGINEER') {
          userData = {
            ...userData,
            category: 'Hardware Support',
            level: 'Senior',
            maxTickets: 10,
            currentTickets: 4,
            expertise: ['Networking', 'Hardware', 'Windows OS']
          };
          
          setStats({
            openTickets: 4,
            totalTickets: 156,
            resolvedTickets: 152,
            pendingTickets: 2,
            escalatedTickets: 2
          });
        } 
        else if (currentUser.role === 'MANAGER') {
          userData = {
            ...userData,
            department: 'Technical Support',
            teamSize: 12,
            managedCategories: ['Hardware', 'Software', 'Network']
          };
          
          setStats({
            openTickets: 32,
            totalTickets: 1250,
            resolvedTickets: 1218,
            pendingTickets: 18,
            escalatedTickets: 14
          });
        }
        else if (currentUser.role === 'CUSTOMER') {
          userData = {
            ...userData,
            openTickets: Math.floor(Math.random() * 5),
            totalTickets: Math.floor(Math.random() * 20) + 5,
          };
          
          setStats({
            openTickets: Math.floor(Math.random() * 5),
            totalTickets: Math.floor(Math.random() * 20) + 5,
            resolvedTickets: Math.floor(Math.random() * 15),
            pendingTickets: Math.floor(Math.random() * 3),
            escalatedTickets: Math.floor(Math.random() * 2)
          });
        }
        
        console.log("Final user data to be used:", userData);
        setUser(userData);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        console.error('Error stack:', error.stack);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Listen for storage events to update the profile when localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'name' || e.key === 'email' || e.key === 'role') {
        console.log('Storage changed, refreshing user data');
        fetchUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Initialize form data when user data is loaded or edit modal is opened
  useEffect(() => {
    if (user && showEditModal) {
      console.log("Initializing form data with user:", user);
      setFormData({
        name: user.name || '',
        preferredContact: user.preferredContact || 'Email',
        expertise: user.expertise ? user.expertise.join(', ') : '',
        department: user.department || '',
        managedCategories: user.managedCategories ? user.managedCategories.join(', ') : ''
      });
    }
  }, [user, showEditModal]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log("Saving profile changes:", formData);
      
      // Prepare the update data based on user role
      const updateData = { name: formData.name };
      
      // Add role-specific updates
      if (user.role === 'CUSTOMER') {
        updateData.preferredContact = formData.preferredContact;
      } 
      else if (user.role === 'ENGINEER') {
        updateData.expertise = formData.expertise.split(',').map(item => item.trim());
      }
      else if (user.role === 'MANAGER') {
        updateData.department = formData.department;
        updateData.managedCategories = formData.managedCategories.split(',').map(item => item.trim());
      }
      
      console.log("Prepared update data:", updateData);
      
      // Update local storage
      localStorage.setItem('name', formData.name);
      
      // Update the user state
      const updatedUser = { 
        ...user, 
        ...updateData,
        // Convert arrays back if needed
        expertise: user.role === 'ENGINEER' ? updateData.expertise : user.expertise,
        managedCategories: user.role === 'MANAGER' ? updateData.managedCategories : user.managedCategories
      };
      
      // Add a new activity entry
      const newActivity = {
        id: Date.now(),
        type: 'profile',
        action: 'updated',
        date: new Date().toISOString(),
        details: 'profile information'
      };
      
      updatedUser.recentActivity = [newActivity, ...(updatedUser.recentActivity || [])];
      
      console.log("Updated user:", updatedUser);
      setUser(updatedUser);
      
      // Trigger a storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'name',
        newValue: formData.name
      }));
      
      // Set success message
      setSuccessMessage('Profile updated successfully!');
      
      // Close the modal after a short delay
      setTimeout(() => {
        setShowEditModal(false);
        setSuccessMessage(null);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving profile changes:', error);
      console.error('Error stack:', error.stack);
      setError('Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Password field changed: ${name}`);
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handlePasswordChange = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      
      console.log("Simulating password change...");
      
      // Simulate password change success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess('Password changed successfully!');
      
      // Close modal after delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 1500);
      
    } catch (error) {
      console.error('Error changing password:', error);
      console.error('Error stack:', error.stack);
      setPasswordError('Failed to change password. Please check your current password and try again.');
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Log render state
  console.log("Profile component render state:", {
    user,
    loading,
    error,
    activeTab,
    stats
  });
  
  if (loading) {
    return (
      <div className="profile-loading-state">
        <div className="profile-loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }
  
  if (error && !user) {
    return (
      <div className="profile-error-state">
        <div className="profile-error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button className="profile-btn profile-btn-logout" onClick={() => auth.logout()}>Go to Login</button>
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
        <button className="profile-btn profile-btn-logout" onClick={() => auth.logout()}>Go to Login</button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatActivityDate = (dateString) => {
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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="profile-user-info">
            <h1>{user.name}</h1>
            <span className="profile-user-role">{auth.getUserRoleDisplay()}</span>
            <p className="profile-user-email">{user.email}</p>
          </div>
        </div>
        <div className="profile-actions-top">
          <button className="profile-btn profile-btn-refresh" onClick={() => window.location.reload()}>
            <i className="fas fa-sync"></i> Refresh
          </button>
          <button className="profile-btn profile-btn-edit" onClick={() => setShowEditModal(true)}>
            <i className="fas fa-edit"></i> Edit Profile
          </button>
          <button className="profile-btn profile-btn-logout" onClick={() => auth.logout()}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab-button ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <i className="fas fa-user"></i> Account
        </button>
        <button 
          className={`profile-tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <i className="fas fa-history"></i> Activity
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === 'account' && (
          <div className="profile-content-card">
            <div className="profile-content-section">
              <h2>Account Information</h2>
              <div className="profile-info-grid">
                <div className="profile-info-group">
                  <label>Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="profile-info-group">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="profile-info-group">
                  <label>Role</label>
                  <p className="profile-role-badge">{user.role}</p>
                </div>
                <div className="profile-info-group">
                  <label>Account Created</label>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
            
            {user.role === 'CUSTOMER' && (
              <div className="profile-content-section">
                <h2>Customer Details</h2>
                <div className="profile-info-grid">
                  <div className="profile-info-group">
                    <label>Customer Since</label>
                    <p>{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Open Tickets</label>
                    <p className="profile-ticket-count">{stats.openTickets || 0}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Total Tickets</label>
                    <p>{stats.totalTickets || 0}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Preferred Contact</label>
                    <p>{user.preferredContact || 'Email'}</p>
                  </div>
                </div>
                <div className="profile-customer-actions">
                  <Link to="/create-ticket" className="profile-customer-action">
                    <i className="fas fa-plus-circle"></i> Create New Ticket
                  </Link>
                  <Link to="/view-tickets" className="profile-customer-action">
                    <i className="fas fa-ticket-alt"></i> View My Tickets
                  </Link>
                </div>
              </div>
            )}
            
            {user.role === 'ENGINEER' && (
              <div className="profile-content-section">
                <h2>Engineer Details</h2>
                <div className="profile-info-grid">
                  <div className="profile-info-group">
                    <label>Category</label>
                    <p>{user.category || 'Not specified'}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Level</label>
                    <p>{user.level || 'Not specified'}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Current Tickets</label>
                    <p className="profile-ticket-count">{stats.openTickets || 0}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Max Tickets</label>
                    <p>{user.maxTickets || 'Not specified'}</p>
                  </div>
                </div>
                <div className="profile-engineer-actions">
                  <Link to="/tickets/assigned" className="profile-engineer-action">
                    <i className="fas fa-tasks"></i> My Assigned Tickets
                  </Link>
                  <Link to="/knowledge-base" className="profile-engineer-action">
                    <i className="fas fa-book"></i> Knowledge Base
                  </Link>
                </div>
              </div>
            )}
            
            {user.role === 'MANAGER' && (
              <div className="profile-content-section">
                <h2>Manager Details</h2>
                <div className="profile-info-grid">
                  <div className="profile-info-group">
                    <label>Department</label>
                    <p>{user.department || 'Not specified'}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Team Size</label>
                    <p>{user.teamSize || 'Not specified'}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Managed Categories</label>
                    <p>{user.managedCategories ? user.managedCategories.join(', ') : 'Not specified'}</p>
                  </div>
                </div>
                <div className="profile-manager-actions">
                  <Link to="/tickets" className="profile-manager-action">
                    <i className="fas fa-ticket-alt"></i> All Tickets
                  </Link>
                  <Link to="/engineers" className="profile-manager-action">
                  <i className="fas fa-users-cog"></i> Manage Engineers
                  </Link>
                </div>
              </div>
            )}
            
            <div className="profile-actions">
              <button className="profile-btn profile-btn-password" onClick={() => setShowPasswordModal(true)}>
                <i className="fas fa-key"></i> Change Password
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="profile-content-card">
            <div className="profile-content-section">
              <h2>Recent Activity</h2>
              {user.recentActivity && user.recentActivity.length > 0 ? (
                <div className="profile-activity-list">
                  {user.recentActivity.map(activity => (
                    <div key={activity.id} className="profile-activity-item">
                      <div className={`profile-activity-icon ${activity.type}`}>
                        {activity.type === 'ticket' && <i className="fas fa-ticket-alt"></i>}
                        {activity.type === 'login' && <i className="fas fa-sign-in-alt"></i>}
                        {activity.type === 'profile' && <i className="fas fa-user-edit"></i>}
                      </div>
                      <div className="profile-activity-details">
                        <p className="profile-activity-text">
                          You <strong>{activity.action}</strong> {activity.details}
                        </p>
                        <span className="profile-activity-date">{formatActivityDate(activity.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="profile-no-activity">No recent activity to display.</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Profile Modal */}
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
              {error && (
                <div className="profile-form-error">
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
              )}
              
              {successMessage && (
                <div className="profile-form-success">
                  <i className="fas fa-check-circle"></i> {successMessage}
                </div>
              )}
              
              <div className="profile-form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
                <small>Email cannot be changed</small>
              </div>
              
              {user.role === 'CUSTOMER' && (
                <div className="profile-form-group">
                  <label>Preferred Contact Method</label>
                  <select 
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleInputChange}
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              )}
              
              {user.role === 'ENGINEER' && (
                <>
                  <div className="profile-form-group">
                    <label>Areas of Expertise</label>
                    <input 
                      type="text" 
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                    />
                    <small>Separate multiple areas with commas</small>
                  </div>
                </>
              )}
              
              {user.role === 'MANAGER' && (
                <>
                  <div className="profile-form-group">
                    <label>Department</label>
                    <input 
                      type="text" 
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="profile-form-group">
                    <label>Managed Categories</label>
                    <input 
                      type="text" 
                      name="managedCategories"
                      value={formData.managedCategories}
                      onChange={handleInputChange}
                    />
                    <small>Separate multiple categories with commas</small>
                  </div>
                </>
              )}
            </div>
            <div className="profile-modal-footer">
              <button 
                className="profile-btn profile-btn-cancel" 
                onClick={() => setShowEditModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="profile-btn profile-btn-save" 
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
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
              {passwordError && (
                <div className="profile-form-error">
                  <i className="fas fa-exclamation-triangle"></i> {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="profile-form-success">
                  <i className="fas fa-check-circle"></i> {passwordSuccess}
                </div>
              )}
              
              <div className="profile-form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                />
              </div>
              <div className="profile-form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                />
              </div>
              <div className="profile-form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                />
              </div>
              <div className="profile-password-requirements">
                <p>Password requirements:</p>
                <ul>
                  <li>At least 8 characters long</li>
                  <li>Include at least one uppercase letter</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>
            </div>
            <div className="profile-modal-footer">
              <button 
                className="profile-btn profile-btn-cancel" 
                onClick={() => setShowPasswordModal(false)}
                disabled={changingPassword}
              >
                Cancel
              </button>
              <button 
                className="profile-btn profile-btn-save" 
                onClick={handlePasswordChange}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;


