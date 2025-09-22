import React, { memo } from 'react';
import ModuleCard from './ModuleCard';
import { Module } from '@/shared/types/common.types';
import { Button } from '@/components/ui/button';
import { Play, FileText, Edit, Trash2, Upload } from 'lucide-react';

interface ModuleListProps {
  modules: Module[];
  onModuleSelect: (module: Module) => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: number, moduleName: string) => void;
  onUploadResource: (module: Module) => void;
  deletingModuleId?: number | null;
  capitalizeModuleName: (name: string) => string;
  isLoading?: boolean;
  searchTerm?: string;
  viewMode?: 'card' | 'list';
}

const ModuleList = memo<ModuleListProps>(({ 
  modules, 
  onModuleSelect, 
  onEditModule, 
  onDeleteModule,
  onUploadResource,
  deletingModuleId = null,
  capitalizeModuleName,
  isLoading = false,
  searchTerm = '',
  viewMode = 'card'
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading modules...</div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-gray-500 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
          {searchTerm ? 'No modules found matching your search.' : 'No modules available.'}
        </div>
        {searchTerm && (
          <div className="text-xs sm:text-sm text-gray-400">
            Try adjusting your search terms or create a new module.
          </div>
        )}
      </div>
    );
  }

  // List view (admin style)
  if (viewMode === 'list') {
    return (
      <div className="space-y-2 sm:space-y-3">
        {modules.map((module, index) => (
          <div key={module.id} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300 group">
            <div 
              className="p-2 sm:p-3 lg:p-4"
              onClick={() => onModuleSelect(module)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                {/* Left side - Module info */}
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-600 bg-gray-100 px-2 py-1 sm:px-3 sm:py-2 rounded-full min-w-[2.5rem] sm:min-w-[3rem] text-center flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base lg:text-lg mb-1 truncate" title={capitalizeModuleName(module.name) || `Module ${index + 1}`}>
                      {capitalizeModuleName(module.name) || `Module ${index + 1}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Click to view full details
                    </p>
                  </div>
                </div>

                {/* Right side - Stats and actions */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                  {/* Module stats */}
                  <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-600 font-semibold">
                        {module.mcqs?.length || 0} MCQs
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {module.isResourceModule ? (
                        <>
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-600 font-semibold">
                            {module.resources?.length || 0} Resources
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-600 font-semibold">
                            {module.videos?.length || 0} Videos
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mobile action buttons - Always visible on mobile */}
                  <div className="flex sm:hidden items-center space-x-1 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditModule(module);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadResource(module);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteModule(module.id, module.name);
                      }}
                      disabled={deletingModuleId === module.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Action buttons - Hidden on mobile, visible on hover on larger screens */}
                  <div className="hidden sm:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditModule(module);
                      }}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadResource(module);
                      }}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteModule(module.id, module.name);
                      }}
                      disabled={deletingModuleId === module.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Card view (default)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {modules.map((module, index) => (
        <ModuleCard
          key={module.id}
          module={module}
          index={index}
          onModuleSelect={onModuleSelect}
          onEditModule={onEditModule}
          onDeleteModule={onDeleteModule}
          onUploadResource={onUploadResource}
          deletingModuleId={deletingModuleId}
          capitalizeModuleName={capitalizeModuleName}
        />
      ))}
    </div>
  );
});

ModuleList.displayName = 'ModuleList';

export default ModuleList;