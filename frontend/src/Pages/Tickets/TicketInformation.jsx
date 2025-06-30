import React, { useState, useRef, useEffect } from 'react';
import './TicketInformation.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ticketAPI } from '../../Services/api';
import { sessionAPI } from '../../Services/api';
import ChatbotHistory from './ChatbotHistory';
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
  const [selectedFileName, setSelectedFileName] = useState("");
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DESC'); // 'ASC' or 'DESC'
  const [showEmergencyToast, setShowEmergencyToast] = useState(true);
  
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ticketAPI.getTicketsOwn();
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

  useEffect(() => {
    setSortOrder('DESC');
  }, []);

  const filteredTickets = ticketList
    .filter(ticket => 
      (typeof ticket.title === 'string' && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (typeof ticket.id === 'string' && ticket.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(ticket => 
      statusFilter === 'ALL' || ticket.status === statusFilter
    )
    .sort((a, b) => {
      if (sortOrder === 'ASC') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

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
        // Accept both .history and .messages as possible keys
        let historyArr = [];
        if (Array.isArray(historyResp.history)) {
          historyArr = historyResp.history;
        } else if (Array.isArray(historyResp.messages)) {
          historyArr = historyResp.messages;
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
    const sidebar = document.querySelector('.customer-ticket-left-panel');
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
    setSelectedFileName(file ? file.name : "");
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

  const handleDownloadAttachment = async (attachmentId, filename) => {
    try {
      const res = await fetch(`/api/tickets/${currentTicket.id}/attachments/${attachmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to download file');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'attachment';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download file.');
    }
  };

  return (
    <div className="customer-ticket-view-container">
      {/* Emergency Toast */}
      {showEmergencyToast && (
        <div className="emergency-toast">
          <span>For Emergency, Please call <b>+852-91234567</b></span>
          <button className="emergency-toast-close" onClick={() => setShowEmergencyToast(false)}>&times;</button>
        </div>
      )}
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <div className="customer-ticket-main">
        <div className="customer-ticket-panels-container">
          <div className="customer-ticket-left-panel">
            <div className="customer-ticket-illustration">
              <i className="fas fa-headset"></i>
            </div>
            <div className="customer-ticket-panel-content">
              <h3>My Tickets</h3>
              <p>Track and manage your support requests with our team.</p>
              
              <div className="customer-search-ticket-container">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="customer-search-ticket-input"
                />
              </div>
              
              <div className="ticket-filters-row">
                <div className="ticket-filter-group" style={{ flex: '3' }}>
                  <label htmlFor="statusFilter"></label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="ticket-filter-select"
                    style={{ width: '100%' }}
                  >
                    <option value="ALL">All</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                <div className="ticket-filter-group" style={{ flex: '1', justifyContent: 'flex-end' }}>
                  <label htmlFor="sortOrder" style={{ marginRight: 8 }}></label>
                  <button
                    id="sortOrder"
                    type="button"
                    className="ticket-sort-btn"
                    onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                    aria-label={sortOrder === 'ASC' ? 'Sort Descending' : 'Sort Ascending'}
                  >
                    {sortOrder === 'ASC' ? (
                      <i className="fas fa-arrow-up"></i>
                    ) : (
                      <i className="fas fa-arrow-down"></i>
                    )}
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="customer-empty-state">Loading tickets...</div>
              ) : error ? (
                <div className="customer-empty-state">{error}</div>
              ) : (
                <div className="customer-ticket-list-section">
                  <div className="customer-ticket-items-container">
                    {filteredTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className={`customer-ticket-items ${activeTicket === ticket.id ? 'active' : ''}`}
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        <div className="customer-ticket-item-header">
                          <span className="customer-ticket-title">{(ticket.title && ticket.title.length > 20) ? ticket.title.slice(0, 20) + '...' : (ticket.title || 'Untitled Ticket')}</span>
                          <span className={`customer-ticket-status-badge ${ticket.status ? ticket.status.toLowerCase() : ''}`}>
                            {ticket.status ? ticket.status.replace(/_/g, ' ') : 'Unknown'}
                          </span>
                        </div>
                        <span className="customer-ticket-meta">
                          <span className="customer-ticket-item-id">#{ticket.id}</span>
                          <span className="customer-ticket-time">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="customer-ticket-meta-info">
                <div className="customer-meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Created: {formatDate(currentTicket.createdAt)}</span>
                </div>
                <div className="customer-meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Last Updated: {formatDate(currentTicket.updatedAt)}</span>
                </div>
                <div className="customer-meta-item">
                  <i className="fas fa-tag"></i>
                  <span>Priority: {currentTicket.urgency}</span>
                </div>
                <div className="customer-meta-item">
                  <i className="fas fa-folder"></i>
                  <span>Category: {currentTicket.type && currentTicket.type.name ? currentTicket.type.name : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="customer-ticket-right-panel">
            {!loading && ticketList.length === 0 ? (
              <div className="customer-ticket-content-wrapper">
                <div className="customer-empty-state" style={{marginTop: '40px', fontSize: '1.1em', textAlign: 'center'}}>
                  <span className="customer-empty-icon"><i className="fas fa-comments"></i></span>
                  You don't have any support tickets yet. If you have a question or need assistance, please visit our chatbot—it's ready to help you anytime!
                  <a href="/chatbot" className="customer-empty-state-btn btn-primary">
                  <i className="fas fa-robot"></i> Chat with Bot</a>
                </div>
                
              </div>
            ) : (
              <div className="customer-ticket-content-wrapper">
                <div className="customer-ticket-header">
                  <div className="customer-ticket-title-section" aria-label="Ticket Title Section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="customer-ticket-id" aria-label="Ticket ID">#{currentTicket.id}</span>
                      <h2 className="customer-ticket-item-title" aria-label="Ticket Title">{currentTicket.title}</h2>
                      <span className={`customer-ticket-item-status ${currentTicket.status ? currentTicket.status.toLowerCase() : ''}`} aria-label="Ticket Status">
                        {currentTicket.status ? currentTicket.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="customer-ticket-tabs">
                    <div 
                      className={`customer-ticket-tab ${activeTab === 'conversation' ? 'active' : ''}`}
                      onClick={() => setActiveTab('conversation')}
                    >
                      <i className="fas fa-comments"></i> Conversation
                    </div>
                    <div 
                      className={`customer-ticket-tab ${activeTab === 'attachments' ? 'active' : ''}`}
                      onClick={() => setActiveTab('attachments')}
                    >
                      <i className="fas fa-paperclip"></i> Attachments
                    </div>
                    {session && session.ticketSession !== true && (
                      <div 
                        className={`customer-ticket-tab ${activeTab === 'chatbot' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chatbot')}
                      >
                        <i className="fas fa-robot"></i> Chat History
                      </div>
                    )}
                  </div>
                </div>
                
                {currentTicket.status === 'IN_PROGRESS' && (
                  <div className="customer-estimated-time">
                    <i className="fas fa-hourglass-half"></i>
                    <div>
                      <strong>Estimated Resolution Time:</strong>
                      <p>Our team is working on your issue. Estimated time to resolution: 24-48 hours</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'conversation' && (
                  <div className="customer-interaction-history">
                    <h4>Conversation History</h4>
                    {parseHistory(currentTicket.history).length === 0 ? (
                      <div className="customer-empty-state">No conversation yet. Start the conversation below.</div>
                    ) : (
                      parseHistory(currentTicket.history).map((msg, idx) => (
                        <div key={idx} className={`customer-interaction ${msg.role === 'engineer' ? 'customer-agent-message' : 'customer-customer-message'}`}>
                          <span className="customer-time">{formatMessageTime(msg.timestamp)}</span>
                          <span className="customer-sender">{msg.role === 'engineer' ? 'Engineer' : 'User'}:</span>
                          <p>{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {activeTab === 'attachments' && (
                  <div className="customer-attachments-section">
                    <div className="customer-attachments-header">
                      <h4>Attached Files</h4>
                      <div>
                        {currentTicket.status !== 'RESOLVED' && currentTicket.status !== 'CLOSED' ? (
                          <label className="customer-custom-file-upload">
                            <input type="file" onChange={handleFileUpload} disabled={uploading} />
                            <i className="fas fa-upload"></i> {uploading ? "Uploading..." : "Upload File"}
                          </label>
                        ) : null}
                        {(currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED') && (
                          <div className="customer-info-message" style={{ color: '#888', marginBottom: 12 }}>
                            This ticket is closed. You cannot reply or upload attachments.
                          </div>
                        )}
                        {selectedFileName && <span className="customer-selected-file-name">{selectedFileName}</span>}
                      </div>
                    </div>
                    {uploadError && <div className="customer-error-message" style={{ color: 'red' }}>{uploadError}</div>}
                    {uploadSuccess && <div className="customer-success-message" style={{ color: 'green' }}>{uploadSuccess}</div>}
                    {attachments.length === 0 ? (
                      <p className="customer-no-attachments">No files have been attached to this ticket.</p>
                    ) : (
                      <div className="customer-attachment-list">
                        {attachments.map(att => (
                          <div className="customer-attachment-item" key={att.id}>
                            <i className="fas fa-paperclip"></i>
                            <span className="customer-attachment-name">{att.filename}</span>
                            <span className="customer-attachment-date">{new Date(att.uploadedAt).toLocaleString()}</span>
                            <button
                              className="customer-attachment-action-btn"
                              onClick={() => handleDownloadAttachment(att.id, att.filename)}
                            >
                              <i className="fas fa-download customer-attachment_download"></i> Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                
                {activeTab === 'conversation' && (currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED') && (
                  <div className="customer-info-message" style={{ color: '#888', marginTop: 16 }}>
                    This ticket is closed. You cannot reply or upload attachments.
                  </div>
                )}
                {activeTab === 'conversation' && currentTicket.status !== 'RESOLVED' && currentTicket.status !== 'CLOSED' && (
                  <div className="customer-reply-box">
                    <textarea 
                      placeholder="Type your reply here..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      disabled={sending}
                    ></textarea>
                    <div className="customer-reply-actions">
                      <label className="customer-attach-file" style={{ cursor: 'pointer' }}>
                        <input 
                          type="file" 
                          onChange={handleFileUpload} 
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                        <i className="fas fa-paperclip"></i>
                        <span>{uploading ? "Uploading..." : "Attach File"}</span>
                      </label>
                      <button className="customer-send-btn" onClick={handleSendReply} disabled={sending || !reply.trim()}>
                        <i className="fas fa-paper-plane"></i> {sending ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                    {uploadError && <div className="customer-error-message" style={{ color: 'red', marginTop: 4 }}>{uploadError}</div>}
                    {uploadSuccess && <div className="customer-success-message" style={{ color: 'green', marginTop: 4 }}>{uploadSuccess}</div>}
                    {sendError && <div className="customer-error-message" style={{ color: 'red', marginTop: 8 }}>{sendError}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default TicketInformation;