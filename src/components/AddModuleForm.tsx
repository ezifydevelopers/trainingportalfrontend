import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Upload, 
  Plus, 
  Trash, 
  Check, 
  Clock,
  FileText,
  AlertCircle
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
  onSave: (moduleData: {
    name: string;
    videoFile: File | null;
    mcqs: MCQ[];
  }) => Promise<void>;
  isCreating: boolean;
  uploadProgress: number;
}

export default function AddModuleForm({
  isOpen,
  onClose,
  onSave,
  isCreating,
  uploadProgress
}: AddModuleFormProps) {
  const [moduleName, setModuleName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      
      // Calculate video duration
      setIsCalculatingDuration(true);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setVideoDuration(Math.floor(video.duration));
        setIsCalculatingDuration(false);
      };
      video.src = url;
    }
  };

  const handleAddMCQ = () => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      toast.error('Please fill in all fields for the MCQ');
      return;
    }

    const newMCQ: MCQ = {
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      answer: options[correctAnswer].trim(),
      explanation: explanation.trim() || undefined
    };

    setMcqs([...mcqs, newMCQ]);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
    toast.success('MCQ added successfully!');
  };

  const handleRemoveMCQ = (index: number) => {
    setMcqs(mcqs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!moduleName.trim()) {
      toast.error('Please enter a module name');
      return;
    }

    try {
      await onSave({
        name: moduleName.trim(),
        videoFile,
        mcqs
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
      setExplanation('');
    } catch (error) {
      console.error('Error saving module:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="mb-8 border-2 border-blue-200 shadow-lg sticky top-4 z-10 bg-white max-h-[80vh] overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <CardTitle className="flex items-center justify-between text-blue-900">
          <div className="flex items-center">
            <Plus className="h-6 w-6 mr-2" />
            Add New Training Module
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isCreating}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-80px)]">
        {/* Module Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Module Name</Label>
          <Input
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder="Enter module name"
            disabled={isCreating}
            className="w-full"
          />
        </div>

        {/* Video Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Training Video</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              disabled={isCreating}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                {videoFile ? videoFile.name : 'Click to upload video'}
              </span>
              <span className="text-xs text-gray-500">MP4, AVI, MOV files supported</span>
            </label>
          </div>
          
          {videoPreview && (
            <div className="space-y-2">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-48"
                />
              </div>
              {isCalculatingDuration ? (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Calculating duration...</span>
                </div>
              ) : videoDuration > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {formatDuration(videoDuration)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MCQ Section */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-4 block">Multiple Choice Questions</Label>
          
          {/* Add MCQ Form */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Question</Label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question here"
                  disabled={isCreating}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Answer Options</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswer === index}
                        onChange={() => setCorrectAnswer(index)}
                        disabled={isCreating}
                        className="text-blue-600"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        disabled={isCreating}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Explanation (Optional)</Label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this is the correct answer"
                  disabled={isCreating}
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <Button
                onClick={handleAddMCQ}
                disabled={isCreating}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add MCQ
              </Button>
            </div>
          </div>

          {/* List of MCQs to be added */}
          {mcqs.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium text-gray-600">MCQs to be added ({mcqs.length})</Label>
              {mcqs.map((mcq, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{mcq.question}</p>
                    <p className="text-xs text-gray-600">Correct: {mcq.answer}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMCQ(index)}
                    disabled={isCreating}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isCreating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Creating module...</span>
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
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            disabled={isCreating}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCreating || !moduleName.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating Module...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Module
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
