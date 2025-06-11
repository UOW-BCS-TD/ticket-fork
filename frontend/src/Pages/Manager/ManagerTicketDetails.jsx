import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ChatbotHistory from '../Tickets/ChatbotHistory';
import './ManagerTicketDetails.css';
import '../Tickets/TicketInformation.css';

const ManagerTicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conversation');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [chatbotHistory, setChatbotHistory] = useState([]);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tickets/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch ticket');
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setError('Failed to fetch ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  useEffect(() => {
    if (!ticket) return;
    const fetchAttachments = async () => {
      try {
        const res = await fetch(`/api/tickets/${ticket.id}/attachments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch attachments');
        setAttachments(await res.json());
      } catch {
        setAttachments([]);
      }
    };
    fetchAttachments();
  }, [ticket]);

  useEffect(() => {
    if (!ticket || !ticket.session_id) return;
    const fetchSession = async () => {
      setSession(null);
      setSessionLoading(false);
      setSessionError(null);
      setChatbotHistory([]);
      setSessionLoading(true);
      try {
        const sessionRes = await fetch(`/api/sessions/${ticket.session_id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!sessionRes.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionRes.json();
        setSession(sessionData);
        // Fetch chatbot history
        const historyResp = await fetch(`/api/sessions/${ticket.session_id}/history/ticket/${ticket.id}`, {
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
    fetchSession();
  }, [ticket]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !ticket?.id) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/tickets/${ticket.id}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess('File uploaded!');
      // Refresh list
      const listRes = await fetch(`/api/tickets/${ticket.id}/attachments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAttachments(await listRes.json());
    } catch (err) {
      setUploadError('Failed to upload file.');
    } finally {
      setUploading(false);
    }
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
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !ticket?.id) return;
    setSending(true);
    setSendError(null);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: reply })
      });
      if (!response.ok) throw new Error('Failed to send reply');
      const updated = await response.json();
      setTicket((prev) => ({ ...prev, history: updated.history, updatedAt: updated.updatedAt }));
      setReply("");
    } catch (err) {
      setSendError("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="empty-state">Loading ticket...</div>;
  if (error) return <div className="empty-state">{error}</div>;
  if (!ticket) return <div className="empty-state">Ticket not found.</div>;

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
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="engineer-ticket-panel-content">
              <h3>Ticket Details</h3>
              <p>Viewing ticket details as a manager.</p>
              <div className="engineer-ticket-meta-info">
                <div className="engineer-meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Last Updated: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-tag"></i>
                  <span>Priority: {ticket.urgency}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-folder"></i>
                  <span>Category: {ticket.type && ticket.type.name ? ticket.type.name : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-user"></i>
                  <span>Customer: {ticket.customer && ticket.customer.name ? ticket.customer.name : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email: {ticket.customer && ticket.customer.email ? ticket.customer.email : '-'}</span>
                </div>
                <div className="engineer-meta-item">
                  <i className="fas fa-user-cog"></i>
                  <span>Assigned To: {ticket.engineer && ticket.engineer.name ? ticket.engineer.name : 'Unassigned'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="engineer-ticket-right-panel">
            <div className="engineer-ticket-content-wrapper">
              <div className="engineer-ticket-header">
                <div className="engineer-ticket-title-section" aria-label="Ticket Title Section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="engineer-ticket-id" aria-label="Ticket ID">#{ticket.id}</span>
                      <h2 className="engineer-ticket-title" aria-label="Ticket Title">{ticket.title}</h2>
                      <span className={`engineer-ticket-item-status ${ticket.status ? ticket.status.toLowerCase() : ''}`} aria-label="Ticket Status">
                        {ticket.status ? ticket.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </div>
                    <button className="manager-return-btn" onClick={() => navigate('/tickets')}>
                      <i className="fas fa-arrow-left"></i> Go Back
                    </button>
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
                <div className="info-message" style={{ color: '#888', fontSize: '0.9em' }}>
                  <i className="fas fa-info-circle"></i> Manager View - Read Only Access
                </div>
              </div>
              {activeTab === 'conversation' && (
                <div className="engineer-interaction-history">
                  <h4>Conversation History</h4>
                  {parseHistory(ticket.history).length === 0 ? (
                    <div className="engineer-empty-state">No conversation yet.</div>
                  ) : (
                    parseHistory(ticket.history).map((msg, idx) => (
                      <div key={idx} className={`engineer-interaction ${msg.role === 'engineer' ? 'agent-message' : 'customer-message'}`}>
                        <span className="time">{formatMessageTime(msg.timestamp)}</span>
                        <span className="sender">{msg.role === 'engineer' ? 'Engineer' : 'User'}:</span>
                        <p>{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'conversation' && (
                <div className="info-message" style={{ color: '#888', marginTop: 16, textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <i className="fas fa-lock"></i> Managers cannot reply or upload attachments in this ticket.
                </div>
              )}
              {activeTab === 'attachments' && (
                <div className="engineer-attachments-section">
                  <div className="engineer-attachments-header">
                    <h4>Attached Files</h4>
                    <div className="info-message" style={{ color: '#888', fontSize: '0.85em' }}>
                      <i className="fas fa-eye"></i> View Only - Upload disabled for managers
                    </div>
                  </div>
                  {attachments.length === 0 ? (
                    <p className="engineer-no-attachments">No files have been attached to this ticket.</p>
                  ) : (
                    <div className="engineer-attachment-list">
                      {attachments.map(att => (
                        <div className="engineer-attachment-item" key={att.id}>
                          <i className="fas fa-paperclip"></i>
                          <span className="engineer-attachment-name">{att.filename}</span>
                          <span className="engineer-attachment-date">{new Date(att.uploadedAt).toLocaleString()}</span>
                          <a href={`/api/tickets/${ticket.id}/attachments/${att.id}`} target="_blank" rel="noopener noreferrer" className="engineer-attachment-action-btn">
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
                      Troubleshooting Guide for {ticket.type && ticket.type.name ? ticket.type.name : '-'}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerTicketDetails;