import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTraineeProgress, useAllTrainees } from "@/hooks/useApi";
import { ArrowLeft, Clock, Trophy, CheckCircle, Target, BarChart3, Loader2, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import withAuth from "@/components/withAuth";
import withRole from "@/components/withRole";
import { HOCPresets } from "@/components/HOCComposer";


interface TrackTraineeDetailProps {
  user?: any;
  isAuthenticated?: boolean;
}
function TrackTraineeDetail({ user, isAuthenticated }: TrackTraineeDetailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, traineeId: urlTraineeId } = useParams();
  const traineeId = Number(id || urlTraineeId);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Debug logging
  // Determine appropriate back navigation based on current route
  const getBackNavigation = () => {
    const currentPath = location.pathname;
    
    // If coming from manager route, go back to manager trainees
    if (currentPath.includes('/manager/company/')) {
      const companyId = currentPath.split('/manager/company/')[1]?.split('/')[0];
      return `/manager/company/${companyId}/trainees`;
    }
    
    // If coming from admin route, go back to admin track trainee
    if (currentPath.includes('/admin/track-trainee/')) {
      return '/admin/track-trainee';
    }
    
    // Default fallback
    return -1; // Go back in browser history
  };

  // Get appropriate button text based on current route
  const getBackButtonText = () => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('/manager/company/')) {
      return 'Back to Company Trainees';
    }
    
    if (currentPath.includes('/admin/track-trainee/')) {
      return 'Back to Trainee List';
    }
    
    return 'Go Back';
  };

  // Fetch trainee data and progress with real-time updates
  const { data: trainees = [] } = useAllTrainees();
  const { 
    data: progressData, 
    isLoading, 
    error, 
    refetch 
  } = useTraineeProgress(isNaN(traineeId) ? 0 : traineeId);

  const trainee = trainees.find(t => t.id === traineeId);

  // Handle invalid trainee ID
  if (isNaN(traineeId) || traineeId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Trainee ID</h2>
              <p className="text-gray-600 mb-4">The trainee ID in the URL is invalid.</p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auto-refresh progress every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
    toast.success("Progress data refreshed");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading trainee progress...</span>
        </div>
      </div>
    );
  }

  if (error || !trainee) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Button variant="outline" onClick={() => navigate('/admin/track-trainee')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trainee List
        </Button>
        <div className="text-center text-red-600">
          {error ? "Failed to load trainee progress" : "Trainee not found"}
        </div>
      </div>
    );
  }

  // Calculate real-time progress data
  const overallProgress = progressData?.overallProgress || 0;
  const modulesCompleted = progressData?.modulesCompleted || 0;
  const averageScore = progressData?.averageScore || 0;
  const totalTimeSpent = progressData?.totalTimeSpent || 0;
  const moduleProgressRaw = progressData?.moduleProgress || [];
  
  // Deduplicate moduleProgress by moduleId, keeping the record with highest score or most recent
  const moduleProgressDeduplicated = moduleProgressRaw.reduce((acc: any[], current: any) => {
    const existing = acc.find(item => item.moduleId === current.moduleId);
    if (!existing) {
      acc.push(current);
    } else {
      // Keep the record with higher score, or if scores are equal, keep the one with more time spent
      if (current.score > existing.score || 
          (current.score === existing.score && current.timeSpent > existing.timeSpent)) {
        const index = acc.findIndex(item => item.moduleId === current.moduleId);
        acc[index] = current;
      }
    }
    return acc;
  }, []);

  // Filter out resource modules from Module Progress section - they should not be shown here
  const moduleProgress = moduleProgressDeduplicated.filter(module => {
    console.log('Module:', module.moduleName, 'isResourceModule:', module.isResourceModule);
    return !module.isResourceModule;
  });
  
  const totalModules = moduleProgress.length;
  const modulesWithScores = moduleProgress.filter(module => module.score !== null).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <Button variant="outline" onClick={() => navigate(getBackNavigation())} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {getBackButtonText()}
      </Button>
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trainee.name}'s Progress</h1>
            <div className="text-gray-600">{trainee.email} • {trainee.company?.name || 'Unknown Company'}</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time progress tracking active</span>
          <span className="text-xs text-green-500">• Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Training Progress Summary */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Training Progress</h2>
            <p className="text-gray-600">Track learning journey and achievements</p>
          </div>
        </div>

        {/* Progress Calculation Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">Progress Calculation</span>
          </div>
          <p className="text-sm text-blue-700">
            Each module contributes equally to overall progress: <strong>{totalModules > 0 ? (100 / totalModules).toFixed(1) : 0}% per module</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {totalModules} total modules • {modulesCompleted} completed • {totalModules - modulesCompleted} remaining
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Overall progress is calculated based on modules where the quiz has been passed (70% or higher score required)
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {modulesCompleted} of {totalModules} modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modulesCompleted}</div>
              <p className="text-xs text-muted-foreground">
                of {totalModules} modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                {totalModules > 0 ? `across all ${totalModules} modules` : 'no modules assigned'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Training Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  const hours = Math.floor(totalTimeSpent / 3600);
                  const minutes = Math.floor((totalTimeSpent % 3600) / 60);
                  const seconds = totalTimeSpent % 60;
                  
                  if (hours > 0) {
                    return `${hours}h ${minutes}m`;
                  } else if (minutes > 0) {
                    return `${minutes}m ${seconds}s`;
                  } else {
                    return `${seconds}s`;
                  }
                })()}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalTimeSpent > 0 ? 
                  `${Math.round(totalTimeSpent / 60)} minutes (${Math.round(totalTimeSpent / 3600 * 10) / 10} hours)` : 
                  'No time spent yet'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time Tracking Summary */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Time Tracking Summary</h2>
            <p className="text-gray-600">Detailed breakdown of training time investment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Time Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {(() => {
                  const hours = Math.floor(totalTimeSpent / 3600);
                  const minutes = Math.floor((totalTimeSpent % 3600) / 60);
                  const seconds = totalTimeSpent % 60;
                  
                  if (hours > 0) {
                    return `${hours}h ${minutes}m`;
                  } else if (minutes > 0) {
                    return `${minutes}m ${seconds}s`;
                  } else {
                    return `${seconds}s`;
                  }
                })()}
              </div>
              <div className="text-sm text-gray-600">
                {totalTimeSpent > 0 ? 
                  `${Math.round(totalTimeSpent / 60)} minutes total` : 
                  'No training time recorded'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Average Time per Module</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {totalModules > 0 ? 
                  (() => {
                    const avgTime = totalTimeSpent / totalModules;
                    const hours = Math.floor(avgTime / 3600);
                    const minutes = Math.floor((avgTime % 3600) / 60);
                    
                    if (hours > 0) {
                      return `${hours}h ${minutes}m`;
                    } else {
                      return `${Math.round(avgTime / 60)}m`;
                    }
                  })() : 
                  '0m'
                }
              </div>
              <div className="text-sm text-gray-600">
                {totalModules > 0 ? 
                  `Across ${totalModules} modules` : 
                  'No modules assigned'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Time Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {modulesCompleted > 0 ? 
                  (() => {
                    const avgTimePerCompleted = totalTimeSpent / modulesCompleted;
                    const hours = Math.floor(avgTimePerCompleted / 3600);
                    const minutes = Math.floor((avgTimePerCompleted % 3600) / 60);
                    
                    if (hours > 0) {
                      return `${hours}h ${minutes}m`;
                    } else {
                      return `${Math.round(avgTimePerCompleted / 60)}m`;
                    }
                  })() : 
                  'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">
                {modulesCompleted > 0 ? 
                  `Per completed module` : 
                  'No completed modules'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Module Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle>Module Progress</CardTitle>
          <CardDescription>Detailed breakdown of progress through each training module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleProgress.map((module, idx) => {
              const isCompleted = module.pass;
              const isInProgress = module.timeSpent > 0 && !isCompleted;
              const isLocked = !isCompleted && !isInProgress; // Modules not started are considered locked
              const status = isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started';
              const statusColor = isCompleted ? 'bg-green-100 text-green-700' : 
                                isInProgress ? 'bg-blue-100 text-blue-700' : 
                                'bg-gray-100 text-gray-500';
              const modulePercentage = totalModules > 0 ? (100 / totalModules).toFixed(1) : '0';
              
              return (
                <div key={`${module.moduleId}-${idx}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
                  {/* Header with status badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 
                        className={`text-lg font-semibold text-gray-900 mb-1 ${!module.isLocked ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                        onClick={!module.isLocked ? () => navigate(`/training/module/${module.moduleId}`) : undefined}
                      >
                        {module.moduleName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${statusColor} text-xs font-medium px-2 py-1`}>
                          {status}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50">
                          {modulePercentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Video Duration
                      </span>
                      <span className="font-medium text-gray-900">
                        {module.videoDuration ? 
                          (() => {
                            const hours = Math.floor(module.videoDuration / 3600);
                            const minutes = Math.floor((module.videoDuration % 3600) / 60);
                            const seconds = module.videoDuration % 60;
                            
                            if (hours > 0) {
                              return `${hours}h ${minutes}m`;
                            } else if (minutes > 0) {
                              return `${minutes}m ${seconds}s`;
                            } else {
                              return `${seconds}s`;
                            }
                          })() : 
                          '0s'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Time Spent
                      </span>
                      <span className="font-medium text-gray-900">
                        {(() => {
                          const timeSpent = module.timeSpent || 0;
                          const hours = Math.floor(timeSpent / 3600);
                          const minutes = Math.floor((timeSpent % 3600) / 60);
                          const seconds = timeSpent % 60;
                          
                          if (hours > 0) {
                            return `${hours}h ${minutes}m`;
                          } else if (minutes > 0) {
                            return `${minutes}m ${seconds}s`;
                          } else {
                            return `${seconds}s`;
                          }
                        })()}
                        {module.timeSpent > 0 && module.videoDuration && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({Math.round((module.timeSpent / module.videoDuration) * 100)}% watched)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quiz requirement - only show for non-resource modules */}
                  {!module.isResourceModule && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-yellow-800">
                          Quiz required (70% to pass)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Resource module indicator */}
                  {module.isResourceModule && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-purple-800">
                          Reference Material - No quiz required
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Score section - only show for non-resource modules */}
                  {!module.isResourceModule && module.score !== null && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Score</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${module.pass ? 'text-green-600' : 'text-red-600'}`}>
                            {module.score}%
                          </span>
                          {module.pass && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              ✓ Passed
                            </span>
                          )}
                        </div>
                      </div>
                      {!module.pass && module.score !== null && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{module.score}% / 70%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${module.score >= 70 ? 'bg-green-500' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(module.score, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
// Export with authentication and role protection
// Export with essential HOCs (no auth since handled by routing)
export default HOCPresets.publicPage(TrackTraineeDetail);
