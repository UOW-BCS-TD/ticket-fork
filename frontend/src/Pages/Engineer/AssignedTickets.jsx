import React, { useState, useEffect } from 'react';
import '../Tickets/TicketInformation.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AssignedTickets = () => {
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conversation');
  const [activeTicket, setActiveTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [escalating, setEscalating] = useState(false);
  const [escalateError, setEscalateError] = useState(null);
  const [escalateSuccess, setEscalateSuccess] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get engineer ID from profile
        const profileResponse = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!profileResponse.ok) throw new Error('Failed to fetch user profile');
        const profileData = await profileResponse.json();
        const engineerId = profileData.engineerId ;
        // Fetch tickets assigned to this engineer
        const ticketsResponse = await fetch(`/api/tickets/engineer/${engineerId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!ticketsResponse.ok) throw new Error('Failed to fetch assigned tickets');
        const data = await ticketsResponse.json();
        setTicketList(data);
        if (data && data.length > 0) {
          setActiveTicket(data[0].id);
        }
      } catch (err) {
        setError('Failed to fetch tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = ticketList.filter(ticket => 
    (typeof ticket.title === 'string' && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (typeof ticket.id === 'string' && ticket.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get the active ticket data
  const currentTicket = ticketList.find(ticket => ticket.id === activeTicket) || ticketList[0] || {};

  // Helper to parse ticket history JSON
  const parseHistory = (history) => {
    if (!history) return [];
    try {
      return JSON.parse(history);
    } catch {
      return [];
    }
  };

  // Helper to format timestamps nicely
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    if (isNaN(d)) return '-';
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  const handleTicketClick = (ticketId) => {
    setActiveTicket(ticketId);
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !currentTicket?.id) return;
    setSending(true);
    setSendError(null);
    try {
      const response = await fetch(`/api/tickets/${currentTicket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: reply })
      });
      if (!response.ok) throw new Error('Failed to send reply');
      const updated = await response.json();
      setTicketList((prev) => prev.map(t => t.id === currentTicket.id ? { ...t, history: updated.history, updatedAt: updated.updatedAt } : t));
      setReply("");
    } catch (err) {
      setSendError("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!currentTicket?.id) return;
    setEscalating(true);
    setEscalateError(null);
    setEscalateSuccess(null);
    try {
      const response = await fetch(`/api/tickets/${currentTicket.id}/escalate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to escalate ticket');
      const updated = await response.json();
      setTicketList((prev) => prev.map(t => t.id === currentTicket.id ? { ...t, ...updated } : t));
      setEscalateSuccess('Ticket escalated successfully!');
    } catch (err) {
      setEscalateError('Failed to escalate ticket.');
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="ticket-view-container">
      <div className="sidebar-toggle" onClick={() => {
        const sidebar = document.querySelector('.ticket-left-panel');
        const toggle = document.querySelector('.sidebar-toggle');
        sidebar.classList.toggle('active');
        toggle.classList.toggle('active');
      }}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="ticket-main">
        <div className="ticket-panels-container">
          <div className="ticket-left-panel">
            <div className="ticket-illustration">
              <i className="fas fa-headset"></i>
            </div>
            <div className="ticket-panel-content">
              <h3>Assigned Tickets</h3>
              <p>All tickets assigned to you as an engineer.</p>
              <div className="search-ticket-container">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-ticket-input"
                />
              </div>
              {loading ? (
                <div className="empty-state">Loading tickets...</div>
              ) : error ? (
                <div className="empty-state">{error}</div>
              ) : (
                <div className="ticket-list-section">
                  <div className="ticket-items-container">
                    {filteredTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className={`ticket-item ${activeTicket === ticket.id ? 'active' : ''}`}
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        <div className="ticket-item-header">
                          <h4>{ticket.title}</h4>
                          <span className={`ticket-item-status ${ticket.status}`}>{ticket.status}</span>
                        </div>
                        <div className="ticket-item-meta">
                          <span className="ticket-item-id">#{ticket.id}</span>
                          <span className="ticket-item-date">{currentTicket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="ticket-meta-info">
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Created: {currentTicket.createdAt ? new Date(currentTicket.createdAt).toLocaleString() : '-'}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Last Updated: {currentTicket.updatedAt ? new Date(currentTicket.updatedAt).toLocaleString() : '-'}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-tag"></i>
                  <span>Priority: {currentTicket.urgency}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-folder"></i>
                  <span>Category: {currentTicket.type && currentTicket.type.name ? currentTicket.type.name : '-'}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-user"></i>
                  <span>Customer: {currentTicket.customer && currentTicket.customer.name ? currentTicket.customer.name : '-'}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email: {currentTicket.customer && currentTicket.customer.email ? currentTicket.customer.email : '-'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ticket-right-panel">
            {!loading && ticketList.length === 0 ? (
              <div className="ticket-content-wrapper">
                <div className="empty-state" style={{marginTop: '40px', fontSize: '1.1em', textAlign: 'center'}}>
                  <span className="empty-icon"><i className="fas fa-comments"></i></span>
                  You don't have any assigned tickets yet.
                </div>
              </div>
            ) : (
              <div className="ticket-content-wrapper">
                <div className="ticket-header">
                  <div className="ticket-title-section" aria-label="Ticket Title Section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span className="ticket-id" aria-label="Ticket ID">#{currentTicket.id}</span>
                      <span className={`ticket-status ${currentTicket.status}`} aria-label="Ticket Status">{currentTicket.status}</span>
                     
                    </div>
                    <h2 className="ticket-title" aria-label="Ticket Title">{currentTicket.title}</h2>
                  </div>
                  <div className="ticket-tabs">
                    <div 
                      className={`ticket-tab ${activeTab === 'conversation' ? 'active' : ''}`}
                      onClick={() => setActiveTab('conversation')}
                    >
                      <i className="fas fa-comments"></i> Conversation
                    </div>
                    <div 
                      className={`ticket-tab ${activeTab === 'attachments' ? 'active' : ''}`}
                      onClick={() => setActiveTab('attachments')}
                    >
                      <i className="fas fa-paperclip"></i> Attachments
                    </div>
                    <div 
                      className={`ticket-tab ${activeTab === 'related' ? 'active' : ''}`}
                      onClick={() => setActiveTab('related')}
                    >
                      <i className="fas fa-link"></i> Related Information
                    </div>
                  </div>
                </div>
                <div className="estimated-time" style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                  {/* Escalate button for engineers */}
                  {currentTicket.status !== 'ESCALATED' && currentTicket.status !== 'CLOSED' && (
                    <button
                      className="escalate-btn"
                      onClick={handleEscalate}
                      disabled={escalating}
                      title="Escalate this ticket to a higher-level engineer"
                    >
                      {escalating ? 'Escalating...' : <><i className="fas fa-arrow-up"></i> Escalate Ticket</>}
                    </button>
                  )}
                </div>
                {activeTab === 'conversation' && (
                  <div className="interaction-history">
                    <h4>Conversation History</h4>
                    {parseHistory(currentTicket.history).length === 0 ? (
                      <div className="empty-state">No conversation yet. Start the conversation below.</div>
                    ) : (
                      parseHistory(currentTicket.history).map((msg, idx) => (
                        <div key={idx} className={`interaction ${msg.role === 'engineer' ? 'agent-message' : 'customer-message'}`}>
                          <span className="time">{formatMessageTime(msg.timestamp)}</span>
                          <span className="sender">{msg.role === 'engineer' ? 'Engineer' : 'User'}:</span>
                          <p>{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {activeTab === 'attachments' && (
                  <div className="attachments-section">
                    <h4>Attached Files</h4>
                    <p className="no-attachments">No files have been attached to this ticket.</p>
                  </div>
                )}
                {activeTab === 'related' && (
                  <div className="related-info-section">
                    <h4>Related Information</h4>
                    <div className="related-tickets">
                      <h5>Related Tickets</h5>
                      <p className="no-related">No related tickets found.</p>
                    </div>
                    <div className="suggested-articles">
                      <h5>Suggested Knowledge Base Articles</h5>
                      <a href="#" className="article-link">
                        <i className="fas fa-file-alt"></i>
                        Common Support Issues and Solutions
                      </a>
                      <a href="#" className="article-link">
                        <i className="fas fa-file-alt"></i>
                        How to Provide Effective Information for Support
                      </a>
                      <a href="#" className="article-link">
                        <i className="fas fa-file-alt"></i>
                        Troubleshooting Guide for {currentTicket.type && currentTicket.type.name ? currentTicket.type.name : '-'}
                      </a>
                    </div>
                  </div>
                )}
                {/* Only show reply box for the Conversation tab */}
                {activeTab === 'conversation' && (
                  <div className="reply-box">
                    <textarea 
                      placeholder="Type your reply here..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      disabled={sending}
                    ></textarea>
                    <div className="reply-actions">
                      <div className="attach-file">
                        <i className="fas fa-paperclip"></i>
                        <span>Attach File</span>
                      </div>
                      <button className="send-btn" onClick={handleSendReply} disabled={sending || !reply.trim()}>
                        <i className="fas fa-paper-plane"></i> {sending ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                    {sendError && <div className="error-message" style={{ color: 'red', marginTop: 8 }}>{sendError}</div>}
                  </div>
                )}
                {/* Escalate success/error messages */}
                {escalateSuccess && <div className="success-message" style={{ color: 'green', marginBottom: 8 }}>{escalateSuccess}</div>}
                {escalateError && <div className="error-message" style={{ color: 'red', marginBottom: 8 }}>{escalateError}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedTickets;
