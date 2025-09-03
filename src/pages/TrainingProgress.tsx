
import Layout from "@/components/Layout";
import TrainingProgressCard from "@/components/TrainingProgressCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard, useModules } from "@/hooks/useApi";
import { courseModules } from "@/data/courseModules";
import { Trophy, Clock, Target, CheckCircle, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import HelpRequestButton from "@/components/HelpRequestButton";
import { useNavigate } from "react-router-dom";

export default function TrainingProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch data from API
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboard();
  const { data: modules, isLoading: modulesLoading, error: modulesError } = useModules();

  if (!user || user.role !== "TRAINEE") {
    return <div>Access denied</div>;
  }

  if (dashboardLoading || modulesLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading progress...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (dashboardError || modulesError) {
    toast.error("Failed to load progress data");
    return (
      <Layout>
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          <div className="text-center text-red-600">
            Failed to load progress data. Please try refreshing the page.
          </div>
        </div>
      </Layout>
    );
  }

  const completedModules = modules?.filter(m => m.completed).map(m => m.moduleId) || [];
  const currentModule = modules?.find(m => !m.completed && m.unlocked)?.moduleId || 1;
  const totalModules = modules?.length || courseModules.length;
  const overallProgress = dashboardData?.overallProgress || 0;

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Progress</h1>
            <p className="text-gray-600">Track your learning journey and achievements</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
              <Progress value={overallProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {dashboardData?.modulesCompleted || 0} of {totalModules} modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.modulesCompleted || 0}</div>
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
              <div className="text-2xl font-bold">{dashboardData?.averageScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                across completed modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalTimeSpent || 0}</div>
              <p className="text-xs text-muted-foreground">
                minutes total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Module Progress</CardTitle>
            <CardDescription>Detailed breakdown of your progress through each training module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules?.map((module) => {
                const isCompleted = module.completed;
                const isCurrent = module.moduleId === currentModule && !isCompleted;
                const userScore = module.marksObtained;
                const timeSpent = module.timeSpentOnVideo;

                return (
                  <TrainingProgressCard
                    key={module.moduleId}
                    module={{
                      id: module.moduleId,
                      title: module.moduleName,
                      description: module.moduleName,
                      content: "",
                      estimatedDuration: Math.floor(module.videoDuration / 60),
                      order: module.moduleId,
                      isLocked: !module.unlocked,
                      completionCriteria: {
                        videoWatched: module.completed,
                        quizPassed: module.pass,
                        minimumScore: 70
                      }
                    }}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    userScore={userScore}
                    timeSpent={timeSpent}
                    onTitleClick={(moduleId) => navigate(`/training/module/${moduleId}`)}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Floating Help Button */}
      <HelpRequestButton />
    </Layout>
  );
}
