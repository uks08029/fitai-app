import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [currentReading, setCurrentReading] = useState({
    heartRate: 72,
    spo2: 98,
    temperature: 36.6,
    steps: 7420,
    timestamp: new Date().toISOString(),
    status: {
      heartRate: 'Normal',
      spo2: 'Optimal',
      temperature: 'Normal',
    },
    alert: null,
    source: 'Demo Sensor Simulator',
    isDemoSimulator: true,
  });

  const [readingHistory, setReadingHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isStressActive, setIsStressActive] = useState(false);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    // Protocol ws:// or wss:// based on current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    // Backend runs on port 5000 in dev
    const wsUrl = `${protocol}//${host}:5000`;

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('[WebSocket Client] Connected to FitAI telemetry server');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'SENSOR_UPDATE' || payload.type === 'INITIAL_STATE') {
            const data = payload.data;
            setCurrentReading(data);

            // Append to rolling chart buffer (keep last 35 points)
            setReadingHistory((prev) => {
              const timeLabel = new Date(data.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const newPoint = {
                time: timeLabel,
                timestamp: data.timestamp,
                heartRate: data.heartRate,
                spo2: data.spo2,
                temperature: data.temperature,
                steps: data.steps,
              };
              const updated = [...prev, newPoint];
              return updated.length > 35 ? updated.slice(updated.length - 35) : updated;
            });

            // Handle incoming threshold alert
            if (data.alert) {
              setAlerts((prev) => {
                const isDuplicate = prev.some(
                  (a) => a.type === data.alert.type && Date.now() - new Date(a.time).getTime() < 8000
                );
                if (isDuplicate) return prev;
                return [
                  {
                    id: Math.random().toString(36).substring(7),
                    ...data.alert,
                    time: new Date().toISOString(),
                  },
                  ...prev.slice(0, 4),
                ];
              });
            }
          }
        } catch (e) {
          console.warn('[WebSocket Client] Message parse error:', e.message);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        console.log('[WebSocket Client] Disconnected. Scheduling reconnection...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket Client] Connection error:', err);
        ws.close();
      };
    } catch (err) {
      console.error('[WebSocket Client] Exception establishing socket:', err);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const toggleStressMode = (active) => {
    setIsStressActive(active);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'TOGGLE_STRESS',
          active,
        })
      );
    }
  };

  const clearAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        connectionStatus,
        currentReading,
        readingHistory,
        alerts,
        clearAlert,
        isStressActive,
        toggleStressMode,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
