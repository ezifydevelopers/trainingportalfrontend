import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash, 
  Play, 
  File, 
  Check, 
  Clock 
} from 'lucide-react';
import { Company, Module } from '@/shared/types/common.types';

interface ModuleManagementSectionProps {
  company: Company;
  onAddModule: (data: any) => void;
  onUpdateModule: (id: number, data: any) => void;
  onDeleteModule: (id: number) => void;
  onAddVideo: (moduleId: number, videoFile: File, duration: number) => void;
  onAddMCQs: (moduleId: number, mcqs: any[]) => void;
  onAddResource: (moduleId: number, resourceFile: File, type: string, duration?: number, estimatedReadingTime?: number) => void;
  onDeleteResource: (resourceId: number) => void;
}

export const ModuleManagementSection: React.FC<ModuleManagementSectionProps> = ({
  company,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onAddVideo,
  onAddMCQs,
  onAddResource,
  onDeleteResource,
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showResourceModule, setShowResourceModule] = useState(false);

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setShowModuleDetail(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    // Open edit dialog
  };

  const handleDeleteModule = (moduleId: number, moduleName: string) => {
    if (window.confirm(`Are you sure you want to delete "${moduleName}"?`)) {
      onDeleteModule(moduleId);
    }
  };

  const handleAddVideoModule = () => {
    setShowAddModule(true);
  };

  const handleAddResourceModule = () => {
    setShowResourceModule(true);
  };

  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {company.name} - Module Management
              </CardTitle>
              <p className="text-gray-600 mt-1">Manage training modules and content</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleAddVideoModule}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Training Module
            </Button>
            <Button
              onClick={handleAddResourceModule}
              variant="outline"
              className="px-6 py-3 rounded-xl font-semibold border-green-500 text-green-600 hover:bg-green-50"
            >
              <File className="h-4 w-4 mr-2" />
              Add Resource Module
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="modules" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Modules</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            {/* Module Management Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Module Management</h3>
                    <p className="text-gray-600">Add and organize training modules</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules List */}
            {modules.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                <p className="text-gray-600">Add your first training module to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div key={module.id}>
                    <div
                      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-300 group transform hover:-translate-y-1"
                      onClick={() => handleModuleSelect(module)}
                    >
                      <div className="flex items-center justify-between">
                        {/* Left side - Module info */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <span className="text-lg font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded-full min-w-[3rem] text-center flex-shrink-0">
                            #{index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg mb-1 truncate" title={module.name}>
                              {module.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Click to view full details
                            </p>
                          </div>
                        </div>
                        
                        {/* Right side - Stats and actions */}
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          {/* Module stats */}
                          <div className="flex items-center space-x-2">
                            {module.isResourceModule ? (
                              <>
                                <Badge variant="outline" className="text-sm bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {module.resources?.length || 0} Resources
                                </Badge>
                                {module.mcqs && module.mcqs.length > 0 && (
                                  <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                                    {module.mcqs.length} MCQs
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                                  {module.mcqs?.length || 0} MCQs
                                </Badge>
                                {module.videos && module.videos.length > 0 && (
                                  <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200 px-3 py-1">
                                    <Play className="h-3 w-3 mr-1" />
                                    {module.videos.length} Videos
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditModule(module);
                              }}
                              title="Edit module"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule(module.id, module.name);
                              }}
                              title="Delete module"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < modules.length - 1 && (
                      <div className="h-px bg-gray-200 mx-4 my-1"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
