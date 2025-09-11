import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Play, 
  FileText, 
  Edit, 
  Trash, 
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { TrainingModule } from '@/types/course';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableModuleProps {
  module: TrainingModule;
  index: number;
  onModuleSelect: (module: TrainingModule) => void;
  onEditModule: (module: TrainingModule) => void;
  onDeleteModule: (module: TrainingModule) => void;
  deletingModuleId: number | null;
  getVideoUrl: (videoUrl: string) => string;
  capitalizeModuleName: (name: string) => string;
}

export default function SortableModule({ 
  module, 
  index, 
  onModuleSelect, 
  onEditModule, 
  onDeleteModule, 
  deletingModuleId,
  getVideoUrl,
  capitalizeModuleName
}: SortableModuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
    <div ref={setNodeRef} style={style} className="relative">
      <div 
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group ${
          isDragging ? 'shadow-lg border-blue-400 scale-105 bg-blue-50' : ''
        }`}
        onClick={() => onModuleSelect(module)}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Drag handle and module info */}
          <div className="flex items-center space-x-3 flex-1">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Order number */}
            <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full min-w-[2rem] text-center">
              {index + 1}
            </span>

            {/* Module name */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {capitalizeModuleName(module.name)}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Module {index + 1}
                </Badge>
                {module.unlocked && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Stats and actions */}
          <div className="flex items-center space-x-3">
            {/* Module stats */}
            <div className="flex items-center space-x-2">
              {module.videos && module.videos.length > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Play className="h-4 w-4" />
                  <span>{module.videos.length}</span>
                </div>
              )}
              {module.mcqs && module.mcqs.length > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{module.mcqs.length}</span>
                </div>
              )}
              {module.videos?.[0]?.duration && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(module.videos[0].duration)}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleSelect(module);
                }}
                className="h-8 w-8 p-0"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditModule(module);
                }}
                className="h-8 w-8 p-0"
                title="Edit Module"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteModule(module);
                }}
                disabled={deletingModuleId === module.id}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Module"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
