import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Eye, 
  Trash2, 
  Download,
  Clock,
  BookOpen,
  X
} from 'lucide-react';
import { useGetModuleResources, useDeleteResource } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getBaseUrl } from '@/lib/api';

interface ModuleResourcesProps {
  moduleId: number;
  onAddResource?: (module: { id: number }) => void;
  onViewResource?: (resource: any) => void;
}

const ModuleResources: React.FC<ModuleResourcesProps> = ({
  moduleId,
  onAddResource,
  onViewResource
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showResourceViewer, setShowResourceViewer] = useState(false);
  const { user } = useAuth();

  const { data: resourcesData, isLoading, refetch } = useGetModuleResources(moduleId);
  const resources = Array.isArray(resourcesData) ? resourcesData : [];
  const deleteResourceMutation = useDeleteResource();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedResource) {
        setSelectedResource(null);
        setShowResourceViewer(false);
      }
    };

    if (selectedResource) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedResource]);

  const handleAddResource = () => {
    if (onAddResource) {
      onAddResource({ id: moduleId });
    } else {
      setShowUploadDialog(true);
    }
  };

  const handleUploadResource = async (resourceFile: File, type: string, duration?: number, estimatedReadingTime?: number) => {
    // This would be handled by the parent component
    setShowUploadDialog(false);
    refetch();
  };

  const handleViewResource = (resource: any) => {
    setSelectedResource(resource);
    setShowResourceViewer(true);
    if (onViewResource) {
      onViewResource(resource);
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResourceMutation.mutateAsync(resourceId);
        toast.success('Resource deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete resource');
      }
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'DOCUMENT':
        return 'bg-blue-100 text-blue-800';
      case 'IMAGE':
        return 'bg-green-100 text-green-800';
      case 'AUDIO':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
      case 'DOCUMENT':
        return <FileText className="h-4 w-4" />;
      case 'IMAGE':
        return <Eye className="h-4 w-4" />;
      case 'AUDIO':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resources...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Resources ({resources.length})
            </CardTitle>
            {user?.role === 'ADMIN' && (
              <Button
                onClick={handleAddResource}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No resources yet</p>
              <p className="text-sm">Add your first resource to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource: any) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {resource.originalName || resource.filename}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className={getResourceTypeColor(resource.type)}>
                          {resource.type}
                        </Badge>
                        {resource.duration && (
                          <span className="text-xs text-gray-500">
                            {Math.floor(resource.duration / 60)}m {resource.duration % 60}s
                          </span>
                        )}
                        {resource.estimatedReadingTime && (
                          <span className="text-xs text-gray-500">
                            ~{resource.estimatedReadingTime} min read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewResource(resource)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteResource(resource.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedResource(null);
              setShowResourceViewer(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getResourceIcon(selectedResource.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                    {selectedResource.originalName || selectedResource.filename}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedResource.type} • {selectedResource.estimatedReadingTime ? `${selectedResource.estimatedReadingTime} min read` : 'Document'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedResource(null);
                  setShowResourceViewer(false);
                }}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {selectedResource.type === 'PDF' ? (
                <div className="w-full h-full">
                  <iframe
                    src={selectedResource.url ? `${getBaseUrl()}${selectedResource.url}` : `${getBaseUrl()}/uploads/resources/${selectedResource.filePath}`}
                    className="w-full h-[600px] border-0 rounded-lg"
                    title={selectedResource.originalName || selectedResource.filename}
                  />
                </div>
              ) : selectedResource.type === 'IMAGE' ? (
                <div className="text-center">
                  <img
                    src={selectedResource.url ? `${getBaseUrl()}${selectedResource.url}` : `${getBaseUrl()}/uploads/resources/${selectedResource.filePath}`}
                    alt={selectedResource.originalName || selectedResource.filename}
                    className="max-w-full max-h-[600px] mx-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : selectedResource.type === 'VIDEO' ? (
                <div className="text-center">
                  <video
                    src={selectedResource.url ? `${getBaseUrl()}${selectedResource.url}` : `${getBaseUrl()}/uploads/resources/${selectedResource.filePath}`}
                    controls
                    className="max-w-full max-h-[600px] mx-auto rounded-lg shadow-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : selectedResource.type === 'AUDIO' ? (
                <div className="text-center">
                  <audio
                    src={selectedResource.url ? `${getBaseUrl()}${selectedResource.url}` : `${getBaseUrl()}/uploads/resources/${selectedResource.filePath}`}
                    controls
                    className="w-full max-w-md mx-auto"
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    {getResourceIcon(selectedResource.type)}
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedResource.originalName || selectedResource.filename}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    This file type cannot be previewed in the browser.
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedResource.url ? `${getBaseUrl()}${selectedResource.url}` : `${getBaseUrl()}/uploads/resources/${selectedResource.filePath}`;
                      link.download = selectedResource.originalName || selectedResource.filename;
                      link.click();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Type: {selectedResource.type}</span>
                  {selectedResource.estimatedReadingTime && (
                    <span>~{selectedResource.estimatedReadingTime} min read</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `${getBaseUrl()}/uploads/${selectedResource.filePath}`;
                      link.download = selectedResource.originalName || selectedResource.filename;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedResource(null);
                      setShowResourceViewer(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModuleResources;
