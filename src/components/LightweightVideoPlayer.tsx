import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

interface LightweightVideoPlayerProps {
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
}

const LightweightVideoPlayer: React.FC<LightweightVideoPlayerProps> = ({
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
  draggable = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simple time update handler
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    setCurrentTime(currentTime);
    setDuration(duration);
    onTimeUpdate?.(currentTime, duration);
  }, [onTimeUpdate]);

  // Simple metadata handler
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    
    const duration = videoRef.current.duration;
    setDuration(duration);
    onLoadedMetadata?.(duration);
  }, [onLoadedMetadata]);

  // Simple load handlers
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
    onError?.(error);
  }, [onError]);

  // Play/pause handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
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
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
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

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        ref={videoRef}
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
        playsInline
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-sm">Loading...</div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 ${
        showControls || !isPlaying ? 'bg-opacity-30' : 'bg-opacity-0'
      }`}>
        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause button */}
            <button
              onClick={() => {
                if (isPlaying) {
                  videoRef.current?.pause();
                } else {
                  videoRef.current?.play();
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
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center space-x-4">
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

export default LightweightVideoPlayer;
