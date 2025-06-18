import React, { useState, useEffect } from 'react';
import './Manager.css';
import './AllTickets.css';
import { ticketAPI } from '../../Services/api';
import { useNavigate } from 'react-router-dom';

const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editingUrgency, setEditingUrgency] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await ticketAPI.getTicketsByManagerCategory();
        setTickets(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tickets');
        setLoading(false);
        console.error(err);
      }
    };
    fetchTickets();
  }, []);

  // Filter tickets based on search term and status
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (
        typeof ticket.customer === 'string'
          ? ticket.customer.toLowerCase().includes(searchTerm.toLowerCase())
          : (
              ticket.customer && (
                (ticket.customer.name && ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (ticket.customer.email && ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
              )
            )
      ) ||
      ticket.id.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || ticket.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedTickets = React.useMemo(() => {
    const sortable = [...filteredTickets];
    sortable.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      // Special handling for nested/complex fields
      if (sortConfig.key === 'engineer') {
        aValue = a.engineer ? (typeof a.engineer === 'object' ? a.engineer.name : a.engineer) : '';
        bValue = b.engineer ? (typeof b.engineer === 'object' ? b.engineer.name : b.engineer) : '';
      }
      if (sortConfig.key === 'urgency') {
        aValue = a.urgency || '';
        bValue = b.urgency || '';
      }
      if (sortConfig.key === 'status') {
        aValue = a.status || '';
        bValue = b.status || '';
      }
      if (sortConfig.key === 'title') {
        aValue = a.title || '';
        bValue = b.title || '';
      }
      if (sortConfig.key === 'id') {
        aValue = a.id;
        bValue = b.id;
      }
      if (sortConfig.key === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }
      if (sortConfig.key === 'servilityLevel') {
        aValue = a.servilityLevel || '';
        bValue = b.servilityLevel || '';
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredTickets, sortConfig]);

  // Pagination on sorted tickets
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = sortedTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditClick = (ticket) => {
    setEditingTicketId(ticket.id);
    setEditingUrgency(ticket.urgency || '');
  };

  const handleEditUrgencyChange = (e) => {
    setEditingUrgency(e.target.value);
  };

  const handleEditSave = async (ticketId) => {
    try {
      // Always send a plain string, not a stringified value
      await ticketAPI.updateTicketUrgency(ticketId, editingUrgency.trim().toUpperCase());
      setTickets((prev) => prev.map(t => t.id === ticketId ? { ...t, urgency: editingUrgency.trim().toUpperCase() } : t));
      setEditingTicketId(null);
    } catch (err) {
      alert('Failed to update priority');
    }
  };

  const handleEditCancel = () => {
    setEditingTicketId(null);
    setEditingUrgency('');
  };

  if (loading) return <div className="alltickets-empty-state">Loading tickets...</div>;
  if (error) return <div className="alltickets-empty-state">Error: {error}</div>;

  return (
    <div className="manager-page">
      <div className="manager-header">
        <div className="manager-header-content">
          <div>
            <h1>All Support Tickets</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="manager-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="alltickets-search-filter">
        <div className="alltickets-search-input-wrapper">
          <svg className="alltickets-search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search tickets by ID, title or customer..."
            className="alltickets-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="delete-button search-clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <select 
          className="alltickets-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="alltickets-table-wrapper">
        {currentTickets.length === 0 ? (
          <div className="alltickets-empty-state">No tickets found</div>
        ) : (
          <table className="alltickets-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Ticket ID{getSortIndicator('id')}</th>
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title{getSortIndicator('title')}</th>
                <th onClick={() => handleSort('engineer')} style={{ cursor: 'pointer' }}>Assigned To{getSortIndicator('engineer')}</th>
                <th onClick={() => handleSort('urgency')} style={{ cursor: 'pointer' }}>Priority{getSortIndicator('urgency')}</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status{getSortIndicator('status')}</th>
                <th onClick={() => handleSort('servilityLevel')} style={{ cursor: 'pointer' }}>Severity{getSortIndicator('servilityLevel')}</th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Created{getSortIndicator('createdAt')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td data-label="Ticket ID">#{ticket.id}</td>
                  <td data-label="Title">{ticket.title}</td>
                  <td>
                    {ticket.engineer
                      ? (typeof ticket.engineer === 'object'
                          ? `${ticket.engineer.name}`
                          : ticket.engineer)
                      : 'Unassigned'}
                  </td>
                  <td>
                    {editingTicketId === ticket.id ? (
                      <select value={editingUrgency} onChange={handleEditUrgencyChange}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    ) : (
                      <span className={`manager-status-badge urgency-${(ticket.urgency || '').toLowerCase().trim()}`}>
                        {ticket.urgency ? ticket.urgency.toUpperCase() : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`manager-status-badge status-${(ticket.status || '').toLowerCase() === 'open' ? 'active' : 
                      (ticket.status || '').toLowerCase() === 'resolved' ? 'inactive' : 'pending'}`}> {ticket.status || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`manager-status-badge severity-${(ticket.servilityLevel || '').toLowerCase().trim()}`}>{ticket.servilityLevel ? ticket.servilityLevel.toUpperCase() : 'N/A'}</span>
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <button className="action-button view-button" onClick={() => navigate(`/manager/tickets/${ticket.id}`)}>View</button>
                    <button className="action-button edit-button" onClick={() => navigate(`/manager/tickets/${ticket.id}/assign`)}>Assign</button>
                    {editingTicketId === ticket.id ? (
                      <>
                        <button className="action-button save-button" onClick={() => handleEditSave(ticket.id)}>Save</button>
                        <button className="action-button cancel-button" onClick={handleEditCancel}>Cancel</button>
                      </>
                    ) : (
                      <button className="action-button edit-priority-button" onClick={() => handleEditClick(ticket)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="alltickets-pagination">
        {Array.from({ length: Math.ceil(sortedTickets.length / ticketsPerPage) }).map((_, index) => (
          <button
            key={index}
            className={`alltickets-pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllTickets;
