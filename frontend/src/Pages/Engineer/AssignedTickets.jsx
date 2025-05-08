import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Engineer.css';

const AssignedTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const fetchAssignedTickets = async () => {
    try {
      // Get the current user's ID from profile
      const profileResponse = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profileData = await profileResponse.json();
      const engineerId = profileData.id;
      
      // Fetch tickets assigned to this engineer
      const ticketsResponse = await fetch(`/api/tickets/engineer/${engineerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!ticketsResponse.ok) {
        throw new Error('Failed to fetch assigned tickets');
      }
      
      const ticketsData = await ticketsResponse.json();
      setTickets(ticketsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/api/tickets/status/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      
      // Refresh tickets after update
      fetchAssignedTickets();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    // Apply status filter
    if (filter !== 'ALL' && ticket.status !== filter) {
      return false;
    }
    
    // Apply search term filter (case insensitive)
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  };

  const getUrgencyClass = (urgency) => {
    switch(urgency) {
      case 'LOW': return 'urgency-low';
      case 'MEDIUM': return 'urgency-medium';
      case 'HIGH': return 'urgency-high';
      case 'CRITICAL': return 'urgency-critical';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="engineer-container">
      <h2>Assigned Tickets</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="ticket-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Tickets</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => navigate('/engineer/create-ticket')}
        >
          Create New Ticket
        </button>
      </div>
      
      {filteredTickets.length === 0 ? (
        <div className="no-tickets">No tickets found matching your criteria.</div>
      ) : (
        <div className="tickets-list">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>{ticket.title}</h3>
                <div className={`ticket-status ${getStatusClass(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </div>
              </div>
              
              <div className="ticket-details">
                <p className="ticket-description">{ticket.description}</p>
                
                <div className="ticket-metadata">
                  <span className={`ticket-urgency ${getUrgencyClass(ticket.urgency)}`}>
                    {ticket.urgency}
                  </span>
                  <span className="ticket-type">{ticket.type}</span>
                  <span className="ticket-product">{ticket.product}</span>
                  <span className="ticket-date">Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="ticket-actions">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  className="status-dropdown"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                
                <button 
                  className="btn-secondary"
                  onClick={() => navigate(`/engineer/ticket/${ticket.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedTickets;
