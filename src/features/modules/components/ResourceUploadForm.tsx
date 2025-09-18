import React, { memo, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import ModalDialog from '@/shared/components/ModalDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Music, 
  FileText, 
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface ResourceFile {
  file: File;
  id: string;
  type: string;
  size: number;
}

interface ResourceUploadFormProps {
  moduleId: number;
  moduleName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleId: number, files: File[]) => Promise<void>;
  isLoading?: boolean;
}

const ResourceUploadForm = memo<ResourceUploadFormProps>(({
  moduleId,
  moduleName,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = useCallback((type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <File className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav'
    ];

    const validFiles = selectedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(`File ${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    const newFiles: ResourceFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: file.type,
      size: file.size
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleBoxClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    try {
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onSubmit(moduleId, files.map(f => f.file));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form
      setFiles([]);
      setUploadProgress(0);
      
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
      setUploadProgress(0);
    }
  }, [files, moduleId, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
    setFiles([]);
    setUploadProgress(0);
  }, [onClose]);

  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={onClose}
      title={`Upload Resources to ${moduleName}`}
      icon={Upload}
      badge={{ text: `${files.length} files selected`, className: "bg-purple-100 text-purple-700 border-purple-300" }}
      size="4xl"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Select Files to Upload</Label>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-purple-400 transition group bg-gray-50 hover:bg-purple-50"
              onClick={handleBoxClick}
            >
              <Upload className="h-12 w-12 text-gray-400 group-hover:text-purple-500 mb-3" />
              <span className="text-gray-600 group-hover:text-purple-600 font-medium text-lg">
                Click to select files
              </span>
              <span className="text-sm text-gray-400 mt-2">
                PDF, DOC, DOCX, TXT, JPG, PNG, GIF, MP4, MP3, WAV (max 50MB each)
              </span>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mp3,.wav"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Selected Files</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 text-gray-500">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.type} • {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(file.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Type Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Supported File Types</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div className="flex items-center space-x-2">
                <FileText className="h-3 w-3" />
                <span>PDF, DOC, DOCX, TXT</span>
              </div>
              <div className="flex items-center space-x-2">
                <Image className="h-3 w-3" />
                <span>JPG, PNG, GIF</span>
              </div>
              <div className="flex items-center space-x-2">
                <File className="h-3 w-3" />
                <span>MP4, WebM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Music className="h-3 w-3" />
                <span>MP3, WAV</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Maximum file size: 50MB per file
            </p>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading || files.length === 0}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} File{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
});

ResourceUploadForm.displayName = 'ResourceUploadForm';

export default ResourceUploadForm;
