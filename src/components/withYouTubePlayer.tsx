import React, { ComponentType } from 'react';
import SimpleYouTubePlayer from './SimpleYouTubePlayer';

interface WithYouTubePlayerProps {
  youtubeUrl?: string;
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

const withYouTubePlayer = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  return React.forwardRef<any, P & WithYouTubePlayerProps>((props, ref) => {
    const {
      youtubeUrl,
      className,
      onPlay,
      onPause,
      onTimeUpdate,
      onEnded,
      onLoadedMetadata,
      onLoadStart,
      onCanPlay,
      onError,
      preload,
      draggable,
      autoplay,
      controls,
      startTime,
      endTime,
      ...restProps
    } = props;

    // Extract video ID from YouTube URL
    const extractVideoId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/user\/[^/]+\/?#\/v\/([^&\n?#]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      return null;
    };

    const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

    return (
      <WrappedComponent
        {...(restProps as P)}
        ref={ref}
        // Pass YouTube player props
        youtubeVideoId={videoId}
        youtubeClassName={className}
        youtubeOnPlay={onPlay}
        youtubeOnPause={onPause}
        youtubeOnTimeUpdate={onTimeUpdate}
        youtubeOnEnded={onEnded}
        youtubeOnLoadedMetadata={onLoadedMetadata}
        youtubeOnLoadStart={onLoadStart}
        youtubeOnCanPlay={onCanPlay}
        youtubeOnError={onError}
        youtubePreload={preload}
        youtubeDraggable={draggable}
        youtubeAutoplay={autoplay}
        youtubeControls={controls}
        youtubeStartTime={startTime}
        youtubeEndTime={endTime}
        // YouTube player component
        YouTubePlayerComponent={videoId ? SimpleYouTubePlayer : null}
      />
    );
  });
};

export default withYouTubePlayer;
