
import { useState, useEffect } from 'react';

export interface NetworkState {
  isOnline: boolean;
  effectiveType?: string;
  isBackendConnected: boolean;
}

export function useNetworkStatus(): NetworkState {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isBackendConnected: false // Mocked backend mode
  };
}
