const ChatbotHistory = ({ chatbotHistory, loading, error, formatMessageTime }) => (
  <div className="chatbot-history-section" style={{
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "0 auto"
  }}>
    <h4>Chat Conversation History</h4>
    {loading ? (
      <div className="empty-state">Loading chat history...</div>
    ) : error ? (
      <div className="empty-state">{error}</div>
    ) : chatbotHistory.length > 0 ? (
      <div className="chat-messages" style={{ maxHeight: 400, overflowY: 'auto', margin: '16px 0' }}>
        {chatbotHistory.map((msg, idx) => {
          const sender = msg.role === 'user' ? 'user' : 'support';
          return (
            <div key={idx} className={`message ${sender}-message`}>
              <div className="message-header">
                <img 
                  src={sender === 'user' ? '/User.png' : '/AI_Assistant.png'} 
                  alt={sender === 'user' ? 'User' : 'AI Assistant'} 
                  className="sender-avatar"
                />
                <span className="message-sender">
                  {sender === 'user' ? 'You' : 'Virtual Assistant'}
                </span>
              </div>
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
      <div className="empty-state">No chat conversation found for this session.</div>
    )}
  </div>
);

export default ChatbotHistory;
