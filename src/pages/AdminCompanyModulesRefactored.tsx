import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CompanySelectionView from '@/components/CompanySelectionView';
import ModuleManagementView from '@/components/ModuleManagementView';
import { 
  useAllCompanies, 
  useCreateCompany, 
  useUpdateCompany,
  useCompanyModules, 
  useDeleteCompany
} from '@/hooks/useApi';
import { getApiBaseUrl } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import NewCompanyDialog from '@/components/NewCompanyDialog';
import EditCompanyDialog from '@/components/EditCompanyDialog';
import { Company, TrainingModule } from '@/types/course';

export default function AdminCompanyModulesRefactored() {
  const queryClient = useQueryClient();
  
  // Fetch companies from API
  const { data: companiesData, isLoading, isError } = useAllCompanies();
  const companies = companiesData?.companies || [];
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  // State management
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [showModuleDetail, setShowModuleDetail] = useState(false);

  // Get modules for selected company
  const { data: modulesData } = useCompanyModules(selectedCompany?.id || 0);
  const modules = modulesData || [];

  // Helper functions
  const getLogoUrl = (logo: string) => {
    if (!logo) return '';
    if (logo.startsWith('http')) {
      return logo;
    }
    const baseUrl = getApiBaseUrl().replace('/api', '');
    return `${baseUrl}/uploads/${logo}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const capitalizeModuleName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Event handlers
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
  };

  const handleNewCompany = () => {
    setShowNewCompany(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowEditCompany(true);
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
  };

  const handleConfirmDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      const response = await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      
      if (response.success) {
        toast.success('Company deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['companies'] });
        setCompanyToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete company';
      toast.error(`Failed to delete company: ${errorMessage}`);
    }
  };

  const handleManageModules = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleModuleSelect = (module: TrainingModule) => {
    setSelectedModule(module);
    setShowModuleDetail(true);
  };

  const handleEditModule = (module: TrainingModule) => {
    setSelectedModule(module);
    setShowModuleDetail(true);
  };

  const handleCloseModuleDetail = () => {
    setSelectedModule(null);
    setShowModuleDetail(false);
  };

  // Error handling
  if (isError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-2">Error loading companies</div>
            <div className="text-sm text-gray-600">Please try refreshing the page</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto" style={{ scrollBehavior: 'smooth' }}>
        
        {!selectedCompany ? (
          <CompanySelectionView
            companies={companies}
            isLoading={isLoading}
            onCompanySelect={handleCompanySelect}
            onNewCompany={handleNewCompany}
            onEditCompany={handleEditCompany}
            onDeleteCompany={handleDeleteCompany}
            onManageModules={handleManageModules}
            getLogoUrl={getLogoUrl}
            getInitials={getInitials}
          />
        ) : (
          <ModuleManagementView
            company={selectedCompany}
            modules={modules}
            onBack={handleBackToCompanies}
            onModuleSelect={handleModuleSelect}
            onEditModule={handleEditModule}
            getVideoUrl={getVideoUrl}
            capitalizeModuleName={capitalizeModuleName}
          />
        )}

        {/* New Company Dialog */}
        <NewCompanyDialog
          open={showNewCompany}
          onOpenChange={setShowNewCompany}
          onCompanyCreated={() => {
            setShowNewCompany(false);
            queryClient.invalidateQueries({ queryKey: ['companies'] });
          }}
        />

        {/* Edit Company Dialog */}
        <EditCompanyDialog
          open={showEditCompany}
          onOpenChange={setShowEditCompany}
          company={editingCompany}
          onCompanyUpdated={() => {
            setShowEditCompany(false);
            setEditingCompany(null);
            queryClient.invalidateQueries({ queryKey: ['companies'] });
          }}
        />

        {/* Company Delete Confirmation Dialog */}
        <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Company</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{companyToDelete?.name}"? This action cannot be undone.
                All associated training modules and data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteCompany}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteCompanyMutation.isPending}
              >
                {deleteCompanyMutation.isPending ? 'Deleting...' : 'Delete Company'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Module Detail Modal - Placeholder for now */}
        {showModuleDetail && selectedModule && (
          <Dialog open={showModuleDetail} onOpenChange={setShowModuleDetail}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Module Details</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{selectedModule.name}</h3>
                <p className="text-gray-600">Module details will be implemented here</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
