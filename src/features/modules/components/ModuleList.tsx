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
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          {searchTerm ? 'No modules found matching your search.' : 'No modules available.'}
        </div>
        {searchTerm && (
          <div className="text-sm text-gray-400">
            Try adjusting your search terms or create a new module.
          </div>
        )}
      </div>
    );
  }

  // List view (admin style)
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {modules.map((module, index) => (
          <div key={module.id}>
            <div 
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-300 group transform hover:-translate-y-1"
              onClick={() => onModuleSelect(module)}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Module info */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <span className="text-lg font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded-full min-w-[3rem] text-center flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg mb-1 truncate" title={capitalizeModuleName(module.name) || `Module ${index + 1}`}>
                      {capitalizeModuleName(module.name) || `Module ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Click to view full details
                    </p>
                  </div>
                </div>

                {/* Right side - Stats and actions */}
                <div className="flex items-center space-x-6">
                  {/* Module stats */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-600 font-semibold">
                        {module.mcqs?.length || 0} MCQs
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {module.isResourceModule ? (
                        <>
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-semibold">
                            {module.resources?.length || 0} Resources
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-semibold">
                            {module.videos?.length || 0} Videos
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditModule(module);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadResource(module);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteModule(module.id, module.name);
                      }}
                      disabled={deletingModuleId === module.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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