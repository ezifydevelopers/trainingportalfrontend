import React from 'react';
import SimpleYouTubePlayer from './SimpleYouTubePlayer';
import withYouTubePlayer from './withYouTubePlayer';

interface YouTubePlayerWrapperProps {
  youtubeVideoId?: string | null;
  youtubeClassName?: string;
  youtubeOnPlay?: () => void;
  youtubeOnPause?: () => void;
  youtubeOnTimeUpdate?: (currentTime: number, duration: number) => void;
  youtubeOnEnded?: () => void;
  youtubeOnLoadedMetadata?: (duration: number) => void;
  youtubeOnLoadStart?: () => void;
  youtubeOnCanPlay?: () => void;
  youtubeOnError?: (error: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  youtubePreload?: 'none' | 'metadata' | 'auto';
  youtubeDraggable?: boolean;
  youtubeAutoplay?: boolean;
  youtubeControls?: boolean;
  youtubeStartTime?: number;
  youtubeEndTime?: number;
  YouTubePlayerComponent?: React.ComponentType<any> | null;
}

const YouTubePlayerWrapper: React.FC<YouTubePlayerWrapperProps> = ({
  youtubeVideoId,
  youtubeClassName,
  youtubeOnPlay,
  youtubeOnPause,
  youtubeOnTimeUpdate,
  youtubeOnEnded,
  youtubeOnLoadedMetadata,
  youtubeOnLoadStart,
  youtubeOnCanPlay,
  youtubeOnError,
  youtubePreload,
  youtubeDraggable,
  youtubeAutoplay,
  youtubeControls,
  youtubeStartTime,
  youtubeEndTime,
  YouTubePlayerComponent
}) => {
  if (!youtubeVideoId || !YouTubePlayerComponent) {
    return null;
  }

  return (
    <YouTubePlayerComponent
      videoId={youtubeVideoId}
      className={youtubeClassName}
      onPlay={youtubeOnPlay}
      onPause={youtubeOnPause}
      onTimeUpdate={youtubeOnTimeUpdate}
      onEnded={youtubeOnEnded}
      onLoadedMetadata={youtubeOnLoadedMetadata}
      onLoadStart={youtubeOnLoadStart}
      onCanPlay={youtubeOnCanPlay}
      onError={youtubeOnError}
      preload={youtubePreload}
      draggable={youtubeDraggable}
      autoplay={youtubeAutoplay}
      controls={youtubeControls}
      startTime={youtubeStartTime}
      endTime={youtubeEndTime}
    />
  );
};

export default withYouTubePlayer(YouTubePlayerWrapper);
