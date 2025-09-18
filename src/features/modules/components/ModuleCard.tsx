import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  FileText, 
  Clock, 
  Users, 
  Edit, 
  Trash, 
  Upload, 
  GripVertical 
} from 'lucide-react';
import { getVideoUrl } from '@/shared/utils/imageUtils';
import { Module } from '@/shared/types/common.types';

interface ModuleCardProps {
  module: Module;
  index: number;
  onModuleSelect: (module: Module) => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: number, moduleName: string) => void;
  onUploadResource: (module: Module) => void;
  deletingModuleId: number | null;
  capitalizeModuleName: (name: string) => string;
  isDragDisabled?: boolean;
}

const ModuleCard = memo<ModuleCardProps>(({
  module,
  index,
  onModuleSelect,
  onEditModule,
  onDeleteModule,
  onUploadResource,
  deletingModuleId,
  capitalizeModuleName,
  isDragDisabled = false
}) => {
  const handleModuleSelect = () => {
    onModuleSelect(module);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditModule(module);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteModule(module.id, module.name);
  };

  const handleUploadResource = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUploadResource(module);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {!isDragDisabled && (
              <div className="flex-shrink-0 cursor-move">
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {capitalizeModuleName(module.name)}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(module.videos?.[0]?.duration || 0)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="h-4 w-4 mr-1" />
                  {module.mcqs?.length || 0} questions
                </div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Module {index + 1}
          </Badge>
        </div>

        {/* Video Preview */}
        {module.videos && module.videos.length > 0 && (
          <div className="mb-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              <video
                src={getVideoUrl(module.videos[0].url)}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-full p-3">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {module.mcqs?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {module.resources?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Resources</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleModuleSelect}
            className="flex-1 mr-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Users className="h-4 w-4 mr-1" />
            View Details
          </Button>
          
          <div className="flex items-center space-x-1">
            {!module.isResourceModule && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                onClick={handleUploadResource}
                title="Upload resources"
              >
                <Upload className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
              onClick={handleEdit}
              title="Edit module"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
              onClick={handleDelete}
              disabled={deletingModuleId === module.id}
              title="Delete module"
            >
              {deletingModuleId === module.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

ModuleCard.displayName = 'ModuleCard';

export default ModuleCard;
