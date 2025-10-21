import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useVideoPreloader } from '@/hooks/useVideoPreloader';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useProgressiveVideoLoading } from '@/hooks/useProgressiveVideoLoading';
import { getVideoUrl, preloadVideos, getNetworkInfo } from '@/shared/utils/imageUtils';
import OptimizedVideoPlayer from '@/components/OptimizedVideoPlayer';
import { VideoOptimizer, videoOptimizationUtils } from '@/utils/videoOptimization';

interface SmartVideoManagerProps {
  videoUrls: string[];
  currentIndex: number;
  onVideoChange?: (index: number) => void;
  enablePreloading?: boolean;
  enableAdaptiveQuality?: boolean;
  enableCompression?: boolean;
  className?: string;
}

const SmartVideoManager: React.FC<SmartVideoManagerProps> = ({
  videoUrls,
  currentIndex,
  onVideoChange,
  enablePreloading = true,
  enableAdaptiveQuality = true,
  enableCompression = false,
  className = "w-full h-full"
}) => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  
  // Hooks
  const { preloadVideos: preloadVideosHook, isPreloaded } = useVideoPreloader(videoUrls, {
    preloadCount: 3,
    preloadDistance: 1,
    maxConcurrentPreloads: 2
  });
  
  const { preloadVideos: swPreloadVideos, isRegistered } = useServiceWorker();
  const { 
    loadingState, 
    changeQuality, 
    getCurrentVideoUrl, 
    setupVideoListeners 
  } = useProgressiveVideoLoading(currentVideoUrl, {
    adaptiveBitrate: enableAdaptiveQuality,
    defaultQuality: 'auto'
  });

  // Video optimizer instance
  const videoOptimizer = useMemo(() => new VideoOptimizer(), []);

  // Network info
  const networkInfo = useMemo(() => getNetworkInfo(), []);

  // Update current video URL when index changes
  useEffect(() => {
    if (videoUrls[currentIndex]) {
      const videoUrl = getVideoUrl(videoUrls[currentIndex], loadingState.currentQuality);
      setCurrentVideoUrl(videoUrl);
    }
  }, [currentIndex, videoUrls, loadingState.currentQuality]);

  // Preload videos when component mounts or video list changes
  useEffect(() => {
    if (enablePreloading && videoUrls.length > 0) {
      // Preload next videos using the hook
      preloadVideosHook(currentIndex);
      
      // Preload using service worker if available
      if (isRegistered) {
        const nextVideos = videoUrls.slice(currentIndex + 1, currentIndex + 4);
        swPreloadVideos(nextVideos);
      }
    }
  }, [currentIndex, videoUrls, enablePreloading, preloadVideosHook, isRegistered, swPreloadVideos]);

  // Handle video optimization
  const handleVideoOptimization = useCallback(async (videoFile: File) => {
    if (!enableCompression || !videoOptimizationUtils.isOptimizationSupported()) {
      return null;
    }

    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      const recommendedSettings = videoOptimizationUtils.getRecommendedSettings();
      const result = await videoOptimizer.optimizeVideo(videoFile, recommendedSettings);
      
      setOptimizationProgress(100);
      return result;
    } catch (error) {
      console.error('Video optimization failed:', error);
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [enableCompression, videoOptimizer]);

  // Handle quality change
  const handleQualityChange = useCallback((newQuality: string) => {
    changeQuality(newQuality);
  }, [changeQuality]);

  // Handle video player events
  const handleVideoEvents = useCallback((videoElement: HTMLVideoElement) => {
    const cleanup = setupVideoListeners(videoElement);
    return cleanup;
  }, [setupVideoListeners]);

  // Get video player props
  const videoPlayerProps = useMemo(() => ({
    src: currentVideoUrl,
    className,
    quality: loadingState.currentQuality,
    enableAdaptiveBitrate: enableAdaptiveQuality,
    onPlay: () => console.log('Video started playing'),
    onPause: () => console.log('Video paused'),
    onEnded: () => {
      console.log('Video ended');
      if (currentIndex < videoUrls.length - 1) {
        onVideoChange?.(currentIndex + 1);
      }
    },
    onError: (error: any) => {
      console.error('Video error:', error);
      // Try to fallback to lower quality
      if (loadingState.currentQuality !== 'low') {
        handleQualityChange('low');
      }
    }
  }), [
    currentVideoUrl,
    className,
    loadingState.currentQuality,
    enableAdaptiveQuality,
    currentIndex,
    videoUrls.length,
    onVideoChange,
    handleQualityChange
  ]);

  // Render loading state
  if (isOptimizing) {
    return (
      <div className={`flex items-center justify-center bg-black rounded-lg ${className}`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Optimizing video...</p>
          <div className="w-48 bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizationProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Render video player
  return (
    <div className="relative">
      <OptimizedVideoPlayer {...videoPlayerProps} />
      
      {/* Network quality indicator */}
      {enableAdaptiveQuality && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              networkInfo.quality === 'good' ? 'bg-green-500' :
              networkInfo.quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span>{networkInfo.quality.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Preload status indicator */}
      {enablePreloading && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              isPreloaded(videoUrls[currentIndex + 1] || '') ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <span>Preload</span>
          </div>
        </div>
      )}

      {/* Quality selector */}
      {enableAdaptiveQuality && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          <select
            value={loadingState.currentQuality}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="bg-transparent text-white text-xs border-none outline-none"
          >
            <option value="auto">Auto</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      )}

      {/* Buffer progress indicator */}
      {loadingState.isLoading && (
        <div className="absolute bottom-16 left-4 right-4">
          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              <span>Loading...</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${loadingState.bufferProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartVideoManager;
