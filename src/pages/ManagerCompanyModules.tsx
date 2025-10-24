import React, { memo, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Plus, FileText, Video, Users, Upload, X, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Module } from '@/shared/types/common.types';
import { getApiBaseUrl } from '@/lib/api';

// Custom hooks
import { useManagerCompanyManagement } from '@/features/companies/hooks/useManagerCompanyManagement';
import { useModuleManagement } from '@/features/modules/hooks/useModuleManagement';

// Components
import CompanyHeader from '@/features/companies/components/CompanyHeader';
import CompanyList from '@/features/companies/components/CompanyList';
import ModuleList from '@/features/modules/components/ModuleList';
import { DuplicateCompanyDialog } from '@/components/DuplicateCompanyDialog';
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

interface ManagerCompanyModulesProps {
  selectedCompanyId?: number;
  managerId: number;
}

interface ManagerCompanyModulesProps {
  user?: any;
  isAuthenticated?: boolean;
}

const ManagerCompanyModules = memo<ManagerCompanyModulesProps>(({ 
  selectedCompanyId, 
  managerId 
}) => {
  const queryClient = useQueryClient();
  
  // Company management
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
  } = useManagerCompanyManagement(managerId, selectedCompanyId);

  // Module management
  const {
    selectedModule,
    activeTab,
    showAddModule,
    showEditModule,
    showModuleDetail,
    moduleToEdit,
    videoModules,
    resourceModules,
    isLoading: modulesLoading,
    isError: modulesError,
    handleTabChange,
    handleModuleSelect,
    handleShowAddModule,
    handleCloseAddModule,
    handleCreateModule,
    handleEditModule,
    handleUpdateModule,
    handleDeleteModule,
    handleCloseModuleDetail,
    handleUploadResource,
    isCreating: isCreatingModule,
    isUpdating: isUpdatingModule,
    isDeleting: isDeletingModule,
  } = useModuleManagement(selectedCompany?.id || null);

  // Debug: Log module data to see if resources are included
  React.useEffect(() => {
    if (resourceModules.length > 0) {

      resourceModules.forEach(module => {
        console.log(`Module ${module.name} (ID: ${module.id}):`, {
          resources: module.resources,
          resourcesCount: module.resources?.length || 0,
          isResourceModule: module.isResourceModule
        });
      });
    }
  }, [resourceModules]);

  // Resource module dialog state
  const [showResourceModuleDialog, setShowResourceModuleDialog] = useState(false);
  const [showDuplicateCompanyDialog, setShowDuplicateCompanyDialog] = useState(false);
  const [resourceModuleName, setResourceModuleName] = useState("");
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);

  // Memoized utility functions
  const capitalizeModuleName = useCallback((name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }, []);

  // Handler for Add Resource Module button
  const handleAddResourceModule = useCallback(() => {
    handleTabChange('resource');
    setShowResourceModuleDialog(true);
  }, [handleTabChange]);

  const handleRefreshModules = useCallback(() => {

    queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany?.id] });
    queryClient.refetchQueries({ queryKey: ['company-modules', selectedCompany?.id] });
  }, [queryClient, selectedCompany?.id]);

  // Handler for creating resource module with files
  const handleCreateResourceModuleWithFiles = useCallback(async () => {
    if (!resourceModuleName.trim() || !selectedCompany) return;
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast.error('You are not logged in. Please log in again.');
        return;
      }

      // Validate token format
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        // Check if token is expired
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          throw new Error('Token expired');
        }
      } catch (tokenError) {
        console.error('Token validation failed:', tokenError);
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return;
      }

      // First create the module
      const moduleResponse = await fetch(`${getApiBaseUrl()}/admin/companies/${selectedCompany.id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: resourceModuleName,
          isResourceModule: true
        })
      });

      if (!moduleResponse.ok) {
        throw new Error('Failed to create resource module');
      }

      const moduleData = await moduleResponse.json();
      const moduleId = moduleData.module.id;

      // Upload files if any
      if (resourceFiles.length > 0) {

        for (const file of resourceFiles) {

          const formData = new FormData();
          formData.append('moduleId', moduleId.toString());
          formData.append('resourceFile', file);
          
          // Map file MIME types to valid ResourceType enum values
          let resourceType = 'DOCUMENT'; // default
          if (file.type.startsWith('video/')) {
            resourceType = 'VIDEO';
          } else if (file.type === 'application/pdf') {
            resourceType = 'PDF';
          } else if (file.type.startsWith('image/')) {
            resourceType = 'IMAGE';
          } else if (file.type.startsWith('audio/')) {
            resourceType = 'AUDIO';
          } else if (file.type.startsWith('text/') || 
                     file.type.includes('document') || 
                     file.type.includes('word') ||
                     file.type.includes('excel') ||
                     file.type.includes('powerpoint')) {
            resourceType = 'DOCUMENT';
          }
          
          formData.append('type', resourceType);

          const resourceResponse = await fetch(`${getApiBaseUrl()}/admin/resources`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            body: formData
          });

          if (!resourceResponse.ok) {
            const errorData = await resourceResponse.json();
            console.error('Resource upload error:', {
              status: resourceResponse.status,
              statusText: resourceResponse.statusText,
              error: errorData
            });

            // Handle specific error cases
            if (resourceResponse.status === 401) {
              toast.error('Your session has expired. Please log in again.');
              // Redirect to login or refresh token
              localStorage.removeItem('authToken');
              window.location.href = '/login';
              return;
            } else if (resourceResponse.status === 400) {
              toast.error(`Upload failed: ${errorData.message || 'Invalid request data'}`);
            } else {
              toast.error(`Upload failed: ${errorData.message || 'Unknown error'}`);
            }

            throw new Error(`Failed to upload resource: ${errorData.message || 'Unknown error'}`);
          }

          const resourceData = await resourceResponse.json();

        }
      }

      toast.success('Resource module created successfully');
      setShowResourceModuleDialog(false);
      setResourceModuleName('');
      setResourceFiles([]);
      
      // Refresh modules by invalidating the query cache

      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany.id] });
      
      // Also invalidate all modules queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      
      // Force a refetch after a short delay to ensure backend has processed the uploads
      setTimeout(() => {

        queryClient.refetchQueries({ queryKey: ['company-modules', selectedCompany.id] });
      }, 1000);
    } catch (error) {

      toast.error('Failed to create resource module');
    }
  }, [resourceModuleName, selectedCompany, resourceFiles, queryClient]);

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
      <div className="w-full">
        {/* Header (Manager) */}
        <CompanyHeader
          selectedCompany={selectedCompany}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onBackToCompanies={handleBackToCompanies}
          onShowNewCompany={undefined} // Managers can't create companies
          onShowAddModule={handleShowAddModule}
          onShowAddResource={handleAddResourceModule}
          onShowDuplicateCompany={() => setShowDuplicateCompanyDialog(true)}
          isManagerView={true}
        />

        {/* Main Content */}
        {!selectedCompany ? (
          // Companies List View (Manager)
          <div className="max-w-7xl mx-auto pb-8 sm:pb-12 lg:pb-16 px-2 sm:px-4">
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
          // Modules Management View (Manager) 
          <div className="max-w-7xl mx-auto pb-8 sm:pb-12 lg:pb-16 px-2 sm:px-4 overflow-x-hidden">
            {/* Modules Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="video" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Video Modules ({videoModules.length})</span>
                  <span className="sm:hidden">Video ({videoModules.length})</span>
                </TabsTrigger>
                <TabsTrigger value="resource" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Resource Modules ({resourceModules.length})</span>
                  <span className="sm:hidden">Resource ({resourceModules.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-2 sm:space-y-3">
                <ModuleList
                  modules={videoModules as unknown as Module[]}
                  onModuleSelect={handleModuleSelect}
                  onEditModule={handleEditModule}
                  onDeleteModule={handleDeleteModule}
                  onUploadResource={handleUploadResource}
                  deletingModuleId={null}
                  capitalizeModuleName={capitalizeModuleName}
                  isLoading={modulesLoading}
                  viewMode="list"
                />
              </TabsContent>

              <TabsContent value="resource" className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {resourceModules.length} resource module{resourceModules.length !== 1 ? 's' : ''} found
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshModules}
                    className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Refresh</span>
                  </Button>
                </div>
                <ModuleList
                  modules={resourceModules as unknown as Module[]}
                  onModuleSelect={handleModuleSelect}
                  onEditModule={handleEditModule}
                  onDeleteModule={handleDeleteModule}
                  onUploadResource={handleUploadResource}
                  deletingModuleId={null}
                  capitalizeModuleName={capitalizeModuleName}
                  isLoading={modulesLoading}
                  viewMode="list"
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        {/* Dialogs */}
        <AddModuleForm
          isOpen={showAddModule}
          onClose={handleCloseAddModule}
          companyId={selectedCompanyId}
          isResourceModule={false}
        />

        <EditModuleForm
          module={moduleToEdit}
          isOpen={showEditModule}
          onClose={() => {}}
          onSubmit={handleUpdateModule}
          isLoading={isUpdatingModule}
        />

        <ResourceUploadForm
          moduleId={selectedModule?.id || 0}
          moduleName={selectedModule?.name || ''}
          isOpen={false}
          onClose={() => {}}
          onSubmit={async (moduleId: number, files: File[]) => {
            // Handle resource upload

          }}
          isLoading={false}
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
          isOpen={false}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Delete Module"
          description="Are you sure you want to delete this module?"
          confirmText="Delete Module"
          type="delete"
          isLoading={isDeletingModule}
          destructive={true}
          details={[
            'All videos and resources in this module',
            'All trainee progress for this module',
            'All assessment data and results'
          ]}
          warning="This action cannot be undone."
        />

        {/* Resource Module Dialog */}
        <Dialog open={showResourceModuleDialog} onOpenChange={setShowResourceModuleDialog}>
          <DialogContent className="w-[95vw] sm:!w-[1024px] max-h-[90vh] overflow-y-auto !max-w-none">
            <DialogHeader>
              <DialogTitle className="flex items-center text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-green-600" />
                Create Resource Module
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Module Name
                </label>
                <Input
                  placeholder="Enter resource module name..."
                  value={resourceModuleName}
                  onChange={(e) => setResourceModuleName(e.target.value)}
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
              
              {/* Resource Upload Section */}
              <div className="border-2 border-dashed border-green-200 rounded-lg p-4 sm:p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Upload Resources</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Upload documents, PDFs, images, and other learning resources for this module
                  </p>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setResourceFiles(files);
                        }}
                        className="hidden"
                        id="resource-upload"
                      />
                      <label
                        htmlFor="resource-upload"
                        className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-green-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 cursor-pointer"
                      >
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Choose Files
                      </label>
                    </div>
                    
                    {resourceFiles.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                        <div className="space-y-1 sm:space-y-2">
                          {resourceFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-xs sm:text-sm text-gray-700 truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setResourceFiles(files => files.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResourceModuleDialog(false);
                    setResourceModuleName('');
                    setResourceFiles([]);
                  }}
                  className="flex-1 text-sm sm:text-base h-9 sm:h-10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateResourceModuleWithFiles}
                  disabled={!resourceModuleName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-sm sm:text-base h-9 sm:h-10"
                >
                  <span className="hidden sm:inline">Create Module & Upload Files</span>
                  <span className="sm:hidden">Create Module</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate Company Dialog */}
        <DuplicateCompanyDialog
          isOpen={showDuplicateCompanyDialog}
          onClose={() => setShowDuplicateCompanyDialog(false)}
          companies={companies}
        />
      </div>
    </ErrorBoundary>
  );
});

ManagerCompanyModules.displayName = 'ManagerCompanyModules';

// Export with comprehensive HOC protection
export default HOCPresets.managerPage(ManagerCompanyModules);