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
  console.log('ModuleDetail - Module data:', module);
  console.log('ModuleDetail - Videos:', module?.videos);
  if (module?.videos?.[0]) {
    console.log('ModuleDetail - First video:', module.videos[0]);
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
      size="4xl"
    >

        <div className="space-y-8">
          {/* Video Section */}
          {module.videos && module.videos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Play className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Video Tutorial
                  </h3>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {formatDuration(module.videos[0].duration || 0)}
                </Badge>
              </div>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading video...</p>
                    </div>
                  </div>
                )}
                
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="text-red-500 mb-2">⚠️</div>
                      <p className="text-sm text-red-600 mb-2">Failed to load video</p>
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
                    console.error('Video loading error:', e);
                    console.error('Video URL:', getVideoUrl(module.videos[0].url));
                    console.error('Original video URL:', module.videos[0].url);
                    console.error('Video element:', e.target);
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Multiple Choice Questions ({module.mcqs.length})
                  </h3>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Assessment
                </Badge>
              </div>
              
              <div className="space-y-6">
                {module.mcqs.map((mcq, qidx) => (
                  <div key={qidx} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-sm font-semibold text-blue-600">{qidx + 1}</span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {mcq.question}
                          </h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {mcq.options?.length || 0} options
                        </Badge>
                      </div>
                      
                      {mcq.options && mcq.options.length > 0 && (
                        <div className="space-y-3">
                          {mcq.options.map((option, oidx) => (
                            <div 
                              key={oidx} 
                              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                                option === mcq.answer 
                                  ? 'bg-green-50 border-green-300 shadow-sm' 
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                option === mcq.answer 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-400'
                              }`}>
                                {option === mcq.answer && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span className={`flex-1 text-base ${
                                option === mcq.answer ? 'font-medium text-green-800' : 'text-gray-700'
                              }`}>
                                {option}
                              </span>
                              {option === mcq.answer && (
                                <Badge className="ml-3 bg-green-100 text-green-800 border-green-200">
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {mcq.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                          <div className="flex items-start space-x-2">
                            <div className="p-1 bg-blue-100 rounded">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">Explanation</p>
                              <p className="text-sm text-blue-800">{mcq.explanation}</p>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Learning Resources ({module.resources.length})
                  </h3>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Materials
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {module.resources.map((resource, ridx) => (
                  <div key={ridx} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
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
                        className="ml-2 flex-shrink-0"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
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
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Module Empty</h4>
              <p className="text-gray-600">This module doesn't have any content yet.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              onClose();
              onAddAnother();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Module
          </Button>
        </div>
    </ModalDialog>
  );
});

ModuleDetail.displayName = 'ModuleDetail';

export default ModuleDetail;
