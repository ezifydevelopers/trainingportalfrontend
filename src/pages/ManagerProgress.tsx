import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, Trophy, Eye, CheckCircle, Clock, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllTrainees, useAllCompanies, useGetManagerCompanies } from "@/hooks/useApi";
import { HOCPresets } from "@/components/HOCComposer";

interface ManagerProgressProps {
  user?: any;
  isAuthenticated?: boolean;
}

const ManagerProgress = ({ user, isAuthenticated }: ManagerProgressProps) => {
  const [loading, setLoading] = useState(true);

  // Get all trainees and companies (like admin does)
  const { data: allTrainees = [], isLoading: traineesLoading } = useAllTrainees();
  const { data: allCompaniesData, isLoading: companiesLoading } = useAllCompanies();
  const allCompanies = allCompaniesData?.companies || [];

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

  // Group trainees by company
  const traineesByCompany = useMemo(() => {
    const grouped: Record<number, { id: number; name: string; logo?: string; trainees: typeof filteredTrainees }> = {};
    filteredTrainees.forEach(trainee => {
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
  }, [filteredTrainees, allCompanies]);

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
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Progress Overview</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">Track progress across all your assigned companies</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalCompanies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalTrainees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Modules</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.completedModules}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.avgCompletionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Company Progress Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Company Progress</h2>
          
          {traineesByCompany.map((company) => {
            // Calculate company statistics
            const completedModules = company.trainees.reduce((sum, t) => sum + (t.calculatedProgress?.modulesCompleted || 0), 0);
            const totalModules = company.trainees.reduce((sum, t) => sum + (t.calculatedProgress?.totalModules || 0), 0);
            const completionRate = company.trainees.length > 0 
              ? Math.round(company.trainees.reduce((sum, t) => sum + (t.calculatedProgress?.overallProgress || 0), 0) / company.trainees.length)
              : 0;

            return (
              <Card key={company.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{company.name}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{company.trainees.length} trainees</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{totalModules} modules</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Trophy className="h-4 w-4" />
                            <span>{completionRate}% complete</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={completionRate > 70 ? "default" : completionRate > 40 ? "secondary" : "outline"}>
                      {completionRate}% Complete
                    </Badge>
                  </div>
                  
                  {/* Company Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span>{completedModules}/{totalModules} modules completed</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Trainee Progress Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Trainee Progress Summary</h3>
                    
                    {company.trainees.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {company.trainees.map((trainee) => {
                          const completedModules = trainee.calculatedProgress?.modulesCompleted || 0;
                          const totalModules = trainee.calculatedProgress?.totalModules || 0;
                          const traineeCompletionRate = trainee.calculatedProgress?.overallProgress || 0;
                          
                          return (
                            <Card key={trainee.id} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{trainee.name}</h4>
                                <Badge variant={traineeCompletionRate > 70 ? "default" : traineeCompletionRate > 40 ? "secondary" : "outline"}>
                                  {traineeCompletionRate}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{trainee.email}</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{completedModules}/{totalModules} modules</span>
                                </div>
                                <Progress value={traineeCompletionRate} className="h-2" />
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Trainees</h3>
                        <p className="text-gray-600">No trainees are assigned to this company yet.</p>
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
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any companies yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Export with essential HOCs (no auth since handled by routing)
export default HOCPresets.publicPage(ManagerProgress);