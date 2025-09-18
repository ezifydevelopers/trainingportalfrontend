import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  useCompanyModules,
  useAddModuleToCompany,
  useUpdateModule,
  useDeleteModule,
  useAddVideoToModule,
  useAddMCQsToModule,
  useAddResource
} from '@/hooks/useApi';
import { Module } from '@/shared/types/common.types';

export const useModuleManagement = (companyId: number | null) => {
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'resource'>('video');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [moduleToEdit, setModuleToEdit] = useState<Module | null>(null);
  const [showEditModule, setShowEditModule] = useState(false);

  // API hooks
  const { data: modules = [], isLoading, isError } = useCompanyModules(companyId);
  const addModuleMutation = useAddModuleToCompany();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const addVideoMutation = useAddVideoToModule();
  const addMCQsMutation = useAddMCQsToModule();
  const addResourceMutation = useAddResource();

  // Memoized filtered modules
  const videoModules = useMemo(() => 
    modules.filter(module => !module.isResourceModule),
    [modules]
  );

  const resourceModules = useMemo(() => 
    modules.filter(module => module.isResourceModule),
    [modules]
  );

  // Module selection handlers
  const handleModuleSelect = useCallback((module: Module) => {
    setSelectedModule(module);
    setShowModuleDetail(true);
  }, []);

  const handleCloseModuleDetail = useCallback(() => {
    setShowModuleDetail(false);
    setSelectedModule(null);
  }, []);

  // Module creation handlers - Admin-style implementation
  const handleCreateModule = useCallback(async (moduleData: {
    name: string;
    videoFile?: File;
    duration?: number;
    mcqs?: Array<{
      question: string;
      options: string[];
      answer: string;
      explanation?: string;
    }>;
  }) => {
    if (!companyId) return;

    // Validate video duration if video file is provided
    if (moduleData.videoFile && (!moduleData.duration || moduleData.duration <= 0)) {
      toast.error("Please wait for video duration to load or try uploading a different video file.");
      return;
    }

    try {
      setIsUploadingVideo(true);
      setUploadProgress(0);
      
      // Show loading toast for the entire process
      const loadingToast = toast.loading("Creating module and uploading video... This may take a while depending on your internet speed.", {
        duration: 0 // Keep toast until manually dismissed
      });
      
      // 1. Add module to company
      setUploadProgress(10);
      toast.loading("Step 1/3: Creating module...", { id: loadingToast });
      const moduleRes = await addModuleMutation.mutateAsync({ 
        companyId, 
        name: moduleData.name 
      });
      
      const moduleId = moduleRes?.module?.id;
      if (!moduleId) {
        throw new Error(`Failed to create module: ${moduleRes?.message || 'No module ID returned'}`);
      }
      
      // 2. Add video to module (this is the critical step that needs to complete)
      if (moduleData.videoFile && moduleData.duration) {
        setUploadProgress(30);
        toast.loading("Step 2/3: Uploading video... Please wait for complete upload.", { id: loadingToast });
        await addVideoMutation.mutateAsync({ 
          moduleId, 
          videoFile: moduleData.videoFile, 
          duration: moduleData.duration 
        });
        setUploadProgress(80);
      }
      
      // 3. Add MCQs to module (optional)
      if (moduleData.mcqs && moduleData.mcqs.length > 0) {
        console.log('Adding MCQs to module:', moduleId, moduleData.mcqs);
        setUploadProgress(90);
        toast.loading("Step 3/3: Adding quiz questions...", { id: loadingToast });
        try {
          await addMCQsMutation.mutateAsync({ moduleId, mcqs: moduleData.mcqs });
          console.log('MCQs added successfully');
          setUploadProgress(100);
          toast.success("✅ Module, video, and MCQs added successfully!", { id: loadingToast });
        } catch (mcqError) {
          console.error('MCQ addition failed:', mcqError);
          toast.error("Module and video created, but failed to add quiz questions.", { id: loadingToast });
        }
      } else {
        setUploadProgress(100);
        toast.success("✅ Module and video added successfully!", { id: loadingToast });
      }
      
      // Reset form and close dialog
      setShowAddModule(false);
      setUploadProgress(0);
      
      // Refresh modules
      queryClient.invalidateQueries({ queryKey: ['company-modules', companyId] });
      
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error(`Failed to create module: ${error.message || 'Unknown error'}`);
      setUploadProgress(0);
    } finally {
      setIsUploadingVideo(false);
    }
  }, [companyId, addModuleMutation, addVideoMutation, addMCQsMutation, queryClient]);

  // Module editing handlers
  const handleEditModule = useCallback((module: Module) => {
    setModuleToEdit(module);
    setShowEditModule(true);
  }, []);

  const handleUpdateModule = useCallback(async (moduleData: {
    id: number;
    name: string;
    videoFile?: File;
    duration?: number;
    mcqs?: Array<{
      question: string;
      options: string[];
      answer: string;
      explanation?: string;
    }>;
  }) => {
    try {
      await updateModuleMutation.mutateAsync({
        id: moduleData.id,
        name: moduleData.name
      });

      // Update video if provided
      if (moduleData.videoFile && moduleData.duration) {
        await addVideoMutation.mutateAsync({
          moduleId: moduleData.id,
          videoFile: moduleData.videoFile,
          duration: moduleData.duration
        });
      }

      // Update MCQs if provided
      if (moduleData.mcqs && moduleData.mcqs.length > 0) {
        await addMCQsMutation.mutateAsync({
          moduleId: moduleData.id,
          mcqs: moduleData.mcqs
        });
      }

      toast.success('Module updated successfully');
      queryClient.invalidateQueries({ queryKey: ['company-modules', companyId] });
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  }, [updateModuleMutation, addVideoMutation, addMCQsMutation, queryClient, companyId]);

  // Module deletion handlers
  const handleDeleteModule = useCallback(async (moduleId: number, moduleName: string) => {
    try {
      setDeletingModuleId(moduleId);
      await deleteModuleMutation.mutateAsync(moduleId);
      toast.success(`Module "${moduleName}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['company-modules', companyId] });
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    } finally {
      setDeletingModuleId(null);
    }
  }, [deleteModuleMutation, queryClient, companyId]);

  // Resource upload handlers
  const handleUploadResource = useCallback(async (module: Module) => {
    // This will be handled by the ResourceUploadForm component
    // For now, just show the form
    setSelectedModule(module);
    setShowModuleDetail(true);
  }, []);

  // Dialog handlers
  const handleShowAddModule = useCallback(() => {
    setShowAddModule(true);
  }, []);

  const handleCloseAddModule = useCallback(() => {
    setShowAddModule(false);
  }, []);

  // Tab handlers
  const handleTabChange = useCallback((tab: 'video' | 'resource') => {
    setActiveTab(tab);
  }, []);

  return {
    // State
    selectedModule,
    showAddModule,
    showModuleDetail,
    deletingModuleId,
    activeTab,
    moduleToEdit,
    showEditModule,
    
    // Data
    modules,
    videoModules,
    resourceModules,
    isLoading,
    isError,
    
    // Actions
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
    
    // Loading states
    isCreating: addModuleMutation.isPending,
    isUpdating: updateModuleMutation.isPending,
    isDeleting: deleteModuleMutation.isPending,
    isUploadingVideo: isUploadingVideo,
    isUploadingMCQs: addMCQsMutation.isPending,
    isUploadingResources: addResourceMutation.isPending,
    uploadProgress,
  };
};
