import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

interface CustomVideoPlayerProps {
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

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
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

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
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
      // Exit fullscreen
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
  };

  // Listen for fullscreen changes and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F key for fullscreen toggle
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
      // Escape key to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      // Set global video reference for compatibility with existing code
      (window as any).currentVideo = videoRef.current;
      onPlay?.();
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      // Set global video reference for compatibility with existing code
      (window as any).currentVideo = videoRef.current;
      onPause?.();
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      onTimeUpdate?.(current, dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Set global video reference for compatibility with existing code
      (window as any).currentVideo = videoRef.current;
      onLoadedMetadata?.(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={(el) => {
          videoRef.current = el;
          // Set global video reference for compatibility with existing code
          if (el) {
            (window as any).currentVideo = el;
          }
        }}
        src={src}
        className="w-full h-full"
        preload={preload}
        draggable={draggable}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={onLoadStart}
        onCanPlay={onCanPlay}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onError={onError}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 ${
        showControls || !isPlaying ? 'bg-opacity-30' : 'bg-opacity-0'
      }`}>
        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <button
              onClick={handlePlay}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
            >
              <Play className="h-8 w-8 text-gray-800 ml-1" fill="currentColor" />
            </button>
          )}
        </div>

        {/* Fullscreen Button - Top Right */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleFullscreen}
            className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-2 transition-all duration-200"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Bottom Controls Bar */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-transform duration-300 ${
          showControls || !isPlaying ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="flex items-center space-x-3">
            {/* Play/Pause Button */}
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" fill="currentColor" />
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white text-sm font-mono">
                {formatTime(duration)}
              </span>
            </div>

            {/* Mute Button */}
            <button
              onClick={handleMute}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default CustomVideoPlayer;
