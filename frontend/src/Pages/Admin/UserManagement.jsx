import React, { useState, useEffect } from 'react';
import './Admin.css';
import { userService } from '../../Services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    active: true
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      filterUsers();
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setEditFormData({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        role: selectedUser.role || 'CUSTOMER',
        active: selectedUser.active !== false
      });
      setShowEditModal(true);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(selectedUser.id, editFormData);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...updatedUser } : user
      ));
      
      setSelectedUser({ ...selectedUser, ...updatedUser });
      setShowEditModal(false);
      showSuccessMessage('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (userId) => {
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      await userService.updateUserPassword(selectedUser.id, { newPassword: newPassword });
      
      setShowResetPasswordModal(false);
      showSuccessMessage('Password reset successfully');
    } catch (err) {
      console.error('Error resetting password:', err);
      setPasswordError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(userId, { 
        active: !currentStatus 
      });
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, active: !currentStatus } : user
      ));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, active: !currentStatus });
      }
      
      showSuccessMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(`Failed to ${!currentStatus ? 'activate' : 'deactivate'} user. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(selectedUser.id);
      
      // Remove the user from the local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
      setShowDeleteModal(false);
      showSuccessMessage('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage system users and their permissions</p>
      </div>

      {error && <div className="admin-error">{error}</div>}
      
      {successMessage && (
        <div className="admin-success">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}

      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="admin-search">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div className="admin-list">
            <div className="admin-list-header">
              <h3>Users ({filteredUsers.length})</h3>
              <button className="add-user-btn" onClick={() => {/* Implement add user */}}>
                <i className="fas fa-plus"></i> Add User
              </button>
            </div>
            {filteredUsers.length === 0 ? (
              <p className="no-data">No users found</p>
            ) : (
              <ul className="user-list">
                {filteredUsers.map(user => (
                  <li 
                    key={user.id} 
                    className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="user-avatar">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                      <div className="user-meta">
                        <span className={`user-role ${user.role?.toLowerCase()}`}>{user.role}</span>
                        <span className={`user-status ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="admin-detail">
          {selectedUser ? (
            <div className="user-detail-panel">
              <div className="user-detail-header">
                <div className="user-detail-avatar">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="user-detail-title">
                  <h2>{selectedUser.name}</h2>
                  <p>{selectedUser.email}</p>
                  <div className="user-badges">
                    <span className={`role-badge ${selectedUser.role?.toLowerCase()}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`status-badge ${selectedUser.active ? 'active' : 'inactive'}`}>
                      {selectedUser.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="user-actions">
                  <button className="edit-btn" onClick={handleEditUser}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                </div>
              </div>

              <div className="user-detail-content">
                <div className="detail-section">
                  <h3>Account Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>User ID</label>
                      <p>{selectedUser.id}</p>
                    </div>
                    <div className="detail-item">
                      <label>Status</label>
                      <p className={`status ${selectedUser.active ? 'active' : 'inactive'}`}>
                        {selectedUser.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <label>Created</label>
                      <p>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div className="detail-item">
                      <label>Last Login</label>
                      <p>{formatDate(selectedUser.lastLogin)}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Actions</h3>
                  <div className="action-buttons">
                    <button 
                      className="action-btn reset-password"
                      onClick={() => handleResetPassword(selectedUser.id)}
                    >
                      <i className="fas fa-key"></i> Reset Password
                    </button>
                    {selectedUser.active ? (
                      <button 
                        className="action-btn deactivate"
                        onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.active)}
                        disabled={loading}
                      >
                        <i className="fas fa-user-slash"></i> Deactivate Account
                      </button>
                    ) : (
                      <button 
                        className="action-btn activate"
                        onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.active)}
                        disabled={loading}
                      >
                        <i className="fas fa-user-check"></i> Activate Account
                      </button>
                    )}
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      disabled={loading}
                    >
                      <i className="fas fa-trash-alt"></i> Delete User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">
                <i className="fas fa-users"></i>
              </div>
              <h2>No User Selected</h2>
              <p>Select a user from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ENGINEER">Engineer</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="active"
                      checked={editFormData.active}
                      onChange={handleEditInputChange}
                    />
                    <span>Active Account</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button className="modal-close" onClick={() => setShowResetPasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="modal-body">
                {passwordError && <div className="form-error">{passwordError}</div>}
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="8"
                  />
                  <div className="form-hint">Password must be at least 8 characters long</div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="confirm-message">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to delete the user <strong>{selectedUser?.name}</strong>?</p>
                <p className="warning">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={confirmDeleteUser}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

