import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ModalDialog from '@/shared/components/ModalDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  X, 
  Upload, 
  Play, 
  FileText, 
  Clock, 
  Check,
  Trash2,
  Save,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { Module } from '@/shared/types/common.types';
import { getVideoUrl } from '@/shared/utils/imageUtils';

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface EditModuleFormProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id: number;
    name: string;
    videoFile?: File;
    duration?: number;
    mcqs?: MCQ[];
  }) => Promise<void>;
  isLoading?: boolean;
}

const EditModuleForm = memo<EditModuleFormProps>(({
  module,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [moduleName, setModuleName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  
  // MCQ state
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  
  // Edit existing MCQ state
  const [editingMcqIndex, setEditingMcqIndex] = useState<number | null>(null);
  const [editExistingQuestion, setEditExistingQuestion] = useState('');
  const [editExistingOptions, setEditExistingOptions] = useState(['', '', '', '']);
  const [editExistingCorrectAnswer, setEditExistingCorrectAnswer] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with module data
  useEffect(() => {
    if (module) {
      setModuleName(module.name);
      setVideoFile(null);
      setVideoPreview(module.videos?.[0]?.url ? getVideoUrl(module.videos[0].url) : '');
      setVideoDuration(module.videos?.[0]?.duration || 0);
      setMcqs(module.mcqs ? [...module.mcqs] : []);
    }
  }, [module]);

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

  // Edit existing MCQ handlers
  const handleEditExistingMcq = useCallback((idx: number) => {
    const mcq = mcqs[idx];
    setEditingMcqIndex(idx);
    setEditExistingQuestion(mcq.question);
    setEditExistingOptions([...mcq.options]);
    setEditExistingCorrectAnswer(mcq.options.indexOf(mcq.answer));
  }, [mcqs]);

  const handleCancelEditExistingMcq = useCallback(() => {
    setEditingMcqIndex(null);
    setEditExistingQuestion('');
    setEditExistingOptions(['', '', '', '']);
    setEditExistingCorrectAnswer(0);
  }, []);

  const handleSaveEditExistingMcq = useCallback(() => {
    if (!editExistingQuestion.trim() || editExistingOptions.some(opt => !opt.trim())) {
      toast.error("Please fill in both question and all options");
      return;
    }

    const updatedMcq: MCQ = {
      question: editExistingQuestion,
      options: editExistingOptions.filter(opt => opt.trim()),
      answer: editExistingOptions[editExistingCorrectAnswer],
      explanation: ""
    };

    const updatedMcqs = [...mcqs];
    updatedMcqs[editingMcqIndex!] = updatedMcq;
    setMcqs(updatedMcqs);
    handleCancelEditExistingMcq();
  }, [editExistingQuestion, editExistingOptions, editExistingCorrectAnswer, mcqs, editingMcqIndex]);

  const handleEditExistingOptionChange = useCallback((idx: number, value: string) => {
    const newOptions = [...editExistingOptions];
    newOptions[idx] = value;
    setEditExistingOptions(newOptions);
  }, [editExistingOptions]);

  const handleEditExistingAddOption = useCallback(() => {
    setEditExistingOptions([...editExistingOptions, '']);
  }, [editExistingOptions]);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!module || !moduleName.trim()) {
      toast.error("Please enter a module name");
      return;
    }

    try {
      await onSubmit({
        id: module.id,
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
    }
  }, [module, moduleName, videoFile, videoDuration, mcqs, onSubmit]);

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
    setEditingMcqIndex(null);
    setEditExistingQuestion('');
    setEditExistingOptions(['', '', '', '']);
    setEditExistingCorrectAnswer(0);
  }, [onClose]);

  return (
    <ModalDialog
      open={isOpen && !!module}
      onOpenChange={onClose}
      title={`Edit Module: ${module?.name || ''}`}
      icon={Edit}
      badge={{ text: "Edit Mode" }}
      size="wide"
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
            <Label className="text-sm font-medium text-gray-700">Update Video Tutorial</Label>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition group bg-gray-50 hover:bg-blue-50"
              onClick={handleBoxClick}
            >
              <Upload className="h-12 w-12 text-gray-400 group-hover:text-blue-500 mb-3" />
              <span className="text-gray-600 group-hover:text-blue-600 font-medium text-lg">
                {videoPreview ? 'Click to replace video' : 'Click to upload video'}
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
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {isCalculatingDuration ? 'Calculating...' : `${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {videoFile?.name || 'Current video'}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* MCQ Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Assessment Questions</Label>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {mcqs.length} questions
              </Badge>
            </div>
            
            {/* Add New MCQ Form */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Add New Question</h4>
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
            
            {/* Existing MCQs */}
            {mcqs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Existing Questions</h4>
                {mcqs.map((mcq, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                    {editingMcqIndex === idx ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Question</Label>
                          <Textarea
                            value={editExistingQuestion}
                            onChange={(e) => setEditExistingQuestion(e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Options</Label>
                          <div className="space-y-2">
                            {editExistingOptions.map((option, oidx) => (
                              <div key={oidx} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => handleEditExistingOptionChange(oidx, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newOptions = editExistingOptions.filter((_, i) => i !== oidx);
                                    setEditExistingOptions(newOptions);
                                    if (editExistingCorrectAnswer >= oidx) {
                                      setEditExistingCorrectAnswer(Math.max(0, editExistingCorrectAnswer - 1));
                                    }
                                  }}
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  disabled={editExistingOptions.length <= 2}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleEditExistingAddOption}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Correct Answer</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {editExistingOptions.map((option, oidx) => (
                              <label key={oidx} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="editCorrectAnswer"
                                  checked={editExistingCorrectAnswer === oidx}
                                  onChange={() => setEditExistingCorrectAnswer(oidx)}
                                  className="text-blue-600"
                                />
                                <span className="text-sm text-gray-700 truncate">
                                  {option || `Option ${oidx + 1}`}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            onClick={handleSaveEditExistingMcq}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCancelEditExistingMcq}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
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
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditExistingMcq(idx)}
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
                    )}
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
              disabled={isLoading || !moduleName.trim()}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Module
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
});

EditModuleForm.displayName = 'EditModuleForm';

export default EditModuleForm;
