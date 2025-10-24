import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useModule, useCompleteModule, useDashboard } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { Play, CheckCircle, ArrowLeft, ArrowRight, Clock, FileText, AlertCircle, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import HelpRequestButton from "@/components/HelpRequestButton";
import FeedbackModal from "@/components/FeedbackModal";
import ResourceViewer from "@/components/ResourceViewer";
import ModuleResources from "@/components/ModuleResources";
import { getApiBaseUrl, getBaseUrl } from "@/lib/api";
import UniversalVideoPlayer from "@/components/UniversalVideoPlayer";

export default function TrainingModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [videoProgress, setVideoProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
     const [videoCompleted, setVideoCompleted] = useState(false);
   const [showFeedbackModal, setShowFeedbackModal] = useState(false);
   const [isVideoPlaying, setIsVideoPlaying] = useState(false);
   const [isFullscreen, setIsFullscreen] = useState(false);
   const [isVideoLoading, setIsVideoLoading] = useState(true);
   const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(true);

  // Fetch module data from API
  const { 
    data: module, 
    isLoading, 
    error 
  } = useModule(parseInt(moduleId || "0"));
  
  // Complete module mutation
  const completeModuleMutation = useCompleteModule();

  // Fetch dashboard data to check if all modules are completed
  const { data: dashboardData } = useDashboard();

  // Function to check if user has completed all modules
  const hasCompletedAllModules = () => {
    if (!dashboardData) return false;
    const totalModules = dashboardData.moduleProgress?.length || 0;
    return dashboardData.modulesCompleted === totalModules && totalModules > 0;
  };

  useEffect(() => {
    if (!user || user.role !== "TRAINEE") {
      navigate("/training");
      return;
    }
  }, [user, navigate]);

  // Reset video states when module changes
  useEffect(() => {
    if (module) {
      setIsVideoLoading(false); // Never show loading
      setVideoError(null);
      setIsVideoPlaying(false);
    }
  }, [module]);

  // Sync videoCompleted state with module.completed from API
  useEffect(() => {
    if (module?.completed) {
      setVideoCompleted(true);
      setVideoProgress(100);
    }
  }, [module?.completed]);

  // Video manipulation prevention is now handled by CustomVideoPlayer

   // Detect fullscreen changes
   useEffect(() => {
     const handleFullscreenChange = () => {
       setIsFullscreen(!!document.fullscreenElement);
     };

     document.addEventListener('fullscreenchange', handleFullscreenChange);
     document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
     document.addEventListener('mozfullscreenchange', handleFullscreenChange);
     document.addEventListener('MSFullscreenChange', handleFullscreenChange);

     return () => {
       document.removeEventListener('fullscreenchange', handleFullscreenChange);
       document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
       document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
       document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
     };
   }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading module...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !module) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Module Not Found</h3>
            <p className="text-gray-600 mb-4">
              {error?.message || "The requested module could not be found or you don't have access to it."}
            </p>
            <Button onClick={() => navigate("/training")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleVideoComplete = async () => {
    console.log('🎬 Video completed! Module ID:', moduleId);
    console.log('📚 Module data:', module);
    
    if (!moduleId) {
      console.log('❌ No module ID found');
      return;
    }
    
    // Check if module has MCQs
    const hasMCQs = module?.mcqs && module.mcqs.length > 0;
    console.log('❓ Module has MCQs:', hasMCQs);
    console.log('📝 MCQs count:', module?.mcqs?.length || 0);
    
    if (hasMCQs) {
      // Module has MCQs - don't mark as completed yet, just show quiz prompt
      console.log('📝 Module has MCQs, showing quiz prompt');
      setVideoCompleted(true);
      setVideoProgress(100);
      toast.success("Video completed! You can now take the quiz.");
      return;
    }
    
    // Module has no MCQs - mark as completed and auto-pass
    console.log('✅ Module has no MCQs, marking as completed and auto-passing');
    try {
      // Call the API to mark the module as completed (auto-pass)
      console.log('🔄 Calling completeModule API...');
      const result = await completeModuleMutation.mutateAsync(parseInt(moduleId));
      console.log('✅ API response:', result);
      
      // Update local state
      setVideoCompleted(true);
      setVideoProgress(100);
      
      toast.success("Module completed successfully! You can now access the next module.");
      
      // Only show feedback modal if this is the last module
      if (hasCompletedAllModules()) {
        setShowFeedbackModal(true);
      }
    } catch (error) {
      console.error('❌ Error calling completeModule API:', error);
      toast.error("Failed to mark video as completed. Please try again.");
    }
  };

  const handleStartQuiz = () => {
    if (!videoCompleted) {
      toast.error("Please complete the video before taking the quiz.");
      return;
    }
    setShowQuiz(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (module.mcqs && currentQuestion < module.mcqs.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!module.mcqs || !user) return;
    const answers = {};
    module.mcqs.forEach((mcq, index) => {
      const selectedAnswerIndex = selectedAnswers[index];
      if (selectedAnswerIndex !== undefined && selectedAnswerIndex >= 0) {
        answers[mcq.id] = mcq.options[selectedAnswerIndex];
      }
    });

    try {
      const response = await fetch(`${getApiBaseUrl()}/trainee/modules/${moduleId}/mcq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ answers })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.pass) {
          toast.success(`Congratulations! You passed with ${result.score}%`);
          
          // Invalidate dashboard data to refresh module unlock status
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
            queryClient.invalidateQueries({ queryKey: ['modules'] }),
            queryClient.invalidateQueries({ queryKey: ['module', parseInt(moduleId || "0")] })
          ]);
          
          if (hasCompletedAllModules()) {
            setShowFeedbackModal(true);
          } else {
            setTimeout(() => {
              navigate("/training");
            }, 1000);
          }
        } else {
          toast.error(`Score: ${result.score}%. You need 70% to pass. Please try again.`);
          setShowQuiz(false);
          setCurrentQuestion(0);
          setSelectedAnswers([]);
        }
      } else {
        toast.error(result.message || "Failed to submit quiz");
      }
    } catch (error) {
      toast.error("Failed to submit quiz. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Video control functions - now handled by CustomVideoPlayer

  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) {
      return '';
    }
    
    // If it's already a complete URL (YouTube or other), return as is
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    
    // For file uploads, construct the full URL
    const baseUrl = getBaseUrl();
    if (videoUrl.startsWith('/uploads/')) {
      // Video URL already has /uploads/ prefix, just add the base URL
      return `${baseUrl}${videoUrl}`;
    } else {
      // Video URL is just a filename, add /uploads/ prefix
      return `${baseUrl}/uploads/${videoUrl}`;
    }
  };

  const capitalizeModuleName = (name: string) => {
    if (!name) return '';
    return name.toUpperCase();
  };

  const handleFeedbackComplete = () => {
    setShowFeedbackModal(false);
    setTimeout(() => {
      navigate("/training");
    }, 1000);
  };

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/training")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Button>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {capitalizeModuleName(module.name)}
            </Badge>
            {module.completed && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold">{capitalizeModuleName(module.name)}</h1>
          <div className="flex items-center space-x-4 mt-1">
            {module.videos?.[0] && (
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(module.videos?.[0].duration)}
              </span>
            )}
            {module.mcqs && (
              <span className="text-sm text-gray-500 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {module.mcqs.length} questions
              </span>
            )}
          </div>
        </div>

        {!showQuiz ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Video Section - Only show for non-resource modules */}
            {!module?.isResourceModule && (
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <Play className="h-4 w-4 mr-2" />
                      Video Tutorial
                    </CardTitle>
                  </CardHeader>
                <CardContent className="pt-0">
                  {module.videos?.[0] ? (
                    <div className="space-y-3">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden select-none relative">
                        
                        {/* Error state */}
                        {videoError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50">
                            <div className="text-center text-white p-4">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm mb-2">{videoError}</p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-white border-white hover:bg-white hover:text-black"
                                onClick={() => {
                                  setVideoError(null);
                                  setIsVideoLoading(true);
                                  // Force re-render of the video player
                                  const videoElement = document.querySelector('video');
                                  if (videoElement) {
                                    videoElement.load();
                                  }
                                }}
                              >
                                Retry
                              </Button>
                            </div>
                          </div>
                        )}
                        <UniversalVideoPlayer
                          src={getVideoUrl(module.videos?.[0]?.url || '')}
                          className="w-full aspect-video"
                          onPlay={() => {
                            setIsVideoPlaying(true);
                            setIsVideoPaused(false);
                          }}
                          onPause={() => {
                            setIsVideoPlaying(false);
                            setIsVideoPaused(true);
                          }}
                          onTimeUpdate={(currentTime, duration) => {
                            const progress = (currentTime / duration) * 100;
                            setVideoProgress(progress);
                            setCurrentTime(currentTime);
                          }}
                          onLoadedMetadata={(duration) => {
                            setVideoDuration(duration);
                          }}
                          onEnded={() => {
                            console.log('🎬 Video onEnded event triggered');
                            handleVideoComplete();
                          }}
                          onLoadStart={() => {
                            setIsVideoLoading(true);
                            setVideoError(null);
                          }}
                          onCanPlay={() => {
                            console.log('Video can play:', getVideoUrl(module.videos?.[0]?.url));
                            setIsVideoLoading(false);
                            setVideoError(null);
                          }}
                          onError={(error) => {
                            console.error('Video error:', error);
                            console.error('Video URL:', getVideoUrl(module.videos?.[0]?.url || ''));
                            console.error('Original video URL:', module.videos?.[0]?.url);
                            setIsVideoLoading(false);
                            setVideoError('Failed to load video. Please check your internet connection and try again.');
                            toast.error('Failed to load video. Please try again.');
                          }}
                          preload="metadata"
                          draggable={false}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(videoProgress)}%</span>
                        </div>
                        <Progress value={videoProgress} />
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleVideoComplete} 
                            size="sm" 
                            className="mt-1"
                            disabled={videoCompleted}
                          >
                            {videoCompleted ? "Video Completed" : 
                              videoProgress < 100 ? `Watch Complete Video (${Math.round(videoProgress)}%)` : "Mark as Watched"}
                          </Button>
                          {videoProgress < 10 && (
                            <Button 
                              onClick={handleVideoComplete} 
                              size="sm" 
                              variant="outline"
                              className="mt-1"
                              disabled={videoCompleted}
                            >
                              Skip Video
                            </Button>
                          )}
                        </div>
                        {/* Video Control Restriction Notice - Moved below video */}
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-2 rounded text-center">
                          ⚠️ You must watch the entire video to complete this module.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No video available for this module</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            )}

            {/* Resources Section */}
            <div className={`${module?.isResourceModule ? 'lg:col-span-3' : 'lg:col-span-2'} mb-4`}>
              <ModuleResources
                moduleId={Number(moduleId)}
                onViewResource={(resource) => {
                  // Handle resource viewing if needed
                }}
              />
            </div>

            {/* Quiz Section */}
            <div className="space-y-4">
              {(videoCompleted || module?.isResourceModule) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {module.mcqs && module.mcqs.length > 0 
                        ? `Multiple Choice Questions (${module.mcqs.length})`
                        : "Quiz"
                      }
                    </CardTitle>
                    <CardDescription>
                      Test your knowledge after completing the video
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {module.mcqs && module.mcqs.length > 0 ? (
                        <>
                          <p className="text-sm text-gray-600">
                            You can now take the quiz to test your knowledge.
                          </p>
                          <Button 
                            onClick={handleStartQuiz} 
                            className="w-full"
                          >
                            Start Quiz
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-3">
                          <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                          <p className="text-sm text-gray-600 font-medium">
                            No quiz required for this module!
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            After watching the complete video, you can proceed to the next module.
                          </p>
                          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-700">
                              ✅ Video completion automatically unlocks the next module
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Module Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Module Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Video Progress</span>
                      <Badge variant={videoCompleted ? "default" : "secondary"}>
                        {videoCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    {module.completed && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quiz Score</span>
                        <Badge variant="default" className="bg-green-600">
                          {module.score || 0}%
                        </Badge>
                      </div>
                    )}
                    {module.completed && !module.mcqs?.length && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Module Status</span>
                        <Badge variant="default" className="bg-blue-600">
                          Auto-Passed (No Quiz)
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          module.mcqs && module.mcqs.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Question {currentQuestion + 1} of {module.mcqs.length}
                </CardTitle>
                <CardDescription>
                  Choose the best answer
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <Progress value={((currentQuestion + 1) / module.mcqs.length) * 100} />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      {module.mcqs[currentQuestion].question}
                    </h3>
                    
                    <div className="space-y-2">
                      {module.mcqs[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${
                            selectedAnswers[currentQuestion] === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswers[currentQuestion] === undefined}
                    >
                      {currentQuestion === module.mcqs.length - 1 ? "Submit Quiz" : "Next"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quiz Not Available</CardTitle>
                <CardDescription>
                  No questions are available for this module
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-3">
                    This module doesn't have any quiz questions yet.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQuiz(false)}
                  >
                    Back to Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
      
      {/* Floating Help Button */}
      <HelpRequestButton 
        moduleId={module.id} 
        moduleName={capitalizeModuleName(module.name)}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleFeedbackComplete}
        moduleId={module.id}
        moduleName={capitalizeModuleName(module.name)}
      />
    </Layout>
  );
}