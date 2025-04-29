import React, { useState, useRef, useEffect } from 'react';
import './TicketInformation.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const TicketInformation = () => {
  const [activeTab, setActiveTab] = useState('conversation');
  const [activeTicket, setActiveTicket] = useState('TK-2023-001');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample ticket data
  const ticketList = [
    { 
      id: 'TK-2023-001', 
      title: 'Payment Gateway Integration Issue', 
      date: '2023/10/15', 
      status: 'progress',
      priority: 'high',
      category: 'Technical Support',
      description: "We're experiencing transaction failures during the checkout process. Approximately 30% of our customer payments are affected."
    },
    { 
      id: 'TK-2023-002', 
      title: 'Account Access Problem', 
      date: '2023/10/14', 
      status: 'open',
      priority: 'medium',
      category: 'Account Management',
      description: "Unable to reset password. The reset email is not arriving in my inbox."
    },
    { 
      id: 'TK-2023-003', 
      title: 'Mobile App Crash on Startup', 
      date: '2023/10/12', 
      status: 'open',
      priority: 'high',
      category: 'Mobile App',
      description: "Our mobile app crashes immediately after the splash screen on iOS devices."
    },
    { 
      id: 'TK-2023-004', 
      title: 'Billing Discrepancy', 
      date: '2023/10/10', 
      status: 'resolved',
      priority: 'low',
      category: 'Billing',
      description: "Last month's invoice shows charges for services we didn't use."
    },
    { 
      id: 'TK-2023-005', 
      title: 'API Documentation Request', 
      date: '2023/10/08', 
      status: 'progress',
      priority: 'medium',
      category: 'API Integration',
      description: "Need updated documentation for the new API endpoints released last week."
    }
  ];

  const handleTicketClick = (ticketId) => {
    setActiveTicket(ticketId);
  };

  const filteredTickets = ticketList.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the active ticket data
  const currentTicket = ticketList.find(ticket => ticket.id === activeTicket) || ticketList[0];

  return (
    <div className="ticket-view-container">
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
                        <span className="ticket-item-id">{ticket.id}</span>
                        <span className="ticket-item-date">{ticket.date}</span>
                      </div>
                      <p className="ticket-preview">{ticket.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="ticket-meta-info">
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Created: {currentTicket.date.replace('/', '-')}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Last Updated: 1 hour ago</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-tag"></i>
                  <span>Priority: {currentTicket.priority}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-folder"></i>
                  <span>Category: {currentTicket.category}</span>
                </div>
              </div>
              
              <div className="quick-actions">
                <button className="action-btn">
                  <i className="fas fa-edit"></i> Add More Details
                </button>
                <button className="action-btn secondary">
                  <i className="fas fa-times"></i> Close Ticket
                </button>
              </div>
            </div>
          </div>

          <div className="ticket-right-panel">
            <div className="ticket-content-wrapper">
              <div className="ticket-header">
                <div className="ticket-title-section">
                  <span className="ticket-id">#{currentTicket.id}</span>
                  <span className={`ticket-status ${currentTicket.status}`}>{currentTicket.status}</span>
                  <h2>{currentTicket.title}</h2>
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
              
              <div className="estimated-time">
                <i className="fas fa-hourglass-half"></i>
                <div>
                  <strong>Estimated Resolution Time:</strong>
                  <p>Our team is working on your issue. Estimated time to resolution: 24-48 hours</p>
                </div>
              </div>
              
              <div className="ticket-details">
                <p>{currentTicket.description}</p>
                {currentTicket.id === 'TK-2023-001' && (
                  <p>Error message displayed to customers: "Payment processing error. Please try again later."</p>
                )}
              </div>
              
              {activeTab === 'conversation' && (
                <div className="interaction-history">
                  <h4>Conversation History</h4>
                  <div className="interaction customer-message">
                    <span className="time">Oct 15, 9:30 AM</span>
                    <span className="sender">You:</span>
                    <p>{currentTicket.description}</p>
                  </div>
                  <div className="interaction agent-message">
                    <span className="time">Oct 15, 10:15 AM</span>
                    <span className="sender">Support Agent (Sarah):</span>
                    <p>Thank you for reporting this issue. I understand how critical this is for your business. I'll need some additional information to help diagnose the problem. Could you please provide more details?</p>
                  </div>
                  {currentTicket.id === 'TK-2023-001' && (
                    <>
                      <div className="interaction customer-message">
                        <span className="time">Oct 15, 11:05 AM</span>
                        <span className="sender">You:</span>
                        <p>Hi Sarah, thanks for the quick response. Here's the information:</p>
                        <ol>
                          <li>All credit card payments are affected, but PayPal seems to work fine.</li>
                          <li>I've attached the error logs from our server.</li>
                          <li>The issue started yesterday after we deployed a new update to our checkout system.</li>
                        </ol>
                      </div>
                      <div className="interaction agent-message">
                        <span className="time">Oct 15, 1:30 PM</span>
                        <span className="sender">Support Agent (Sarah):</span>
                        <p>Thank you for providing that information. After reviewing the logs, I can see that there's an API authentication issue with our payment gateway. Our technical team is working on this now. I'll keep you updated on our progress.</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {activeTab === 'attachments' && (
                <div className="attachments-section">
                  <h4>Attached Files</h4>
                  {currentTicket.id === 'TK-2023-001' ? (
                    <div className="attachment-list">
                      <div className="attachment-item">
                        <i className="fas fa-file-code"></i>
                        <span className="attachment-name">error_logs.txt</span>
                        <span className="attachment-size">24KB</span>
                        <button className="attachment-action-btn">
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                      <div className="attachment-item">
                        <i className="fas fa-file-image"></i>
                        <span className="attachment-name">error_screenshot.png</span>
                        <span className="attachment-size">156KB</span>
                        <button className="attachment-action-btn">
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="no-attachments">No files have been attached to this ticket.</p>
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
                        'Troubleshooting Guide for ' + currentTicket.category}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="reply-box">
                <textarea placeholder="Type your reply here..."></textarea>
                <div className="reply-actions">
                  <div className="attach-file">
                    <i className="fas fa-paperclip"></i>
                    <span>Attach File</span>
                  </div>
                  <button className="send-btn">
                    <i className="fas fa-paper-plane"></i> Send Reply
                  </button>
                </div>
              </div>
              
              <div className="satisfaction-survey">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketInformation;
