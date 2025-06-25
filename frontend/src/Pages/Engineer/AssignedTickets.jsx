import React, { useState, useEffect } from 'react';
import '../Tickets/TicketInformation.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { sessionAPI, ticketAPI } from '../../Services/api';
import ChatbotHistory from '../Tickets/ChatbotHistory';

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
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState(null);
  const [resolveSuccess, setResolveSuccess] = useState(null);
  const [engineerLevel, setEngineerLevel] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [chatbotHistory, setChatbotHistory] = useState([]);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('LOW');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get engineer ID and level from profile
        const profileResponse = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!profileResponse.ok) throw new Error('Failed to fetch user profile');
        const profileData = await profileResponse.json();
        const engineerId = profileData.engineerId;
        setEngineerLevel(profileData.engineerLevel);
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

  // Fetch attachments when ticket changes or tab is attachments
  useEffect(() => {
    if (!activeTicket || activeTab !== 'attachments') return;
    const fetchAttachments = async () => {
      try {
        const res = await fetch(`/api/tickets/${activeTicket}/attachments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch attachments');
        setAttachments(await res.json());
      } catch {
        setAttachments([]);
      }
    };
    fetchAttachments();
  }, [activeTicket, activeTab]);

  // Only show tickets that are not CLOSED or RESOLVED
  const filteredTickets = ticketList.filter(ticket => 
    (ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED') &&
    (
      (typeof ticket.title === 'string' && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Get the active ticket data
  const currentTicket = filteredTickets.length > 0 ?
    (filteredTickets.find(ticket => ticket.id === activeTicket) || filteredTickets[0]) : {};

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
      setTicketList((prev) => prev.map(t => t.id === currentTicket.id ? { ...t, history: updated.history, updatedAt: updated.updatedAt,last_response_time: updated.updatedAt } : t));
      setReply("");
    } catch (err) {
      setSendError("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!currentTicket?.id) return;
    if (!window.confirm('Are you sure you want to escalate this ticket to a higher-level engineer?')) {
      return;
    }
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
      setTimeout(() => setEscalateSuccess(null), 3000);
    } catch (err) {
      setEscalateError('Failed to escalate ticket.');
      setTimeout(() => setEscalateError(null), 5000);
    } finally {
      setEscalating(false);
    }
  };

  const handleResolve = async () => {
    if (!currentTicket?.id) return;
    if (!window.confirm('Are you sure you want to mark this ticket as resolved?')) {
      return;
    }
    setResolving(true);
    setResolveError(null);
    setResolveSuccess(null);
    try {
      const response = await fetch(`/api/tickets/${currentTicket.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify('RESOLVED')
      });
      if (!response.ok) throw new Error('Failed to resolve ticket');
      const updated = await response.json();
      setTicketList((prev) => prev.map(t => t.id === currentTicket.id ? { ...t, ...updated } : t));
      setResolveSuccess('Ticket marked as resolved!');
      setTimeout(() => setResolveSuccess(null), 3000);
    } catch (err) {
      setResolveError('Failed to resolve ticket.');
      setTimeout(() => setResolveError(null), 5000);
    } finally {
      setResolving(false);
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
        // Fetch chatbot history from new engineer-specific endpoint
        const historyResp = await fetch(`/api/sessions/${currentTicket.session_id}/history/ticket/${currentTicket.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!historyResp.ok) throw new Error('Failed to fetch chatbot history');
        const historyJson = await historyResp.json();
        let historyArr = [];
        if (Array.isArray(historyJson.history)) {
          historyArr = historyJson.history;
        } else if (Array.isArray(historyJson.messages)) {
          historyArr = historyJson.messages;
        }
        setChatbotHistory(historyArr);
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

  const openSeverityModal = () => {
    setSelectedSeverity(currentTicket.servilityLevel || 'LOW');
    setShowSeverityModal(true);
  };

  const closeSeverityModal = () => {
    setShowSeverityModal(false);
  };

  const confirmSeverityChange = async () => {
    try {
      await ticketAPI.updateTicketServility(currentTicket.id, selectedSeverity);
      setTicketList((prev) => prev.map(t => t.id === currentTicket.id ? { ...t, servilityLevel: selectedSeverity } : t));
      closeSeverityModal();
    } catch (err) {
      alert('Failed to update severity level');
    }
  };

  return (
    <div className="engineer-ticket-view-container">
      <div className="engineer-sidebar-toggle" onClick={() => {
        const sidebar = document.querySelector('.engineer-ticket-left-panel');
        const toggle = document.querySelector('.engineer-sidebar-toggle');
        sidebar.classList.toggle('active');
        toggle.classList.toggle('active');
      }}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="engineer-ticket-main">
        <div className="engineer-ticket-panels-container">
          <div className="engineer-ticket-left-panel">
            <div className="engineer-ticket-illustration">
              <i className="fas fa-headset"></i>
            </div>
            <div className="engineer-ticket-panel-content">
              <h3>Assigned Tickets</h3>
              <p>All tickets assigned to you as an engineer.</p>
              <div className="engineer-search-ticket-container">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="engineer-search-ticket-input"
                />
              </div>
              {loading ? (
                <div className="engineer-empty-state">Loading tickets...</div>
              ) : error ? (
                <div className="engineer-empty-state">{error}</div>
              ) : (
                <div className="engineer-ticket-list-section">
                  <div className="engineer-ticket-items-container">
                    {filteredTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className={`engineer-ticket-item ${activeTicket === ticket.id ? 'active' : ''}`}
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        <div className="engineer-ticket-item-header">
                          <h4>{ticket.title}</h4>
                          <span className={`engineer-ticket-item-status ${ticket.status ? ticket.status.toLowerCase() : ''}`}>
                            {ticket.status ? ticket.status.replace(/_/g, ' ') : 'Unknown'}
                          </span>
                        </div>
                        <div className="engineer-ticket-item-meta">
                          <span className="engineer-ticket-item-id">#{ticket.id}</span>
                          <span className="engineer-ticket-item-date">{currentTicket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="engineer-ticket-meta-info">
                <div className="engineer-meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Created: {currentTicket.createdAt ? new Date(currentTicket.createdAt).toLocaleString() : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Last Updated: {currentTicket.updatedAt ? new Date(currentTicket.updatedAt).toLocaleString() : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-tag"></i>
                  <span>Priority: {currentTicket.urgency}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-folder"></i>
                  <span>Category: {currentTicket.type && currentTicket.type.name ? currentTicket.type.name : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-user"></i>
                  <span>Customer: {currentTicket.customer && currentTicket.customer.name ? currentTicket.customer.name : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email: {currentTicket.customer && currentTicket.customer.email ? currentTicket.customer.email : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span style={{ marginRight: 6 }}>Severity: </span>
                  <span>{currentTicket.servilityLevel}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="engineer-ticket-right-panel">
            {!loading && ticketList.length === 0 ? (
              <div className="engineer-ticket-content-wrapper">
                <div className="engineer-empty-state" style={{marginTop: '40px', fontSize: '1.1em', textAlign: 'center'}}>
                  <span className="engineer-empty-icon"><i className="fas fa-comments"></i></span>
                  You don't have any assigned tickets yet.
                </div>
              </div>
            ) : (
              <div className="engineer-ticket-content-wrapper">
                <div className="engineer-ticket-header">
                  <div className="engineer-ticket-title-section" aria-label="Ticket Title Section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="engineer-ticket-id" aria-label="Ticket ID">#{currentTicket.id}</span>
                      <h2 className="engineer-ticket-title" aria-label="Ticket Title">{currentTicket.title}</h2>
                      <span className={`engineer-ticket-item-status ${currentTicket.status ? currentTicket.status.toLowerCase() : ''}`} aria-label="Ticket Status">
                        {currentTicket.status ? currentTicket.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="engineer-ticket-tabs">
                    <div 
                      className={`engineer-ticket-tab ${activeTab === 'conversation' ? 'active' : ''}`}
                      onClick={() => setActiveTab('conversation')}
                    >
                      <i className="fas fa-comments"></i> Conversation
                    </div>
                    <div 
                      className={`engineer-ticket-tab ${activeTab === 'attachments' ? 'active' : ''}`}
                      onClick={() => setActiveTab('attachments')}
                    >
                      <i className="fas fa-paperclip"></i> Attachments
                    </div>
                    <div 
                      className={`engineer-ticket-tab ${activeTab === 'related' ? 'active' : ''}`}
                      onClick={() => setActiveTab('related')}
                    >
                      <i className="fas fa-link"></i> Related Information
                    </div>
                    {session && session.ticketSession !== true && (
                      <div 
                        className={`engineer-ticket-tab ${activeTab === 'chatbot' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chatbot')}
                      >
                        <i className="fas fa-robot"></i> Chatbot History
                      </div>
                    )}
                  </div>
                </div>
                <div className="engineer-estimated-time" style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                  {/* Escalate button for engineers */}
                  {engineerLevel !== 3 && currentTicket.status !== 'ESCALATED' && currentTicket.status !== 'CLOSED' && (
                    <button
                      className="engineer-escalate-btn"
                      onClick={handleEscalate}
                      disabled={escalating}
                      title="Escalate this ticket to a higher-level engineer"
                    >
                      {escalating ? 'Escalating...' : <><i className="fas fa-arrow-up"></i> Escalate Ticket</>}
                    </button>
                  )}
                  {/* Change severity button */}
                  {currentTicket.status !== 'RESOLVED' && currentTicket.status !== 'CLOSED' && (
                    <button
                      className="engineer-escalate-btn"
                      style={{ background: 'linear-gradient(90deg, #f39c12 60%, #d35400 100%)' }}
                      onClick={openSeverityModal}
                    >
                      <i className="fas fa-exclamation-triangle"></i> Change Severity
                    </button>
                  )}
                  {/* Mark as Resolved button for engineers */}
                  {currentTicket.status !== 'RESOLVED' && currentTicket.status !== 'CLOSED' && (
                    <button
                      className="engineer-escalate-btn"
                      style={{ background: 'linear-gradient(90deg, #2ecc71 60%, #27ae60 100%)' }}
                      onClick={handleResolve}
                      disabled={resolving}
                      title="Mark this ticket as resolved"
                    >
                      {resolving ? 'Resolving...' : <><i className="fas fa-check"></i> Mark as Resolved</>}
                    </button>
                  )}
                </div>
                {activeTab === 'conversation' && (
                  <div className="engineer-interaction-history">
                    <h4>Conversation History</h4>
                    {parseHistory(currentTicket.history).length === 0 ? (
                      <div className="engineer-empty-state">No conversation yet. Start the conversation below.</div>
                    ) : (
                      parseHistory(currentTicket.history).map((msg, idx) => (
                        <div key={idx} className={`engineer-interaction ${msg.role === 'engineer' ? 'agent-message' : 'customer-message'}`}>
                          <span className="time">{formatMessageTime(msg.timestamp)}</span>
                          <span className="sender">{msg.role === 'engineer' ? 'Engineer' : 'User'}:</span>
                          <p>{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {activeTab === 'attachments' && (
                  <div className="engineer-attachments-section">
                    <div className="engineer-attachments-header">
                      <h4>Attached Files</h4>
                      <div>
                        {currentTicket.status !== 'RESOLVED' && currentTicket.status !== 'CLOSED' ? (
                          <label className="engineer-custom-file-upload">
                            <input type="file" onChange={handleFileUpload} disabled={uploading} />
                            <i className="fas fa-upload"></i> {uploading ? "Uploading..." : "Upload File"}
                          </label>
                        ) : null}
                        {(currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED') && (
                          <div className="engineer-info-message" style={{ color: '#888', marginBottom: 12 }}>
                            This ticket is closed. You cannot reply or upload attachments.
                          </div>
                        )}
                      </div>
                    </div>
                    {uploadError && <div className="engineer-error-message" style={{ color: 'red' }}>{uploadError}</div>}
                    {uploadSuccess && <div className="engineer-success-message" style={{ color: 'green' }}>{uploadSuccess}</div>}
                    {attachments.length === 0 ? (
                      <p className="engineer-no-attachments">No files have been attached to this ticket.</p>
                    ) : (
                      <div className="engineer-attachment-list">
                        {attachments.map(att => (
                          <div className="engineer-attachment-item" key={att.id}>
                            <i className="fas fa-paperclip"></i>
                            <span className="engineer-attachment-name">{att.filename}</span>
                            <span className="engineer-attachment-date">{new Date(att.uploadedAt).toLocaleString()}</span>
                            <a href={`/api/tickets/${currentTicket.id}/attachments/${att.id}`} target="_blank" rel="noopener noreferrer" className="engineer-attachment-action-btn">
                              <i className="fas fa-download attachment_download"></i> Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'related' && (
                  <div className="engineer-related-info-section">
                    <h4>Related Information</h4>
                    <div className="related-tickets">
                      <h5>Related Tickets</h5>
                      <p className="engineer-no-related">No related tickets found.</p>
                    </div>
                    <div className="engineer-suggested-articles">
                      <h5>Suggested Knowledge Base Articles</h5>
                      <a href="#" className="engineer-article-link">
                        <i className="fas fa-file-alt"></i>
                        Common Support Issues and Solutions
                      </a>
                      <a href="#" className="engineer-article-link">
                        <i className="fas fa-file-alt"></i>
                        How to Provide Effective Information for Support
                      </a>
                      <a href="#" className="engineer-article-link">
                        <i className="fas fa-file-alt"></i>
                        Troubleshooting Guide for {currentTicket.type && currentTicket.type.name ? currentTicket.type.name : '-'}
                      </a>
                    </div>
                  </div>
                )}
                {activeTab === 'chatbot' && session && session.ticketSession !== true && (
                  <ChatbotHistory
                    chatbotHistory={chatbotHistory}
                    loading={sessionLoading}
                    error={sessionError}
                    formatMessageTime={formatMessageTime}
                  />
                )}
                {/* Only show reply box for the Conversation tab */}
                {activeTab === 'conversation' && (
                  <div className="engineer-reply-box">
                    <textarea 
                      placeholder="Type your reply here..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      disabled={sending}
                    ></textarea>
                    <div className="engineer-reply-actions">
                      <label className="engineer-attach-file" style={{ cursor: 'pointer' }}>
                        <input 
                          type="file" 
                          onChange={handleFileUpload} 
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                        <i className="fas fa-paperclip"></i>
                        <span>{uploading ? "Uploading..." : "Attach File"}</span>
                      </label>
                      <button className="engineer-send-btn" onClick={handleSendReply} disabled={sending || !reply.trim()}>
                        <i className="fas fa-paper-plane"></i> {sending ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                    {uploadError && <div className="engineer-error-message" style={{ color: 'red', marginTop: 4 }}>{uploadError}</div>}
                    {uploadSuccess && <div className="engineer-success-message" style={{ color: 'green', marginTop: 4 }}>{uploadSuccess}</div>}
                    {sendError && <div className="engineer-error-message" style={{ color: 'red', marginTop: 8 }}>{sendError}</div>}
                  </div>
                )}
                {/* Escalate success/error messages */}
                {escalateSuccess && <div className="engineer-success-message" style={{ color: 'green', marginBottom: 8 }}>{escalateSuccess}</div>}
                {escalateError && <div className="engineer-error-message" style={{ color: 'red', marginBottom: 8 }}>{escalateError}</div>}
                {resolveSuccess && <div className="engineer-success-message" style={{ color: 'green', marginBottom: 8 }}>{resolveSuccess}</div>}
                {resolveError && <div className="engineer-error-message" style={{ color: 'red', marginBottom: 8 }}>{resolveError}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
      {showSeverityModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right:0, bottom:0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: '90%', maxWidth: 400 }}>
            <h3 style={{ marginTop: 0 }}>Change Severity Level</h3>
            <select value={selectedSeverity} onChange={(e)=>setSelectedSeverity(e.target.value)} style={{ width: '100%', padding: 8 }}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="engineer-escalate-btn" onClick={confirmSeverityChange}>Confirm</button>
              <button className="engineer-escalate-btn" style={{ background: '#777' }} onClick={closeSeverityModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedTickets;
