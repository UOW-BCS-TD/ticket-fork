import React from 'react';

const ChatbotHistory = ({ chatbotHistory, loading, error, formatMessageTime }) => (
  <div className="chatbot-history-section">
    <h4>Chatbot Conversation History</h4>
    {loading ? (
      <div className="empty-state">Loading chatbot history...</div>
    ) : error ? (
      <div className="empty-state">{error}</div>
    ) : chatbotHistory.length > 0 ? (
      <div className="chat-messages" style={{ maxHeight: 400, overflowY: 'auto', margin: '16px 0' }}>
        {chatbotHistory.map((msg, idx) => {
          const sender = msg.role === 'user' ? 'user' : 'support';
          return (
            <div key={idx} className={`message ${sender}-message`}>
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-timestamp">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="empty-state">No chatbot conversation found for this session.</div>
    )}
  </div>
);

export default ChatbotHistory; 