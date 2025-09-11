import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  Play, 
  Image as ImageIcon,
  File,
  Music
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';
import { useUpdateResourceTimeTracking } from '@/hooks/useApi';

interface Resource {
  id: number;
  filename: string;
  originalName: string;
  type: 'VIDEO' | 'PDF' | 'DOCUMENT' | 'IMAGE' | 'AUDIO';
  duration?: number;
  estimatedReadingTime?: number;
  filePath: string;
  url: string;
}

interface ResourceViewerProps {
  resource: Resource;
  onComplete?: () => void;
}

const ResourceViewer: React.FC<ResourceViewerProps> = ({ resource, onComplete }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const updateTimeTracking = useUpdateResourceTimeTracking();

  const getResourceIcon = () => {
    switch (resource.type) {
      case 'PDF':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'VIDEO':
        return <Play className="h-6 w-6 text-blue-500" />;
      case 'IMAGE':
        return <ImageIcon className="h-6 w-6 text-green-500" />;
      case 'AUDIO':
        return <Music className="h-6 w-6 text-purple-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getResourceTypeColor = () => {
    switch (resource.type) {
      case 'PDF':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'VIDEO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IMAGE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'AUDIO':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceUrl = () => {
    console.log('ResourceViewer Debug:', {
      resourceUrl: resource.url,
      filePath: resource.filePath,
      hasUrl: !!resource.url
    });
    
    if (resource.url) {
      // If url exists but doesn't include /resources/, fix it
      if (resource.url.includes('/uploads/') && !resource.url.includes('/uploads/resources/')) {
        return resource.url.replace('/uploads/', '/uploads/resources/');
      }
      return resource.url;
    }
    // Fallback to constructing URL from filePath
    const baseUrl = getApiBaseUrl().replace('/api', ''); // Remove /api from base URL for static files
    return `${baseUrl}/uploads/resources/${resource.filePath}`;
  };

  const getDuration = () => {
    if (resource.duration) {
      const minutes = Math.floor(resource.duration / 60);
      const seconds = resource.duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (resource.estimatedReadingTime) {
      return `${resource.estimatedReadingTime} min read`;
    }
    return 'Duration unknown';
  };

  const getProgress = () => {
    if (resource.duration) {
      return Math.min((timeSpent / resource.duration) * 100, 100);
    }
    if (resource.estimatedReadingTime) {
      const estimatedSeconds = resource.estimatedReadingTime * 60;
      return Math.min((timeSpent / estimatedSeconds) * 100, 100);
    }
    return 0;
  };

  const handleTimeUpdate = async (additionalTime: number) => {
    const newTimeSpent = timeSpent + additionalTime;
    setTimeSpent(newTimeSpent);

    try {
      await updateTimeTracking.mutateAsync({
        resourceId: resource.id,
        timeSpent: newTimeSpent
      });
    } catch (error) {
      console.error('Failed to update time tracking:', error);
    }

    // Check if completed
    const progress = getProgress();
    if (progress >= 90 && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getResourceUrl();
    link.download = resource.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    if (resource.type === 'PDF' || resource.type === 'IMAGE') {
      window.open(getResourceUrl(), '_blank');
    } else {
      // For other file types, trigger download
      handleDownload();
    }
  };

  // Start time tracking when component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying || resource.type === 'PDF' || resource.type === 'DOCUMENT') {
        handleTimeUpdate(1); // Update every second
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeSpent, resource.type]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getResourceIcon()}
            <div>
              <CardTitle className="text-sm font-medium truncate">
                {resource.originalName}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={`text-xs ${getResourceTypeColor()}`}>
                  {resource.type}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {getDuration()}
                </div>
              </div>
            </div>
          </div>
          {isCompleted && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleView}
              className="flex-1"
            >
              {resource.type === 'PDF' || resource.type === 'IMAGE' ? 'View' : 'Download'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceViewer;
