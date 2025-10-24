import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Upload, X, Plus, Trash2, Play, Pause, CheckCircle, Youtube, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EnhancedModuleCreationProgress from '../../../components/EnhancedModuleCreationProgress';
import YouTubeVideoUpload from '../../../components/YouTubeVideoUpload';

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface EnhancedAddModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  isResourceModule?: boolean;
}

const EnhancedAddModuleForm: React.FC<EnhancedAddModuleFormProps> = ({
  isOpen,
  onClose,
  companyId,
  isResourceModule = false
}) => {
  const [moduleName, setModuleName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  // YouTube video states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeThumbnail, setYoutubeThumbnail] = useState('');
  const [videoType, setVideoType] = useState<'file' | 'youtube'>('file');
  const [showYouTubeUpload, setShowYouTubeUpload] = useState(false);
  
  // MCQ states
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [showMcqForm, setShowMcqForm] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setModuleName('');
      setVideoFile(null);
      setVideoPreview('');
      setVideoDuration(0);
      setMcqs([]);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
      setExplanation('');
      setShowMcqForm(false);
      setShowProgress(false);
      setSessionId('');
      setIsUploading(false);
      setUploadProgress(0);
      setYoutubeUrl('');
      setYoutubeTitle('');
      setYoutubeThumbnail('');
      setVideoType('file');
      setShowYouTubeUpload(false);
    }
  }, [isOpen]);

  // Handle video file selection
  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('Video file size must be less than 50MB');
      return;
    }

    setVideoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    // Load video to get duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setVideoDuration(Math.round(video.duration));
      URL.revokeObjectURL(previewUrl);
    };
    video.src = previewUrl;
  }, []);

  // Handle MCQ form submission
  const handleAddMcq = useCallback(() => {
    if (!question.trim() || options.some(opt => !opt.trim()) || !options[correctAnswer].trim()) {
      toast.error('Please fill in all MCQ fields');
      return;
    }

    const newMcq: MCQ = {
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      answer: options[correctAnswer].trim(),
      explanation: explanation.trim() || undefined
    };

    setMcqs(prev => [...prev, newMcq]);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
    setShowMcqForm(false);
    toast.success('MCQ added successfully!');
  }, [question, options, correctAnswer, explanation]);

  // Handle MCQ removal
  const handleRemoveMcq = useCallback((index: number) => {
    setMcqs(prev => prev.filter((_, i) => i !== index));
    toast.success('MCQ removed');
  }, []);

  // YouTube video handlers
  const handleYouTubeVideoAdd = useCallback((videoData: { url: string; title: string; duration: number; thumbnail: string }) => {
    setYoutubeUrl(videoData.url);
    setYoutubeTitle(videoData.title);
    setYoutubeThumbnail(videoData.thumbnail);
    setVideoDuration(videoData.duration);
    setVideoType('youtube');
    setShowYouTubeUpload(false);
    toast.success('YouTube video added successfully');
  }, []);

  const handleYouTubeVideoCancel = useCallback(() => {
    setShowYouTubeUpload(false);
  }, []);

  const handleRemoveYouTubeVideo = useCallback(() => {
    setYoutubeUrl('');
    setYoutubeTitle('');
    setYoutubeThumbnail('');
    setVideoDuration(0);
    setVideoType('file');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moduleName.trim()) {
      toast.error('Please enter a module name');
      return;
    }

    if (videoType === 'file' && !videoFile) {
      toast.error('Please select a video file or add a YouTube video');
      return;
    }

    if (videoType === 'youtube' && !youtubeUrl) {
      toast.error('Please add a YouTube video');
      return;
    }

    if (!videoDuration || videoDuration <= 0) {
      toast.error('Please wait for video duration to load or try a different video');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();
      formData.append('companyId', companyId.toString());
      formData.append('name', moduleName.trim());
      formData.append('isResourceModule', isResourceModule.toString());
      formData.append('duration', videoDuration.toString());
      formData.append('videoType', videoType);
      
      if (videoType === 'file' && videoFile) {
        formData.append('video', videoFile);
      } else if (videoType === 'youtube') {
        formData.append('youtubeUrl', youtubeUrl);
        formData.append('youtubeTitle', youtubeTitle);
        formData.append('youtubeThumbnail', youtubeThumbnail);
      }
      
      if (mcqs.length > 0) {
        formData.append('mcqs', JSON.stringify(mcqs));
      }

      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(sessionId);

      // Start upload with progress tracking
      const response = await fetch('/api/admin/modules/create-with-content', {
        method: 'POST',
        headers: {
          'x-session-id': sessionId
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setShowProgress(true);
        // Don't close the form yet - let progress component handle it
      } else {
        throw new Error(result.message || 'Failed to create module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error(`Failed to create module: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }, [moduleName, videoFile, videoDuration, mcqs, companyId, isResourceModule]);

  // Progress handlers
  const handleProgressSuccess = useCallback((data: any) => {
    toast.success('Module created successfully!');
    setShowProgress(false);
    onClose();
  }, [onClose]);

  const handleProgressError = useCallback((error: string) => {
    toast.error(`Module creation failed: ${error}`);
    setShowProgress(false);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Add New {isResourceModule ? 'Resource' : 'Training'} Module</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Module Name */}
              <div className="space-y-2">
                <Label htmlFor="moduleName">Module Name *</Label>
                <Input
                  id="moduleName"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="Enter module name"
                  disabled={isUploading}
                  required
                />
              </div>

              {/* Video Upload */}
              <div className="space-y-4">
                <Label>Video Tutorial *</Label>
                
                {/* Video Type Selection */}
                <div className="flex space-x-2 mb-4">
                  <Button
                    type="button"
                    variant={videoType === 'file' ? 'default' : 'outline'}
                    onClick={() => setVideoType('file')}
                    disabled={isUploading}
                    className="flex items-center space-x-2"
                  >
                    <Video className="h-4 w-4" />
                    <span>Upload File</span>
                  </Button>
                  <Button
                    type="button"
                    variant={videoType === 'youtube' ? 'default' : 'outline'}
                    onClick={() => setVideoType('youtube')}
                    disabled={isUploading}
                    className="flex items-center space-x-2"
                  >
                    <Youtube className="h-4 w-4" />
                    <span>YouTube Link</span>
                  </Button>
                </div>

                {/* File Upload */}
                {videoType === 'file' && !videoFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload video or drag and drop</p>
                    <p className="text-sm text-gray-500">MP4, MOV, AVI up to 50MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="mt-4"
                    >
                      Select Video
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{videoFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({Math.round(videoFile.size / 1024 / 1024)}MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview('');
                          setVideoDuration(0);
                        }}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {videoPreview && (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          src={videoPreview}
                          controls
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {videoDuration > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {videoDuration === 0 && (
                      <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        Loading video duration...
                      </div>
                    )}
                  </div>
                )}

                {/* YouTube Video Section */}
                {videoType === 'youtube' && (
                  <div className="space-y-4">
                    {!youtubeUrl ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Youtube className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <p className="text-gray-600 mb-2">Add YouTube Video</p>
                        <p className="text-sm text-gray-500 mb-4">Paste a YouTube link to add video content</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowYouTubeUpload(true)}
                          disabled={isUploading}
                          className="flex items-center space-x-2"
                        >
                          <Youtube className="h-4 w-4" />
                          <span>Add YouTube Video</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Youtube className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">{youtubeTitle}</span>
                            <span className="text-xs text-gray-500">YouTube Video</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveYouTubeVideo}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {youtubeThumbnail && (
                          <div className="relative">
                            <img
                              src={youtubeThumbnail}
                              alt="YouTube thumbnail"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                              <Youtube className="h-12 w-12 text-white" />
                            </div>
                            {videoDuration > 0 && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {videoDuration === 0 && (
                          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                            Loading video duration...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* MCQs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>MCQ Questions (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMcqForm(true)}
                    disabled={isUploading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add MCQ
                  </Button>
                </div>

                {/* MCQ Form */}
                {showMcqForm && (
                  <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question"
                        rows={3}
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options</Label>
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...options];
                              newOptions[index] = e.target.value;
                              setOptions(newOptions);
                            }}
                            placeholder={`Option ${index + 1}`}
                            disabled={isUploading}
                          />
                          <Button
                            type="button"
                            variant={correctAnswer === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCorrectAnswer(index)}
                            disabled={isUploading}
                          >
                            {correctAnswer === index ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Explain why this is the correct answer"
                        rows={2}
                        disabled={isUploading}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={handleAddMcq}
                        disabled={isUploading}
                      >
                        Add MCQ
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMcqForm(false)}
                        disabled={isUploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                )}

                {/* MCQs List */}
                {mcqs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Questions ({mcqs.length})</Label>
                    {mcqs.map((mcq, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{mcq.question}</p>
                          <p className="text-xs text-gray-500">
                            Answer: {mcq.answer}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMcq(index)}
                          disabled={isUploading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Preparing upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || !moduleName.trim() || !videoFile || videoDuration <= 0}
                  className="min-w-[120px]"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Module'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Progress Modal */}
      <EnhancedModuleCreationProgress
        sessionId={sessionId}
        isVisible={showProgress}
        onClose={() => setShowProgress(false)}
        onSuccess={handleProgressSuccess}
        onError={handleProgressError}
      />

      {/* YouTube Video Upload Modal */}
      {showYouTubeUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <YouTubeVideoUpload
              onVideoAdd={handleYouTubeVideoAdd}
              onCancel={handleYouTubeVideoCancel}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedAddModuleForm;
