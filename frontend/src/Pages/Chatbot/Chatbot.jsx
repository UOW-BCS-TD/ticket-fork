import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

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
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/sessions/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setChatList(response.data);
    } catch (error) {
      console.error('Error fetching chat list:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError('Failed to load chat list. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chat sessions on mount
  useEffect(() => {
    fetchChatList();
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Send message (and create session if needed)
  const sendMessage = async () => {
    if (!message.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to use the chatbot.');
      return;
    }
    try {
      let sessionId = activeSessionId;
      // If no session, create one with the first message as the title
      if (!chatStarted) {
        try {
          const sessionResponse = await axios.post(
            'http://localhost:8082/api/sessions',
            { title: message },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          sessionId = sessionResponse.data.id;
          setActiveSessionId(sessionId);
          setActiveChat(sessionResponse.data.title);
          setChatStarted(true);
          setChatList((prev) => [sessionResponse.data, ...prev]);
        } catch (err) {
          console.error('Error creating session:', err);
          alert('Failed to create session. Please check your login and try again.');
          return;
        }
      }
      // Save user message to session history and get bot response and full history
      setMessage('');
      try {
        const response = await axios.post(
          'http://localhost:5000/query',
          { query: message },
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        // Use the full updated history from backend
        const messages = response.data.history || [];
        const formattedMessages = messages.map(msg => ({
          text: msg.content,
          sender: msg.role === 'assistant' ? 'support' : 'user',
          timestamp: msg.timestamp
        }));
        setChatHistory(formattedMessages);
      } catch (chatbotError) {
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
          return;
        }
        console.log('Fetching history for session:', session.id);
        const response = await axios.get(`http://localhost:8082/api/sessions/${session.id}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('History response:', response.data);
        const messages = response.data.messages || [];
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
      }
    };
    fetchChatHistory();
    setSidebarOpen(false);
  };

  // Start a new chat
  const handleNewChat = async () => {
    if (activeSessionId) {
      const confirmEnd = window.confirm('You can only have one active session. The current session will be ended and a new chat will start. Continue?');
      if (!confirmEnd) return;
      // End the current session before starting a new one
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.put(
            `http://localhost:8082/api/sessions/${activeSessionId}/end`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChatList((prev) => prev.map((s) => s.id === activeSessionId ? { ...s, status: 'CLOSED' } : s));
        } catch (error) {
          alert('Failed to end previous session.');
        }
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
      await axios.put(
        `http://localhost:8082/api/sessions/${activeSessionId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatList((prev) => prev.filter((s) => s.id !== activeSessionId));
      handleNewChat();
      alert('Session ended.');
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
  let filteredChats = chatList.filter((chat) => {
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
            className="search-input"
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
                  <span className="session-title">{chat.title || 'Untitled Chat'}</span>
                  <span className="session-meta">
                    <span className={`status-badge ${chat.status}`}>{chat.status}</span>
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
              <span className="online-tag">Online</span>
            </div>
            <div className="chat-header-actions">
              <button className="quick-action-btn" onClick={handleNewChat}><i className="new-chat-icon">+</i> New Chat</button>
              <button className="quick-action-btn" onClick={handleEndSession}><i className="end-chat-icon">✖</i> End Session</button>
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
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {!chatStarted && (
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

        <div className={`chat-input-container ${!chatStarted ? 'centered-input' : ''}`}>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}><i className="send-icon">➤</i>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;