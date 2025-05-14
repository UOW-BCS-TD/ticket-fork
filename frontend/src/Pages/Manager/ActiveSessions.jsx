import React, { useState, useEffect } from 'react';
import './Manager.css';

const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get('/api/sessions');
        setSessions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch active sessions');
        setLoading(false);
        console.error(err);
      }
    };

    fetchSessions();

    // Set up polling to refresh sessions data every minute
    const intervalId = setInterval(fetchSessions, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleEndSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to end this session?')) {
      try {
        // Replace with your actual API endpoint
        await axios.post(`/api/sessions/${sessionId}/end`);
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'Ended', endTime: new Date().toISOString() } 
            : session
        ));
      } catch (err) {
        console.error('Failed to end session:', err);
        alert('Failed to end session. Please try again.');
      }
    }
  };

  // Filter sessions based on search term and user type
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress.includes(searchTerm);
    
    const matchesType = filterType === 'all' || session.userType.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Calculate session duration
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end - start;
    
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (loading) return <div className="empty-state">Loading sessions...</div>;
  if (error) return <div className="empty-state">Error: {error}</div>;

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h1 className="manager-title">Active User Sessions</h1>
        <div className="manager-actions">
          <button 
            className="action-button view-button"
            onClick={() => window.print()}
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by name, email or IP..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="customer">Customers</option>
          <option value="engineer">Engineers</option>
          <option value="manager">Managers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="empty-state">No active sessions found</div>
      ) : (
        <table className="manager-table">
          <thead>
            <tr>
              <th>User</th>
              <th>User Type</th>
              <th>IP Address</th>
              <th>Login Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr key={session.id}>
                <td>
                  <div>{session.userName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{session.userEmail}</div>
                </td>
                <td>{session.userType}</td>
                <td>{session.ipAddress}</td>
                <td>{new Date(session.startTime).toLocaleString()}</td>
                <td>{calculateDuration(session.startTime, session.endTime)}</td>
                <td>
                  <span className={`status-badge status-${session.status === 'Active' ? 'active' : 'inactive'}`}>
                    {session.status}
                  </span>
                </td>
                <td>
                  {session.status === 'Active' && (
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleEndSession(session.id)}
                    >
                      End Session
                    </button>
                  )}
                  <button className="action-button view-button">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Total Active Sessions:</strong> {sessions.filter(s => s.status === 'Active').length}
        </div>
        <div>
          <strong>Last Updated:</strong> {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ActiveSessions;
