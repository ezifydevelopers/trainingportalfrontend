import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { CompanySelectionSection } from '@/features/companies/components/CompanySelectionSection';
import { useCompanyManagement } from '@/features/companies/hooks/useCompanyManagement';
import { ModuleManagementSection } from './ModuleManagementSection';
import { TraineeManagementSection } from './TraineeManagementSection';

export const ManagerDashboardRefactored: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedCompany,
    setSelectedCompany,
    companies,
    trainees,
    companiesLoading,
    traineesLoading,
    handleUpdateCompany,
    handleAddModule,
    handleUpdateModule,
    handleDeleteModule,
    handleAddVideo,
    handleAddMCQs,
    handleAddResource,
    handleDeleteResource,
  } = useCompanyManagement(user?.id || 0);

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
  };

  const handleCompanyEdit = (company: any) => {
    // Handle company edit - this would open a dialog
    console.log('Edit company:', company);
  };

  const handleViewTrainee = (traineeId: number) => {
    navigate(`/manager/company/${selectedCompany?.id}/trainee/${traineeId}`);
  };

  const handleEditTrainee = (traineeId: number) => {
    // Handle trainee edit
    console.log('Edit trainee:', traineeId);
  };

  const handleViewProgress = () => {
    navigate(`/manager/company/${selectedCompany?.id}/progress`);
  };

  const handleAddTrainee = () => {
    window.open('/signup-trainee', '_blank');
  };

  return (
    <Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
                <p className="text-blue-100 text-lg">Manage your assigned companies and their training modules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Selection Section */}
        <CompanySelectionSection
          companies={companies}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCompanySelect={handleCompanySelect}
          onCompanyEdit={handleCompanyEdit}
          isLoading={companiesLoading}
        />

        {/* Selected Company Management */}
        {selectedCompany && (
          <div className="space-y-6">
            <ModuleManagementSection
              company={selectedCompany}
              onAddModule={handleAddModule}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
              onAddVideo={handleAddVideo}
              onAddMCQs={handleAddMCQs}
              onAddResource={handleAddResource}
              onDeleteResource={handleDeleteResource}
            />
            
            <TraineeManagementSection
              company={selectedCompany}
              trainees={trainees}
              isLoading={traineesLoading}
              onViewTrainee={handleViewTrainee}
              onEditTrainee={handleEditTrainee}
              onViewProgress={handleViewProgress}
              onAddTrainee={handleAddTrainee}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};
