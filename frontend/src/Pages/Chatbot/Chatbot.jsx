import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const chatListRef = useRef(null);

  // Fetch chat sessions on mount
  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to view chat history.');
          return;
        }
        const response = await axios.get('http://localhost:8082/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatList(response.data);
      } catch (error) {
        console.error('Error fetching chat list:', error);
        alert('Failed to fetch chat history.');
      }
    };
    fetchChatList();
  }, []);

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
        setChatHistory([
          { text: message, sender: 'user', timestamp: new Date().toISOString() },
        ]);
        setMessage('');
        return;
      }
      // Add user message to chat history
      setChatHistory((prev) => [...prev, { text: message, sender: 'user', timestamp: new Date().toISOString() }]);
      setMessage('');
      // Send the query to the backend (your chatbot backend, not Spring Boot)
      await axios.post(
        'http://localhost:5000/query',
        { query: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        const response = await axios.get(`http://localhost:8082/api/sessions/${session.id}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let history = response.data.history;
        if (typeof history === 'string') {
          try { history = JSON.parse(history); } catch { history = []; }
        }
        setChatHistory(
          Array.isArray(history)
            ? history.map((msg) => ({
                text: msg.content,
                sender: msg.role === 'assistant' ? 'support' : 'user',
                timestamp: msg.timestamp,
              }))
            : []
        );
      } catch (error) {
        console.error('Error fetching chat history:', error);
        alert('Failed to fetch chat history.');
      }
    };
    fetchChatHistory();
    setSidebarOpen(false);
  };

  // Start a new chat
  const handleNewChat = () => {
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

  // Filter chat list by search
  const filteredChats = chatList.filter(
    (chat) =>
      (chat.title && chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="chat-items-container">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeSessionId === chat.id ? 'active' : ''}`}
              onClick={() => handleChatItemClick(chat)}
            >
              <div className="chat-item-header">
                <h4>{chat.title}</h4>
                <span className="chat-date">{chat.startTime ? new Date(chat.startTime).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
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
                  <p>{chat.text}</p>
                  <span className="message-timestamp">
                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
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