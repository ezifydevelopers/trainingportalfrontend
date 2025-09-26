import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface ProgressData {
  status: 'starting' | 'validating' | 'creating' | 'completed' | 'error';
  progress: number;
  message: string;
  data: any;
  error: string | null;
}

interface ModuleCreationProgressProps {
  sessionId: string;
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function ModuleCreationProgress({
  sessionId,
  isVisible,
  onClose,
  onSuccess,
  onError
}: ModuleCreationProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for progress updates
  useEffect(() => {
    if (!isVisible || !sessionId) return;

    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/modules/progress/${sessionId}`);
        const result = await response.json();
        
        if (result.success) {
          setProgressData(result.data);
          
          // Check if completed or errored
          if (result.data.status === 'completed') {
            setIsPolling(false);
            clearInterval(pollInterval);
            onSuccess?.(result.data.data);
            // Auto-close after 3 seconds
            setTimeout(() => onClose(), 3000);
          } else if (result.data.status === 'error') {
            setIsPolling(false);
            clearInterval(pollInterval);
            onError?.(result.data.error || 'Unknown error occurred');
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error);
        // Continue polling even if there's an error
      }
    }, 1000); // Poll every second

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [isVisible, sessionId, onSuccess, onError, onClose]);

  // Manual refresh
  const handleRefresh = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/admin/modules/progress/${sessionId}`);
      const result = await response.json();
      
      if (result.success) {
        setProgressData(result.data);
      }
    } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  };

  if (!isVisible || !progressData) return null;

  const getStatusIcon = () => {
    switch (progressData.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (progressData.status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const canClose = progressData.status === 'completed' || progressData.status === 'error';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={getStatusColor()}>
                {progressData.status === 'completed' ? 'Module Created!' : 
                 progressData.status === 'error' ? 'Creation Failed' : 
                 'Creating Module...'}
              </span>
            </div>
            {canClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{progressData.progress}%</span>
            </div>
            <Progress value={progressData.progress} className="h-2" />
          </div>

          {/* Status Message */}
          <div className="text-sm text-gray-700">
            {progressData.message}
          </div>

          {/* Error Message */}
          {progressData.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <strong>Error:</strong> {progressData.error}
            </div>
          )}

          {/* Success Data */}
          {progressData.status === 'completed' && progressData.data && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <div className="font-medium">Module created successfully!</div>
              <div className="text-xs mt-1">
                • Module: {progressData.data.module?.name}<br/>
                • Video: {progressData.data.video ? 'Uploaded' : 'None'}<br/>
                • MCQs: {progressData.data.mcqs?.length || 0}<br/>
                • Trainees assigned: {progressData.data.traineesAssigned || 0}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!isPolling}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            
            {canClose && (
              <Button
                size="sm"
                onClick={onClose}
                className="ml-2"
              >
                {progressData.status === 'completed' ? 'Done' : 'Close'}
              </Button>
            )}
          </div>

          {/* Polling Indicator */}
          {isPolling && (
            <div className="text-xs text-gray-500 text-center">
              Auto-refreshing every second...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
