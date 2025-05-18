import React, { useState, useEffect } from 'react';
import './Manager.css';
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

  // Get current tickets for pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="empty-state">Loading tickets...</div>;
  if (error) return <div className="empty-state">Error: {error}</div>;

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h1 className="manager-title">All Support Tickets</h1>
        <div className="manager-actions">
          <button className="action-button edit-button">Create Ticket</button>
        </div>
      </div>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search tickets by ID, title or customer..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
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

      {currentTickets.length === 0 ? (
        <div className="empty-state">No tickets found</div>
      ) : (
        <>
          <table className="manager-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td data-label="Ticket ID">#{ticket.id}</td>
                  <td data-label="Title">{ticket.title}</td>
                  <td>
                    {ticket.customer
                      ? (typeof ticket.customer === 'object'
                          ? ticket.customer.name || ticket.customer.email || `ID: ${ticket.customer.id}`
                          : ticket.customer)
                      : 'N/A'}
                  </td>
                  <td>
                    {ticket.engineer
                      ? (typeof ticket.engineer === 'object'
                          ? `${ticket.engineer.name}${ticket.engineer.email ? ` (${ticket.engineer.email})` : ''}`
                          : ticket.engineer)
                      : 'Unassigned'}
                  </td>
                  <td>
                    <span className={`status-badge urgency-${(ticket.urgency || '').toLowerCase().trim()}`}>
                      {ticket.urgency || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${(ticket.status || '').toLowerCase() === 'open' ? 'active' : 
                                                           (ticket.status || '').toLowerCase() === 'resolved' ? 'inactive' : 
                                                           'pending'}`}>
                      {ticket.status || 'N/A'}
                    </span>
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="action-button view-button" onClick={() => navigate(`/manager/tickets/${ticket.id}`)}>View</button>
                    <button className="action-button edit-button" onClick={() => navigate(`/manager/tickets/${ticket.id}/assign`)}>Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredTickets.length / ticketsPerPage) }).map((_, index) => (
              <button
                key={index}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllTickets;
