import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
interface ProgressRecord {
  id: number;
  userId: number;
  moduleId: number;
  completed: boolean;
  score: number | null;
  timeSpent: number | null;
  pass: boolean;
  createdAt: string;
  updatedAt: string;
  module: {
    id: number;
    name: string;
    companyId: number;
  };
}

interface TraineeProgressCardProps {
  trainee: {
    id: number;
    name: string;
    email: string;
    companyId: number;
  };
  progress: ProgressRecord[];
  modules: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
}

const TraineeProgressCard = memo<TraineeProgressCardProps>(({ trainee, progress, modules }) => {
  // Progress data is already filtered for this trainee
  const traineeProgress = progress;
  const completedModules = traineeProgress.filter(p => p.pass);
  const inProgressModules = traineeProgress.filter(p => !p.pass);
  const totalModules = modules.length;
  const completedCount = completedModules.length;
  const progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  // Get recent activity (last 5 activities)
  const recentActivity = traineeProgress
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Calculate time spent
  const totalTimeSpent = traineeProgress.reduce((total, p) => total + (p.timeSpent || 0), 0);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{trainee.name}</CardTitle>
            <p className="text-sm text-gray-600">{trainee.email}</p>
          </div>
          <Badge 
            variant={progressPercentage === 100 ? "default" : progressPercentage > 50 ? "secondary" : "outline"}
            className={progressPercentage === 100 ? "bg-green-100 text-green-800" : ""}
          >
            {progressPercentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{completedCount}/{totalModules} modules</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-gray-600">Completed: {completedCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-gray-600">In Progress: {inProgressModules.length}</span>
          </div>
        </div>

        {/* Time Spent */}
        {totalTimeSpent > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Time Spent: {formatTime(totalTimeSpent)}</span>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
            <div className="space-y-1">
              {recentActivity.map((activity, index) => {
                const module = modules.find(m => m.id === activity.moduleId);
                return (
                  <div key={index} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {activity.pass ? (
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                      )}
                      <span className="text-gray-600 truncate">
                        {module?.name || `Module ${activity.moduleId}`}
                      </span>
                    </div>
                    <span className="text-gray-500 flex-shrink-0">
                      {new Date(activity.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {traineeProgress.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No progress recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TraineeProgressCard.displayName = 'TraineeProgressCard';

export default TraineeProgressCard;
