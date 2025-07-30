// src/components/ChatInput.js
import React, { useState } from 'react';
import './ChatInput.css';

// Add isLoading to props
const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) { // Only send if input is not empty AND not loading
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about Yola South..."
        className="chat-input-field"
        disabled={isLoading} // Disable input while loading
      />
      <button
        type="submit"
        className="chat-send-button"
        disabled={isLoading} // Disable button while loading
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;