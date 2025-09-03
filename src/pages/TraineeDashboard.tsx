
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useApi";
import { Play, CheckCircle, Lock, Clock, Trophy, BookOpen, Target, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import HelpRequestButton from "@/components/HelpRequestButton";

export default function TraineeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch data from API
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboard();

  // Debug logging
  console.log('=== TRAINEE DASHBOARD DEBUG ===');
  console.log('Dashboard data:', dashboardData);
  console.log('Module progress:', dashboardData?.moduleProgress);
  if (dashboardData?.moduleProgress) {
    dashboardData.moduleProgress.forEach((module, index) => {
      console.log(`Module ${index + 1}:`, {
        id: module.moduleId,
        name: module.moduleName,
        completed: module.completed,
        pass: module.pass,
        unlocked: module.unlocked,
        isCurrent: !module.completed && module.unlocked
      });
    });
  }

  if (!user || user.role !== "TRAINEE") {
    return <div>Access denied</div>;
  }

  if (dashboardLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (dashboardError) {
    console.error('Dashboard error:', dashboardError);
    toast.error("Failed to load dashboard data");
    return (
      <Layout>
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>
          </div>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <BookOpen className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Dashboard</h3>
                <p className="text-red-700 mb-4">
                  {dashboardError?.message || "Failed to load dashboard data. Please try refreshing the page."}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleStartModule = (moduleId: number) => {
    console.log(`Navigating to module ${moduleId}`);
    navigate(`/training/module/${moduleId}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>
        </div>
        
        {/* Quick Progress Overview */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-blue-900">Overall Progress</span>
              <span className="text-2xl font-bold text-blue-900">{dashboardData?.overallProgress || 0}%</span>
            </div>
            <Progress value={dashboardData?.overallProgress || 0} className="h-3" />
            <p className="text-blue-700 text-sm mt-2">
              {dashboardData?.modulesCompleted || 0} modules completed
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Module</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.currentModule ? dashboardData.currentModule.moduleName : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData?.currentModule?.moduleName ? 'Current training module' : 'All modules completed'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.modulesCompleted || 0}</div>
              <p className="text-xs text-muted-foreground">modules completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.averageScore || 0}%</div>
              <p className="text-xs text-muted-foreground">average score</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Modules */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Training Modules</CardTitle>
                <CardDescription>Complete each module to progress through your training</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.moduleProgress && dashboardData.moduleProgress.length > 0 ? (
                dashboardData.moduleProgress.map((module) => {
                  const isCompleted = module.completed;
                  const isAvailable = module.unlocked;
                  const isLocked = !module.unlocked;
                  const isCurrent = !isCompleted && isAvailable;
                  
                  return (
                    <div
                      key={module.moduleId}
                      className={`rounded-lg border p-4 transition-colors ${
                        isCompleted ? 'bg-green-50 border-green-200' :
                        isCurrent ? 'bg-blue-50 border-blue-200' :
                        isAvailable ? 'bg-white border-gray-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-100' :
                            isCurrent ? 'bg-blue-100' :
                            isAvailable ? 'bg-gray-100' :
                            'bg-gray-100'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : isLocked ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Play className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 
                              className={`font-semibold text-gray-900 ${!isLocked ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                              onClick={!isLocked ? () => handleStartModule(module.moduleId) : undefined}
                            >
                              {module.moduleName}
                            </h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(module.videoDuration)}
                              </span>
                              {module.marksObtained > 0 && (
                                <span className="text-xs text-gray-500">
                                  Score: {module.marksObtained}%
                                </span>
                              )}
                              {isCompleted && (
                                <Badge variant="outline" className="text-green-700 border-green-300">
                                  Completed
                                </Badge>
                              )}
                              {isCurrent && !isCompleted && (
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  Current
                                </Badge>
                              )}
                              {isLocked && (
                                <Badge variant="outline" className="text-gray-500">
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Button
                            variant={isCompleted ? "outline" : "default"}
                            disabled={isLocked}
                            onClick={() => handleStartModule(module.moduleId)}
                          >
                            {isCompleted ? "Review" : isLocked ? "Locked" : "Start"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Modules Available</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't been assigned any training modules yet. Please contact your administrator.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Modules will appear here once assigned</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Floating Help Button */}
      <HelpRequestButton />
    </Layout>
  );
}
