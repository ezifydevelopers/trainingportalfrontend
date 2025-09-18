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
import { Plus, FileText, Video, Users, Upload, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Module } from '@/shared/types/common.types';

// Custom hooks
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

interface ManagerCompanyModulesProps {
  selectedCompanyId?: number;
  managerId: number;
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
      console.log('Resource modules data:', resourceModules);
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
    console.log('Manual refresh triggered');
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

      // First create the module
      const moduleResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7001/api'}/admin/companies/${selectedCompany.id}/modules`, {
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
      console.log('Created module with ID:', moduleId);

      // Upload files if any
      if (resourceFiles.length > 0) {
        console.log('Uploading', resourceFiles.length, 'files to module', moduleId);
        for (const file of resourceFiles) {
          console.log('Uploading file:', file.name, 'Type:', file.type);
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
          console.log('Mapped file type:', file.type, 'to resource type:', resourceType);

          const resourceResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7001/api'}/admin/resources`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            body: formData
          });

          if (!resourceResponse.ok) {
            const errorData = await resourceResponse.json();
            console.error('Resource upload failed:', errorData);
            throw new Error(`Failed to upload resource: ${errorData.message || 'Unknown error'}`);
          }

          const resourceData = await resourceResponse.json();
          console.log('Resource uploaded successfully:', resourceData);
        }
      }

      toast.success('Resource module created successfully');
      setShowResourceModuleDialog(false);
      setResourceModuleName('');
      setResourceFiles([]);
      
      // Refresh modules by invalidating the query cache
      console.log('Invalidating queries for company:', selectedCompany.id);
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany.id] });
      
      // Also invalidate all modules queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      
      // Force a refetch after a short delay to ensure backend has processed the uploads
      setTimeout(() => {
        console.log('Force refetching modules...');
        queryClient.refetchQueries({ queryKey: ['company-modules', selectedCompany.id] });
      }, 1000);
    } catch (error) {
      console.error('Error creating resource module:', error);
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
          isManagerView={true}
        />

        {/* Main Content */}
        {!selectedCompany ? (
          // Companies List View (Manager)
          <div className="max-w-7xl mx-auto pb-16">
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
          <div className="max-w-7xl mx-auto pb-16">
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

              <TabsContent value="resource" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {resourceModules.length} resource module{resourceModules.length !== 1 ? 's' : ''} found
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshModules}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
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
          onSubmit={handleCreateModule}
          isLoading={isCreatingModule}
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
            console.log('Uploading resources to module:', moduleId, files);
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Create Resource Module
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Name
                </label>
                <Input
                  placeholder="Enter resource module name..."
                  value={resourceModuleName}
                  onChange={(e) => setResourceModuleName(e.target.value)}
                />
              </div>
              
              {/* Resource Upload Section */}
              <div className="border-2 border-dashed border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Resources</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload documents, PDFs, images, and other learning resources for this module
                  </p>
                  
                  <div className="space-y-4">
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
                        className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </label>
                    </div>
                    
                    {resourceFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                        <div className="space-y-2">
                          {resourceFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setResourceFiles(files => files.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResourceModuleDialog(false);
                    setResourceModuleName('');
                    setResourceFiles([]);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateResourceModuleWithFiles}
                  disabled={!resourceModuleName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Create Module & Upload Files
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
});

ManagerCompanyModules.displayName = 'ManagerCompanyModules';

export default ManagerCompanyModules;