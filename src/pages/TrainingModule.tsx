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
      setIsVideoLoading(true);
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

     // Prevent video manipulation and add security measures
   useEffect(() => {
     const preventVideoManipulation = () => {
       const video = (window as any).currentVideo;
       if (video) {
         // Keep controls enabled but restrict certain features
         video.controls = true;
         video.controlsList = "nodownload nofullscreen noremoteplayback";
         video.disablePictureInPicture = true;
         
         // Prevent seeking beyond current progress
         const checkProgress = () => {
           const currentTime = video.currentTime;
           const duration = video.duration;
           const allowedTime = (videoProgress / 100) * duration;
           
           if (currentTime < allowedTime) {
             video.currentTime = allowedTime;
           }
         };
         
         // Check progress every 100ms
         const interval = setInterval(checkProgress, 100);
         
         return () => clearInterval(interval);
       }
     };
     
     // Run after video loads
     const timer = setTimeout(preventVideoManipulation, 1000);
     
     return () => clearTimeout(timer);
   }, [videoProgress]);

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

  // Video control functions
  const togglePlayPause = () => {
    const video = (window as any).currentVideo;
    if (video) {
      if (video.paused) {
        video.play();
        setIsVideoPaused(false);
        setIsVideoPlaying(true);
      } else {
        video.pause();
        setIsVideoPaused(true);
        setIsVideoPlaying(false);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = (window as any).currentVideo;
    if (video && video.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickTime = (clickX / width) * video.duration;
      video.currentTime = clickTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = (window as any).currentVideo;
    if (video) {
      video.volume = parseFloat(e.target.value);
    }
  };

  const toggleMute = () => {
    const video = (window as any).currentVideo;
    if (video) {
      video.muted = !video.muted;
    }
  };

  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) {
      return '';
    }
    
    let fullUrl;
    if (videoUrl.startsWith('http')) {
      fullUrl = videoUrl;
    } else if (videoUrl.startsWith('/uploads/')) {
      // Video URL already has /uploads/ prefix, just add the base URL
      const baseUrl = getBaseUrl();
      fullUrl = `${baseUrl}${videoUrl}`;
    } else {
      // Video URL is just a filename, add /uploads/ prefix
      const baseUrl = getBaseUrl();
      fullUrl = `${baseUrl}/uploads/${videoUrl}`;
    }
    
    return fullUrl;
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
                        {/* Loading indicator */}
                        {isVideoLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="text-center text-white">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p className="text-sm">Loading video...</p>
                            </div>
                          </div>
                        )}
                        
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
                                  const video = (window as any).currentVideo;
                                  if (video) {
                                    video.load();
                                  }
                                }}
                              >
                                Retry
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video 
                            ref={(el) => {
                              if (el) {
                                // Store video reference for controls
                                (window as any).currentVideo = el;
                              }
                            }}
                            src={getVideoUrl(module.videos?.[0]?.url)} 
                            className="w-full h-full"
                            preload="metadata"
                            draggable={false}
                          onEnded={() => {
                            console.log('🎬 Video onEnded event triggered');
                            handleVideoComplete();
                          }}
                          onTimeUpdate={(e) => {
                            const video = e.target as HTMLVideoElement;
                            const progress = (video.currentTime / video.duration) * 100;
                            setVideoProgress(progress);
                            setCurrentTime(video.currentTime);
                          }}
                          onLoadedMetadata={(e) => {
                            const video = e.target as HTMLVideoElement;
                            setVideoDuration(video.duration);
                          }}
                          onPlay={() => {
                            setIsVideoPlaying(true);
                            setIsVideoPaused(false);
                          }}
                          onPause={() => {
                            setIsVideoPlaying(false);
                            setIsVideoPaused(true);
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onLoadStart={() => {
                            setIsVideoLoading(true);
                            setVideoError(null);
                          }}
                          onCanPlay={() => {
                            setIsVideoLoading(false);
                            setVideoError(null);
                          }}
                          onError={(e) => {
                            setIsVideoLoading(false);
                            setVideoError('Failed to load video. Please check your internet connection and try again.');
                            toast.error('Failed to load video. Please try refreshing the page.');
                          }}
                          onSeeked={(e) => {
                            // Prevent seeking by resetting to allowed position
                            const video = e.target as HTMLVideoElement;
                            const currentTime = video.currentTime;
                            const duration = video.duration;
                            
                            // Only allow forward progress, not backward
                            if (currentTime < videoProgress / 100 * duration) {
                              video.currentTime = videoProgress / 100 * duration;
                            }
                          }}
                          onSeeking={(e) => {
                            // Prevent seeking attempts
                            const video = e.target as HTMLVideoElement;
                            const currentTime = video.currentTime;
                            const duration = video.duration;
                            
                            // Only allow forward progress, not backward
                            if (currentTime < videoProgress / 100 * duration) {
                              video.currentTime = videoProgress / 100 * duration;
                            }
                          }}
                          onKeyDown={(e) => {
                            // Prevent keyboard shortcuts for video control
                            e.preventDefault();
                          }}
                          onKeyUp={(e) => {
                            // Prevent keyboard shortcuts for video control
                            e.preventDefault();
                          }}
                          onKeyPress={(e) => {
                            // Prevent keyboard shortcuts for video control
                            e.preventDefault();
                          }}
                          onMouseDown={(e) => {
                            // Prevent right-click context menu
                            if (e.button === 2) {
                              e.preventDefault();
                            }
                          }}
                                                     onMouseUp={(e) => {
                             // Prevent right-click context menu
                             if (e.button === 2) {
                               e.preventDefault();
                             }
                           }}
                           onClick={() => {
                             // Allow clicking on video to pause when playing
                             if (isVideoPlaying) {
                               const video = (window as any).currentVideo;
                               if (video) {
                                 video.pause();
                               }
                             }
                           }}
                        />
                        
                        {/* Custom Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div 
                              className="w-full h-2 bg-white/30 rounded-full cursor-pointer hover:h-3 transition-all duration-200"
                              onClick={handleProgressClick}
                            >
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-200"
                                style={{ width: `${videoProgress}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Control Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Play/Pause Button */}
                              <button
                                onClick={togglePlayPause}
                                className="text-white hover:text-blue-400 transition-colors duration-200"
                              >
                                {isVideoPaused ? (
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                  </svg>
                                )}
                              </button>
                              
                              {/* Time Display */}
                              <div className="text-white text-sm font-mono">
                                {formatTime(currentTime)} / {formatTime(videoDuration)}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* Volume Control */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={toggleMute}
                                  className="text-white hover:text-blue-400 transition-colors duration-200"
                                >
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                  </svg>
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  defaultValue="1"
                                  onChange={handleVolumeChange}
                                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              
                              {/* Progress Percentage */}
                              <div className="text-white text-sm font-mono">
                                {Math.round(videoProgress)}%
                              </div>
                            </div>
                          </div>
                        </div>
                        
                                                 {/* Custom Play/Pause Button Overlay - Only show when video is loaded and paused */}
                         {!isVideoPlaying && !isVideoLoading && !videoError && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-200">
                             <Button
                               size="lg"
                               className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16 shadow-lg"
                               onClick={() => {
                                 const video = (window as any).currentVideo;
                                 if (video) {
                                   video.play();
                                 }
                               }}
                             >
                               <Play className="h-8 w-8" />
                             </Button>
                           </div>
                         )}
                         
                         {/* Fullscreen Button - Always visible */}
                         <div className="absolute top-4 right-4 group">
                           <Button
                             size="sm"
                             variant="ghost"
                             className="bg-black bg-opacity-70 text-white hover:bg-black hover:bg-opacity-80 rounded-full w-8 h-8 p-0"
                             onClick={() => {
                              if (isFullscreen) {
                                // Exit fullscreen
                                if (document.exitFullscreen) {
                                  document.exitFullscreen();
                                } else if ((document as any).webkitExitFullscreen) {
                                  (document as any).webkitExitFullscreen();
                                } else if ((document as any).mozCancelFullScreen) {
                                  (document as any).mozCancelFullScreen();
                                } else if ((document as any).msExitFullscreen) {
                                  (document as any).msExitFullscreen();
                                }
                               } else {
                                 // Enter fullscreen
                                 const video = (window as any).currentVideo;
                                 if (video) {
                                   if (video.requestFullscreen) {
                                     video.requestFullscreen();
                                   } else if (video.webkitRequestFullscreen) {
                                     video.webkitRequestFullscreen();
                                   } else if (video.msRequestFullscreen) {
                                     video.msRequestFullscreen();
                                   }
                                 }
                               }
                             }}
                           >
                             {isFullscreen ? (
                               <div className="h-4 w-4 flex items-center justify-center">
                                 <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
                               </div>
                             ) : (
                               <Maximize2 className="h-4 w-4" />
                             )}
                           </Button>
                           {/* Tooltip */}
                           <div className="absolute right-0 top-10 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                             {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                           </div>
                         </div>
                         
                         {/* Small pause indicator when playing - appears on hover */}
                         {isVideoPlaying && (
                           <div className="absolute top-4 right-12 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200">
                             Click to pause
                           </div>
                         )}
                        
                                                 {/* Video Control Restriction Notice */}
                         <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white text-xs p-2 rounded text-center">
                           ⚠️ Click play to start, click video to pause. You must watch the entire video to complete this module.
                         </div>
                        </div>
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
                            disabled={videoCompleted || videoProgress < 100}
                          >
                            {videoCompleted ? "Video Completed" : 
                              videoProgress < 100 ? `Watch Complete Video (${Math.round(videoProgress)}%)` : "Mark as Watched"}
                          </Button>
                          
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