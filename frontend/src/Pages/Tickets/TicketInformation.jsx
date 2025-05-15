import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TicketInformation.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ticketAPI } from '../../services/api';

const TicketInformation = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketAPI.getTickets();
        setTickets(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="ticket-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading tickets...</p>
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

  if (!tickets.length) {
    return (
      <div className="ticket-not-found">
        <i className="fas fa-ticket-alt"></i>
        <p>No tickets found</p>
        <button onClick={() => navigate('/tickets')}>Back to Tickets</button>
      </div>
    );
  }

  return (
    <div className="ticket-list-page">
      <div className="ticket-list-container">
        <h1>My Tickets</h1>
        <ul className="ticket-list">
          {tickets.map(ticket => (
            <li key={ticket.id} className="ticket-list-item" onClick={() => navigate(`/tickets/${ticket.id}`)}>
              <div className="ticket-list-title">{ticket.title || 'Untitled Ticket'}</div>
              <div className="ticket-list-meta">
                <span>#{ticket.id}</span>
                <span>Status: {ticket.status}</span>
                <span>Urgency: {ticket.urgency}</span>
                <span>Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TicketInformation;
