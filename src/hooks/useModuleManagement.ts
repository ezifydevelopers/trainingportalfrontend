import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  useAddModuleToCompany, 
  useAddVideoToModule, 
  useAddMCQsToModule, 
  useDeleteModule,
  useUpdateModule
} from './useApi';
import { TrainingModule, Company } from '@/types/course';

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface ModuleData {
  name: string;
  videoFile: File | null;
  mcqs: MCQ[];
}

export function useModuleManagement(companyId: number) {
  const queryClient = useQueryClient();
  const addModuleMutation = useAddModuleToCompany();
  const addVideoMutation = useAddVideoToModule();
  const addMCQsMutation = useAddMCQsToModule();
  const deleteModuleMutation = useDeleteModule();
  const updateModuleMutation = useUpdateModule();

  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createModule = useCallback(async (moduleData: ModuleData) => {
    if (!moduleData.name.trim()) {
      throw new Error('Module name is required');
    }

    setIsCreatingModule(true);
    setUploadProgress(0);

    try {
      // Step 1: Create the module
      setUploadProgress(10);
      const moduleResponse = await addModuleMutation.mutateAsync({
        companyId,
        name: moduleData.name.trim()
      });

      if (!moduleResponse.success || !moduleResponse.module) {
        throw new Error('Failed to create module');
      }

      const module = moduleResponse.module;
      setUploadProgress(30);

      // Step 2: Upload video if provided
      if (moduleData.videoFile) {
        setUploadProgress(40);
        const videoFormData = new FormData();
        videoFormData.append('video', moduleData.videoFile);

        const videoResponse = await addVideoMutation.mutateAsync({
          moduleId: module.id,
          videoFile: moduleData.videoFile
        });

        if (!videoResponse.success) {
          throw new Error('Failed to upload video');
        }
        setUploadProgress(70);
      }

      // Step 3: Add MCQs if provided
      if (moduleData.mcqs.length > 0) {
        setUploadProgress(80);
        const mcqResponse = await addMCQsMutation.mutateAsync({
          moduleId: module.id,
          mcqs: moduleData.mcqs
        });

        if (!mcqResponse.success) {
          throw new Error('Failed to add MCQs');
        }
        setUploadProgress(90);
      }

      // Step 4: Complete
      setUploadProgress(100);
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['modules', companyId] });
      await queryClient.invalidateQueries({ queryKey: ['companies'] });

      toast.success('Module created successfully!');
      return module;

    } catch (error) {
      console.error('Error creating module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create module';
      toast.error(`Failed to create module: ${errorMessage}`);
      throw error;
    } finally {
      setIsCreatingModule(false);
      setUploadProgress(0);
    }
  }, [companyId, addModuleMutation, addVideoMutation, addMCQsMutation, queryClient]);

  const deleteModule = useCallback(async (module: TrainingModule) => {
    try {
      const response = await deleteModuleMutation.mutateAsync(module.id);
      
      if (response.success) {
        toast.success('Module deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['modules', companyId] });
      } else {
        throw new Error(response.message || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete module';
      toast.error(`Failed to delete module: ${errorMessage}`);
      throw error;
    }
  }, [companyId, deleteModuleMutation, queryClient]);

  const updateModule = useCallback(async (moduleId: number, updates: Partial<TrainingModule>) => {
    try {
      const response = await updateModuleMutation.mutateAsync({
        moduleId,
        updates
      });

      if (response.success) {
        toast.success('Module updated successfully');
        await queryClient.invalidateQueries({ queryKey: ['modules', companyId] });
        return response.module;
      } else {
        throw new Error(response.message || 'Failed to update module');
      }
    } catch (error) {
      console.error('Error updating module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update module';
      toast.error(`Failed to update module: ${errorMessage}`);
      throw error;
    }
  }, [companyId, updateModuleMutation, queryClient]);

  return {
    createModule,
    deleteModule,
    updateModule,
    isCreatingModule,
    uploadProgress,
    isDeleting: deleteModuleMutation.isPending,
    isUpdating: updateModuleMutation.isPending
  };
}
