import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTraineeProgress, useAllTrainees } from "@/hooks/useApi";
import { ArrowLeft, Clock, Trophy, CheckCircle, Target, BarChart3, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function TrackTraineeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const traineeId = Number(id);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch trainee data and progress with real-time updates
  const { data: trainees = [] } = useAllTrainees();
  const { 
    data: progressData, 
    isLoading, 
    error, 
    refetch 
  } = useTraineeProgress(traineeId);

  const trainee = trainees.find(t => t.id === traineeId);

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
  const moduleProgress = progressData?.moduleProgress || [];
  const totalModules = moduleProgress.length;
  const modulesWithScores = moduleProgress.filter(module => module.score !== null).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Button variant="outline" onClick={() => navigate('/admin/track-trainee')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Trainee List
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
              <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)}</div>
              <p className="text-xs text-muted-foreground">
                minutes total ({Math.round(totalTimeSpent / 3600 * 10) / 10} hours)
              </p>
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
                <div key={module.moduleId} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
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
                        Duration
                      </span>
                      <span className="font-medium text-gray-900">
                        {module.videoDuration ? Math.round(module.videoDuration / 60) : 0} mins
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Time Spent
                      </span>
                      <span className="font-medium text-gray-900">
                        {Math.round((module.timeSpent || 0) / 60)} mins
                        {module.timeSpent > 0 && module.videoDuration && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({Math.round((module.timeSpent / module.videoDuration) * 100)}% watched)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quiz requirement */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-yellow-800">
                        Quiz required (70% to pass)
                      </span>
                    </div>
                  </div>

                  {/* Score section */}
                  {module.score !== null && (
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
  );
} 