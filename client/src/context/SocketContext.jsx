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
      {/* Toast Alert for incoming notifications */}
      {incomingNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{incomingNotification.title}</div>
            <div style={{ fontSize: '13px', color: '#9ca3af' }}>{incomingNotification.body}</div>
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
