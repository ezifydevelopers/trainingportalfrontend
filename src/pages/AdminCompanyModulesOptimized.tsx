import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Plus, FileText, Video, Users } from 'lucide-react';
import { toast } from 'sonner';

// Custom hooks
import { useCompanyManagement } from '@/features/companies/hooks/useCompanyManagement';
import { useManagerCompanyManagement } from '@/features/companies/hooks/useManagerCompanyManagement';
import { useModuleManagement } from '@/features/modules/hooks/useModuleManagement';

// Components
import CompanyHeader from '@/features/companies/components/CompanyHeader';
import CompanyList from '@/features/companies/components/CompanyList';
import ModuleList from '@/features/modules/components/ModuleList';
import ModuleDetail from '@/features/modules/components/ModuleDetail';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

// Form Components
import AddModuleForm from '@/features/modules/components/AddModuleForm';
import EditModuleForm from '@/features/modules/components/EditModuleForm';
import ResourceUploadForm from '@/features/modules/components/ResourceUploadForm';

// Dialog Components
import NewCompanyDialog from '@/components/NewCompanyDialog';
import CompanyEditDialog from '@/features/companies/components/CompanyEditDialog';
import ConfirmationDialog from '@/shared/components/ConfirmationDialog';
import { HOCPresets } from "@/components/HOCComposer";

interface AdminCompanyModulesOptimizedProps {
  selectedCompanyId?: number;
  isManagerView?: boolean;
  managerId?: number;
}

interface AdminCompanyModulesOptimizedProps {
  user?: any;
  isAuthenticated?: boolean;
}

