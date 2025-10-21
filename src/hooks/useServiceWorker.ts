import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  cacheSize: number;
}

export const useServiceWorker = () => {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: navigator.onLine,
    cacheSize: 0
  });

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    setSwState(prev => ({ ...prev, isSupported: true }));

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered:', registration);

        setSwState(prev => ({ ...prev, isRegistered: true }));

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('New service worker version available');
                // You can show a notification to the user here
              }
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();

    // Listen for online/offline events
    const handleOnline = () => setSwState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSwState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Preload videos
  const preloadVideos = async (videoUrls: string[]) => {
    if (!swState.isRegistered) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'PRELOAD_VIDEOS',
          data: { videoUrls }
        });
      }
    } catch (error) {
      console.error('Error preloading videos:', error);
    }
  };

  // Clear video cache
  const clearVideoCache = async () => {
    if (!swState.isRegistered) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({ type: 'CLEAR_CACHE' });
      }
    } catch (error) {
      console.error('Error clearing video cache:', error);
    }
  };

  // Get cache size
  const getCacheSize = async (): Promise<number> => {
    if (!swState.isRegistered) return 0;

    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        return new Promise((resolve) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'CACHE_SIZE') {
              resolve(event.data.size);
            }
          };
          registration.active?.postMessage({ type: 'GET_CACHE_SIZE' }, [messageChannel.port2]);
        });
      }
    } catch (error) {
      console.error('Error getting cache size:', error);
    }
    return 0;
  };

  return {
    ...swState,
    preloadVideos,
    clearVideoCache,
    getCacheSize
  };
};
