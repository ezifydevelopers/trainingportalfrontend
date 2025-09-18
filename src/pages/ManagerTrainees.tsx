import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, Trophy, BookOpen, Search, Eye, Trash2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllTrainees, useAllCompanies, useGetManagerCompanies, useDeleteTrainee } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const ManagerTrainees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [traineeToDelete, setTraineeToDelete] = useState<{ id: number; name: string } | null>(null);

  // Get all trainees and companies (like admin does)
  const { data: allTrainees = [], isLoading: traineesLoading } = useAllTrainees();
  const { data: allCompaniesData, isLoading: companiesLoading } = useAllCompanies();
  const allCompanies = useMemo(() => allCompaniesData?.companies || [], [allCompaniesData?.companies]);

  // Delete trainee mutation
  const deleteTraineeMutation = useDeleteTrainee();


  // Get manager's assigned companies
  const { data: managerCompaniesData, isLoading: managerCompaniesLoading } = useGetManagerCompanies(user?.id || 0);
  const managerCompanies = useMemo(() => managerCompaniesData?.companies || [], [managerCompaniesData?.companies]);

  // Filter trainees to only show those from manager's assigned companies
  const managerCompanyIds = managerCompanies.map(assignment => assignment.companyId);
  const filteredTrainees = useMemo(() => {
    return allTrainees.filter(trainee => 
      trainee.companyId && managerCompanyIds.includes(trainee.companyId)
    );
  }, [allTrainees, managerCompanyIds]);

  // Get company info for each trainee
  const traineesWithCompanyInfo = useMemo(() => {
    return filteredTrainees.map(trainee => {
      const company = allCompanies.find(c => c.id === trainee.companyId);
      return {
        ...trainee,
        companyName: company?.name || 'Unknown Company'
      };
    });
  }, [filteredTrainees, allCompanies]);

  // Filter trainees based on search term
  const filteredTraineesBySearch = useMemo(() => {
    if (!searchTerm) return traineesWithCompanyInfo;
    
    const term = searchTerm.toLowerCase();
    return traineesWithCompanyInfo.filter(trainee => 
      trainee.name.toLowerCase().includes(term) ||
      trainee.email.toLowerCase().includes(term) ||
      trainee.companyName.toLowerCase().includes(term)
    );
  }, [traineesWithCompanyInfo, searchTerm]);

  // Calculate statistics
  const totalCompanies = managerCompanies.length;
  const totalTrainees = filteredTrainees.length;
  const totalModules = filteredTrainees.reduce((sum, trainee) => sum + (trainee.calculatedProgress?.totalModules || 0), 0);
  const completedModules = filteredTrainees.reduce((sum, trainee) => sum + (trainee.calculatedProgress?.modulesCompleted || 0), 0);
  const avgProgress = filteredTrainees.length > 0 
    ? Math.round(filteredTrainees.reduce((sum, trainee) => sum + (trainee.calculatedProgress?.overallProgress || 0), 0) / filteredTrainees.length)
    : 0;

  // Helper functions
  const formatTime = (seconds: number) => {
    if (seconds === 0) return "No time spent";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m total`;
    }
    return `${minutes}m total`;
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return "No activity";
    return new Date(dateString).toLocaleString();
  };

  // Action handlers
  const handleViewProgress = (traineeId: number) => {
    // Find the company ID for this trainee
    const trainee = filteredTraineesBySearch.find(t => t.id === traineeId);
    if (trainee && trainee.companyId) {
      navigate(`/manager/company/${trainee.companyId}/trainee/${traineeId}`);
    } else {
      console.error('Company ID not found for trainee:', traineeId);
      toast.error('Unable to find company information for this trainee');
    }
  };

  const handleDeleteTrainee = (trainee: { id: number; name: string }) => {
    setTraineeToDelete(trainee);
  };

  const confirmDeleteTrainee = async () => {
    if (!traineeToDelete) return;

    try {
      await deleteTraineeMutation.mutateAsync(traineeToDelete.id);
      toast.success(`Trainee ${traineeToDelete.name} deleted successfully`);
      setTraineeToDelete(null);
    } catch (error) {
      console.error('Error deleting trainee:', error);
      toast.error('Failed to delete trainee');
    }
  };

  const cancelDeleteTrainee = () => {
    setTraineeToDelete(null);
  };

  useEffect(() => {
    setLoading(traineesLoading || companiesLoading || managerCompaniesLoading);
  }, [traineesLoading, companiesLoading, managerCompaniesLoading]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Trainees</h1>
          <p className="text-gray-600">View all trainees from all your assigned companies</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trainees</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <Trophy className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProgress}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedModules}</div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Progress Tracking Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-medium">Real-time progress tracking active</span>
              <span className="text-green-600 text-sm">Auto-refresh every 60 seconds</span>
            </div>
            <div className="text-green-700 text-sm font-medium">
              {filteredTraineesBySearch.length} of {totalTrainees} trainees
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search trainees by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
            Showing {filteredTraineesBySearch.length} results
          </div>
        </div>

        {/* Trainee Progress Overview Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trainee Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTraineesBySearch.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Trainee</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Overall Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Modules Completed</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Average Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Time Invested</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Last Activity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTraineesBySearch.map((trainee) => {
                      const progress = trainee.calculatedProgress || {
                        overallProgress: 0,
                        modulesCompleted: 0,
                        totalModules: 0,
                        averageScore: 0,
                        totalTimeSpent: 0,
                        lastUpdated: undefined
                      };

                      return (
                        <tr key={trainee.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{trainee.name}</div>
                                <div className="text-sm text-gray-500">{trainee.email}</div>
                    </div>
                      </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{trainee.companyName}</span>
                        </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Progress value={progress.overallProgress} className="flex-1 h-2" />
                              <span className="text-sm font-medium w-12">{progress.overallProgress}%</span>
                        </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium">
                              {progress.modulesCompleted} of {progress.totalModules}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium">
                              {progress.averageScore}% Average
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm font-medium">
                                {progress.totalTimeSpent}s
                      </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(progress.totalTimeSpent)}
                    </div>
                  </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {formatLastActivity(progress.lastUpdated)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                      <Button
                                size="sm" 
                        variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleViewProgress(trainee.id)}
                      >
                                <Eye className="h-4 w-4 mr-1" />
                                View Progress
                      </Button>
                      <Button
                        size="sm"
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteTrainee({ id: trainee.id, name: trainee.name })}
                                disabled={deleteTraineeMutation.isPending}
                      >
                                <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                  </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Trainees Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No trainees match your search criteria.' : 'No trainees are assigned to any of your companies yet.'}
                </p>
                </div>
            )}
              </CardContent>
            </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!traineeToDelete} onOpenChange={cancelDeleteTrainee}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trainee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{traineeToDelete?.name}</strong>? 
                This action cannot be undone and will permanently remove the trainee and all their progress data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDeleteTrainee}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteTrainee}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteTraineeMutation.isPending}
              >
                {deleteTraineeMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ManagerTrainees;