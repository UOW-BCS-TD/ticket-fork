import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { text: 'Hello! How can I help you today?', sender: 'support', timestamp: '2023/02/19' },
  ]);

  const [activeChat, setActiveChat] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatListRef = useRef(null);

  const chatList = [
    { name: 'Payment gateway issue', date: '2023/02/19', message: 'My transaction failed but I was still charged. Transaction ID: TXN-78945612' },
    { name: 'Account access question', date: '2023/02/18', message: 'I can\'t reset my password. The reset email is not arriving in my inbox.' },
    { name: 'Feature inquiry', date: '2023/02/17', message: 'Does your platform support integration with Shopify? I need to connect my store.' },
    { name: 'Subscription upgrade', date: '2023/02/15', message: 'I want to upgrade from Basic to Pro plan. What are the additional features?' },
    { name: 'Mobile app bug', date: '2023/02/14', message: 'The app crashes when I try to upload profile picture on Android 12.' },
    { name: 'aobile app bug', date: '2023/02/14', message: 'The app crashes when I try to upload profile picture on Android 12.' },
    { name: 'bobile app bug', date: '2023/02/14', message: 'The app crashes when I try to upload profile picture on Android 12.' },
    { name: 'cobile app bug', date: '2023/02/14', message: 'The app crashes when I try to upload profile picture on Android 12.' },
    { name: 'dobile app bug', date: '2023/02/14', message: 'The app crashes when I try to upload profile picture on Android 12.' },
    { name: 'eobile app bug', date: '2023/02/14', message: 'The app crashes when I try to upload profile picture on Android 12.' },
    { name: 'fobile app bug', date: '2023/02/14', message: 'The app crashes when I try to upload profile picture on Android 12.' },

  ];

  const sendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { text: message, sender: 'user', timestamp: new Date().toISOString() }]);
      setMessage('');
      if (!chatStarted) {
        setChatStarted(true);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleChatItemClick = (chatName) => {
    setActiveChat(chatName);
    setChatStarted(true);
    // Close sidebar after selecting a chat on mobile
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setChatStarted(false);
    setActiveChat('');
    setChatHistory([]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatListRef.current && 
          !chatListRef.current.contains(event.target) && 
          !event.target.classList.contains('sidebar-toggle') && 
          !event.target.parentElement?.classList.contains('sidebar-toggle')) {
        setSidebarOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredChats = chatList.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chat-items style
  // const limitedChats = filteredChats.slice(0, 5);

  return (
    <div className="chat-container">
      <div 
        className={`sidebar-toggle ${sidebarOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div 
        ref={chatListRef}
        className={`chat-list ${sidebarOpen ? 'active' : ''}`}
      >
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
          {filteredChats.map((chat, index) => (
            <div 
              key={index} 
              className={`chat-item ${activeChat === chat.name ? 'active' : ''}`}
              onClick={() => handleChatItemClick(chat.name)}
            >
              <div className="chat-item-header">
                <h4>{chat.name}</h4>
                <span className="chat-date">{chat.date}</span>
              </div>
              <p className="chat-preview">{chat.message}</p>
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
            </div>
          </div>
        )}
        
        {chatStarted && (
          <div className="chat-messages">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`message ${chat.sender}-message`}>
                <div className="message-content">
                  <p>{chat.text}</p>
                  <span className="message-timestamp">{new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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