const AdminCompanyModulesOptimized = memo<AdminCompanyModulesOptimizedProps>(({ 
  selectedCompanyId, 
  isManagerView = false,
  managerId = 0
}) => {
  // Company management - use different hooks based on view mode
  const adminCompanyManagement = useCompanyManagement(selectedCompanyId);
  const managerCompanyManagement = useManagerCompanyManagement(managerId, selectedCompanyId);
  
  const {
    selectedCompany,
    searchTerm,
    showNewCompany,
    showEditCompany,
    companyToEdit,
    companyToDelete,
    companies,
    isLoading: companiesLoading,
    isError: companiesError,
    handleCompanySelect,
    handleBackToCompanies,
    handleCreateCompany,
    handleEditCompany,
    handleUpdateCompany,
    handleDeleteCompany,
    confirmDeleteCompany,
    handleSearchChange,
    handleShowNewCompany,
    handleCloseNewCompany,
    handleCloseEditCompany,
    handleCloseDeleteDialog,
    isCreating,
    isUpdating,
    isDeleting,
  } = isManagerView ? managerCompanyManagement : adminCompanyManagement;

  // Module management
  const {
    selectedModule,
    showAddModule,
    showModuleDetail,
    deletingModuleId,
    activeTab,
    modules,
    videoModules,
    resourceModules,
    isLoading: modulesLoading,
    isError: modulesError,
    handleModuleSelect,
    handleCloseModuleDetail,
    handleCreateModule,
    handleEditModule,
    handleUpdateModule,
    handleDeleteModule,
    handleUploadResource,
    handleShowAddModule,
    handleCloseAddModule,
    handleTabChange,
    isCreating: isCreatingModule,
    isUpdating: isUpdatingModule,
    isDeleting: isDeletingModule,
    isUploadingVideo,
    uploadProgress,
  } = useModuleManagement(selectedCompany?.id || null);

  // Memoized utility functions
  const capitalizeModuleName = useCallback((name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }, []);

  // Error handling
  if (companiesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-4">Error loading companies</div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <CompanyHeader
          selectedCompany={selectedCompany}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onBackToCompanies={handleBackToCompanies}
          onShowNewCompany={isManagerView ? undefined : handleShowNewCompany}
          onShowAddModule={handleShowAddModule}
          onShowAddResource={() => handleTabChange('resource')}
          isManagerView={isManagerView}
        />

        {/* Main Content */}
        {!selectedCompany && !isManagerView ? (
          // Companies List View (only for admin)
          <div className="max-w-7xl mx-auto">
            <CompanyList
              companies={companies}
              onCompanySelect={handleCompanySelect}
              onCompanyEdit={handleEditCompany}
              onCompanyDelete={handleDeleteCompany}
              isLoading={companiesLoading}
              searchTerm={searchTerm}
            />
          </div>
        ) : selectedCompany ? (
          // Modules Management View
          <div className="max-w-7xl mx-auto">
            {/* Modules Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="video" className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Video Modules ({videoModules.length})</span>
                </TabsTrigger>
                <TabsTrigger value="resource" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Resource Modules ({resourceModules.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-6">
                <ModuleList
                  modules={videoModules}
                  onModuleSelect={handleModuleSelect}
                  onEditModule={handleEditModule}
                  onDeleteModule={handleDeleteModule}
                  onUploadResource={handleUploadResource}
                  deletingModuleId={deletingModuleId}
                  capitalizeModuleName={capitalizeModuleName}
                  isLoading={modulesLoading}
                />
              </TabsContent>

              <TabsContent value="resource" className="space-y-6">
                <ModuleList
                  modules={resourceModules}
                  onModuleSelect={handleModuleSelect}
                  onEditModule={handleEditModule}
                  onDeleteModule={handleDeleteModule}
                  onUploadResource={handleUploadResource}
                  deletingModuleId={deletingModuleId}
                  capitalizeModuleName={capitalizeModuleName}
                  isLoading={modulesLoading}
                />
              </TabsContent>
            </Tabs>

            {/* Add Module Form */}
            <AddModuleForm
              isOpen={showAddModule}
              onClose={handleCloseAddModule}
              onSubmit={handleCreateModule}
              isLoading={isCreatingModule}
              isUploadingVideo={isUploadingVideo}
              uploadProgress={uploadProgress}
            />

            {/* Edit Module Form */}
            <EditModuleForm
              module={selectedModule}
              isOpen={showModuleDetail && !!selectedModule}
              onClose={handleCloseModuleDetail}
              onSubmit={handleUpdateModule}
              isLoading={isUpdatingModule}
            />

            {/* Resource Upload Form */}
            <ResourceUploadForm
              moduleId={selectedModule?.id || 0}
              moduleName={selectedModule?.name || ''}
              isOpen={false} // This will be controlled by a separate state
              onClose={() => {}}
              onSubmit={handleUploadResource}
              isLoading={false}
            />
          </div>
        ) : isManagerView ? (
          // Manager view fallback when no company selected
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Selected</h3>
              <p className="text-gray-600">Please select a company from the manager dashboard to manage modules.</p>
            </div>
          </div>
        ) : null}

        {/* Dialogs */}
        <NewCompanyDialog
          open={showNewCompany}
          onOpenChange={handleCloseNewCompany}
          onSubmit={handleCreateCompany}
          isLoading={isCreating}
        />

        <CompanyEditDialog
          company={companyToEdit}
          isOpen={showEditCompany}
          onClose={handleCloseEditCompany}
          onSubmit={handleUpdateCompany}
          isLoading={isUpdating}
        />

        <ModuleDetail
          module={selectedModule}
          isOpen={showModuleDetail}
          onClose={handleCloseModuleDetail}
          onAddAnother={handleShowAddModule}
          capitalizeModuleName={capitalizeModuleName}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={!!companyToDelete}
          onClose={handleCloseDeleteDialog}
          onConfirm={confirmDeleteCompany}
          title="Delete Company"
          description={`Are you sure you want to delete "${companyToDelete?.name}"?`}
          confirmText="Delete Company"
          type="delete"
          isLoading={isDeleting}
          destructive={true}
          details={[
            'All training modules for this company',
            'All trainees associated with this company',
            'All progress data and assessment results'
          ]}
          warning="This action cannot be undone."
        />
      </div>
    </ErrorBoundary>
  );
});

AdminCompanyModulesOptimized.displayName = 'AdminCompanyModulesOptimized';

// Export with comprehensive HOC protection
export default HOCPresets.adminPage(AdminCompanyModulesOptimized);
