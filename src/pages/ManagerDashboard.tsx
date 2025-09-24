import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, Trophy, Eye, CheckCircle, Clock, BookOpen, ArrowRight, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Use the working admin hooks
import { useAllTrainees, useAllCompanies, useGetManagerCompanies, useDeleteTrainee } from "@/hooks/useApi";
import ManagerTraineeCard from "@/features/trainees/components/ManagerTraineeCard";
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

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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

  // Group trainees by company
  const traineesByCompany = useMemo(() => {
    const grouped: Record<number, { id: number; name: string; logo?: string; trainees: typeof filteredTrainees }> = {};
    traineesWithCompanyInfo.forEach(trainee => {
      const companyId = trainee.companyId;
      if (!grouped[companyId]) {
        const company = allCompanies.find(c => c.id === companyId);
        grouped[companyId] = {
          id: companyId,
          name: company?.name || 'Unknown Company',
          logo: company?.logo,
          trainees: []
        };
      }
      grouped[companyId].trainees.push(trainee);
    });
    return Object.values(grouped);
  }, [traineesWithCompanyInfo, allCompanies]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalTrainees = filteredTrainees.length;
    const totalCompanies = managerCompanies.length;
    
    // Calculate progress statistics
    const completedModules = filteredTrainees.reduce((sum, t) => sum + (t.calculatedProgress?.modulesCompleted || 0), 0);
    const totalModules = filteredTrainees.reduce((sum, t) => sum + (t.calculatedProgress?.totalModules || 0), 0);
    const avgCompletionRate = filteredTrainees.length > 0 
      ? Math.round(filteredTrainees.reduce((sum, t) => sum + (t.calculatedProgress?.overallProgress || 0), 0) / filteredTrainees.length)
      : 0;
    
    return {
      totalTrainees,
      totalCompanies,
      completedModules,
      totalModules,
      avgCompletionRate
    };
  }, [filteredTrainees, managerCompanies]);

  // Action handlers
  const handleViewProgress = (traineeId: number) => {
    // Find the company ID for this trainee
    const trainee = filteredTrainees.find(t => t.id === traineeId);
    if (trainee && trainee.companyId) {
      navigate(`/manager/company/${trainee.companyId}/trainee/${traineeId}`);
    } else {

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
        <div className="container mx-auto py-2 sm:py-4 lg:py-6 xl:py-8 px-2 sm:px-4">
          {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">Manage all your assigned companies, trainees, and their progress</p>
          </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{overallStats.totalCompanies}</div>
            </CardContent>
          </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">Total Trainees</CardTitle>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{overallStats.totalTrainees}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">Completed Modules</CardTitle>
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{overallStats.completedModules}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Avg Completion Rate</CardTitle>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{overallStats.avgCompletionRate}%</div>
                  </CardContent>
                </Card>
              </div>

        {/* ALL COMPANIES WITH TRAINEES AND PROGRESS IN ONE UNIFIED VIEW */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {traineesByCompany.map((company) => {
            // Calculate company statistics
            const completedModules = company.trainees.reduce((sum, t) => sum + (t.calculatedProgress?.modulesCompleted || 0), 0);
            const totalModules = company.trainees.reduce((sum, t) => sum + (t.calculatedProgress?.totalModules || 0), 0);
            const completionRate = company.trainees.length > 0 
              ? Math.round(company.trainees.reduce((sum, t) => sum + (t.calculatedProgress?.overallProgress || 0), 0) / company.trainees.length)
              : 0;

            return (
              <Card key={company.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 p-3 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg lg:text-xl truncate">{company.name}</CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 lg:space-x-4 text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{company.trainees.length} trainees</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{totalModules} modules</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{completionRate}% complete</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-2">
                      <Badge variant={completionRate > 70 ? "default" : completionRate > 40 ? "secondary" : "outline"} className="text-xs sm:text-sm w-fit">
                        {completionRate}% Complete
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/manager/company/${company.id}/modules`)}
                        className="flex items-center space-x-1 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
                      >
                        <span className="hidden sm:inline">Manage</span>
                        <span className="sm:hidden">Manage</span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    </div>
              </div>
                  
                  {/* Company Progress Bar */}
                  <div className="mt-3 sm:mt-4">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span className="truncate ml-2">{completedModules}/{totalModules} modules completed</span>
                    </div>
                    <Progress value={completionRate} className="h-1.5 sm:h-2" />
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-4 lg:p-6">
                  {/* Trainees Section - SHOWING ALL TRAINEES AND PROGRESS COMBINED */}
                  <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Trainees & Progress</h3>
                  <div className="text-xs sm:text-sm text-gray-600">
                        {company.trainees.length} trainees
                  </div>
                </div>
                
                    {company.trainees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {company.trainees.map((trainee) => (
                          <ManagerTraineeCard
                          key={trainee.id}
                          trainee={{
                            id: trainee.id,
                            name: trainee.name,
                            email: trainee.email,
                              companyId: trainee.companyId || company.id
                            }}
                            calculatedProgress={trainee.calculatedProgress}
                            companyName={company.name}
                            onViewProgress={handleViewProgress}
                            onDelete={handleDeleteTrainee}
                            isDeleting={deleteTraineeMutation.isPending}
                        />
                      ))}
                    </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                        <Users className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                        <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No Trainees</h3>
                        <p className="text-xs sm:text-sm text-gray-600">No trainees are assigned to this company yet.</p>
                      </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Empty State */}
        {traineesByCompany.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
            <Building2 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No Companies Assigned</h3>
            <p className="text-xs sm:text-sm text-gray-600">You haven't been assigned to any companies yet.</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!traineeToDelete} onOpenChange={cancelDeleteTrainee}>
          <AlertDialogContent className="w-[95vw] sm:w-full max-w-md mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">Delete Trainee</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                Are you sure you want to delete <strong>{traineeToDelete?.name}</strong>? 
                This action cannot be undone and will permanently remove the trainee and all their progress data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <AlertDialogCancel onClick={cancelDeleteTrainee} className="w-full sm:w-auto text-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteTrainee}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm"
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

export default ManagerDashboard;
