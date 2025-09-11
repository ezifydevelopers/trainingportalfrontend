import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Eye,
  Download
} from 'lucide-react';
import { 
  useGetManagerCompanies,
  useCompanyModules,
  useGetCompanyTrainees
} from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function ManagerProgress() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  // Get manager's assigned companies, modules, and trainees
  const { data: companiesData } = useGetManagerCompanies(user?.id || 0);
  const { data: modulesData, isLoading: modulesLoading } = useCompanyModules(parseInt(companyId || '0'));
  const { data: traineesData, isLoading: traineesLoading } = useGetCompanyTrainees(parseInt(companyId || '0'));

  const companies = companiesData?.companies || [];
  const currentCompany = companies.find(c => c.id === parseInt(companyId || '0'));
  const modules = modulesData || [];
  const trainees = traineesData?.trainees || [];

  // Calculate real statistics
  const totalTrainees = trainees.length;
  const totalModules = modules.length;
  const verifiedTrainees = trainees.filter(t => t.isVerified).length;
  const completionRate = totalTrainees > 0 ? Math.round((verifiedTrainees / totalTrainees) * 100) : 0;
  const totalCompletions = totalTrainees * totalModules; // Simplified calculation
  const avgTimePerModule = 2.5; // This would need to come from actual progress data

  const handleViewTrainee = (traineeId: number) => {
    navigate(`/manager/company/${companyId}/trainee/${traineeId}`);
  };

  const handleViewModule = (moduleId: number) => {
    navigate(`/manager/company/${companyId}/module/${moduleId}`);
  };

  const handleExportReport = () => {
    // Export progress report
    console.log('Exporting progress report...');
  };

  if (modulesLoading || traineesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading progress data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/manager/company/${companyId}/modules`)}
              >
                ← Back to Modules
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentCompany?.name || 'Company'} - Progress Tracking
            </h1>
            <p className="text-gray-600">Monitor trainee progress and training effectiveness</p>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainees}</div>
              <p className="text-xs text-muted-foreground">Active trainees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Verified trainees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalModules}</div>
              <p className="text-xs text-muted-foreground">Available modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgTimePerModule}h</div>
              <p className="text-xs text-muted-foreground">Per module</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trainees">Trainee Progress</TabsTrigger>
            <TabsTrigger value="modules">Module Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 p-4">
                    {trainees.length > 0 ? (
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Trainee Status Overview</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Verified Trainees</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{verifiedTrainees}/{totalTrainees}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Pending Trainees</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full" 
                                  style={{ width: `${100 - completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{totalTrainees - verifiedTrainees}/{totalTrainees}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Total Modules</span>
                            <span className="text-sm font-medium text-gray-900">{totalModules}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainees.length > 0 ? (
                      trainees.slice(0, 4).map((trainee, index) => (
                        <div key={trainee.id || index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{trainee.name || 'Unknown Trainee'}</p>
                            <p className="text-xs text-gray-500">
                              {trainee.isVerified ? 'Verified trainee' : 'Pending verification'}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {trainee.isVerified ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No trainees found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trainees" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {trainees.map((trainee) => (
                <Card key={trainee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{trainee.name}</h3>
                          <p className="text-sm text-gray-500">{trainee.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">85%</div>
                          <div className="text-xs text-gray-500">Completion Rate</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">5/6</div>
                          <div className="text-xs text-gray-500">Modules</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTrainee(trainee.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{module.name}</h3>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">92%</div>
                          <div className="text-xs text-gray-500">Completion Rate</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">23/25</div>
                          <div className="text-xs text-gray-500">Trainees</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">1.8h</div>
                          <div className="text-xs text-gray-500">Avg. Time</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewModule(module.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Completion trends chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Module Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Module performance chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
