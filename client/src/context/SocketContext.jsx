import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingNotification, setIncomingNotification] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('notification:new', (notification) => {
      setIncomingNotification(notification);
      // Auto clear after 6s
      setTimeout(() => setIncomingNotification(null), 6000);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, incomingNotification }}>
      {children}
      {/* in-app notification toast */}
      {incomingNotification && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--surface-white)',
            border: '1px solid var(--accent-sage-border)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card-hover)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-charcoal)',
            maxWidth: '380px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-sage)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            💬
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-charcoal)', marginBottom: '2px' }}>
              {incomingNotification.title}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-slate)', lineHeight: '1.4' }}>
              {incomingNotification.body}
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, isConnected: false };
};
