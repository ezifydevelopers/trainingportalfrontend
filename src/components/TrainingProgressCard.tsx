
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CourseModule } from "@/types/course";
import { CheckCircle, Clock, Trophy, Target, PlayCircle } from "lucide-react";

interface TrainingProgressCardProps {
  module: CourseModule;
  isCompleted: boolean;
  isCurrent: boolean;
  userScore?: number;
  timeSpent?: number;
  onTitleClick?: (moduleId: number) => void;
}

export default function TrainingProgressCard({ 
  module, 
  isCompleted, 
  isCurrent, 
  userScore, 
  timeSpent,
  onTitleClick
}: TrainingProgressCardProps) {
  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (isCurrent) return <PlayCircle className="h-5 w-5 text-blue-600" />;
    return <Target className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = () => {
    if (isCompleted) return (
      <Badge variant="outline" className="text-green-700 border-green-300">
        Completed
      </Badge>
    );
    if (isCurrent) return (
      <Badge variant="outline" className="text-blue-700 border-blue-300">
        In Progress
      </Badge>
    );
    return <Badge variant="outline" className="text-gray-500">Not Started</Badge>;
  };

  const getCardStyle = () => {
    if (isCompleted) return 'border-green-200 bg-green-50';
    if (isCurrent) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <Card className={`${getCardStyle()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {/* <CardTitle className="text-base font-semibold">Module {module.order}</CardTitle> */}
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription 
          className={`font-medium text-base text-gray-900 ${onTitleClick && !module.isLocked ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
          onClick={onTitleClick && !module.isLocked ? () => onTitleClick(module.id) : undefined}
        >
          {module.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{module.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Duration:
          </span>
          <span className="font-medium">{module.estimatedDuration} mins</span>
        </div>

        {isCompleted && userScore !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                Your Score:
              </span>
              <span className="font-bold">{userScore}%</span>
            </div>
            <Progress value={userScore} className="h-2" />
          </div>
        )}

        {timeSpent !== undefined && timeSpent > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Time Spent:
            </span>
            <span className="font-medium">{timeSpent} mins</span>
          </div>
        )}

        {module.completionCriteria.quizPassed && (
          <div className="flex items-center space-x-2 text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
            <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <span className="text-yellow-800">
              Quiz required (70% to pass)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
