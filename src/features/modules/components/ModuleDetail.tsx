import React, { memo, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ModalDialog from '@/shared/components/ModalDialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  FileText, 
  Clock, 
  Users, 
  Check, 
  Eye, 
  Plus 
} from 'lucide-react';
import { getVideoUrl } from '@/shared/utils/imageUtils';
import { Module } from '@/shared/types/common.types';

interface ModuleDetailProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onAddAnother: () => void;
  capitalizeModuleName: (name: string) => string;
}

const ModuleDetail = memo<ModuleDetailProps>(({
  module,
  isOpen,
  onClose,
  onAddAnother,
  capitalizeModuleName
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Debug video data
  if (module?.videos?.[0]) {
    console.log('ModuleDetail - Video URL:', getVideoUrl(module.videos[0].url));
  }
  const formatDuration = useMemo(() => (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  if (!module) return null;

  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={onClose}
      title={capitalizeModuleName(module.name)}
      icon={Play}
      badge={{ text: `Module ID: ${module.id}` }}
      size="wide"
    >

        <div className="space-y-1">
          {/* Video Section */}
          {module.videos && module.videos.length > 0 && (
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    Video Tutorial
                  </h3>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm w-fit">
                  {formatDuration(module.videos[0].duration || 0)}
                </Badge>
              </div>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video min-h-[250px] max-h-[400px] sm:max-h-[450px] lg:max-h-[500px]">
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-xs sm:text-sm text-gray-600">Loading video...</p>
                    </div>
                  </div>
                )}
                
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <div className="text-red-500 mb-2 text-2xl sm:text-3xl">⚠️</div>
                      <p className="text-xs sm:text-sm text-red-600 mb-2">Failed to load video</p>
                      <p className="text-xs text-gray-500">{videoError}</p>
                    </div>
                  </div>
                )}
                
                <video
                  src={getVideoUrl(module.videos[0].url)}
                  className="w-full h-full"
                  controls
                  preload="metadata"
                  crossOrigin="anonymous"
                  onLoadStart={() => {
                    console.log('Video loading started:', getVideoUrl(module.videos[0].url));
                    setIsVideoLoading(true);
                    setVideoError(null);
                  }}
                  onCanPlay={() => {
                    console.log('Video can play:', getVideoUrl(module.videos[0].url));
                    setIsVideoLoading(false);
                    setVideoError(null);
                  }}
                  onError={(e) => {
                    setIsVideoLoading(false);
                    setVideoError('Failed to load video. Please check your internet connection and try again.');
                    console.error('Video URL:', getVideoUrl(module.videos[0].url));
                  }}
                >
                  <source src={getVideoUrl(module.videos[0].url)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* MCQs Section */}
          {module.mcqs && module.mcqs.length > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    Multiple Choice Questions ({module.mcqs.length})
                  </h3>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm w-fit">
                  Assessment
                </Badge>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                {module.mcqs.map((mcq, qidx) => (
                  <div key={qidx} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 sm:p-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-1 sm:space-y-0 mb-1 sm:mb-2">
                        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex-shrink-0">
                            <span className="text-xs sm:text-sm font-semibold text-blue-600">{qidx + 1}</span>
                          </div>
                          <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 break-words">
                            {mcq.question}
                          </h4>
                        </div>
                        <Badge variant="secondary" className="text-xs w-fit">
                          {mcq.options?.length || 0} options
                        </Badge>
                      </div>
                      
                      {mcq.options && mcq.options.length > 0 && (
                        <div className="space-y-1">
                          {mcq.options.map((option, oidx) => (
                            <div 
                              key={oidx} 
                              className={`flex items-start p-2 rounded-lg border-2 transition-all ${
                                option === mcq.answer 
                                  ? 'bg-green-50 border-green-300 shadow-sm' 
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                option === mcq.answer 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-400'
                              }`}>
                                {option === mcq.answer && (
                                  <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                                )}
                              </div>
                              <span className={`flex-1 text-sm sm:text-base break-words ${
                                option === mcq.answer ? 'font-medium text-green-800' : 'text-gray-700'
                              }`}>
                                {option}
                              </span>
                              {option === mcq.answer && (
                                <Badge className="ml-2 sm:ml-3 bg-green-100 text-green-800 border-green-200 text-xs flex-shrink-0">
                                  <span className="hidden sm:inline">Correct Answer</span>
                                  <span className="sm:hidden">✓</span>
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {mcq.explanation && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                          <div className="flex items-start space-x-2">
                            <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Explanation</p>
                              <p className="text-xs sm:text-sm text-blue-800 break-words">{mcq.explanation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {module.resources && module.resources.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    Learning Resources ({module.resources.length})
                  </h3>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs sm:text-sm w-fit">
                  Materials
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {module.resources.map((resource, ridx) => (
                  <div key={ridx} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {resource.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {resource.type}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Open the resource in a new tab using filePath
                          // Remove /api from the base URL since static files are served directly
                          const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:7001').replace('/api', '');
                          const resourceUrl = `${baseUrl}/uploads/resources/${resource.filePath}`;
                          window.open(resourceUrl, '_blank');
                        }}
                        className="ml-2 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 sm:py-2"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!module.videos || module.videos.length === 0) && 
           (!module.mcqs || module.mcqs.length === 0) && 
           (!module.resources || module.resources.length === 0) && (
            <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mx-auto mb-2 sm:mb-3 text-gray-400" />
              <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Module Empty</h4>
              <p className="text-xs sm:text-sm text-gray-600">This module doesn't have any content yet.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-3 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            Close
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
            onClick={() => {
              onClose();
              onAddAnother();
            }}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Another Module</span>
            <span className="sm:hidden">Add Module</span>
          </Button>
        </div>
    </ModalDialog>
  );
});

ModuleDetail.displayName = 'ModuleDetail';

export default ModuleDetail;
