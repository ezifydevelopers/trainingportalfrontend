import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, Clock, CheckCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';

interface CalculatedProgress {
  overallProgress: number;
  modulesCompleted: number;
  totalModules: number;
  averageScore: number;
  totalTimeSpent: number;
  lastUpdated?: string;
}

interface ManagerTraineeCardProps {
  trainee: {
    id: number;
    name: string;
    email: string;
    companyId: number;
  };
  calculatedProgress?: CalculatedProgress;
  companyName?: string;
  onViewProgress?: (traineeId: number) => void;
  onDelete?: (trainee: { id: number; name: string }) => void;
  isDeleting?: boolean;
}

const ManagerTraineeCard = memo<ManagerTraineeCardProps>(({ 
  trainee, 
  calculatedProgress, 
  companyName, 
  onViewProgress, 
  onDelete, 
  isDeleting = false 
}) => {
  // Use calculated progress data if available, otherwise default to 0
  const progressData = calculatedProgress || {
    overallProgress: 0,
    modulesCompleted: 0,
    totalModules: 0,
    averageScore: 0,
    totalTimeSpent: 0
  };

  const {
    overallProgress,
    modulesCompleted,
    totalModules,
    averageScore,
    totalTimeSpent
  } = progressData;

  // Calculate in-progress modules (total - completed)
  const inProgressModules = Math.max(0, totalModules - modulesCompleted);

  // Format time spent
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get status color based on progress
  const getStatusColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{trainee.name}</CardTitle>
            <p className="text-sm text-gray-600">{trainee.email}</p>
          </div>
          {companyName && (
            <Badge variant="outline" className="text-xs">
              {companyName}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className={`text-sm font-semibold ${getStatusColor(overallProgress)}`}>
              {overallProgress}% Complete
            </span>
          </div>
          <Progress value={overallProgress} className="h-2 mb-2" />
          <div className="text-xs text-gray-600">
            {modulesCompleted}/{totalModules} modules
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">Completed: {modulesCompleted}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">In Progress: {inProgressModules}</span>
          </div>
        </div>

        {/* Additional Stats */}
        {totalTimeSpent > 0 && (
          <div className="text-xs text-gray-500">
            Time Spent: {formatTime(totalTimeSpent)}
          </div>
        )}

        {averageScore > 0 && (
          <div className="text-xs text-gray-500">
            Average Score: {averageScore}%
          </div>
        )}

        {/* Status Message */}
        {totalModules === 0 ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <Users className="h-4 w-4" />
            <span className="text-sm">No modules assigned yet</span>
          </div>
        ) : modulesCompleted === 0 ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <Users className="h-4 w-4" />
            <span className="text-sm">No progress recorded yet</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Making progress!</span>
          </div>
        )}

        {/* Action Buttons */}
        {(onViewProgress || onDelete) && (
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
            {onViewProgress && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1"
                onClick={() => onViewProgress(trainee.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Progress
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onDelete({ id: trainee.id, name: trainee.name })}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ManagerTraineeCard.displayName = 'ManagerTraineeCard';

export default ManagerTraineeCard;
