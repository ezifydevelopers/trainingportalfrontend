import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  useGetManagerCompanies, 
  useCreateCompany, 
  useUpdateCompany, 
  useDeleteCompany 
} from '@/hooks/useApi';
import { Company } from '@/shared/types/common.types';
import { ManagerCompanyAssignment } from '@/lib/api';

export const useManagerCompanyManagement = (managerId: number, selectedCompanyId?: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // API hooks
  const { data: managerCompaniesData, isLoading, isError } = useGetManagerCompanies(managerId);
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  // Extract companies from manager assignments
  const companies = useMemo(() => {
    if (!managerCompaniesData?.companies) return [];
    return managerCompaniesData.companies.map((assignment: ManagerCompanyAssignment) => ({
      id: assignment.company.id,
      name: assignment.company.name,
      logo: assignment.company.logo,
      createdAt: assignment.assignedAt,
      updatedAt: assignment.assignedAt
    }));
  }, [managerCompaniesData?.companies]);

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
    navigate('/manager/dashboard');
  }, [navigate]);

  // Company creation handlers
  const handleCreateCompany = useCallback(async (companyData: Partial<Company>) => {
    try {
      const formData = new FormData();
      formData.append('name', companyData.name || '');
      if (companyData.logo && typeof companyData.logo !== 'string') {
        formData.append('logo', companyData.logo as File);
      }

      await createCompanyMutation.mutateAsync(formData);
      toast.success('Company created successfully');
      setShowNewCompany(false);
      queryClient.invalidateQueries({ queryKey: ['manager-companies', managerId] });
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    }
  }, [createCompanyMutation, queryClient, managerId]);

  // Company update handlers
  const handleUpdateCompany = useCallback(async (companyData: { id: number; data: FormData }) => {
    try {
      await updateCompanyMutation.mutateAsync(companyData);
      toast.success('Company updated successfully');
      setShowEditCompany(false);
      setCompanyToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['manager-companies', managerId] });
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    }
  }, [updateCompanyMutation, queryClient, managerId]);

  // Company deletion handlers
  const handleDeleteCompany = useCallback((company: Company) => {
    setCompanyToDelete(company);
  }, []);

  const confirmDeleteCompany = useCallback(async () => {
    if (!companyToDelete) return;

    try {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      toast.success('Company deleted successfully');
      setCompanyToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['manager-companies', managerId] });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  }, [companyToDelete, deleteCompanyMutation, queryClient, managerId]);

  // Dialog handlers
  const handleShowNewCompany = useCallback(() => {
    setShowNewCompany(true);
  }, []);

  const handleCloseNewCompany = useCallback(() => {
    setShowNewCompany(false);
  }, []);

  const handleEditCompany = useCallback((company: Company) => {
    setCompanyToEdit(company);
    setShowEditCompany(true);
  }, []);

  const handleCloseEditCompany = useCallback(() => {
    setShowEditCompany(false);
    setCompanyToEdit(null);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setCompanyToDelete(null);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    selectedCompany,
    searchTerm,
    showNewCompany,
    showEditCompany,
    companyToEdit,
    companyToDelete,
    companies: filteredCompanies,
    isLoading,
    isError,
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
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
  };
};
