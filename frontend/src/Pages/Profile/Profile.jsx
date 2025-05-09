import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Profile.css';
import auth from '../../Services/auth';
import api from '../../Services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();
  
  // Add form state for edit profile
  const [formData, setFormData] = useState({
    name: '',
    preferredContact: 'Email',
    expertise: '',
    department: '',
    managedCategories: ''
  });

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

  // Function to truncate token for display
  const truncateToken = (token) => {
    if (!token) return 'N/A';
    if (token.length <= 20) return token;
    return token.substring(0, 10) + '...' + token.substring(token.length - 10);
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
            <span className="profile-user-role">{user.role}</span>
            <p className="profile-user-email">{user.email}</p>
          </div>
        </div>
        <div className="profile-actions-top">
          <button className="profile-btn profile-btn-edit" onClick={() => setShowEditModal(true)}>
            <i className="fas fa-edit"></i> Edit Profile
          </button>
          <button className="profile-btn profile-btn-logout" onClick={handleLogout}>
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
        <button 
          className={`profile-tab-button ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          <i className="fas fa-key"></i> Auth Data
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
                    <p className="profile-ticket-count">{user.openTickets || 0}</p>
                  </div>
                  <div className="profile-info-group">
                    <label>Total Tickets</label>
                    <p>{user.totalTickets || 0}</p>
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
            
            <div className="profile-actions">
              <button className="profile-btn profile-btn-password">
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
        
        {activeTab === 'auth' && authData && (
          <div className="profile-content-card">
            <div className="profile-content-section">
              <h2>Authentication Data</h2>
              <div className="profile-info-grid">
                <div className="profile-info-group">
                  <label>User ID</label>
                  <p>{authData.id}</p>
                </div>
                <div className="profile-info-group">
                <label>Email</label>
                  <p>{authData.email}</p>
                </div>
                <div className="profile-info-group">
                  <label>Token Type</label>
                  <p>{authData.type}</p>
                </div>
                <div className="profile-info-group">
                  <label>Roles</label>
                  <p>{Array.isArray(authData.roles) ? authData.roles.join(', ') : authData.roles}</p>
                </div>
              </div>
              
              <div className="profile-token-section">
                <h3>Authentication Token</h3>
                <div className="profile-token-display">
                  <p className="profile-token-text">{truncateToken(authData.token)}</p>
                  <button 
                    className="profile-btn profile-btn-copy"
                    onClick={() => {
                      navigator.clipboard.writeText(authData.token);
                      alert('Token copied to clipboard!');
                    }}
                  >
                    <i className="fas fa-copy"></i> Copy
                  </button>
                </div>
                <p className="profile-token-info">
                  <i className="fas fa-info-circle"></i> This token is used for API authentication. Keep it secure and do not share it.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
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
              <button className="profile-btn profile-btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="profile-btn profile-btn-save" onClick={handleSaveChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

