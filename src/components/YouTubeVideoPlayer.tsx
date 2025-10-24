import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import './YouTubeVideoPlayer.css';

interface YouTubeVideoPlayerProps {
  videoId: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  preload?: 'none' | 'metadata' | 'auto';
  draggable?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  startTime?: number;
  endTime?: number;
}

const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  videoId,
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
  autoplay = false,
  controls = true,
  startTime = 0,
  endTime
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  // Simple iframe loading - no complex API needed
  useEffect(() => {
    console.log('Loading YouTube video:', videoId);
    setIsLoading(true);
    setHasError(false);
    
    // Simple timeout to detect if iframe fails to load
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('YouTube video loaded successfully');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      clearTimeout(timeout);
    };
  }, [videoId, isLoading]);

  // Simple iframe approach - no complex player initialization needed

  // Simple iframe approach - no complex monitoring needed

  // Play/pause handlers
  const handlePlay = useCallback(() => {
    if (player) {
      player.playVideo();
    }
  }, [player]);

  const handlePause = useCallback(() => {
    if (player) {
      player.pauseVideo();
    }
  }, [player]);

  // Volume control
  const toggleMute = useCallback(() => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  }, [player, isMuted]);

  // Seek functionality
  const handleSeek = useCallback((time: number) => {
    if (player) {
      player.seekTo(time, true);
    }
  }, [player]);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!iframeRef.current) return;

    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

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

  // Get YouTube thumbnail
  const getThumbnail = useCallback(() => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }, [videoId]);

  return (
    <div 
      className={`youtube-video-player relative bg-black rounded-lg overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* YouTube iframe */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&playsinline=1&disablekb=1&autoplay=0&mute=0&theme=dark&color=white&hl=en&origin=${window.location.origin}`}
        className="w-full h-full"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => {
          console.log('YouTube iframe loaded');
          setIsLoading(false);
        }}
        onError={() => {
          console.error('YouTube iframe failed to load');
          setHasError(true);
          setIsLoading(false);
        }}
      />
      
      {/* Loading indicator removed */}

      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50">
          <div className="text-center text-white">
            <div className="text-sm mb-2">Failed to load YouTube video</div>
            <div className="text-xs opacity-75">Video ID: {videoId}</div>
          </div>
        </div>
      )}

      {/* YouTube branding removed for cleaner UI */}

      {/* YouTube player has its own native controls */}
      
      {/* Overlay to hide YouTube branding */}
      <div className="youtube-overlay"></div>
      
      {/* Hide YouTube logo in bottom right corner */}
      <div className="youtube-logo-hider"></div>
    </div>
  );
};

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default YouTubeVideoPlayer;
