import React, { useState, useEffect } from 'react';
import './Admin.css';
import { logService } from '../../Services/api';
import authFunctions from '../../Services/auth';
import { useNavigate } from 'react-router-dom';

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    level: 'all',
    search: '',
    limit: 100
  });
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!authFunctions.isAdmin()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Fetch available log files
  useEffect(() => {
    const fetchLogFiles = async () => {
      try {
        setLoading(true);
        const files = await logService.getLogFiles();
        setLogFiles(files);
        if (files.length > 0) {
          setSelectedFile(files[0]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching log files:', err);
        setError('Failed to load log files. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogFiles();
  }, []);

  // Fetch logs when filters or selected file changes
  useEffect(() => {
    if (selectedFile) {
      fetchLogs();
    }
  }, [selectedFile]);

  const fetchLogs = async () => {
    if (!selectedFile) return;
    
    try {
      setLoading(true);
      const data = await logService.getLogsFromFile(selectedFile, {
        level: filter.level === 'all' ? '' : filter.level,
        search: filter.search,
        limit: filter.limit
      });
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Please try again later.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const clearFilters = () => {
    setFilter({
      level: 'all',
      search: '',
      limit: 100
    });
    // Don't fetch logs here, let the effect handle it
  };

  const getLogLevelClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'log-error';
      case 'warn': return 'log-warning';
      case 'debug': return 'log-debug';
      case 'trace': return 'log-trace';
      case 'info': 
      default: return 'log-info';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      // Parse the timestamp string to a Date object
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp; // Return original if parsing fails
      }
      
      // Format using native JavaScript
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return timestamp; // Return original if any error occurs
    }
  };

  if (loading && logs.length === 0) {
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
        <p>View and analyze application logs</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="logs-container">
        <div className="logs-controls">
          <div className="logs-filters">
            <div className="filter-group">
              <label>Log File</label>
              <select 
                value={selectedFile} 
                onChange={handleFileChange}
                className="log-select"
              >
                {logFiles.map(file => (
                  <option key={file} value={file}>{file}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Level</label>
              <select 
                name="level" 
                value={filter.level} 
                onChange={handleFilterChange}
                className="level-select"
              >
                <option value="all">All Levels</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warning</option>
                <option value="ERROR">Error</option>
                <option value="DEBUG">Debug</option>
                <option value="TRACE">Trace</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search</label>
              <input 
                type="text" 
                name="search" 
                value={filter.search} 
                onChange={handleFilterChange}
                placeholder="Search in logs..."
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>Limit</label>
              <select 
                name="limit" 
                value={filter.limit} 
                onChange={handleFilterChange}
                className="limit-select"
              >
                <option value="50">50 entries</option>
                <option value="100">100 entries</option>
                <option value="200">200 entries</option>
                <option value="500">500 entries</option>
                <option value="1000">1000 entries</option>
              </select>
            </div>
            <div className="filter-actions">
              <button 
                className="admin-btn-primary" 
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              <button 
                className="admin-btn-secondary" 
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="logs-table-container">
          {logFiles.length === 0 ? (
            <div className="no-logs">
              <i className="fas fa-exclamation-circle"></i>
              <p>No log files found. Please check your server configuration.</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="no-logs">
              <i className="fas fa-search"></i>
              <p>No logs found matching your criteria</p>
            </div>
          ) : (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Logger</th>
                  <th>Thread</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className={getLogLevelClass(log.level)}>
                    <td className="log-timestamp">{formatTimestamp(log.timestamp)}</td>
                    <td className="log-level">{log.level}</td>
                    <td className="log-logger">{log.logger}</td>
                    <td className="log-thread">{log.threadName || '-'}</td>
                    <td className="log-message">
                      <div className="message-contents">{log.message}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLogs;
