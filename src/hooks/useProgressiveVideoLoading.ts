import { useState, useEffect, useCallback, useRef } from 'react';

interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
  bitrate: number;
  bandwidth: number; // minimum bandwidth required in Mbps
}

interface ProgressiveLoadingOptions {
  qualities: VideoQuality[];
  defaultQuality: string;
  adaptiveBitrate: boolean;
  bufferSize: number; // in seconds
  preloadThreshold: number; // percentage of video to preload
}

interface LoadingState {
  currentQuality: string;
  isLoading: boolean;
  bufferProgress: number;
  networkSpeed: number;
  recommendedQuality: string;
  availableQualities: VideoQuality[];
}

const DEFAULT_QUALITIES: VideoQuality[] = [
  {
    label: 'Auto',
    value: 'auto',
    resolution: 'Auto',
    bitrate: 0,
    bandwidth: 0
  },
  {
    label: '1080p',
    value: '1080p',
    resolution: '1920x1080',
    bitrate: 5000,
    bandwidth: 5
  },
  {
    label: '720p',
    value: '720p',
    resolution: '1280x720',
    bitrate: 2500,
    bandwidth: 2.5
  },
  {
    label: '480p',
    value: '480p',
    resolution: '854x480',
    bitrate: 1000,
    bandwidth: 1
  },
  {
    label: '360p',
    value: '360p',
    resolution: '640x360',
    bitrate: 500,
    bandwidth: 0.5
  }
];

