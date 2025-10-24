import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Youtube, Link, CheckCircle, AlertCircle, ExternalLink, X } from 'lucide-react';

interface YouTubeVideoUploadProps {
  onVideoAdd: (videoData: { url: string; title: string; duration: number; thumbnail: string }) => void;
  onCancel: () => void;
}

const YouTubeVideoUpload: React.FC<YouTubeVideoUploadProps> = ({ onVideoAdd, onCancel }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [manualDuration, setManualDuration] = useState(300); // Default 5 minutes
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    videoId: string | null;
    title: string;
    duration: number;
    thumbnail: string;
    error?: string;
  } | null>(null);
  
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('YouTubeVideoUpload mounted with props:', { onVideoAdd, onCancel });
  }, [onVideoAdd, onCancel]);

  // Focus the URL input when component mounts
  useEffect(() => {
    if (urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, []);

  // Validate YouTube URL
  const validateYouTubeUrl = useCallback((url: string): { isValid: boolean; videoId: string | null } => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/user\/[^/]+\/?#\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { isValid: true, videoId: match[1] };
      }
    }
    return { isValid: false, videoId: null };
  }, []);

  // Get video information from YouTube
  const getVideoInfo = useCallback(async (videoId: string) => {
    try {
      // For now, we'll use a simple approach. In production, you might want to use YouTube Data API
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      // Since we can't easily get title and duration without API, we'll use placeholders
      // In a real implementation, you'd call YouTube Data API here
      return {
        title: `YouTube Video ${videoId}`,
        duration: manualDuration, // Use manual duration
        thumbnail
      };
    } catch (error) {
      throw new Error('Failed to get video information');
    }
  }, [manualDuration]);

  // Handle URL validation
  const handleValidateUrl = useCallback(async () => {
    if (!youtubeUrl.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const { isValid, videoId } = validateYouTubeUrl(youtubeUrl);
      
      if (!isValid || !videoId) {
        setValidationResult({
          isValid: false,
          videoId: null,
          title: '',
          duration: 0,
          thumbnail: '',
          error: 'Invalid YouTube URL. Please enter a valid YouTube link.'
        });
        return;
      }

      const videoInfo = await getVideoInfo(videoId);
      
      setValidationResult({
        isValid: true,
        videoId,
        title: videoInfo.title,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        videoId: null,
        title: '',
        duration: 0,
        thumbnail: '',
        error: error instanceof Error ? error.message : 'Failed to validate video'
      });
    } finally {
      setIsValidating(false);
    }
  }, [youtubeUrl, validateYouTubeUrl, getVideoInfo]);

  // Handle adding video
  const handleAddVideo = useCallback(() => {
    console.log('handleAddVideo called', { validationResult, youtubeUrl });
    if (validationResult?.isValid) {
      onVideoAdd({
        url: youtubeUrl,
        title: validationResult.title,
        duration: validationResult.duration,
        thumbnail: validationResult.thumbnail
      });
    }
  }, [validationResult, youtubeUrl, onVideoAdd]);

  // Handle URL change
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('URL changed:', e.target.value);
    setYoutubeUrl(e.target.value);
    setValidationResult(null);
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    console.log('Cancel button clicked');
    onCancel();
  }, [onCancel]);

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-red-200">
      <CardHeader className="bg-red-50 border-b border-red-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3 text-center">
            <div className="bg-red-100 rounded-full p-2">
              <Youtube className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800">Add YouTube Video</span>
              <p className="text-sm text-gray-600 font-normal">Paste a YouTube link to add video content</p>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* URL Input - Enhanced */}
        <div className="space-y-3">
          <Label htmlFor="youtube-url" className="text-sm font-semibold text-gray-700">
            YouTube Video URL *
          </Label>
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={urlInputRef}
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={youtubeUrl}
                onChange={handleUrlChange}
                className="pr-10 border-2 border-gray-300 focus:border-red-400 focus:ring-red-200"
              />
              <Youtube className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <Button
              onClick={() => {
                console.log('Validate button clicked');
                handleValidateUrl();
              }}
              disabled={!youtubeUrl.trim() || isValidating}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 flex items-center space-x-2"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  <span>Validate</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Supports YouTube, YouTube Shorts, and YouTube Music links
          </p>
        </div>

        {/* Duration Input - Enhanced */}
        <div className="space-y-3">
          <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
            Video Duration (seconds) *
          </Label>
          <div className="flex space-x-3">
            <Input
              id="duration"
              type="number"
              min="1"
              value={manualDuration}
              onChange={(e) => setManualDuration(Number(e.target.value))}
              placeholder="300"
              className="max-w-xs border-2 border-gray-300 focus:border-red-400 focus:ring-red-200"
            />
            <div className="text-sm text-gray-500 flex items-center">
              ≈ {Math.floor(manualDuration / 60)}:{(manualDuration % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Enter the video duration in seconds (e.g., 300 for 5 minutes)
          </p>
        </div>

        {/* Supported URL formats */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Supported formats:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>• https://youtu.be/VIDEO_ID</li>
              <li>• https://www.youtube.com/embed/VIDEO_ID</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Validation Result - Enhanced */}
        {validationResult && (
          <div className="space-y-3">
            {validationResult.isValid ? (
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center space-x-2 text-green-700 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-lg">Valid YouTube Video</span>
                </div>
                
                <div className="flex space-x-4">
                  {validationResult.thumbnail && (
                    <div className="relative">
                      <img
                        src={validationResult.thumbnail}
                        alt="Video thumbnail"
                        className="w-32 h-24 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                        <Youtube className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg mb-1">{validationResult.title}</p>
                    <p className="text-sm text-gray-600 mb-2">Video ID: {validationResult.videoId}</p>
                    <div className="flex items-center space-x-4">
                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in YouTube</span>
                      </a>
                      <span className="text-xs text-gray-500">
                        Duration: {Math.floor(validationResult.duration / 60)}:{(validationResult.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult.error || 'Invalid YouTube URL'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons - Enhanced */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log('Add YouTube Video button clicked');
              handleAddVideo();
            }}
            disabled={!validationResult?.isValid}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 flex items-center space-x-2"
          >
            <Youtube className="w-4 h-4" />
            <span>Add YouTube Video</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeVideoUpload;
