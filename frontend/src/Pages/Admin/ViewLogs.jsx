import React, { useState, useEffect } from 'react';
import './Admin.css';

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    level: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Mock log data for demonstration
  useEffect(() => {
    // Simulate API call to fetch logs
    setTimeout(() => {
      const mockLogs = [
        { id: 1, timestamp: '2023-07-15T08:23:45', level: 'INFO', message: 'User login successful', user: 'admin@example.com', ip: '192.168.1.1' },
        { id: 2, timestamp: '2023-07-15T09:12:30', level: 'WARNING', message: 'Failed login attempt', user: 'unknown', ip: '203.0.113.42' },
        { id: 3, timestamp: '2023-07-15T10:45:12', level: 'ERROR', message: 'Database connection failed', user: 'system', ip: 'localhost' },
        { id: 4, timestamp: '2023-07-15T11:30:22', level: 'INFO', message: 'Ticket #1234 created', user: 'customer@example.com', ip: '198.51.100.73' },
        { id: 5, timestamp: '2023-07-15T12:15:40', level: 'INFO', message: 'User profile updated', user: 'engineer@example.com', ip: '192.168.1.15' },
        { id: 6, timestamp: '2023-07-15T13:05:18', level: 'WARNING', message: 'High server load detected', user: 'system', ip: 'localhost' },
        { id: 7, timestamp: '2023-07-15T14:22:33', level: 'ERROR', message: 'Payment processing failed', user: 'customer@example.com', ip: '198.51.100.73' },
        { id: 8, timestamp: '2023-07-15T15:10:05', level: 'INFO', message: 'System backup completed', user: 'system', ip: 'localhost' },
        { id: 9, timestamp: '2023-07-15T16:45:59', level: 'CRITICAL', message: 'Security breach detected', user: 'system', ip: '203.0.113.42' },
        { id: 10, timestamp: '2023-07-15T17:30:11', level: 'INFO', message: 'User logout', user: 'admin@example.com', ip: '192.168.1.1' },
      ];
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const applyFilters = () => {
    // This would typically be an API call with filter parameters
    // For now, we'll just simulate filtering the mock data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const clearFilters = () => {
    setFilter({
      level: 'all',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getLogLevelClass = (level) => {
    switch(level.toUpperCase()) {
      case 'INFO':
        return 'log-info';
      case 'WARNING':
        return 'log-warning';
      case 'ERROR':
        return 'log-error';
      case 'CRITICAL':
        return 'log-critical';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>System Logs</h1>
        <p>View and analyze system activity logs</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-content">
        <div className="logs-container">
          <div className="logs-filter">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="level">Log Level</label>
                <select 
                  id="level" 
                  name="level" 
                  value={filter.level}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="startDate">Start Date</label>
                <input 
                  type="date" 
                  id="startDate" 
                  name="startDate" 
                  value={filter.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="endDate">End Date</label>
                <input 
                  type="date" 
                  id="endDate" 
                  name="endDate" 
                  value={filter.endDate}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="filter-group search">
                <label htmlFor="search">Search</label>
                <input 
                  type="text" 
                  id="search" 
                  name="search" 
                  placeholder="Search logs..." 
                  value={filter.search}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="filter-btn clear" onClick={clearFilters}>Clear Filters</button>
              <button className="filter-btn apply" onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>
          
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Message</th>
                  <th>User</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No logs found</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td>{formatDate(log.timestamp)}</td>
                      <td>
                        <span className={`log-level ${getLogLevelClass(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td>{log.message}</td>
                      <td>{log.user}</td>
                      <td>{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="logs-pagination">
            <button className="page-btn" disabled>&laquo; Previous</button>
            <span className="page-info">Page 1 of 1</span>
            <button className="page-btn" disabled>Next &raquo;</button>
          </div>
          
          <div className="logs-actions">
            <button className="action-btn">
              <i className="fas fa-download"></i> Export Logs
            </button>
            <button className="action-btn">
              <i className="fas fa-trash-alt"></i> Clear Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLogs;
