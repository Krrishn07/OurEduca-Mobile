import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const useIsConnected = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateStatus = () => setIsConnected(window.navigator.onLine);
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);
      updateStatus();
      return () => {
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', updateStatus);
      };
    }

    // Native logic
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};
