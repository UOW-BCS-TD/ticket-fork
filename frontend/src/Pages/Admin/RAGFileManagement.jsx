import React, { useEffect, useState } from 'react';
import { ragService } from '../../Services/api';
import './Admin.css';

const RAGFileManagement = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await ragService.listFiles();
      setFiles(data);
    } catch (e) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      await ragService.uploadFile(file);
      setMessage('File uploaded');
      fetchFiles();
    } catch (e) {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await ragService.deleteFile(name);
      fetchFiles();
    } catch {
      alert('Delete failed');
    }
  };

  const handleRestart = async () => {
    if (!window.confirm('Rebuild RAG database? This may take a while.')) return;
    setMessage('Restarting...');
    try {
      await ragService.restartRAG();
      setMessage('Restart triggered');
    } catch {
      setMessage('Restart failed');
    }
  };

  return (
    <div className="admin-page">
      <h2>RAG File Management</h2>
      <div style={{ marginBottom: 16 }}>
        <label className="upload-btn">
          <input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </label>
        <button className="restart-btn" onClick={handleRestart} style={{ marginLeft: 10 }}>Restart RAG</button>
      </div>
      {message && <div>{message}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Filename</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f}>
                <td>{f}</td>
                <td><button onClick={() => handleDelete(f)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RAGFileManagement; 