import React from 'react';
import LightweightVideoPlayer from './LightweightVideoPlayer';
import SimpleYouTubePlayer from './SimpleYouTubePlayer';

interface UniversalVideoPlayerProps {
  src: string;
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

const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = (props) => {
  const { src, ...otherProps } = props;

  // Check if it's a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  // Extract YouTube video ID from various YouTube URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      // Standard YouTube URLs
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/user\/[^\/]+\/?#\/v\/([^&\n?#]+)/,
      // Additional patterns for better detection
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Check if it's a YouTube URL and extract video ID
  if (isYouTubeUrl(src)) {
    const videoId = getYouTubeVideoId(src);
    console.log('YouTube URL detected:', src);
    console.log('Extracted video ID:', videoId);
    
    if (videoId) {
      return (
        <SimpleYouTubePlayer
          videoId={videoId}
          {...otherProps}
        />
      );
    } else {
      console.warn('Could not extract video ID from YouTube URL:', src);
    }
  }

  // For regular video files, use the lightweight player
  return (
    <LightweightVideoPlayer
      src={src}
      {...otherProps}
    />
  );
};

export default UniversalVideoPlayer;
