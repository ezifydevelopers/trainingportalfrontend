import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Eye, 
  Edit, 
  Check, 
  Clock, 
  Trophy 
} from 'lucide-react';
import { Company, User } from '@/shared/types/common.types';

interface TraineeManagementSectionProps {
  company: Company;
  trainees: User[];
  isLoading: boolean;
  onViewTrainee: (traineeId: number) => void;
  onEditTrainee: (traineeId: number) => void;
  onViewProgress: () => void;
  onAddTrainee: () => void;
}

export const TraineeManagementSection: React.FC<TraineeManagementSectionProps> = ({
  company,
  trainees,
  isLoading,
  onViewTrainee,
  onEditTrainee,
  onViewProgress,
  onAddTrainee,
}) => {
  // Calculate statistics
  const totalTrainees = trainees.length;
  const verifiedTrainees = trainees.filter(t => t.isVerified).length;
  const pendingTrainees = totalTrainees - verifiedTrainees;
  const completionRate = totalTrainees > 0 ? Math.round((verifiedTrainees / totalTrainees) * 100) : 0;

  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {company.name} - Trainee Management
              </CardTitle>
              <p className="text-gray-600 mt-1">Manage trainees for {company.name}</p>
            </div>
          </div>
          <Button
            onClick={onAddTrainee}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trainee
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Stats Cards */}
        {!isLoading && trainees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Trainees</p>
                  <p className="text-2xl font-bold text-blue-900">{totalTrainees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Verified</p>
                  <p className="text-2xl font-bold text-green-900">{verifiedTrainees}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-900">{pendingTrainees}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{completionRate}%</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Actions */}
        {!isLoading && trainees.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search trainees..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                className="px-4 py-2 rounded-lg"
                onClick={onViewProgress}
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Progress
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                onClick={onAddTrainee}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trainee
              </Button>
            </div>
          </div>
        )}

        {/* Trainees List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading trainees...</p>
          </div>
        ) : trainees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trainees found</h3>
            <p className="text-gray-600 mb-6">No trainees are registered for this company yet.</p>
            <Button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Add First Trainee
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {trainees.map((trainee, index) => (
              <div
                key={trainee.id || index}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {trainee.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{trainee.name || 'Unknown Trainee'}</h4>
                        <Badge className={trainee.isVerified ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"}>
                          <Check className="h-3 w-3 mr-1" />
                          {trainee.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {trainee.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 border-blue-200"
                      onClick={() => onViewTrainee(trainee.id || 0)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 border-gray-200"
                      onClick={() => onEditTrainee(trainee.id || 0)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
