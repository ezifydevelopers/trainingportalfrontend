import React, { useState, useEffect, useRef, useCallback } from 'react';
import './YouTubeVideoPlayer.css';

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface SimpleYouTubePlayerProps {
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

const SimpleYouTubePlayer: React.FC<SimpleYouTubePlayerProps> = ({
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const isInitializingRef = useRef(false);

  // Build YouTube embed URL with proper parameters
  const buildYouTubeUrl = useCallback(() => {
    const params = new URLSearchParams({
      rel: '0',
      controls: controls ? '1' : '0',
      autoplay: autoplay ? '1' : '0',
      mute: '0',
      playsinline: '1',
      fs: '1',
      origin: window.location.origin,
      enablejsapi: '1',
      modestbranding: '1',
      showinfo: '0',
      iv_load_policy: '3',
      cc_load_policy: '0',
      disablekb: '0'
    });

    if (startTime > 0) {
      params.set('start', startTime.toString());
    }
    if (endTime && endTime > 0) {
      params.set('end', endTime.toString());
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, controls, autoplay, startTime, endTime]);

  const startProgressTracking = useCallback((player: YT.Player | null) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (player && player.getCurrentTime && player.getDuration) {
      // Real YouTube player progress tracking
      progressIntervalRef.current = setInterval(() => {
        try {
          const current = player.getCurrentTime();
          const dur = player.getDuration();
          
          setCurrentTime(current);
          setDuration(dur);
          
          if (dur > 0) {
            onTimeUpdate?.(current, dur);
          }
        } catch (error) {
          console.warn('Error getting YouTube player time:', error);
        }
      }, 1000); // Update every second
    } else {
      // Fallback progress simulation
      let simulatedTime = 0;
      const estimatedDuration = 300; // 5 minutes
      
      progressIntervalRef.current = setInterval(() => {
        simulatedTime += 1;
        setCurrentTime(simulatedTime);
        
        if (simulatedTime >= estimatedDuration) {
          console.log('Simulated video ended');
          onEnded?.();
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        } else {
          onTimeUpdate?.(simulatedTime, estimatedDuration);
        }
      }, 1000);
    }
  }, [onTimeUpdate, onEnded]);

  const initializePlayer = useCallback(() => {
    // Prevent multiple initializations
    if (isPlayerReady || isInitializingRef.current) {
      console.log('Player already ready or initializing, skipping initialization');
      return;
    }

    isInitializingRef.current = true;

    if (!window.YT || !window.YT.Player) {
      console.error('YouTube API not available, using fallback');
      // Don't set error, use fallback instead
      setIsLoading(false);
      setIsPlayerReady(true);
      isInitializingRef.current = false;
      onCanPlay?.();
      
      const estimatedDuration = 300;
      setDuration(estimatedDuration);
      onLoadedMetadata?.(estimatedDuration);
      startProgressTracking(null);
      return;
    }

    console.log('Initializing YouTube player for video:', videoId);
    setIsLoading(false);
    setHasError(false);
    onLoadStart?.();

    try {
      // Create a unique ID for the player
      const playerId = `youtube-player-${videoId}-${Date.now()}`;
      
      // Create a div element for the player
      if (iframeRef.current) {
        iframeRef.current.id = playerId;
      }

      const youtubePlayer = new window.YT.Player(playerId, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          rel: 0,
          controls: controls ? 1 : 0,
          autoplay: autoplay ? 1 : 0,
          mute: 0,
          playsinline: 1,
          fs: 1,
          start: startTime,
          end: endTime,
          origin: window.location.origin,
          enablejsapi: 1,
          modestbranding: 1,
          showinfo: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          disablekb: 0
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            setIsLoading(false);
            setIsPlayerReady(true);
            setPlayer(youtubePlayer);
            isInitializingRef.current = false;
            onCanPlay?.();
            
            // Get video duration
            const videoDuration = youtubePlayer.getDuration();
            if (videoDuration > 0) {
              setDuration(videoDuration);
              onLoadedMetadata?.(videoDuration);
            }

            // Start progress tracking
            startProgressTracking(youtubePlayer);
          },
          onStateChange: (event: any) => {
            const state = event.data;
            console.log('YouTube player state changed:', state);
            
            switch (state) {
              case window.YT.PlayerState.PLAYING:
                onPlay?.();
                break;
              case window.YT.PlayerState.PAUSED:
                onPause?.();
                break;
              case window.YT.PlayerState.ENDED:
                console.log('YouTube video ended');
                onEnded?.();
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                }
                break;
              case window.YT.PlayerState.BUFFERING:
                console.log('YouTube video buffering');
                break;
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            // Don't set error, use fallback instead
            console.log('Using fallback due to YouTube player error');
            setIsLoading(false);
            setIsPlayerReady(true);
            onCanPlay?.();
            
            const estimatedDuration = 300;
            setDuration(estimatedDuration);
            onLoadedMetadata?.(estimatedDuration);
            startProgressTracking(null);
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      // Don't set error, use fallback instead
      console.log('Using fallback due to initialization error');
      setIsLoading(false);
      setIsPlayerReady(true);
      isInitializingRef.current = false;
      onCanPlay?.();
      
      const estimatedDuration = 300;
      setDuration(estimatedDuration);
      onLoadedMetadata?.(estimatedDuration);
      startProgressTracking(null);
    }
  }, [videoId, controls, autoplay, startTime, endTime, onPlay, onPause, onEnded, onLoadedMetadata, onLoadStart, onCanPlay, startProgressTracking, isPlayerReady]);

  // Load YouTube API and initialize player with fallback
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      // Load YouTube API script if not already loaded
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = () => {
          console.error('Failed to load YouTube API, using fallback');
          // Fallback to iframe approach
          setIsLoading(false);
          setIsPlayerReady(true);
          onCanPlay?.();
          
          const estimatedDuration = 300;
          setDuration(estimatedDuration);
          onLoadedMetadata?.(estimatedDuration);
          startProgressTracking(null);
        };
        document.head.appendChild(script);
      }

      // Set up global callback
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        initializePlayer();
      };

      // Fallback timeout in case API doesn't load
      timeoutId = setTimeout(() => {
        if (!isPlayerReady) {
          console.log('YouTube API timeout, using fallback iframe');
          setIsLoading(false);
          setIsPlayerReady(true);
          onCanPlay?.();
          
          const estimatedDuration = 300;
          setDuration(estimatedDuration);
          onLoadedMetadata?.(estimatedDuration);
          startProgressTracking(null);
        }
      }, 10000); // 10 second timeout
    };

    loadYouTubeAPI();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.warn('Error destroying YouTube player:', error);
        }
      }
      isInitializingRef.current = false;
    };
  }, [videoId]); // Only depend on videoId to prevent infinite loops

  const handleIframeLoad = useCallback(() => {
    console.log('YouTube iframe loaded');
    // Don't set loading to false here, wait for API ready
  }, []);


  const handleIframeError = useCallback(() => {
    console.error('YouTube iframe failed to load');
    // Don't set error immediately, try fallback first
    console.log('YouTube iframe failed, using fallback approach');
    setIsLoading(false);
    setIsPlayerReady(true);
    onCanPlay?.();
    
    const estimatedDuration = 300;
    setDuration(estimatedDuration);
    onLoadedMetadata?.(estimatedDuration);
    startProgressTracking(null);
  }, [onCanPlay, onLoadedMetadata, startProgressTracking]);

  return (
    <div 
      className={`youtube-video-player relative bg-black rounded-lg overflow-hidden group ${className}`}
    >
      {/* YouTube iframe - will be replaced by YouTube API */}
      <div
        ref={iframeRef}
        className="w-full h-full"
        title="YouTube video player"
      />
      
      {/* Fallback iframe in case API fails */}
      {!isPlayerReady && (
        <iframe
          className="w-full h-full absolute top-0 left-0"
          title="YouTube video player fallback"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          src={buildYouTubeUrl()}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}

      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50">
          <div className="text-center text-white">
            <div className="text-sm mb-2">Failed to load YouTube video</div>
            <div className="text-xs opacity-75">Video ID: {videoId}</div>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                // Re-initialize the player instead of reloading the page
                initializePlayer();
              }}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleYouTubePlayer;
