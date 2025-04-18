import React from 'react';
import { Link } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Customer Support Chat</h2>
        <Link to="/" className="back-button">Back to Home</Link>
      </div>
      
      <div className="chat-messages">
        {/* Chat messages will appear here */}
        <div className="message bot-message">
          Hello! How can I help you today?
        </div>
      </div>
      
      <div className="chat-input">
        <input 
          type="text" 
          placeholder="Type your message here..." 
        />
        <button>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
