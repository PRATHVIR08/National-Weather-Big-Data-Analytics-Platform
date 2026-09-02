import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ConnectionContext = createContext();

const API_BASE_URL = 'http://127.0.0.1:8000';

export function ConnectionProvider({ children }) {
  // 'connecting' | 'live' | 'offline'
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastChecked, setLastChecked] = useState(null);

  const checkBackendHealth = useCallback(async () => {
    setConnectionStatus('connecting');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${API_BASE_URL}/weather/live`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setConnectionStatus('live');
        setLastChecked(new Date().toLocaleTimeString());
        return true;
      } else {
        setConnectionStatus('offline');
        setLastChecked(new Date().toLocaleTimeString());
        return false;
      }
    } catch (err) {
      setConnectionStatus('offline');
      setLastChecked(new Date().toLocaleTimeString());
      return false;
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();

    // Check backend health periodically every 30 seconds
    const interval = setInterval(() => {
      checkBackendHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const isLive = connectionStatus === 'live';
  const isOffline = connectionStatus === 'offline';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <ConnectionContext.Provider
      value={{
        connectionStatus,
        setConnectionStatus,
        isLive,
        isOffline,
        isConnecting,
        checkBackendHealth,
        lastChecked,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}
