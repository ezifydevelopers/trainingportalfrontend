import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ModuleCreationData {
  companyId: number;
  name: string;
  isResourceModule?: boolean;
  videoFile: File;
  duration: number;
  mcqs?: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>;
}

interface UseAtomicModuleCreationReturn {
  createModule: (data: ModuleCreationData) => Promise<{ sessionId: string; success: boolean }>;
  isCreating: boolean;
  error: string | null;
}

export function useAtomicModuleCreation(): UseAtomicModuleCreationReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createModule = useCallback(async (data: ModuleCreationData) => {
    setIsCreating(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('companyId', data.companyId.toString());
      formData.append('name', data.name);
      formData.append('isResourceModule', (data.isResourceModule || false).toString());
      formData.append('duration', data.duration.toString());
      
      if (data.mcqs && data.mcqs.length > 0) {
        formData.append('mcqs', JSON.stringify(data.mcqs));
      }
      
      formData.append('video', data.videoFile);

      // Generate session ID for progress tracking
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/admin/modules/create-with-content', {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create module');
      }

      if (result.success) {
        // Invalidate relevant queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['modules'] });
        queryClient.invalidateQueries({ queryKey: ['companies'] });
        
        toast.success('Module creation started! Check progress below.');
        
        return {
          sessionId: result.sessionId || sessionId,
          success: true
        };
      } else {
        throw new Error(result.message || 'Module creation failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to create module: ${errorMessage}`);
      
      return {
        sessionId: '',
        success: false
      };
    } finally {
      setIsCreating(false);
    }
  }, [queryClient]);

  return {
    createModule,
    isCreating,
    error
  };
}