export const useProgressiveVideoLoading = (
  baseVideoUrl: string,
  options: Partial<ProgressiveLoadingOptions> = {}
) => {
  const {
    qualities = DEFAULT_QUALITIES,
    defaultQuality = 'auto',
    adaptiveBitrate = true,
    bufferSize = 10,
    preloadThreshold = 20
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    currentQuality: defaultQuality,
    isLoading: false,
    bufferProgress: 0,
    networkSpeed: 0,
    recommendedQuality: defaultQuality,
    availableQualities: qualities
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const networkSpeedRef = useRef<number>(0);
  const qualityChangeTimeoutRef = useRef<NodeJS.Timeout>();

  // Network speed detection
  const detectNetworkSpeed = useCallback(async () => {
    try {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const downlink = connection.downlink;
        networkSpeedRef.current = downlink;
        setLoadingState(prev => ({ ...prev, networkSpeed: downlink }));
        return downlink;
      }
      
      // Fallback: measure download speed
      const startTime = performance.now();
      const response = await fetch(baseVideoUrl, { method: 'HEAD' });
      const endTime = performance.now();
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          const sizeInMB = parseInt(contentLength) / (1024 * 1024);
          const timeInSeconds = (endTime - startTime) / 1000;
          const speedInMbps = (sizeInMB * 8) / timeInSeconds;
          networkSpeedRef.current = speedInMbps;
          setLoadingState(prev => ({ ...prev, networkSpeed: speedInMbps }));
          return speedInMbps;
        }
      }
    } catch (error) {
      console.error('Error detecting network speed:', error);
    }
    
    return 0;
  }, [baseVideoUrl]);

  // Recommend quality based on network speed
  const recommendQuality = useCallback((networkSpeed: number) => {
    if (!adaptiveBitrate) return defaultQuality;
    
    // Find the highest quality that can be supported by current network speed
    const supportedQualities = qualities.filter(quality => 
      quality.bandwidth <= networkSpeed || quality.value === 'auto'
    );
    
    if (supportedQualities.length === 0) {
      return qualities[qualities.length - 1].value; // Lowest quality
    }
    
    // Return the highest supported quality
    return supportedQualities[0].value;
  }, [qualities, adaptiveBitrate, defaultQuality]);

  // Generate video URL with quality parameter
  const generateVideoUrl = useCallback((quality: string) => {
    if (quality === 'auto') {
      return baseVideoUrl;
    }
    
    // Add quality parameter to URL
    const url = new URL(baseVideoUrl);
    url.searchParams.set('quality', quality);
    return url.toString();
  }, [baseVideoUrl]);

  // Change video quality
  const changeQuality = useCallback((newQuality: string) => {
    if (newQuality === loadingState.currentQuality) return;
    
    setLoadingState(prev => ({ ...prev, currentQuality: newQuality }));
    
    if (videoRef.current) {
      const newUrl = generateVideoUrl(newQuality);
      videoRef.current.src = newUrl;
      videoRef.current.load();
    }
  }, [loadingState.currentQuality, generateVideoUrl]);

  // Adaptive quality adjustment
  const adjustQualityBasedOnPerformance = useCallback(() => {
    if (!adaptiveBitrate || !videoRef.current) return;
    
    const video = videoRef.current;
    const buffered = video.buffered;
    const currentTime = video.currentTime;
    
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const bufferAhead = bufferedEnd - currentTime;
      
      // If buffer is running low, switch to lower quality
      if (bufferAhead < bufferSize / 2) {
        const currentIndex = qualities.findIndex(q => q.value === loadingState.currentQuality);
        if (currentIndex < qualities.length - 1) {
          const lowerQuality = qualities[currentIndex + 1].value;
          changeQuality(lowerQuality);
        }
      }
      // If buffer is healthy and network is good, try higher quality
      else if (bufferAhead > bufferSize && networkSpeedRef.current > 2) {
        const currentIndex = qualities.findIndex(q => q.value === loadingState.currentQuality);
        if (currentIndex > 0) {
          const higherQuality = qualities[currentIndex - 1].value;
          const higherQualityObj = qualities.find(q => q.value === higherQuality);
          if (higherQualityObj && higherQualityObj.bandwidth <= networkSpeedRef.current) {
            changeQuality(higherQuality);
          }
        }
      }
    }
  }, [adaptiveBitrate, bufferSize, qualities, loadingState.currentQuality, changeQuality]);

  // Monitor buffer progress
  const updateBufferProgress = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const buffered = video.buffered;
    const duration = video.duration;
    
    if (buffered.length > 0 && duration > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const progress = (bufferedEnd / duration) * 100;
      
      setLoadingState(prev => ({ ...prev, bufferProgress: progress }));
      
      // Trigger quality adjustment if needed
      if (adaptiveBitrate) {
        adjustQualityBasedOnPerformance();
      }
    }
  }, [adaptiveBitrate, adjustQualityBasedOnPerformance]);

  // Initialize network speed detection
  useEffect(() => {
    detectNetworkSpeed();
    
    // Set up network speed monitoring
    const interval = setInterval(detectNetworkSpeed, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [detectNetworkSpeed]);

  // Update recommended quality when network speed changes
  useEffect(() => {
    const recommended = recommendQuality(loadingState.networkSpeed);
    setLoadingState(prev => ({ ...prev, recommendedQuality: recommended }));
    
    // Auto-switch to recommended quality if adaptive bitrate is enabled
    if (adaptiveBitrate && recommended !== loadingState.currentQuality) {
      // Debounce quality changes
      if (qualityChangeTimeoutRef.current) {
        clearTimeout(qualityChangeTimeoutRef.current);
      }
      
      qualityChangeTimeoutRef.current = setTimeout(() => {
        changeQuality(recommended);
      }, 2000); // Wait 2 seconds before changing quality
    }
  }, [loadingState.networkSpeed, recommendQuality, adaptiveBitrate, loadingState.currentQuality, changeQuality]);

  // Set up video event listeners
  const setupVideoListeners = useCallback((video: HTMLVideoElement) => {
    const handleProgress = () => updateBufferProgress();
    const handleLoadStart = () => setLoadingState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setLoadingState(prev => ({ ...prev, isLoading: false }));
    
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    
    return () => {
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [updateBufferProgress]);

  // Get current video URL
  const getCurrentVideoUrl = useCallback(() => {
    return generateVideoUrl(loadingState.currentQuality);
  }, [generateVideoUrl, loadingState.currentQuality]);

  // Preload next quality
  const preloadNextQuality = useCallback(() => {
    const currentIndex = qualities.findIndex(q => q.value === loadingState.currentQuality);
    if (currentIndex > 0) {
      const nextQuality = qualities[currentIndex - 1];
      const nextUrl = generateVideoUrl(nextQuality.value);
      
      // Create a link element to preload
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = nextUrl;
      document.head.appendChild(link);
      
      // Remove after a delay
      setTimeout(() => {
        document.head.removeChild(link);
      }, 10000);
    }
  }, [qualities, loadingState.currentQuality, generateVideoUrl]);

  return {
    loadingState,
    changeQuality,
    getCurrentVideoUrl,
    setupVideoListeners,
    preloadNextQuality,
    generateVideoUrl,
    videoRef
  };
};
