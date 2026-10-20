import { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const ChatModal = ({ bookingId, partnerName, onClose }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize conversation and load message history
  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        const convRes = await api.get(`/chat/booking/${bookingId}`);
        if (convRes.data.success) {
          const conv = convRes.data.conversation;
          setConversation(conv);

          const msgRes = await api.get(`/chat/${conv._id}/messages`);
          if (msgRes.data.success) {
            setMessages(msgRes.data.messages);
          }

          // Join socket room
          if (socket) {
            socket.emit('conversation:join', { conversationId: conv._id });
          }
        }
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [bookingId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !conversation) return;

    const handleNewMessage = ({ conversationId, message }) => {
      if (conversationId === conversation._id) {
        setMessages((prev) => [...prev, message]);

        // Acknowledge read receipt if message is from partner
        if (message.sender?._id !== user.id) {
          socket.emit('message:read', {
            conversationId: conversation._id,
            messageId: message._id,
          });
        }
      }
    };

    const handleTypingStart = ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setIsPartnerTyping(true);
      }
    };

    const handleTypingStop = ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setIsPartnerTyping(false);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, conversation, user.id]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket && conversation) {
      socket.emit('typing:start', { conversationId: conversation._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: conversation._id });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socket && conversation) {
      socket.emit('typing:stop', { conversationId: conversation._id });
    }

    // If socket is connected, emit event for real-time delivery
    if (socket && isConnected) {
      socket.emit('message:send', {
        conversationId: conversation._id,
        text: textToSend,
      });
    } else {
      // Fallback to REST API if socket connection is down
      try {
        const res = await api.post(`/chat/${conversation._id}/messages`, {
          text: textToSend,
        });
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message]);
        }
      } catch (err) {
        console.error('REST fallback send failed:', err);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(32, 41, 35, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
    >
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '620px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-warm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-white)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: isConnected ? 'var(--primary-forest)' : 'var(--status-pending)',
                boxShadow: isConnected ? '0 0 8px rgba(36, 122, 82, 0.6)' : 'none',
              }}
            ></div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-charcoal)' }}>
                {partnerName}
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-slate)' }}>
                {isConnected ? 'Real-Time Connected' : 'Connecting channel...'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close chat"
            style={{
              color: 'var(--text-slate)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              transition: 'background var(--transition-fast)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ✕
          </button>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: 'var(--bg-warm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-slate)', marginTop: '40px', fontSize: '14px' }}>
              Loading conversation history...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-slate)', margin: 'auto', maxWidth: '320px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-charcoal)', marginBottom: '4px' }}>
                No messages yet
              </p>
              <p style={{ fontSize: '12px', lineHeight: '1.5' }}>
                Coordinate job location, timings, or specific tools directly with {partnerName}.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === user.id || msg.sender === user.id;
              return (
                <div
                  key={msg._id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isMe ? 'var(--primary-forest)' : 'var(--surface-white)',
                      color: isMe ? '#FFFFFF' : 'var(--text-charcoal)',
                      border: isMe ? 'none' : '1px solid var(--border-warm)',
                      fontSize: '13.5px',
                      lineHeight: '1.45',
                      wordBreak: 'break-word',
                      boxShadow: isMe ? '0 2px 8px rgba(36, 122, 82, 0.2)' : 'var(--shadow-xs)',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-slate)',
                      marginTop: '3px',
                      display: 'flex',
                      gap: '4px',
                    }}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && msg.readBy?.length > 1 && (
                      <span style={{ color: 'var(--primary-forest)', fontWeight: '700' }}>✓✓</span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isPartnerTyping && (
            <div
              style={{
                alignSelf: 'flex-start',
                fontSize: '12px',
                color: 'var(--primary-forest)',
                background: 'var(--accent-sage)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--accent-sage-border)',
                fontStyle: 'italic',
              }}
            >
              {partnerName} is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-warm)',
            display: 'flex',
            gap: '10px',
            background: 'var(--surface-white)',
          }}
        >
          <input
            type="text"
            placeholder={`Message ${partnerName}...`}
            value={inputText}
            onChange={handleInputChange}
            className="form-input"
            style={{
              flex: 1,
              padding: '10px 14px',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              opacity: inputText.trim() ? 1 : 0.5,
              cursor: inputText.trim() ? 'pointer' : 'default',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
