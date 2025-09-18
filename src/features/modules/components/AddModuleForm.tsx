import React, { memo, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import ModalDialog from '@/shared/components/ModalDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  X, 
  Upload, 
  Play, 
  FileText, 
  Clock, 
  Check,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface AddModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    videoFile?: File;
    duration?: number;
    mcqs?: MCQ[];
  }) => Promise<void>;
  isLoading?: boolean;
  uploadProgress?: number;
  isUploadingVideo?: boolean;
}

const AddModuleForm = memo<AddModuleFormProps>(({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  uploadProgress = 0,
  isUploadingVideo = false
}) => {
  const [moduleName, setModuleName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  const [localUploadProgress, setLocalUploadProgress] = useState(0);
  
  // MCQ state
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video handling
  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setIsCalculatingDuration(true);
      
      // Calculate video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setVideoDuration(Math.round(video.duration));
        setIsCalculatingDuration(false);
      };
      video.src = URL.createObjectURL(file);
    }
  }, []);

  const handleBoxClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // MCQ handling
  const handleAddOption = useCallback(() => {
    setOptions([...options, '']);
  }, [options]);

  const handleOptionChange = useCallback((idx: number, value: string) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  }, [options]);

  const handleRemoveOption = useCallback((idx: number) => {
    const newOptions = options.filter((_, i) => i !== idx);
    setOptions(newOptions);
    if (correctAnswer >= idx) {
      setCorrectAnswer(Math.max(0, correctAnswer - 1));
    }
  }, [options, correctAnswer]);

  const handleAddMcq = useCallback(() => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      toast.error("Please fill in both question and all options");
      return;
    }
    
    const newMcq: MCQ = {
      question,
      options: options.filter(opt => opt.trim()),
      answer: options[correctAnswer],
      explanation: ""
    };
    
    setMcqs([...mcqs, newMcq]);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
  }, [question, options, correctAnswer, mcqs]);

  const handleRemoveMcq = useCallback((idx: number) => {
    setMcqs(mcqs.filter((_, i) => i !== idx));
  }, [mcqs]);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moduleName.trim()) {
      toast.error("Please enter a module name");
      return;
    }

    try {
      await onSubmit({
        name: moduleName,
        videoFile: videoFile || undefined,
        duration: videoDuration || undefined,
        mcqs: mcqs.length > 0 ? mcqs : undefined
      });
      
      // Reset form
      setModuleName('');
      setVideoFile(null);
      setVideoPreview('');
      setVideoDuration(0);
      setMcqs([]);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
    } catch (error) {
      console.error('Error creating module:', error);
    }
  }, [moduleName, videoFile, videoDuration, mcqs, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
    // Reset form
    setModuleName('');
    setVideoFile(null);
    setVideoPreview('');
    setVideoDuration(0);
    setMcqs([]);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
  }, [onClose]);

  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Add New Training Module"
      icon={Plus}
      badge={{ text: "Active Form" }}
      size="4xl"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Name */}
          <div className="space-y-2">
            <Label htmlFor="moduleName" className="text-sm font-medium text-gray-700">
              Module Name *
            </Label>
            <Input
              id="moduleName"
              type="text"
              placeholder="Enter module name..."
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="max-w-md"
              required
            />
          </div>
          
          {/* Video Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Upload Video Tutorial</Label>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition group bg-gray-50 hover:bg-blue-50"
              onClick={handleBoxClick}
            >
              <Upload className="h-12 w-12 text-gray-400 group-hover:text-blue-500 mb-3" />
              <span className="text-gray-600 group-hover:text-blue-600 font-medium text-lg">
                Click to upload video
              </span>
              <span className="text-sm text-gray-400 mt-2">MP4, WebM, or Ogg (max 100MB)</span>
              <Input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </div>
            
            {/* Video Preview */}
            {videoPreview && (
              <div className="mt-4">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                  <video
                    src={videoPreview}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                  {/* Video Upload Progress Overlay */}
                  {isUploadingVideo && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 w-80">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-sm font-medium text-gray-900">Uploading Video...</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-xs text-gray-600 mt-2 text-center">{uploadProgress}% complete</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {isCalculatingDuration ? 'Calculating...' : `${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {videoFile?.name}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* MCQ Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Assessment Questions (Optional)</Label>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {mcqs.length} questions added
              </Badge>
            </div>
            
            {/* Add MCQ Form */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <Label htmlFor="question" className="text-sm font-medium text-gray-700">
                  Question
                </Label>
                <Textarea
                  id="question"
                  placeholder="Enter your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Answer Options
                </Label>
                <div className="space-y-2">
                  {options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(idx)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={options.length <= 2}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Correct Answer
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((option, idx) => (
                    <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswer === idx}
                        onChange={() => setCorrectAnswer(idx)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {option || `Option ${idx + 1}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <Button
                type="button"
                onClick={handleAddMcq}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!question.trim() || options.some(opt => !opt.trim())}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {/* MCQ List */}
            {mcqs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Added Questions</h4>
                {mcqs.map((mcq, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{mcq.question}</p>
                        <div className="space-y-1">
                          {mcq.options.map((option, oidx) => (
                            <div
                              key={oidx}
                              className={`flex items-center space-x-2 text-sm ${
                                option === mcq.answer ? 'text-green-700 font-medium' : 'text-gray-600'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                option === mcq.answer ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}>
                                {option === mcq.answer && <Check className="h-2 w-2 text-white" />}
                              </div>
                              <span>{option}</span>
                              {option === mcq.answer && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMcq(idx)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || isUploadingVideo || !moduleName.trim()}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : isUploadingVideo ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Uploading Video...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
});

AddModuleForm.displayName = 'AddModuleForm';

export default AddModuleForm;
