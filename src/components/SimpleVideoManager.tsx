import React, { useState, useEffect, useCallback } from 'react';
import LightweightVideoPlayer from './LightweightVideoPlayer';
import { getVideoUrl } from '@/shared/utils/imageUtils';

interface SimpleVideoManagerProps {
  videoUrls: string[];
  currentIndex: number;
  onVideoChange?: (index: number) => void;
  className?: string;
}

const SimpleVideoManager: React.FC<SimpleVideoManagerProps> = ({
  videoUrls,
  currentIndex,
  onVideoChange,
  className = "w-full h-full"
}) => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update current video URL when index changes
  useEffect(() => {
    if (videoUrls[currentIndex]) {
      const videoUrl = getVideoUrl(videoUrls[currentIndex]);
      setCurrentVideoUrl(videoUrl);
      setError(null);
    }
  }, [currentIndex, videoUrls]);

  // Handle video events
  const handleVideoEvents = useCallback((eventType: string, data?: any) => {
    switch (eventType) {
      case 'play':
        console.log('Video started playing');
        break;
      case 'pause':
        console.log('Video paused');
        break;
      case 'ended':
        console.log('Video ended');
        if (currentIndex < videoUrls.length - 1) {
          onVideoChange?.(currentIndex + 1);
        }
        break;
      case 'error':
        console.error('Video error:', data);
        setError('Failed to load video. Please try again.');
        break;
      case 'loadStart':
        setIsLoading(true);
        setError(null);
        break;
      case 'canPlay':
        setIsLoading(false);
        setError(null);
        break;
    }
  }, [currentIndex, videoUrls.length, onVideoChange]);

  // Handle time update
  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    // Optional: Add progress tracking here
  }, []);

  // Handle metadata loaded
  const handleLoadedMetadata = useCallback((duration: number) => {
    console.log('Video duration:', duration);
  }, []);

  // Render error state
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black rounded-lg ${className}`}>
        <div className="text-center text-white">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setCurrentVideoUrl(getVideoUrl(videoUrls[currentIndex]));
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render video player
  return (
    <div className="relative">
      <LightweightVideoPlayer
        src={currentVideoUrl}
        className={className}
        onPlay={() => handleVideoEvents('play')}
        onPause={() => handleVideoEvents('pause')}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => handleVideoEvents('ended')}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={() => handleVideoEvents('loadStart')}
        onCanPlay={() => handleVideoEvents('canPlay')}
        onError={(error) => handleVideoEvents('error', error)}
        preload="metadata"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          Loading...
        </div>
      )}

      {/* Video counter */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
        {currentIndex + 1} / {videoUrls.length}
      </div>
    </div>
  );
};

export default SimpleVideoManager;
