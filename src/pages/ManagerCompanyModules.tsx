import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Plus,
  Eye,
  Settings,
  FileText,
  Play,
  UserPlus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Video,
  File,
  Image,
  Music
} from 'lucide-react';
import { 
  useGetManagerCompanies,
  useCompanyModules,
  useGetModuleResources,
  useGetCompanyTrainees
} from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ManagerCompanyModules() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);

  // Get manager's assigned companies
  const { data: companiesData } = useGetManagerCompanies(user?.id || 0);
  const { data: modulesData, isLoading: modulesLoading } = useCompanyModules(parseInt(companyId || '0'));
  const { data: resourcesData, isLoading: resourcesLoading } = useGetModuleResources(selectedModule || 0);
  const { data: traineesData, isLoading: traineesLoading } = useGetCompanyTrainees(parseInt(companyId || '0'));

  const companies = companiesData?.companies || [];
  const currentCompany = companies.find(c => c.id === parseInt(companyId || '0'));
  const modules = modulesData || [];
  const resources = resourcesData?.resources || [];
  const trainees = traineesData?.trainees || [];

  const handleViewTrainees = () => {
    navigate(`/manager/company/${companyId}/trainees`);
  };

  const handleAddModule = () => {
    setShowAddModule(true);
  };

  const handleAddResource = () => {
    setShowAddResource(true);
  };

  const handleManageModule = (moduleId: number) => {
    setSelectedModule(moduleId);
  };

  const handleViewProgress = () => {
    navigate(`/manager/company/${companyId}/progress`);
  };

  if (modulesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading modules...</div>
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
                onClick={() => navigate('/manager/dashboard')}
              >
                ← Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentCompany?.name || 'Company'} Management
            </h1>
            <p className="text-gray-600">Manage training modules, resources, and trainees</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.length}</div>
              <p className="text-xs text-muted-foreground">Active modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainees.length}</div>
              <p className="text-xs text-muted-foreground">Registered trainees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {modules.reduce((total, module) => total + (module.resources?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total resources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Average completion</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="trainees">Trainees</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Training Modules</h3>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleAddModule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video Module
                </Button>
                <Button onClick={handleAddResource}>
                  <FileText className="w-4 h-4 mr-2" />
                  Add Resource Module
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.name}</CardTitle>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Videos:</span>
                        <span className="font-medium">{module.videos?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Resources:</span>
                        <span className="font-medium">{module.resources?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">MCQs:</span>
                        <span className="font-medium">{module.mcqs?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleManageModule(module.id)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {modules.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
                <p className="text-gray-600 mb-4">Create your first training module to get started.</p>
                <div className="space-x-2">
                  <Button onClick={handleAddModule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video Module
                  </Button>
                  <Button variant="outline" onClick={handleAddResource}>
                    <FileText className="w-4 h-4 mr-2" />
                    Add Resource Module
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trainees" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Trainees</h3>
              <Button onClick={handleViewTrainees}>
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Trainees
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {trainees.map((trainee) => (
                <Card key={trainee.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{trainee.name}</p>
                          <p className="text-sm text-gray-500">{trainee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={trainee.isVerified ? "default" : "secondary"}>
                          {trainee.isVerified ? "Verified" : "Pending"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {trainees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trainees found</h3>
                <p className="text-gray-600">No trainees are registered for this company yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Resources</h3>
              <Button onClick={handleAddResource}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{module.name}</span>
                      <Badge variant="outline">{module.resources?.length || 0} resources</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {module.resources && module.resources.length > 0 ? (
                      <div className="space-y-2">
                        {module.resources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                {resource.type === 'VIDEO' && <Video className="w-4 h-4 text-purple-600" />}
                                {resource.type === 'PDF' && <File className="w-4 h-4 text-purple-600" />}
                                {resource.type === 'IMAGE' && <Image className="w-4 h-4 text-purple-600" />}
                                {resource.type === 'AUDIO' && <Music className="w-4 h-4 text-purple-600" />}
                                {resource.type === 'DOCUMENT' && <FileText className="w-4 h-4 text-purple-600" />}
                              </div>
                              <div>
                                <p className="font-medium">{resource.title}</p>
                                <p className="text-sm text-gray-500">{resource.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{resource.type}</Badge>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No resources in this module</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Training Progress</h3>
              <Button onClick={handleViewProgress}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Detailed Progress
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{module.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-500">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">12</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">3</div>
                          <div className="text-xs text-gray-500">In Progress</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-600">5</div>
                          <div className="text-xs text-gray-500">Not Started</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
