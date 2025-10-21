import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Loader2, Wifi, WifiOff } from 'lucide-react';

interface OptimizedVideoPlayerProps {
  src: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: any) => void;
  preload?: 'none' | 'metadata' | 'auto';
  draggable?: boolean;
  quality?: 'auto' | 'high' | 'medium' | 'low';
  enableAdaptiveBitrate?: boolean;
  bufferSize?: number; // in seconds
}

const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  src,
  className = "w-full h-full",
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
  onLoadedMetadata,
  onLoadStart,
  onCanPlay,
  onError,
  preload = "metadata",
  draggable = false,
  quality = 'auto',
  enableAdaptiveBitrate = true,
  bufferSize = 10
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'medium' | 'poor'>('good');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  // Performance optimizations
  const [adaptiveQuality, setAdaptiveQuality] = useState(quality);
  const [bufferedRanges, setBufferedRanges] = useState<TimeRanges | null>(null);
  const [connectionSpeed, setConnectionSpeed] = useState<number>(0);

  // Network quality detection
  useEffect(() => {
    const detectNetworkQuality = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        setConnectionSpeed(downlink);
        
        if (effectiveType === '4g' && downlink > 2) {
          setNetworkQuality('good');
        } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 2)) {
          setNetworkQuality('medium');
        } else {
          setNetworkQuality('poor');
        }
      }
    };

    detectNetworkQuality();
    
    const handleConnectionChange = () => {
      detectNetworkQuality();
    };

    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  // Adaptive quality based on network conditions
  useEffect(() => {
    if (enableAdaptiveBitrate && quality === 'auto') {
      if (networkQuality === 'poor') {
        setAdaptiveQuality('low');
      } else if (networkQuality === 'medium') {
        setAdaptiveQuality('medium');
      } else {
        setAdaptiveQuality('high');
      }
    } else {
      setAdaptiveQuality(quality);
    }
  }, [networkQuality, quality, enableAdaptiveBitrate]);

  // Online/offline detection
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

  // Optimized time update handler
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    setCurrentTime(currentTime);
    setDuration(duration);
    
    // Calculate buffer progress
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferProgress = duration > 0 ? (bufferedEnd / duration) * 100 : 0;
      setBufferProgress(bufferProgress);
      setBufferedRanges(video.buffered);
    }
    
    onTimeUpdate?.(currentTime, duration);
  }, [onTimeUpdate]);

  // Optimized metadata handler
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    
    const duration = videoRef.current.duration;
    setDuration(duration);
    onLoadedMetadata?.(duration);
  }, [onLoadedMetadata]);

  // Optimized load handlers
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    onCanPlay?.();
  }, [onCanPlay]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    console.error('Video error:', error);
    onError?.(error);
  }, [onError]);

  // Play/pause handlers with error handling
  const handlePlay = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      await videoRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    } catch (error) {
      console.warn('Play interrupted:', error);
      // Don't update state if play was interrupted
    }
  }, [onPlay]);

  const handlePause = useCallback(() => {
    if (!videoRef.current) return;
    
    videoRef.current.pause();
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).mozRequestFullScreen) {
        (videoRef.current as any).mozRequestFullScreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Volume control
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  // Playback rate control
  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  // Seek functionality
  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            videoRef.current.play();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 10));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, toggleMute, toggleFullscreen, handleSeek]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferProgress = duration > 0 ? (bufferedEnd / duration) * 100 : 0;
        setBufferProgress(bufferProgress);
      }
    };

    video.addEventListener('progress', handleProgress);
    return () => video.removeEventListener('progress', handleProgress);
  }, [duration]);

  // Memoized progress percentage
  const progressPercentage = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={(el) => {
          videoRef.current = el;
          if (el) {
            (window as any).currentVideo = el;
          }
        }}
        src={src}
        className="w-full h-full"
        preload={preload}
        draggable={draggable}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        onContextMenu={(e) => e.preventDefault()}
        onAbort={() => console.log('Video loading aborted')}
        onStalled={() => console.log('Video stalled')}
        onSuspend={() => console.log('Video loading suspended')}
        playsInline
        crossOrigin="anonymous"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-white text-sm">Loading video...</span>
          </div>
        </div>
      )}

      {/* Network status indicator */}
      {!isOnline && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      )}

      {/* Quality indicator */}
      {enableAdaptiveBitrate && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          {adaptiveQuality.toUpperCase()}
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 ${
        showControls || !isPlaying ? 'bg-opacity-30' : 'bg-opacity-0'
      }`}>
        {/* Progress bar */}
        <div className="absolute bottom-16 left-4 right-4">
          <div className="relative">
            {/* Buffer progress */}
            <div 
              className="absolute h-1 bg-white bg-opacity-30 rounded-full w-full"
              style={{ width: `${bufferProgress}%` }}
            />
            {/* Play progress */}
            <div 
              className="absolute h-1 bg-blue-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Progress bar background */}
            <div className="absolute h-1 bg-white bg-opacity-20 rounded-full w-full" />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause button */}
            <button
              onClick={async () => {
                if (isPlaying) {
                  handlePause();
                } else {
                  await handlePlay();
                }
              }}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Time display */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Playback rate */}
            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              className="bg-black bg-opacity-75 text-white text-sm rounded px-2 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedVideoPlayer;
