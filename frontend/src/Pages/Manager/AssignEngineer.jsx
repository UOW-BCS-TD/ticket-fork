import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AssignEngineer.css';

const AssignEngineer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Compute unique categories and levels for filter dropdowns
  const categories = Array.from(new Set(engineers.map(e => e.category))).filter(Boolean);
  const levels = Array.from(new Set(engineers.map(e => e.level))).filter(Boolean);

  // Filter and search engineers
  const filteredEngineers = engineers.filter(eng => {
    const matchesSearch =
      (eng.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (eng.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (eng.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || eng.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || String(eng.level) === String(filterLevel);
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Sorting logic
  const sortedEngineers = [...filteredEngineers].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'name':
        aVal = (a.user?.name || a.email || '').toLowerCase();
        bVal = (b.user?.name || b.email || '').toLowerCase();
        break;
      case 'email':
        aVal = (a.email || '').toLowerCase();
        bVal = (b.email || '').toLowerCase();
        break;
      case 'level':
        aVal = a.level || 0;
        bVal = b.level || 0;
        break;
      case 'maxTickets':
        aVal = a.maxTickets || 0;
        bVal = b.maxTickets || 0;
        break;
      case 'currentTickets':
        aVal = a.currentTickets || 0;
        bVal = b.currentTickets || 0;
        break;
      case 'category':
        aVal = (a.category || '').toLowerCase();
        bVal = (b.category || '').toLowerCase();
        break;
      default:
        aVal = '';
        bVal = '';
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch ticket details
        const ticketRes = await fetch(`/api/tickets/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!ticketRes.ok) throw new Error('Failed to fetch ticket');
        const ticketData = await ticketRes.json();
        setTicket(ticketData);
        // Fetch all available engineers (not filtered by category)
        const engRes = await fetch(`/api/engineers/available`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!engRes.ok) throw new Error('Failed to fetch engineers');
        setEngineers(await engRes.json());
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedEngineer) return;
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/tickets/${id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedEngineer.id)
      });
      if (!res.ok) throw new Error('Failed to assign engineer');
      setSuccess('Engineer assigned successfully!');
      setTimeout(() => navigate(`/manager/tickets/${id}`), 1200);
    } catch (err) {
      setError('Failed to assign engineer.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className="empty-state">Loading...</div>;
  if (error) return <div className="empty-state">{error}</div>;
  if (!ticket) return <div className="empty-state">Ticket not found.</div>;

  return (
    <div className="assign-engineer-container">
      <div className="assign-engineer-main">
        <h2 className="assign-engineer-title">Assign Engineer to Ticket #{ticket.id}</h2>
        <div className="assign-engineer-meta">
          <p><b>Title:</b> {ticket.title}</p>
          <p><b>Category:</b> {ticket.category || (ticket.type && ticket.type.name)}</p>
        </div>
        <hr className="assign-engineer-divider" />
        <h3 className="assign-engineer-subtitle">Available Engineers</h3>
        <div className="assign-engineer-table-controls">
          <div className="assign-engineer-search-input-wrapper">
            <svg className="assign-engineer-search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              className="assign-engineer-search"
              placeholder="Search by name, email, or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="delete-button search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <select
            className="assign-engineer-filter"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="assign-engineer-filter"
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            {levels.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <button className="managers-return-btn" onClick={() => navigate('/tickets')}>
              <i className="fas fa-arrow-left"></i> Go Back
          </button>
        </div>

        <div className="allengineers-table-wrapper">
          {filteredEngineers.length === 0 ? (
            <div className="empty-state">No available engineers.</div>
          ) : (
            <table className="assign-engineer-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} style={{cursor:'pointer'}}>
                    Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('email')} style={{cursor:'pointer'}}>
                    Email {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('level')} style={{cursor:'pointer'}}>
                    Level {sortBy === 'level' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('maxTickets')} style={{cursor:'pointer'}}>
                    Max Tickets {sortBy === 'maxTickets' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('currentTickets')} style={{cursor:'pointer'}}>
                    Current Tickets {sortBy === 'currentTickets' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('category')} style={{cursor:'pointer'}}>
                    Category {sortBy === 'category' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedEngineers.map(eng => (
                  <tr key={eng.id} className={selectedEngineer && selectedEngineer.id === eng.id ? 'selected' : ''}>
                    <td>{eng.user?.name || eng.email}</td>
                    <td>{eng.email}</td>
                    <td>{eng.level}</td>
                    <td>{eng.maxTickets}</td>
                    <td>{eng.currentTickets}</td>
                    <td>{eng.category}</td>
                    <td>
                      <button
                        className="action-button edit-button"
                        onClick={() => { setSelectedEngineer(eng); setConfirm(true); }}
                        disabled={assigning}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {confirm && selectedEngineer && (
          <div className="assign-engineer-popup-overlay" role="dialog" aria-modal="true">
            <div className="assign-engineer-popup-modal">
              <button className="assign-engineer-popup-close" aria-label="Close" onClick={() => setConfirm(false)} disabled={assigning}>&times;</button>
              <div className="assign-engineer-confirm-text">
                Are you sure you want to assign <b>{selectedEngineer.user?.name || selectedEngineer.email}</b> to this ticket?
              </div>
              <div className="assign-engineer-modal-actions">
                <button className="action-button edit-button" onClick={handleAssign} disabled={assigning}>
                  {assigning ? 'Assigning...' : 'Yes, Assign'}
                </button>
                <button className="action-button delete-button" onClick={() => setConfirm(false)} disabled={assigning}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {success && <div className="success-message assign-engineer-success">{success}</div>}
        {error && <div className="error-message assign-engineer-error">{error}</div>}
      </div>
    </div>
  );
};

export default AssignEngineer; 