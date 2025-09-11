import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  GripVertical,
  FileText,
  Play,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TrainingModule, Company } from '@/types/course';
import SortableModule from './SortableModule';
import AddModuleForm from './AddModuleForm';
import { useModuleManagement } from '@/hooks/useModuleManagement';

interface ModuleManagementViewProps {
  company: Company;
  modules: TrainingModule[];
  onBack: () => void;
  onModuleSelect: (module: TrainingModule) => void;
  onEditModule: (module: TrainingModule) => void;
  getVideoUrl: (videoUrl: string) => string;
  capitalizeModuleName: (name: string) => string;
}

export default function ModuleManagementView({
  company,
  modules,
  onBack,
  onModuleSelect,
  onEditModule,
  getVideoUrl,
  capitalizeModuleName
}: ModuleManagementViewProps) {
  const [showAddModule, setShowAddModule] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const {
    createModule,
    deleteModule,
    isCreatingModule,
    uploadProgress,
    isDeleting
  } = useModuleManagement(company.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((module) => module.id === active.id);
      const newIndex = modules.findIndex((module) => module.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedModules = arrayMove(modules, oldIndex, newIndex);
        setIsReordering(true);
        
        // TODO: Implement API call to update module order
        // This would require a new API endpoint to update module order
        
        setTimeout(() => {
          setIsReordering(false);
        }, 1000);
      }
    }
  };

  const handleCreateModule = async (moduleData: {
    name: string;
    videoFile: File | null;
    mcqs: any[];
  }) => {
    try {
      await createModule(moduleData);
      setShowAddModule(false);
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

  const handleDeleteModule = async (module: TrainingModule) => {
    setDeletingModuleId(module.id);
    try {
      await deleteModule(module);
    } catch (error) {
      console.error('Error deleting module:', error);
    } finally {
      setDeletingModuleId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h2 className="text-4xl font-bold mb-2">{company.name}</h2>
              <p className="text-blue-100 text-lg">Manage training modules and content</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddModule(true)} 
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl shadow-lg"
            disabled={isCreatingModule}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Add Module Form */}
      <AddModuleForm
        isOpen={showAddModule}
        onClose={() => setShowAddModule(false)}
        onSave={handleCreateModule}
        isCreating={isCreatingModule}
        uploadProgress={uploadProgress}
      />

      {/* Modules List */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Training Modules</h3>
          <Badge variant="secondary" className="text-sm">
            {modules.length} module{modules.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {modules.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h4>
                <p className="text-gray-600 mb-4">Create your first training module to get started</p>
                <Button 
                  onClick={() => setShowAddModule(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Module
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Drag and Drop Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <GripVertical className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Drag and drop modules to reorder them
                </span>
              </div>
            </div>

            {/* Modules List with Drag and Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={modules.map(module => module.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <SortableModule
                      key={module.id}
                      module={module}
                      index={index}
                      onModuleSelect={onModuleSelect}
                      onEditModule={onEditModule}
                      onDeleteModule={handleDeleteModule}
                      deletingModuleId={deletingModuleId}
                      getVideoUrl={getVideoUrl}
                      capitalizeModuleName={capitalizeModuleName}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {isReordering && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating module order...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
