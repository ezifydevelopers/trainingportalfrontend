import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  useAllCompanies, 
  useCreateCompany, 
  useUpdateCompany, 
  useDeleteCompany 
} from '@/hooks/useApi';
import { Company } from '@/shared/types/common.types';

export const useCompanyManagement = (selectedCompanyId?: number) => {
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // API hooks
  const { data: companiesData, isLoading, isError } = useAllCompanies();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  const companies = companiesData?.companies || [];

  // Set selected company if selectedCompanyId is provided
  useMemo(() => {
    if (selectedCompanyId && companies.length > 0) {
      const company = companies.find(c => c.id === selectedCompanyId);
      if (company && !selectedCompany) {
        setSelectedCompany(company);
      }
    }
  }, [selectedCompanyId, companies, selectedCompany]);

  // Memoized filtered companies
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  // Company selection handlers
  const handleCompanySelect = useCallback((company: Company) => {
    setSelectedCompany(company);
  }, []);

  const handleBackToCompanies = useCallback(() => {
    setSelectedCompany(null);
  }, []);

  // Company creation handlers
  const handleCreateCompany = useCallback(async (companyData: Partial<Company>) => {
    try {
      await createCompanyMutation.mutateAsync(companyData);
      toast.success('Company created successfully');
      setShowNewCompany(false);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    } catch (error) {
      toast.error('Failed to create company');
    }
  }, [createCompanyMutation, queryClient]);

  // Company editing handlers
  const handleEditCompany = useCallback((company: Company) => {
    setCompanyToEdit(company);
    setShowEditCompany(true);
  }, []);

  const handleUpdateCompany = useCallback(async (companyData: Partial<Company>) => {
    if (!companyToEdit) return;
    
    try {
      await updateCompanyMutation.mutateAsync({
        id: companyToEdit.id,
        ...companyData
      });
      toast.success('Company updated successfully');
      setShowEditCompany(false);
      setCompanyToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    } catch (error) {
      toast.error('Failed to update company');
    }
  }, [companyToEdit, updateCompanyMutation, queryClient]);

  // Company deletion handlers
  const handleDeleteCompany = useCallback((company: Company) => {
    setCompanyToDelete(company);
  }, []);

  const confirmDeleteCompany = useCallback(async () => {
    if (!companyToDelete) return;
    
    try {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      toast.success(`Company "${companyToDelete.name}" deleted successfully`);
      setCompanyToDelete(null);
      setSelectedCompany(null);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    } catch (error) {
      toast.error('Failed to delete company');
    }
  }, [companyToDelete, deleteCompanyMutation, queryClient]);

  // Search handlers
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Dialog handlers
  const handleShowNewCompany = useCallback(() => {
    setShowNewCompany(true);
  }, []);

  const handleCloseNewCompany = useCallback(() => {
    setShowNewCompany(false);
  }, []);

  const handleCloseEditCompany = useCallback(() => {
    setShowEditCompany(false);
    setCompanyToEdit(null);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setCompanyToDelete(null);
  }, []);

  return {
    // State
    selectedCompany,
    searchTerm,
    showNewCompany,
    showEditCompany,
    companyToEdit,
    companyToDelete,
    
    // Data
    companies: filteredCompanies,
    isLoading,
    isError,
    
    // Actions
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
    
    // Loading states
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
  };
};