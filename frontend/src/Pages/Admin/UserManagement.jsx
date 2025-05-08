import React, { useState, useEffect } from 'react';
import './Admin.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.users.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId) => {
    try {
      const userDetails = await apiService.users.getById(userId);
      setSelectedUser(userDetails);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(`Failed to load details for user ID: ${userId}`);
    }
  };

  if (loading) {
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

      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="admin-search">
            <input type="text" placeholder="Search users..." />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div className="admin-list">
            <h3>Users ({users.length})</h3>
            {users.length === 0 ? (
              <p className="no-data">No users found</p>
            ) : (
              <ul className="user-list">
                {users.map(user => (
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
                      <span className={`user-role ${user.role.toLowerCase()}`}>{user.role}</span>
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
                  <span className={`role-badge ${selectedUser.role.toLowerCase()}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="user-actions">
                  <button className="edit-btn" onClick={() => setShowEditModal(true)}>
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
                      <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="detail-item">
                      <label>Last Login</label>
                      <p>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Actions</h3>
                  <div className="action-buttons">
                    <button className="action-btn reset-password">
                      <i className="fas fa-key"></i> Reset Password
                    </button>
                    {selectedUser.active ? (
                      <button className="action-btn deactivate">
                        <i className="fas fa-user-slash"></i> Deactivate Account
                      </button>
                    ) : (
                      <button className="action-btn activate">
                        <i className="fas fa-user-check"></i> Activate Account
                      </button>
                    )}
                    <button className="action-btn delete">
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
    </div>
  );
};

export default UserManagement;
