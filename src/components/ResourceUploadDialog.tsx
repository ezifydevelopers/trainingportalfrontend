import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ResourceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadResource: (resourceFile: File, type: string, duration?: number, estimatedReadingTime?: number) => Promise<void>;
  moduleName?: string;
}

export default function ResourceUploadDialog({
  open,
  onOpenChange,
  onUploadResource,
  moduleName
}: ResourceUploadDialogProps) {
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [type, setType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [estimatedReadingTime, setEstimatedReadingTime] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceFile(file);
      
      // Auto-detect file type based on extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension) {
        if (['pdf'].includes(extension)) {
          setType('PDF');
        } else if (['doc', 'docx'].includes(extension)) {
          setType('DOCUMENT');
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
          setType('IMAGE');
        } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
          setType('AUDIO');
        } else {
          setType('DOCUMENT');
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!resourceFile || !type) {
      toast.error('Please select a file and specify the type');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUploadResource(
        resourceFile,
        type,
        duration ? parseInt(duration) : undefined,
        estimatedReadingTime ? parseInt(estimatedReadingTime) : undefined
      );

      setUploadProgress(100);
      clearInterval(progressInterval);

      // Reset form
      setResourceFile(null);
      setType('');
      setDuration('');
      setEstimatedReadingTime('');
      
      toast.success('Resource uploaded successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to upload resource');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Upload Resource
            {moduleName && (
              <span className="text-sm text-gray-500 ml-2">({moduleName})</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="resource-file">Select File</Label>
            <div className="mt-2">
              <input
                type="file"
                id="resource-file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.m4a"
              />
              <label
                htmlFor="resource-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {resourceFile ? resourceFile.name : 'Click to upload file'}
                </p>
                <p className="text-xs text-gray-400">
                  PDF, DOC, DOCX, JPG, PNG, MP3, etc.
                </p>
              </label>
            </div>
            {resourceFile && (
              <div className="mt-2 text-sm text-gray-600">
                <p>File: {resourceFile.name}</p>
                <p>Size: {formatFileSize(resourceFile.size)}</p>
              </div>
            )}
          </div>

          {/* Resource Type */}
          <div>
            <Label htmlFor="resource-type">Resource Type</Label>
            <select
              id="resource-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isUploading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select type...</option>
              <option value="PDF">PDF Document</option>
              <option value="DOCUMENT">Word Document</option>
              <option value="IMAGE">Image</option>
              <option value="AUDIO">Audio File</option>
            </select>
          </div>

          {/* Duration (for audio/video) */}
          {(type === 'AUDIO' || type === 'VIDEO') && (
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isUploading}
                placeholder="Enter duration in seconds"
                className="mt-1"
              />
            </div>
          )}

          {/* Estimated Reading Time (for documents) */}
          {(type === 'PDF' || type === 'DOCUMENT') && (
            <div>
              <Label htmlFor="reading-time">Estimated Reading Time (minutes)</Label>
              <Input
                id="reading-time"
                type="number"
                value={estimatedReadingTime}
                onChange={(e) => setEstimatedReadingTime(e.target.value)}
                disabled={isUploading}
                placeholder="Enter estimated reading time"
                className="mt-1"
              />
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <div className="flex items-center space-x-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Please do not close this window during upload</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !resourceFile || !type}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
