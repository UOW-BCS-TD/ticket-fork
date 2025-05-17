import React, { useState, useRef, useEffect } from 'react';
import './TicketInformation.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ticketAPI } from '../../Services/api';
import { sessionAPI } from '../../Services/api';
// import { format } from 'date-fns'; // Uncomment if date-fns is available

const TicketInformation = () => {
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conversation');
  const [activeTicket, setActiveTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [chatbotHistory, setChatbotHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ticketAPI.getTickets();
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

  useEffect(() => {
    const fetchSession = async () => {
      setSession(null);
      setSessionLoading(false);
      setSessionError(null);
      setChatbotHistory([]);
      if (!currentTicket || !currentTicket.session_id) return;
      setSessionLoading(true);
      try {
        // Fetch session info (for ticketSession flag)
        const sessionData = await sessionAPI.getSessionById(currentTicket.session_id);
        setSession(sessionData);
        // Fetch chatbot history from /history endpoint
        const historyResp = await sessionAPI.getSessionHistory(currentTicket.session_id);
        setChatbotHistory(Array.isArray(historyResp.history) ? historyResp.history : []);
      } catch (err) {
        setSessionError('Failed to fetch chatbot history.');
      } finally {
        setSessionLoading(false);
      }
    };
    if (currentTicket && currentTicket.session_id) {
      fetchSession();
    }
  }, [currentTicket]);

  // Fetch attachments when ticket changes or tab is attachments
  useEffect(() => {
    if (!currentTicket?.id || activeTab !== 'attachments') return;
    const fetchAttachments = async () => {
      try {
        const res = await fetch(`/api/tickets/${currentTicket.id}/attachments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch attachments');
        setAttachments(await res.json());
      } catch {
        setAttachments([]);
      }
    };
    fetchAttachments();
  }, [currentTicket.id, activeTab]);

  const handleTicketClick = (ticketId) => {
    setActiveTicket(ticketId);
  };

  const toggleSidebar = () => {
    const sidebar = document.querySelector('.ticket-left-panel');
    const toggle = document.querySelector('.sidebar-toggle');
    
    sidebar.classList.toggle('active');
    toggle.classList.toggle('active');
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    return d.toLocaleString();
  };

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
    // If you have date-fns, you can use:
    // return format(d, 'MMM dd, yyyy, HH:mm');
    // Otherwise, use toLocaleString with options:
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !currentTicket?.id) return;
    setSending(true);
    setSendError(null);
    try {
      const updated = await ticketAPI.sendMessageToTicket(currentTicket.id, { content: reply });
      // Update ticketList with new history for the active ticket
      setTicketList((prev) => prev.map(t => t.id === currentTicket.id ? { ...t, history: updated.history, updatedAt: updated.updatedAt } : t));
      setReply("");
    } catch (err) {
      setSendError("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentTicket?.id) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/tickets/${currentTicket.id}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess('File uploaded!');
      // Refresh list
      const listRes = await fetch(`/api/tickets/${currentTicket.id}/attachments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAttachments(await listRes.json());
    } catch (err) {
      setUploadError('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ticket-view-container">
      <div className="sidebar-toggle" onClick={toggleSidebar}>
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
              <h3>My Tickets</h3>
              <p>Track and manage your support requests with our team.</p>
              
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
                          <span className="ticket-item-date">{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="ticket-meta-info">
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Created: {formatDate(currentTicket.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Last Updated: {formatDate(currentTicket.updatedAt)}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-tag"></i>
                  <span>Priority: {currentTicket.urgency}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-folder"></i>
                  <span>Category: {currentTicket.type && currentTicket.type.name ? currentTicket.type.name : '-'}</span>
                </div>
              </div>
              
              {/* <div className="quick-actions">
                <button className="action-btn">
                  <i className="fas fa-edit"></i> Add More Details
                </button>
                <button className="action-btn secondary">
                  <i className="fas fa-times"></i> Close Ticket
                </button>
              </div> */}
            </div>
          </div>

          <div className="ticket-right-panel">
            {!loading && ticketList.length === 0 ? (
              <div className="ticket-content-wrapper">
                <div className="empty-state" style={{marginTop: '40px', fontSize: '1.1em', textAlign: 'center'}}>
                  <span className="empty-icon"><i className="fas fa-comments"></i></span>
                  You don't have any support tickets yet. If you have a question or need assistance, please visit our chatbot—it's ready to help you anytime!
                  <a href="http://localhost:5173/chatbot" className="btn btn-primary">
                  <i className="fas fa-robot"></i> Chat with Bot</a>
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
                    {session && session.ticketSession !== true && (
                      <div 
                        className={`ticket-tab ${activeTab === 'chatbot' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chatbot')}
                      >
                        <i className="fas fa-robot"></i> Chatbot History
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="estimated-time">
                  <i className="fas fa-hourglass-half"></i>
                  <div>
                    <strong>Estimated Resolution Time:</strong>
                    <p>Our team is working on your issue. Estimated time to resolution: 24-48 hours</p>
                  </div>
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
                    <input type="file" onChange={handleFileUpload} disabled={uploading} />
                    {uploadError && <div className="error-message" style={{ color: 'red' }}>{uploadError}</div>}
                    {uploadSuccess && <div className="success-message" style={{ color: 'green' }}>{uploadSuccess}</div>}
                    {attachments.length === 0 ? (
                      <p className="no-attachments">No files have been attached to this ticket.</p>
                    ) : (
                      <div className="attachment-list">
                        {attachments.map(att => (
                          <div className="attachment-item" key={att.id}>
                            <i className="fas fa-paperclip"></i>
                            <span className="attachment-name">{att.filename}</span>
                            <span className="attachment-date">{new Date(att.uploadedAt).toLocaleString()}</span>
                            <a href={`/api/tickets/${currentTicket.id}/attachments/${att.id}`} target="_blank" rel="noopener noreferrer" className="attachment-action-btn">
                              <i className="fas fa-download"></i> Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'related' && (
                  <div className="related-info-section">
                    <h4>Related Information</h4>
                    <div className="related-tickets">
                      <h5>Related Tickets</h5>
                      {currentTicket.id === 'TK-2023-001' ? (
                        <div className="related-ticket-item">
                          <span className="related-ticket-id">#TK-2023-042</span>
                          <span className="related-ticket-title">API Authentication Issues</span>
                          <span className="related-ticket-status resolved">Resolved</span>
                        </div>
                      ) : (
                        <p className="no-related">No related tickets found.</p>
                      )}
                    </div>
                    
                    <div className="suggested-articles">
                      <h5>Suggested Knowledge Base Articles</h5>
                      <a href="#" className="article-link">
                        <i className="fas fa-file-alt"></i>
                        {currentTicket.id === 'TK-2023-001' ? 'Troubleshooting Payment Gateway Integration Issues' : 'Common Support Issues and Solutions'}
                      </a>
                      <a href="#" className="article-link">
                        <i className="fas fa-file-alt"></i>
                        {currentTicket.id === 'TK-2023-001' ? 'Common API Authentication Errors and Solutions' : 'How to Provide Effective Information for Support'}
                      </a>
                      <a href="#" className="article-link">
                        <i className="fas fa-file-alt"></i>
                        {currentTicket.id === 'TK-2023-001' ? 
                          'Payment Processing Best Practices' : 
                          'Troubleshooting Guide for ' + currentTicket.type.name}
                      </a>
                    </div>
                  </div>
                )}
                
                {activeTab === 'chatbot' && session && session.ticketSession !== true && (
                  <div className="chatbot-history-section">
                    <h4>Chatbot Conversation History</h4>
                    {sessionLoading ? (
                      <div className="empty-state">Loading chatbot history...</div>
                    ) : sessionError ? (
                      <div className="empty-state">{sessionError}</div>
                    ) : chatbotHistory.length > 0 ? (
                      <div className="interaction-history">
                        {chatbotHistory.map((msg, idx) => (
                          <div key={idx} className={`interaction ${msg.role === 'user' ? 'customer-message' : 'agent-message'}`}>
                            <span className="time">{formatMessageTime(msg.timestamp)}</span>
                            <span className="sender">{msg.role === 'user' ? 'You' : 'Bot'}:</span>
                            <p>{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">No chatbot conversation found for this session.</div>
                    )}
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
                
                {/* <div className="satisfaction-survey">
                  <h4>How would you rate our support so far?</h4>
                  <div className="rating-options">
                    <div className="rating-option">
                      <i className="far fa-frown"></i>
                      <p>Poor</p>
                    </div>
                    <div className="rating-option">
                      <i className="far fa-meh"></i>
                      <p>Average</p>
                    </div>
                    <div className="rating-option">
                      <i className="far fa-smile"></i>
                      <p>Good</p>
                    </div>
                    <div className="rating-option">
                      <i className="far fa-grin-stars"></i>
                      <p>Excellent</p>
                    </div>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default TicketInformation;