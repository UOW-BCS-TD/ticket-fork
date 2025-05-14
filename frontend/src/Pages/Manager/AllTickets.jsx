import React, { useState, useEffect } from 'react';
import './Manager.css';

const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get('/api/tickets');
        setTickets(response.data);
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
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <option value="open">Open</option>
          <option value="in progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
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
                  <td>#{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.customer}</td>
                  <td>{ticket.assignedTo || 'Unassigned'}</td>
                  <td>
                    <span className={`status-badge status-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${ticket.status === 'Open' ? 'active' : 
                                                           ticket.status === 'Resolved' ? 'inactive' : 
                                                           'pending'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="action-button view-button">View</button>
                    <button className="action-button edit-button">Assign</button>
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
