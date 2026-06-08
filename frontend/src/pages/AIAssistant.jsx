// AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am NutriGuide AI, your personalized nutrition assistant. How can I help you with your health goals, calories, or Indian diet queries today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    // Add user message to screen
    const userMsg = { sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Create history payload from existing chat state
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      // Call API
      const res = await api.sendChatMessage(queryText, historyPayload);
      
      // Add bot response
      setMessages(prev => [...prev, { sender: 'bot', text: res.response }]);
    } catch (err) {
      setError('Connection error: Make sure the FastAPI backend is active.');
      // Add error response
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: '⚠️ Oh no! I could not connect to the backend server. Please verify your Python FastAPI server is running on port 8000.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    "What are some high-protein veg snacks?",
    "Healthy complex carbs in Indian meals?",
    "Why is protein capped for kidney disease?",
    "Explain calories and TDEE simply"
  ];

  return (
    <div style={styles.container}>
      {/* Medical Disclaimer Banner */}
      <div className="glass-card" style={styles.disclaimerCard}>
        <div style={styles.disclaimerHead}>
          <AlertCircle size={20} color="#f59e0b" />
          <h4 style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '600' }}>Important Medical Disclaimer</h4>
        </div>
        <p style={styles.disclaimerText}>
          “This app provides general nutrition guidance only. It is not a replacement for professional medical advice. 
          For diabetes, pregnancy, kidney disease, eating disorders, or serious health conditions, 
          consult a qualified doctor or dietitian.”
        </p>
      </div>

      {/* Chat Window */}
      <div className="glass-card" style={styles.chatCard}>
        <div style={styles.chatHeader}>
          <div style={styles.headerTitle}>
            <img 
              src="/ai_dietitian_avatar.png" 
              alt="AI Assistant Avatar" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #2dd4bf' }} 
            />
            <h3 style={styles.chatHeading}>NutriGuide AI Assistant</h3>
          </div>
          <span style={styles.statusBadge}>
            <Sparkles size={12} />
            <span>Gemini Powered</span>
          </span>
        </div>

        {/* Message Feed */}
        <div style={styles.messageFeed}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{
                ...styles.messageRow,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div 
                style={{
                  ...styles.bubble,
                  ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
                }}
              >
                <p style={styles.bubbleText}>{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={styles.messageRow}>
              <div style={{ ...styles.bubble, ...styles.botBubble, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <RefreshCw size={14} className="animate-spin" />
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div style={styles.chipsRow}>
            {suggestionChips.map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSendMessage(chip)}
                style={styles.chip}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          style={styles.inputForm}
        >
          <input 
            type="text" 
            placeholder="Ask anything about calories, proteins, or Indian meals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={styles.chatInput}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="btn btn-primary"
            style={styles.sendBtn}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '850px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  disclaimerCard: {
    padding: '1.25rem',
    borderLeft: '4px solid #f59e0b',
    background: 'rgba(245, 158, 11, 0.08)',
  },
  disclaimerHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  disclaimerText: {
    fontSize: '0.8rem',
    lineHeight: '1.45',
    color: '#475569',
  },
  chatCard: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '520px',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  chatHeading: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '12px',
    color: '#4f46e5',
    fontWeight: '600',
  },
  messageFeed: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '75%',
    padding: '0.85rem 1.25rem',
    borderRadius: '16px',
    lineHeight: '1.45',
    fontSize: '0.9rem',
  },
  userBubble: {
    backgroundColor: '#0d9488',
    color: '#ffffff',
    borderTopRightRadius: '2px',
  },
  botBubble: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    borderTopLeftRadius: '2px',
    whiteSpace: 'pre-line',
  },
  bubbleText: {
    margin: 0,
  },
  chipsRow: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0 1.5rem 1rem 1.5rem',
    flexWrap: 'wrap',
  },
  chip: {
    padding: '0.5rem 0.85rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    color: '#0d9488',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  inputForm: {
    display: 'flex',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    gap: '0.75rem',
  },
  chatInput: {
    flex: 1,
    padding: '0.85rem 1.25rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    color: '#0f172a',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    padding: '0.85rem',
    borderRadius: '10px',
    minWidth: '50px',
  }
};
