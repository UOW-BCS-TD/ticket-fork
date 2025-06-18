import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { chatbotAPI, sessionAPI, userService, productAPI, ticketTypeAPI } from '../../Services/api';

const API_BASE_URL = 'http://localhost:8082';

function formatSessionTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  if (isToday) return time;
  if (isYesterday) return `Yesterday, ${time}`;
  return date.toLocaleDateString() + ', ' + time;
}

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [botLoading, setBotLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [cachedUserProfile, setCachedUserProfile] = useState(null);
  const [cachedProducts, setCachedProducts] = useState(null);
  const [cachedTicketTypes, setCachedTicketTypes] = useState(null);
  const [showTicketPrompt, setShowTicketPrompt] = useState(false);
  const [checkingForActiveSessions, setCheckingForActiveSessions] = useState(true);
  const [showEmergencyToast, setShowEmergencyToast] = useState(true);

  const chatListRef = useRef(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const fetchChatList = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return [];
      }

      const response = await sessionAPI.getSessionsList();
      setChatList(response);
      return response;
    } catch (error) {
      console.error('Error fetching chat list:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return [];
      }
      setError('Failed to load chat list. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chat sessions on mount
  useEffect(() => {
    const fetchAndSetActiveSession = async () => {
      setCheckingForActiveSessions(true);
      const fetchedChatList = await fetchChatList();
      // Find and set the first active session if it exists
      const activeSession = fetchedChatList.find(session => 
        session.status === 'ACTIVE' && 
        session.ticketSession !== true && 
        session.ticketSession !== 1
      );
      if (activeSession) {
        setActiveChat(activeSession.title);
        setActiveSessionId(activeSession.id);
        setChatStarted(true);
        // Fetch the chat history for this active session
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setCheckingForActiveSessions(false);
            return;
          }
          const response = await sessionAPI.getSessionHistory(activeSession.id);
          const messages = response.messages || [];
          const formattedMessages = messages.map(msg => ({
            text: msg.content,
            sender: msg.role === 'assistant' ? 'support' : 'user',
            timestamp: msg.timestamp
          }));
          setChatHistory(formattedMessages);
        } catch (error) {
          console.error('Error fetching chat history for active session:', error);
        }
        // Always set to false after try/catch
        setCheckingForActiveSessions(false);
      } else {
        // No active session found, allow user to start a new chat
        setCheckingForActiveSessions(false);
      }
    };
    fetchAndSetActiveSession();
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const getUserProfile = async (token) => {
    if (cachedUserProfile) return cachedUserProfile;
    const userResponse = await userService.getCurrentUserProfile();
    setCachedUserProfile(userResponse);
    return userResponse;
  };

  const getProducts = async (token) => {
    if (cachedProducts) return cachedProducts;
    const productsResponse = await productAPI.getProducts();
    setCachedProducts(productsResponse);
    return productsResponse;
  };

  const getTicketTypes = async (token) => {
    if (cachedTicketTypes) return cachedTicketTypes;
    const ticketTypesResponse = await ticketTypeAPI.getTicketTypes();
    setCachedTicketTypes(ticketTypesResponse);
    return ticketTypesResponse;
  };

  // Add new function to handle feedback
  const handleFeedback = async (isSolved) => {
    if (isSolved) {
      await handleEndSession();
      setShowFeedback(false);
      setShowTicketPrompt(false);
    } else {
      // Show ticket prompt instead of creating ticket immediately
      setShowTicketPrompt(true);
      setShowFeedback(false);
    }
  };

  // New handler for ticket prompt
  const handleTicketPrompt = async (submitTicket) => {
    if (submitTicket) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to create a ticket.');
          return;
        }
        // 1. Get user profile to determine role and customerId
        const user = await getUserProfile(token);
        const customerId = user.customerId;
        if (!customerId) {
          alert('Customer profile not found. Cannot create ticket.');
          return;
        }
        // 2. Determine urgency based on customer role
        let urgency = 'MEDIUM';
        if (user.role === 'VIP') urgency = 'HIGH';
        else if (user.role === 'PREMIUM') urgency = 'MEDIUM';
        else if (user.role === 'STANDARD') urgency = 'LOW';
        // 3. Create a new session for the ticket
        let sessionId = activeSessionId;
        if (!sessionId) {
          // No active session, create a new one
          const sessionResponse = await axios.post(
            `${API_BASE_URL}/api/sessions`,
            { title: 'New Support Ticket', ticketSession: false },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          sessionId = sessionResponse.data.id;
          if (!sessionId) {
            alert('Failed to create session. Please try again.');
            return;
          }
          await axios.put(
            `${API_BASE_URL}/api/sessions/${sessionId}/end`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        // 4. Fetch products and ticket types (cached)
        const products = await getProducts(token);
        const ticketTypes = await getTicketTypes(token);
        // 5. Detect product category from chat
        const chatText = chatHistory.map(msg => msg.text).join(' ').toLowerCase();
        const modelPatterns = [
          { key: 'MODEL_3', patterns: [/\bmodel[\s\-]?3\b/i, /\btesla[\s\-]?model[\s\-]?3\b/i] },
          { key: 'MODEL_Y', patterns: [/\bmodel[\s\-]?y\b/i, /\btesla[\s\-]?model[\s\-]?y\b/i] },
          { key: 'MODEL_S', patterns: [/\bmodel[\s\-]?s\b/i, /\btesla[\s\-]?model[\s\-]?s\b/i] },
          { key: 'MODEL_X', patterns: [/\bmodel[\s\-]?x\b/i, /\btesla[\s\-]?model[\s\-]?x\b/i] },
          { key: 'CYBERTRUCK', patterns: [/\bcybertruck\b/i, /\btesla[\s\-]?cybertruck\b/i] }
        ];
        let productCategory = null;
        for (const model of modelPatterns) {
          for (const pattern of model.patterns) {
            if (pattern.test(chatText)) {
              productCategory = model.key;
              break;
            }
          }
          if (productCategory) break;
        }
        // 6. Find product and type IDs
        let selectedCategory = productCategory || 'MODEL_S'; // fallback to MODEL_S if not detected
        const selectedType = ticketTypes.length > 0 ? ticketTypes[0] : null;
        if (!selectedType) {
          alert('No ticket type found.');
          return;
        }
        const typeId = selectedType.id;
        // 7. Build the request body (no description, no engineer)
        const currentSession = chatList.find(s => s.id === sessionId);
        const sessionTitle = currentSession ? currentSession.title : 'Support Request from Chat';
        const ticketBody = {
          title: sessionTitle,
          category: selectedCategory,
          type: { id: typeId },
          session: { id: sessionId },
          urgency: urgency,
          status: 'OPEN',
          customer: { id: customerId }
        };
        // 8. Create the ticket
        const ticketResponse = await axios.post(
          `${API_BASE_URL}/api/tickets`,
          ticketBody,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const ticketId = ticketResponse.data.id || ticketResponse.data.data?.id;
        if (!ticketId) {
          alert('Failed to create ticket. Please try again.');
          return;
        }
        // No need to call /api/tickets/{id}/assign; backend handles assignment
        await handleEndSession();
        navigate(`/view-tickets`);
      } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Failed to create ticket. Please try again later.');
      }
    } else {
      // User chose not to submit a ticket, just continue conversation
      setShowTicketPrompt(false);
      setShowFeedback(false);
    }
  };

  // Modify sendMessage function to show feedback after bot response
  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      // Create a new session if needed
      if (!activeSessionId) {
        setCheckingForActiveSessions(true);
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to send messages.');
          setCheckingForActiveSessions(false);
          return;
        }
        
        try {
          const response = await sessionAPI.createSession({
            title: message.length > 30 ? message.substring(0, 30) + '...' : message,
            ticketSession: false
          });
          
          setActiveSessionId(response.data.id);
          setActiveChat(response.data.title);
          setChatStarted(true);
          await fetchChatList();
        } catch (sessionError) {
          console.error('Error creating session:', sessionError);
          alert('Failed to create session. Please check your login and try again.');
          setCheckingForActiveSessions(false);
          return;
        }
        setCheckingForActiveSessions(false); // Always set to false after session creation
      } 
      
      // Optimistically update chat history with user message and loading bot message
      const userMessage = {
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [
        ...prev,
        userMessage,
        { text: '', sender: 'support', loading: true, timestamp: new Date().toISOString() }
      ]);
      setMessage('');
      try {
        const response = await chatbotAPI.sendQuery(message);
        
        // Use the full updated history from backend
        const messages = response.history || [];
        const formattedMessages = messages.map(msg => ({
          text: msg.content,
          sender: msg.role === 'assistant' ? 'support' : 'user',
          timestamp: msg.timestamp
        }));
        setChatHistory(formattedMessages);
        setShowFeedback(true); // Show feedback after bot response
      } catch (chatbotError) {
        // Remove the loading message if error
        setChatHistory((prev) => prev.filter((msg, idx) => !(msg.loading && idx === prev.length - 1)));
        console.error('Error communicating with chatbot:', chatbotError);
        alert('Failed to get response from chatbot.');
      }
    } catch (error) {
      console.error('Error sending message or creating session:', error);
      alert('Failed to send message or create session.');
    }
  };

  // Handle pressing Enter in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Select a chat session and load its history
  const handleChatItemClick = (session) => {
    console.log('Selected session:', session);
    setActiveChat(session.title);
    setActiveSessionId(session.id);
    setChatStarted(true);
    setChatHistory([]);
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to view chat history.');
          setCheckingForActiveSessions(false);
          return;
        }
        console.log('Fetching history for session:', session.id);
        const response = await sessionAPI.getSessionHistory(session.id);
        console.log('History response:', response);
        const messages = response.messages || [];
        console.log('Parsed messages:', messages);
        
        // Convert the messages to the format expected by the chat display
        const formattedMessages = messages.map(msg => ({
          text: msg.content,
          sender: msg.role === 'assistant' ? 'support' : 'user',
          timestamp: msg.timestamp
        }));
        
        console.log('Formatted messages:', formattedMessages);
        setChatHistory(formattedMessages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        console.error('Error details:', error.response?.data);
        alert('Failed to fetch chat history.');
      } finally {
        setCheckingForActiveSessions(false); // Always set to false after fetching chat history
      }
    };
    fetchChatHistory();
    setSidebarOpen(false);
  };

  // Start a new chat
  const handleNewChat = async () => {
    const currentSession = chatList.find((s) => s.id === activeSessionId);
    if (currentSession && currentSession.status === 'ACTIVE') {
      const confirmEnd = window.confirm('You can only have one active session. The current session will be ended and a new chat will start. Continue?');
      if (!confirmEnd) return;
      // End the current session before starting a new one
      try {
        await sessionAPI.endSession(activeSessionId);
        setChatList((prev) => prev.map((s) => s.id === activeSessionId ? { ...s, status: 'CLOSED' } : s));
        await fetchChatList();
      } catch (error) {
        alert('Failed to end previous session.');
      }
    }
    setChatStarted(false);
    setActiveChat('');
    setActiveSessionId(null);
    setChatHistory([]);
  };

  // End the current session
  const handleEndSession = async () => {
    if (!activeSessionId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to end the session.');
      return;
    }
    try {
      await sessionAPI.endSession(activeSessionId);
      setChatList((prev) => prev.filter((s) => s.id !== activeSessionId));
      handleNewChat();
      alert('Session ended.');
      await fetchChatList();
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session.');
    }
  };

  // Sidebar close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        chatListRef.current &&
        !chatListRef.current.contains(event.target) &&
        !event.target.classList.contains('sidebar-toggle') &&
        !event.target.parentElement?.classList.contains('sidebar-toggle')
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter chats based on search query and status
  let filteredChats = chatList
    .filter(chat => chat.ticketSession !== true && chat.ticketSession !== 1) // Exclude ticket sessions (true or 1)
    .filter((chat) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const titleLower = (chat.title || 'Untitled Chat').toLowerCase();
      const matchesSearch = searchLower === '' || titleLower.includes(searchLower);
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'ACTIVE' && chat.status === 'ACTIVE') ||
                           (statusFilter === 'CLOSED' && chat.status === 'CLOSED');
      return matchesSearch && matchesStatus;
    });

  // Sort by lastActivity descending (latest first)
  filteredChats = filteredChats.sort((a, b) => {
    const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
    const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="chat-container">
      {/* Emergency Toast */}
      {showEmergencyToast && (
        <div className="emergency-toast">
          <span>For Emergency, Please call <b>+852-91234567</b></span>
          <button className="emergency-toast-close" onClick={() => setShowEmergencyToast(false)}>&times;</button>
        </div>
      )}
      <div className={`sidebar-toggle ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div ref={chatListRef} className={`chat-list ${sidebarOpen ? 'active' : ''}`}>
        <div className="chat-list-header">
          <h2>Chat History</h2>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="chat-search-input"
          />
        </div>
        <div className="chat-filters">
          <button
            className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${statusFilter === 'CLOSED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CLOSED')}
          >
            Closed
          </button>
        </div>
        <div className="chat-items-container">
          {isLoading ? (
            <div className="empty-chat-list">
              <p>Loading chats...</p>
            </div>
          ) : error ? (
            <div className="empty-chat-list">
              <p>{error}</p>
              <button className="quick-action-btn" onClick={fetchChatList}>
                Retry
              </button>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="empty-chat-list">
              <p>No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${activeSessionId === chat.id ? 'active' : ''}`}
                onClick={() => handleChatItemClick(chat)}
              >
                <div className="chat-item-header">
                  <span className="session-title">{(chat.title && chat.title.length > 20) ? chat.title.slice(0, 20) + '...' : (chat.title || 'Untitled Chat')}</span>
                  <span className="session-meta">
                    <span className={`chat-status-badge ${chat.status}`}>{chat.status}</span>
                    <span className="session-time">
                      {formatSessionTime(chat.lastActivity)}
                    </span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {chatStarted && (
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>{activeChat}</h3>
              {(() => {
                const currentSession = chatList.find((s) => s.id === activeSessionId);
                return currentSession ? (
                  <span className={`chat-status-badge ${currentSession.status}`}>{currentSession.status}</span>
                ) : null;
              })()}
            </div>
            <div className="chat-header-actions">
              <button className="quick-action-btn" onClick={handleNewChat}><b className="new-chat-icon">+</b> New Chat</button>
              <button className="quick-action-btn" onClick={handleEndSession} disabled={!activeSessionId}><b className="end-chat-icon">✖</b> End Session</button>
            </div>
          </div>
        )}

        {chatStarted && (
          <div className="chat-messages">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`message ${chat.sender}-message`}>
                <div className="message-content">
                  {chat.loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Thinking...</span>
                    </span>
                  ) : (
                    <>
                      <p>{chat.text}</p>
                      <span className="message-timestamp">
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {chat.sender === 'support' && index === chatHistory.length - 1 && showFeedback && chatHistory.filter(m => m.sender === 'user').length >= 3 && (
                        <div className="feedback-container">
                          <p>Did I solve your problem?</p>
                          <div className="feedback-buttons">
                            <button 
                              className="feedback-btn success" 
                              onClick={() => handleFeedback(true)}
                            >
                              ✅ Yes
                            </button>
                            <button 
                              className="feedback-btn cancel" 
                              onClick={() => handleFeedback(false)}
                            >
                              ❌ No
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Ticket prompt after feedback 'No' */}
                      {chat.sender === 'support' && index === chatHistory.length - 1 && showTicketPrompt && (
                        <div className="feedback-container">
                          <p>Do you want to submit a ticket?</p>
                          <div className="feedback-buttons">
                            <button 
                              className="feedback-btn success" 
                              onClick={() => handleTicketPrompt(true)}
                            >
                              ✅ Yes
                            </button>
                            <button 
                              className="feedback-btn cancel" 
                              onClick={() => handleTicketPrompt(false)}
                            >
                              ❌ No
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {!chatStarted && !checkingForActiveSessions && (
          <div className="welcome-container">
            <div className="logo-container">
              <div className="chat-logo">
                <img src="/logo.png" alt="Company Logo" />
              </div>
              <h2>Welcome to TechCare Support</h2>
              <p>How can our virtual assistant help you today?</p>
            </div>
          </div>
        )}

        {checkingForActiveSessions && !chatStarted && (
          <div className="welcome-container loading-container">
            <div className="logo-container">
              <div className="chat-logo">
                <img src="/logo.png" alt="Company Logo" />
              </div>
              <h2>TechCare Support</h2>
              <p>Loading your active session...</p>
              <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite', fontSize: '24px', marginTop: '10px' }} />
            </div>
          </div>
        )}

        <div className={`chat-input-container ${!chatStarted ? 'centered-input' : ''}`}>
          <div className="chat-input">
            {(() => {
              const currentSession = chatList.find((s) => s.id === activeSessionId);
              const isClosed = currentSession && currentSession.status === 'CLOSED';
              return (
                <>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      checkingForActiveSessions 
                        ? 'Checking for active sessions...' 
                        : isClosed 
                          ? 'This session is closed. You cannot send messages.' 
                          : 'Type your message...'
                    }
                    disabled={checkingForActiveSessions || isClosed}
                  />
                  <button onClick={sendMessage} disabled={checkingForActiveSessions || isClosed}>
                    <i className="send-icon">➤</i>Send
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;