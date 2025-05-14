import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TicketInformation.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ticketAPI, userService } from '../../services/api';

const TicketInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Ticket ID from params:', id);
      
      if (!id) {
        console.log('No ID provided');
        setError('Invalid ticket ID');
        setLoading(false);
        return;
      }

      try {
        // Get current user
        console.log('Fetching current user...');
        const userResponse = await userService.getCurrentUserProfile();
        console.log('Current user:', userResponse.data);
        setCurrentUser(userResponse.data);

        // Get all tickets for the current user
        console.log('Fetching all tickets...');
        const ticketsResponse = await ticketAPI.getTickets();
        console.log('All tickets:', ticketsResponse.data);
        
        const userTickets = ticketsResponse.data.filter(t => 
          t.customer.id === userResponse.data.id
        );
        console.log('User tickets:', userTickets);

        // Find the specific ticket
        const ticketId = parseInt(id);
        console.log('Looking for ticket with ID:', ticketId);
        const foundTicket = userTickets.find(t => t.id === ticketId);
        console.log('Found ticket:', foundTicket);
        
        if (!foundTicket) {
          console.log('Ticket not found in user tickets');
          setError('Ticket not found or you do not have permission to view it');
          setLoading(false);
          return;
        }

        // Get detailed ticket information
        console.log('Fetching detailed ticket information...');
        const ticketResponse = await ticketAPI.getTicketById(id);
        console.log('Detailed ticket info:', ticketResponse.data);
        setTicket(ticketResponse.data);
      } catch (err) {
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        if (err.response?.status === 403) {
          setError('You do not have permission to view this ticket');
        } else if (err.response?.status === 404) {
          setError('Ticket not found');
        } else {
          setError(err.response?.data?.message || 'Failed to load ticket information');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await ticketAPI.updateTicketStatus(id, newStatus);
      setTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket status');
      console.error('Error updating ticket:', err);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const response = await ticketAPI.updateTicketUrgency(id, newPriority);
      setTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket priority');
      console.error('Error updating ticket:', err);
    }
  };

  const handleAssignEngineer = async (engineerId) => {
    try {
      const response = await ticketAPI.assignEngineer(id, engineerId);
      setTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign engineer');
      console.error('Error assigning engineer:', err);
    }
  };

  if (loading) {
    return (
      <div className="ticket-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading ticket information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => navigate('/tickets')}>Back to Tickets</button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-not-found">
        <i className="fas fa-ticket-alt"></i>
        <p>Ticket not found</p>
        <button onClick={() => navigate('/tickets')}>Back to Tickets</button>
      </div>
    );
  }

  return (
    <div className="ticket-information-page">
      <div className="ticket-information-container">
        <div className="ticket-header">
          <div className="ticket-title-section">
            <h1>{ticket.title}</h1>
            <div className="ticket-meta">
              <span className="ticket-id">#{ticket.id}</span>
              <span className="ticket-date">Created: {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="ticket-actions">
            <button className="ticket-action-btn" onClick={() => navigate(`/tickets/${id}/edit`)}>
              <i className="fas fa-edit"></i> Edit
            </button>
            <button className="ticket-action-btn ticket-delete-btn">
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>

        <div className="ticket-content">
          <div className="ticket-main-info">
            <div className="ticket-section">
              <h3>Description</h3>
              <p>{ticket.description}</p>
            </div>

            <div className="ticket-section">
              <h3>Status</h3>
              <div className="ticket-status-options">
                <button 
                  className={`status-btn ${ticket.status === 'OPEN' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('OPEN')}
                >
                  Open
                </button>
                <button 
                  className={`status-btn ${ticket.status === 'IN_PROGRESS' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                >
                  In Progress
                </button>
                <button 
                  className={`status-btn ${ticket.status === 'RESOLVED' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('RESOLVED')}
                >
                  Resolved
                </button>
                <button 
                  className={`status-btn ${ticket.status === 'CLOSED' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('CLOSED')}
                >
                  Closed
                </button>
              </div>
            </div>

            <div className="ticket-section">
              <h3>Priority</h3>
              <div className="ticket-priority-options">
                <button 
                  className={`priority-btn ${ticket.urgency === 'LOW' ? 'active' : ''}`}
                  onClick={() => handlePriorityChange('LOW')}
                >
                  Low
                </button>
                <button 
                  className={`priority-btn ${ticket.urgency === 'MEDIUM' ? 'active' : ''}`}
                  onClick={() => handlePriorityChange('MEDIUM')}
                >
                  Medium
                </button>
                <button 
                  className={`priority-btn ${ticket.urgency === 'HIGH' ? 'active' : ''}`}
                  onClick={() => handlePriorityChange('HIGH')}
                >
                  High
                </button>
                <button 
                  className={`priority-btn ${ticket.urgency === 'CRITICAL' ? 'active' : ''}`}
                  onClick={() => handlePriorityChange('CRITICAL')}
                >
                  Critical
                </button>
              </div>
            </div>
          </div>

          <div className="ticket-sidebar">
            <div className="ticket-section">
              <h3>Customer Information</h3>
              <div className="ticket-customer-info">
                <p><strong>Name:</strong> {ticket.customer.name}</p>
                <p><strong>Email:</strong> {ticket.customer.email}</p>
              </div>
            </div>

            <div className="ticket-section">
              <h3>Product</h3>
              <div className="ticket-product-info">
                <p><strong>Name:</strong> {ticket.product.name}</p>
                <p><strong>Description:</strong> {ticket.product.description}</p>
              </div>
            </div>

            <div className="ticket-section">
              <h3>Ticket Type</h3>
              <div className="ticket-type-info">
                <p><strong>Type:</strong> {ticket.type.name}</p>
                <p><strong>Description:</strong> {ticket.type.description}</p>
              </div>
            </div>

            <div className="ticket-section">
              <h3>Assigned Engineer</h3>
              <div className="ticket-engineer-info">
                {ticket.engineer ? (
                  <>
                    <p><strong>Name:</strong> {ticket.engineer.name}</p>
                    <p><strong>Email:</strong> {ticket.engineer.email}</p>
                  </>
                ) : (
                  <p>No engineer assigned</p>
                )}
              </div>
            </div>

            <div className="ticket-section">
              <h3>Session Information</h3>
              <div className="ticket-session-info">
                <p><strong>Session ID:</strong> {ticket.session.id}</p>
                <p><strong>Start Time:</strong> {new Date(ticket.session.startTime).toLocaleString()}</p>
                {ticket.session.endTime && (
                  <p><strong>End Time:</strong> {new Date(ticket.session.endTime).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketInformation;
