import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search,
  Eye,
  Settings,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { 
  useGetCompanyTrainees,
  useGetManagerCompanies
} from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ManagerTrainees() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<number | null>(null);

  // Get manager's assigned companies and trainees
  const { data: companiesData } = useGetManagerCompanies(user?.id || 0);
  const { data: traineesData, isLoading: traineesLoading } = useGetCompanyTrainees(parseInt(companyId || '0'));

  const companies = companiesData?.companies || [];
  const currentCompany = companies.find(c => c.id === parseInt(companyId || '0'));
  const trainees = traineesData?.trainees || [];

  const filteredTrainees = trainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTrainee = (traineeId: number) => {
    setSelectedTrainee(traineeId);
  };

  const handleManageTrainee = (traineeId: number) => {
    navigate(`/manager/company/${companyId}/trainee/${traineeId}`);
  };

  const handleAddTrainee = () => {
    // Redirect to trainee signup page
    window.open('/signup-trainee', '_blank');
  };

  const handleViewProgress = () => {
    navigate(`/manager/company/${companyId}/progress`);
  };

  if (traineesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading trainees...</div>
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
              {currentCompany?.name || 'Company'} - Trainees
            </h1>
            <p className="text-gray-600">Manage and track trainee progress</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainees.length}</div>
              <p className="text-xs text-muted-foreground">Registered trainees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {trainees.filter(t => t.isVerified).length}
              </div>
              <p className="text-xs text-muted-foreground">Verified accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {trainees.filter(t => !t.isVerified).length}
              </div>
              <p className="text-xs text-muted-foreground">Pending verification</p>
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

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search trainees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleViewProgress}>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Progress
            </Button>
            <Button onClick={handleAddTrainee}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Trainee
            </Button>
          </div>
        </div>

        {/* Trainees List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTrainees.map((trainee) => (
            <Card key={trainee.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold">{trainee.name}</h3>
                        <Badge variant={trainee.isVerified ? "default" : "secondary"}>
                          {trainee.isVerified ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{trainee.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined: {new Date(trainee.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">Progress</div>
                      <div className="text-xs text-gray-500">85% Complete</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTrainee(trainee.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleManageTrainee(trainee.id)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Training Progress</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrainees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No trainees found' : 'No trainees found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'No trainees are registered for this company yet.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleAddTrainee}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Trainee
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
