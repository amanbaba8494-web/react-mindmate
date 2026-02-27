import React, { useState } from 'react';
import './chatBot.css';

function ChatBot({ mood, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! I'm SmartSolv.AI. I see you're feeling ${mood}. How can I help you today?`,
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const getBotResponse = (userMessage) => {
    const lower = userMessage.toLowerCase();
    
    // Simple keyword-based responses
    const responses = {
      'hello': 'Hey there! How can I assist you?',
      'hi': 'Hello! What can I do for you?',
      'how are you': 'I\'m doing great, here to help you! What\'s on your mind?',
      'help': 'I can help you with advice, motivation, or just chat. What do you need?',
      'thanks': 'You\'re welcome! Anything else I can help with?',
      'ok': 'Great! Let me know if you need anything.',
      'advice': 'Tell me what\'s bothering you, and I\'ll try to help.',
      'study': 'I can help you with study tips and strategies. What subject?',
      'stressed': 'Take a deep breath. Let\'s talk about what\'s stressing you.',
      'sad': 'I\'m sorry you\'re feeling down. Talk to me about it.',
      'happy': 'That\'s wonderful! Keep that energy going!',
      'motivation': 'You\'ve got this! What are you working towards?',
      'default': 'That\'s interesting. Tell me more about that.'
    };

    for (let key in responses) {
      if (lower.includes(key)) {
        return responses[key];
      }
    }
    return responses.default;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate bot typing
    setTimeout(() => {
      const botResponse = getBotResponse(input);
      const botMsg = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div>
            <h2>SmartSolv.AI</h2>
            <p className="chat-mood">Mood: {mood}</p>
          </div>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" className="chat-send" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
