import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw, Upload, FileText, Video, Database } from 'lucide-react';

interface StepStatus {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  message: string;
  icon: React.ReactNode;
}

interface ProgressData {
  status: 'starting' | 'validating' | 'uploading_video' | 'uploading_mcqs' | 'creating_module' | 'completed' | 'error';
  progress: number;
  message: string;
  data: any;
  error: string | null;
  currentStep: string;
  steps: StepStatus[];
}

interface EnhancedModuleCreationProgressProps {
  sessionId: string;
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function EnhancedModuleCreationProgress({
  sessionId,
  isVisible,
  onClose,
  onSuccess,
  onError
}: EnhancedModuleCreationProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Initialize steps
  const initializeSteps = (): StepStatus[] => [
    {
      id: 'video_upload',
      name: 'Uploading Video',
      status: 'pending',
      progress: 0,
      message: 'Waiting for video upload...',
      icon: <Video className="h-4 w-4" />
    },
    {
      id: 'mcq_upload',
      name: 'Processing MCQs',
      status: 'pending',
      progress: 0,
      message: 'Waiting for MCQs...',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'module_creation',
      name: 'Creating Module',
      status: 'pending',
      progress: 0,
      message: 'Waiting for module creation...',
      icon: <Database className="h-4 w-4" />
    }
  ];

  // Poll for progress updates
  useEffect(() => {
    if (!isVisible || !sessionId) return;

    setIsPolling(true);
    setProgressData({
      status: 'starting',
      progress: 0,
      message: 'Initializing module creation...',
      data: null,
      error: null,
      currentStep: 'video_upload',
      steps: initializeSteps()
    });

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/modules/progress/${sessionId}`);
        const result = await response.json();
        
        if (result.success) {
          const data = result.data;
          
          // Update steps based on current status
          const steps = initializeSteps();
          
          // Update step statuses based on progress
          if (data.status === 'uploading_video' || data.status === 'completed') {
            steps[0].status = data.status === 'completed' ? 'completed' : 'in_progress';
            steps[0].progress = data.status === 'completed' ? 100 : Math.min(data.progress, 100);
            steps[0].message = data.status === 'completed' ? 'Video uploaded successfully!' : 'Uploading video...';
          }
          
          if (data.status === 'uploading_mcqs' || data.status === 'completed') {
            steps[0].status = 'completed';
            steps[0].progress = 100;
            steps[1].status = data.status === 'completed' ? 'completed' : 'in_progress';
            steps[1].progress = data.status === 'completed' ? 100 : Math.min(data.progress - 50, 100);
            steps[1].message = data.status === 'completed' ? 'MCQs processed successfully!' : 'Processing MCQs...';
          }
          
          if (data.status === 'creating_module' || data.status === 'completed') {
            steps[0].status = 'completed';
            steps[1].status = 'completed';
            steps[2].status = data.status === 'completed' ? 'completed' : 'in_progress';
            steps[2].progress = data.status === 'completed' ? 100 : Math.min(data.progress - 80, 100);
            steps[2].message = data.status === 'completed' ? 'Module created successfully!' : 'Creating module...';
          }
          
          if (data.status === 'error') {
            // Mark current step as error
            const currentStepIndex = steps.findIndex(step => step.id === data.currentStep);
            if (currentStepIndex >= 0) {
              steps[currentStepIndex].status = 'error';
              steps[currentStepIndex].message = data.error || 'An error occurred';
            }
          }
          
          const updatedProgressData = {
            ...data,
            steps
          };
          
          setProgressData(updatedProgressData);
          
          // Check if completed or errored
          if (data.status === 'completed') {
            setIsPolling(false);
            clearInterval(pollInterval);
            onSuccess?.(data.data);
            // Auto-close after 5 seconds
            setTimeout(() => onClose(), 5000);
          } else if (data.status === 'error') {
            setIsPolling(false);
            clearInterval(pollInterval);
            onError?.(data.error || 'Unknown error occurred');
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
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={getStatusColor()}>
                {progressData.status === 'completed' ? 'Module Created Successfully!' : 
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
        
        <CardContent className="space-y-6">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{progressData.progress}%</span>
            </div>
            <Progress value={progressData.progress} className="h-3" />
          </div>

          {/* Step-by-Step Progress */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Upload Progress</h4>
            {progressData.steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className={`flex-shrink-0 ${
                  step.status === 'completed' ? 'text-green-500' :
                  step.status === 'error' ? 'text-red-500' :
                  step.status === 'in_progress' ? 'text-blue-500' :
                  'text-gray-400'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : step.status === 'error' ? (
                    <XCircle className="h-5 w-5" />
                  ) : step.status === 'in_progress' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-green-700' :
                      step.status === 'error' ? 'text-red-700' :
                      step.status === 'in_progress' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    {step.status === 'in_progress' && (
                      <span className="text-xs text-gray-500">{step.progress}%</span>
                    )}
                  </div>
                  
                  {step.status === 'in_progress' && (
                    <Progress value={step.progress} className="h-1 mt-1" />
                  )}
                  
                  <p className={`text-xs mt-1 ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'error' ? 'text-red-600' :
                    step.status === 'in_progress' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {step.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Current Status Message */}
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
            <strong>Status:</strong> {progressData.message}
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
              <div className="text-xs mt-1 space-y-1">
                <div>• Module: {progressData.data.module?.name}</div>
                <div>• Video: {progressData.data.video ? 'Uploaded successfully' : 'None'}</div>
                <div>• MCQs: {progressData.data.mcqs?.length || 0} questions added</div>
                <div>• Order: #{progressData.data.module?.order}</div>
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
