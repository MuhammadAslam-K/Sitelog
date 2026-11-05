import { useState, useEffect } from 'react';

/**
 * Hook to track online / offline network connectivity with reconnection signal.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    let timer;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide reconnected indicator after 4 seconds
      timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      if (timer) clearTimeout(timer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { isOnline, showReconnected };
}
