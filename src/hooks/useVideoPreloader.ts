import { useEffect, useRef, useState } from 'react';

interface VideoPreloaderOptions {
  preloadCount?: number;
  preloadDistance?: number;
  maxConcurrentPreloads?: number;
}

interface PreloadStatus {
  url: string;
  status: 'pending' | 'loading' | 'loaded' | 'error';
  progress: number;
}

export const useVideoPreloader = (videoUrls: string[], options: VideoPreloaderOptions = {}) => {
  const {
    preloadCount = 3,
    preloadDistance = 1,
    maxConcurrentPreloads = 2
  } = options;

  const [preloadStatus, setPreloadStatus] = useState<Map<string, PreloadStatus>>(new Map());
  const preloadQueue = useRef<string[]>([]);
  const activePreloads = useRef<Set<string>>(new Set());

  // Initialize preload status for all videos
  useEffect(() => {
    const initialStatus = new Map<string, PreloadStatus>();
    videoUrls.forEach(url => {
      initialStatus.set(url, {
        url,
        status: 'pending',
        progress: 0
      });
    });
    setPreloadStatus(initialStatus);
  }, [videoUrls]);

  // Preload videos based on current index
  const preloadVideos = (currentIndex: number) => {
    const videosToPreload: string[] = [];
    
    // Preload next videos
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < videoUrls.length) {
        videosToPreload.push(videoUrls[nextIndex]);
      }
    }

    // Add to preload queue
    videosToPreload.forEach(url => {
      if (!preloadStatus.get(url)?.status || preloadStatus.get(url)?.status === 'pending') {
        preloadQueue.current.push(url);
      }
    });

    // Start preloading if we have capacity
    processPreloadQueue();
  };

  const processPreloadQueue = () => {
    while (
      preloadQueue.current.length > 0 && 
      activePreloads.current.size < maxConcurrentPreloads
    ) {
      const url = preloadQueue.current.shift();
      if (url) {
        startPreload(url);
      }
    }
  };

  const startPreload = (url: string) => {
    if (activePreloads.current.has(url)) return;

    activePreloads.current.add(url);
    
    setPreloadStatus(prev => {
      const newStatus = new Map(prev);
      newStatus.set(url, {
        url,
        status: 'loading',
        progress: 0
      });
      return newStatus;
    });

    // Create video element for preloading
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    
    const handleLoadStart = () => {
      setPreloadStatus(prev => {
        const newStatus = new Map(prev);
        const current = newStatus.get(url);
        if (current) {
          newStatus.set(url, { ...current, progress: 10 });
        }
        return newStatus;
      });
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = video.buffered.end(0);
        const duration = video.duration;
        const progress = duration > 0 ? (buffered / duration) * 100 : 0;
        
        setPreloadStatus(prev => {
          const newStatus = new Map(prev);
          const current = newStatus.get(url);
          if (current) {
            newStatus.set(url, { ...current, progress: Math.min(progress, 90) });
          }
          return newStatus;
        });
      }
    };

    const handleCanPlay = () => {
      setPreloadStatus(prev => {
        const newStatus = new Map(prev);
        newStatus.set(url, {
          url,
          status: 'loaded',
          progress: 100
        });
        return newStatus;
      });
      
      activePreloads.current.delete(url);
      video.remove();
      processPreloadQueue();
    };

    const handleError = () => {
      setPreloadStatus(prev => {
        const newStatus = new Map(prev);
        newStatus.set(url, {
          url,
          status: 'error',
          progress: 0
        });
        return newStatus;
      });
      
      activePreloads.current.delete(url);
      video.remove();
      processPreloadQueue();
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    
    video.src = url;
  };

  const getPreloadStatus = (url: string) => {
    return preloadStatus.get(url);
  };

  const isPreloaded = (url: string) => {
    return preloadStatus.get(url)?.status === 'loaded';
  };

  return {
    preloadVideos,
    getPreloadStatus,
    isPreloaded,
    preloadStatus: Array.from(preloadStatus.values())
  };
};
