
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useApi";
import { Play, CheckCircle, Lock, Clock, Trophy, BookOpen, Target, Loader2, Award, Star, FileText, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import HelpRequestButton from "@/components/HelpRequestButton";

export default function TraineeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("videos");
  
  // Fetch data from API
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboard();

  // Separate video and resource modules
  const videoModules = dashboardData?.moduleProgress?.filter(module => !module.isResourceModule) || [];
  const resourceModules = dashboardData?.moduleProgress?.filter(module => module.isResourceModule) || [];

  // Helper function to render modules
  const renderModules = (modules) => {
    console.log('🔍 Rendering modules:', modules.map((m, index) => ({
      index: index + 1,
      name: m.moduleName,
      completed: m.completed,
      unlocked: m.unlocked,
      pass: m.pass,
      score: m.marksObtained
    })));
    if (!modules || modules.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Modules Available</h3>
          <p className="text-gray-600 mb-4">
            You haven't been assigned any modules yet. Please contact your administrator.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Modules will appear here once assigned</span>
          </div>
        </div>
      );
    }

    return modules.map((module, index) => {
      const isCompleted = module.completed;
      // For resource modules, always keep them unlocked
      const isAvailable = module.isResourceModule ? true : module.unlocked;
      // A module should only be locked if it's not completed AND not unlocked
      const isLocked = !isCompleted && (module.isResourceModule ? false : !module.unlocked);
      const isCurrent = !isCompleted && isAvailable;
      
      // Debug logging for the first few modules
      if (index < 5) {
        console.log(`Module ${index + 1} (${module.moduleName}):`, {
          completed: isCompleted,
          unlocked: module.unlocked,
          isResourceModule: module.isResourceModule,
          isAvailable,
          isLocked,
          isCurrent
        });
      }
      
      return (
        <div
          key={module.moduleId}
          className={`rounded-lg border p-0.5 sm:p-4 transition-colors ${
            isCompleted ? 'bg-green-50 border-green-200' :
            isCurrent ? 'bg-blue-50 border-blue-200' :
            isAvailable ? 'bg-white border-gray-200' :
            'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className={`flex-shrink-0 h-4 w-4 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-100' :
                isCurrent ? 'bg-blue-100' :
                isAvailable ? 'bg-gray-100' :
                'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-2 w-2 sm:h-5 sm:w-5 text-green-600" />
                ) : isLocked ? (
                  <Lock className="h-2 w-2 sm:h-5 sm:w-5 text-gray-400" />
                ) : module.isResourceModule ? (
                  <FileText className="h-2 w-2 sm:h-5 sm:w-5 text-purple-600" />
                ) : (
                  <Play className="h-2 w-2 sm:h-5 sm:w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 
                  className={`font-semibold text-xs sm:text-base text-gray-900 break-words leading-tight ${!isLocked ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                  onClick={!isLocked ? () => handleStartModule(module.moduleId) : undefined}
                >
                  {module.moduleName}
                </h3>
                <div className="flex items-center space-x-1 sm:space-x-4 mt-1 sm:mt-2">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    {formatTime(module.videoDuration)}
                  </span>
                  {module.marksObtained > 0 && (
                    <span className="text-xs text-gray-500">
                      <span className="hidden sm:inline">Score: </span>{module.marksObtained}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-0.5 sm:space-x-3">
              {isCompleted && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs px-0.5 py-0.5 h-3 sm:h-auto sm:px-2 sm:py-1">
                  <CheckCircle className="h-1.5 w-1.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              )}
              {isCurrent && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-0.5 py-0.5 h-3 sm:h-auto sm:px-2 sm:py-1">
                  <Play className="h-1.5 w-1.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Current</span>
                  <span className="sm:hidden">▶</span>
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200 text-xs px-0.5 py-0.5 h-3 sm:h-auto sm:px-2 sm:py-1">
                  <Lock className="h-1.5 w-1.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Locked</span>
                  <span className="sm:hidden">🔒</span>
                </Badge>
              )}
              {!isLocked && (
                <Button
                  size="sm"
                  onClick={() => handleStartModule(module.moduleId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-3 px-0.5 sm:h-auto sm:px-3 sm:py-2"
                >
                  <span className="hidden sm:inline">{isCompleted ? 'Review' : 'Start'}</span>
                  <span className="sm:hidden">{isCompleted ? 'R' : 'S'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

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
    navigate(`/training/module/${moduleId}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen pb-16">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">Welcome back, {user.name}!</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">Continue your learning journey</p>
          </div>
        </div>

        {/* Congratulations Banner - Show when all modules are completed */}
        {dashboardData?.overallProgress === 100 && dashboardData?.modulesCompleted > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-green-900 mb-3 sm:mb-4">
                  🎉 Congratulations! 🎉
                </h2>
                <p className="text-lg sm:text-xl text-green-800 mb-2 font-semibold">
                  You have successfully completed all your training modules!
                </p>
                <p className="text-sm sm:text-base text-green-700 mb-4 sm:mb-6">
                  You watched all videos and passed all assessments. Well done on your dedication and hard work!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-green-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{dashboardData.modulesCompleted} Modules Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span className="font-medium">{dashboardData.averageScore}% Average Score</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Quick Progress Overview */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-base sm:text-lg font-medium text-blue-900">Overall Progress</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-900">{dashboardData?.overallProgress || 0}%</span>
            </div>
            <Progress value={dashboardData?.overallProgress || 0} className="h-2 sm:h-3" />
            <p className="text-blue-700 text-xs sm:text-sm mt-2">
              {dashboardData?.modulesCompleted || 0} modules completed
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">Training Modules</CardTitle>
                <CardDescription className="text-sm">Complete each module to progress through your training</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="videos" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Video Modules ({videoModules.length})</span>
                  <span className="sm:hidden">Videos ({videoModules.length})</span>
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Resource Modules ({resourceModules.length})</span>
                  <span className="sm:hidden">Resources ({resourceModules.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="space-y-1 sm:space-y-4">
                {videoModules.length > 0 ? (
                  videoModules.map((module) => {
                  const isCompleted = module.completed;
                  const isAvailable = module.unlocked;
                  const isLocked = !module.unlocked;
                  const isCurrent = !isCompleted && isAvailable;
                  
                  return (
                    <div
                      key={module.moduleId}
                      className={`rounded-lg border p-3 sm:p-4 transition-colors ${
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
                    <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Video Modules Available</h3>
                    <p className="text-gray-600 mb-4">
                      You haven't been assigned any video modules yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-1 sm:space-y-4">
                {resourceModules.length > 0 ? (
                  resourceModules.map((module) => {
                    const isCompleted = module.completed;
                    // Always keep resource modules unlocked/available
                    const isAvailable = true; // module.unlocked;
                    const isLocked = false; // !module.unlocked;
                    const isCurrent = !isCompleted && isAvailable;
                    
                    return (
                      <div
                        key={module.moduleId}
                        className={`rounded-lg border p-0.5 sm:p-4 transition-colors ${
                          isCompleted ? 'bg-green-50 border-green-200' :
                          isCurrent ? 'bg-blue-50 border-blue-200' :
                          isAvailable ? 'bg-white border-gray-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 sm:space-x-4">
                            <div className={`flex-shrink-0 h-4 w-4 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-100' :
                              isCurrent ? 'bg-blue-100' :
                              isAvailable ? 'bg-gray-100' :
                              'bg-gray-100'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-2 w-2 sm:h-5 sm:w-5 text-green-600" />
                              ) : isLocked ? (
                                <Lock className="h-2 w-2 sm:h-5 sm:w-5 text-gray-400" />
                              ) : (
                                <FileText className="h-2 w-2 sm:h-5 sm:w-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xs sm:text-lg font-medium text-gray-900 break-words leading-tight">{module.moduleName}</h3>
                              <div className="flex items-center space-x-1 sm:space-x-4 mt-0.5 sm:mt-1">
                                <span className="text-xs text-gray-500">
                                  {isCompleted ? 'Completed' : isCurrent ? 'Current' : isLocked ? 'Locked' : 'Available'}
                                </span>
                                {module.timeSpentOnVideo > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(module.timeSpentOnVideo)}<span className="hidden sm:inline"> spent</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-0.5 sm:space-x-3">
                            {isCompleted && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs px-0.5 py-0.5 h-3 sm:h-auto sm:px-2 sm:py-1">
                                <CheckCircle className="h-1.5 w-1.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Completed</span>
                                <span className="sm:hidden">✓</span>
                              </Badge>
                            )}
                            {isCurrent && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-0.5 py-0.5 h-3 sm:h-auto sm:px-2 sm:py-1">
                                <FileText className="h-1.5 w-1.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Current</span>
                                <span className="sm:hidden">▶</span>
                              </Badge>
                            )}
                            {isLocked && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200 text-xs px-0.5 py-0.5 h-3 sm:h-auto sm:px-2 sm:py-1">
                                <Lock className="h-1.5 w-1.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Locked</span>
                                <span className="sm:hidden">🔒</span>
                              </Badge>
                            )}
                            {!isLocked && (
                              <Button
                                size="sm"
                                disabled={isLocked}
                                onClick={() => handleStartModule(module.moduleId)}
                                className="text-xs h-3 px-0.5 sm:h-auto sm:px-3 sm:py-2"
                              >
                                <span className="hidden sm:inline">{isCompleted ? "Review" : isLocked ? "Locked" : "View Resources"}</span>
                                <span className="sm:hidden">{isCompleted ? "R" : "V"}</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Resource Modules Available</h3>
                    <p className="text-gray-600 mb-4">
                      You haven't been assigned any resource modules yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom spacing */}
      <div className="h-8"></div>
      
      {/* Floating Help Button */}
      <HelpRequestButton />
    </Layout>
  );
}
