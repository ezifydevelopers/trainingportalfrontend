import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import CompanyCard from "@/components/CompanyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Upload, Play, FileText, Check, ArrowLeft, X, Clock, Users, Eye, Edit, Save, XIcon, GripVertical, File, Image, Music, Copy } from "lucide-react";
import NewCompanyDialog from "@/components/NewCompanyDialog";
import EditCompanyDialog from "@/components/EditCompanyDialog";
import { DuplicateCompanyDialog } from "@/components/DuplicateCompanyDialog";
import { 
  useAllCompanies, 
  useCreateCompany, 
  useUpdateCompany,
  useCompanyModules, 
  useAddModuleToCompany, 
  useAddVideoToModule, 
  useAddMCQsToModule, 
  useDeleteModule,
  useDeleteCompany,
  useUpdateModule,
  useAddResource,
  useGetModuleResources,
  useDeleteResource,
  useDuplicateCompanyData
} from "@/hooks/useApi";
import { getApiBaseUrl, getBaseUrl } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import ResourceUploadDialog from "@/components/ResourceUploadDialog";
import ModuleResources from "@/components/ModuleResources";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Module Component
interface Module {
  id: number;
  name: string;
  order?: number;
  isResourceModule?: boolean;
  mcqs?: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>;
  videos?: Array<{
    url: string;
    duration: number;
  }>;
  resources?: Array<{
    id: number;
    filename: string;
    originalName: string;
    type: string;
    duration?: number;
    estimatedReadingTime?: number;
    filePath: string;
  }>;
}

interface SortableModuleProps {
  module: Module;
  index: number;
  onModuleSelect: (module: Module) => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: number, moduleName: string) => void;
  onUploadResource: (module: Module) => void;
  deletingModuleId: number | null;
  getVideoUrl: (url: string) => string;
  capitalizeModuleName: (name: string) => string;
}

function SortableModule({ 
  module, 
  index, 
  onModuleSelect, 
  onEditModule, 
  onDeleteModule, 
  onUploadResource,
  deletingModuleId,
  getVideoUrl,
  capitalizeModuleName
}: SortableModuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div 
        className={`bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group ${
          isDragging ? 'shadow-lg border-blue-400 scale-105 bg-blue-50' : ''
        }`}
        onClick={() => onModuleSelect(module)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:justify-between">
          {/* Left side - Drag handle and module info */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              title="Drag to reorder"
            >
              <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600" />
            </div>
            
            {/* Order number with real-time update indicator */}
            <span className={`text-xs sm:text-sm font-bold px-2 py-1 rounded-full min-w-[1.5rem] sm:min-w-[2rem] text-center flex-shrink-0 transition-colors ${
              isDragging 
                ? 'text-blue-600 bg-blue-100 border-2 border-blue-300' 
                : 'text-gray-600 bg-gray-100'
            }`}>
              #{index + 1}
            </span>
            
            {/* Module name */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base break-words" title={capitalizeModuleName(module.name) || `Module ${index + 1}`}>
                {capitalizeModuleName(module.name) || `Module ${index + 1}`}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Click to view full details
              </p>
            </div>
          </div>
          
          {/* Right side - Stats and actions */}
          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto">
            {/* Module stats */}
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              {module.isResourceModule ? (
                <>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 px-2 py-1 whitespace-nowrap">
                    <FileText className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Resource Module</span>
                    <span className="sm:hidden">Resource</span>
                  </Badge>
                  {module.mcqs && module.mcqs.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-gray-50 px-2 py-1 whitespace-nowrap">
                      <span className="hidden sm:inline">{module.mcqs.length} MCQs</span>
                      <span className="sm:hidden">{module.mcqs.length}</span>
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-xs bg-gray-50 px-2 py-1 whitespace-nowrap">
                    <span className="hidden sm:inline">{module.mcqs?.length || 0} MCQs</span>
                    <span className="sm:hidden">{module.mcqs?.length || 0}</span>
                  </Badge>
                  {module.videos && module.videos.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-gray-50 px-2 py-1 whitespace-nowrap">
                      <Play className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{module.videos.length} Videos</span>
                      <span className="sm:hidden">{module.videos.length}</span>
                    </Badge>
                  )}
                  {module.videos?.[0]?.url && (
                    <Badge variant="outline" className="text-xs bg-gray-50 px-2 py-1 whitespace-nowrap">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor((module.videos?.[0]?.duration || 0) / 60)}:{(module.videos?.[0]?.duration || 0) % 60 < 10 ? '0' : ''}{(module.videos?.[0]?.duration || 0) % 60}
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {module.isResourceModule && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadResource(module);
                  }}
                  title="Upload resources"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditModule(module);
                }}
                title="Edit module"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={deletingModuleId === module.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteModule(module.id, capitalizeModuleName(module.name) || `Module ${index + 1}`);
                }}
                title="Delete module"
              >
                {deletingModuleId === module.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCompanyModules() {
  const queryClient = useQueryClient();
  
  // Fetch companies from API
  const { data: companiesData, isLoading, isError } = useAllCompanies();
  const companies = companiesData?.companies || [];
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const addModuleMutation = useAddModuleToCompany();
  const addVideoMutation = useAddVideoToModule();
  const addMCQsMutation = useAddMCQsToModule();
  const deleteModuleMutation = useDeleteModule();
  const deleteCompanyMutation = useDeleteCompany();
  const updateModuleMutation = useUpdateModule();
  const addResourceMutation = useAddResource();
  const deleteResourceMutation = useDeleteResource();

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [moduleName, setModuleName] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showResourceUpload, setShowResourceUpload] = useState(false);
  const [selectedModuleForResource, setSelectedModuleForResource] = useState(null);
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState(null);
  const [showResourceModuleDialog, setShowResourceModuleDialog] = useState(false);
  const [showDuplicateCompanyDialog, setShowDuplicateCompanyDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'resource'>('video');
  
  const [resourceModuleName, setResourceModuleName] = useState("");
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);

  const fileInputRef = React.useRef(null);

  // Edit mode state variables
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModuleName, setEditModuleName] = useState("");
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [editVideoPreview, setEditVideoPreview] = useState("");
  const [editVideoDuration, setEditVideoDuration] = useState(0);
  const [editMcqs, setEditMcqs] = useState([]);
  const [editQuestion, setEditQuestion] = useState("");
  const [editOptions, setEditOptions] = useState(["", "", "", ""]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState(0);
  const [isCalculatingEditDuration, setIsCalculatingEditDuration] = useState(false);
  const editFileInputRef = React.useRef(null);

  // State for editing existing MCQs
  const [editingMcqIndex, setEditingMcqIndex] = useState(null);
  const [editExistingQuestion, setEditExistingQuestion] = useState("");
  const [editExistingOptions, setEditExistingOptions] = useState(["", "", "", ""]);
  const [editExistingCorrectAnswer, setEditExistingCorrectAnswer] = useState(0);

  // Drag and drop state
  const [orderedModules, setOrderedModules] = useState([]);
  const [originalOrder, setOriginalOrder] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Fetch modules for selected company
  const { data: modules = [], isLoading: modulesLoading, isError: modulesError } = useCompanyModules(selectedCompany?.id || null);

  // Computed modules to display (uses orderedModules when available, otherwise filtered modules)
  const displayModules = React.useMemo(() => {
    if (orderedModules.length > 0) {
      return orderedModules;
    }
    return modules.filter(module => !module.isResourceModule);
  }, [orderedModules, modules]);

  // Refresh selectedModule when modules data changes
  useEffect(() => {
    if (selectedModule && modules.length > 0) {
      const updatedModule = modules.find(m => m.id === selectedModule.id);
      if (updatedModule) {
        setSelectedModule(updatedModule);
      }
    }
  }, [modules, selectedModule]);

  // Helper function to construct video URL
  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) return "";
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    
    // Use base URL without /api for static files
    const baseUrl = getBaseUrl();
    
    // If videoUrl already starts with /uploads/, use it directly
    if (videoUrl.startsWith('/uploads/')) {
      const fullUrl = `${baseUrl}${videoUrl}`;
      return fullUrl;
    }
    
    // Otherwise, add /uploads/ prefix
    const fullUrl = `${baseUrl}/uploads/${videoUrl}`;
    return fullUrl;
  };

  // Helper function to construct logo URL
  const getLogoUrl = (logoUrl: string) => {
    if (!logoUrl) {
      return "";
    }
    if (logoUrl.startsWith('http')) {
      return logoUrl;
    }
    // Use base URL without /api for static files
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/uploads/${logoUrl}`;
    return fullUrl;
  };

  // Helper function to capitalize module names
  const capitalizeModuleName = (name: string) => {
    if (!name) return '';
    return name.toUpperCase();
  };

  // Helper function to validate MCQ data
  const validateMCQs = (mcqs: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>) => {
    if (!Array.isArray(mcqs)) {
      throw new Error('MCQs must be an array');
    }
    
    for (let i = 0; i < mcqs.length; i++) {
      const mcq = mcqs[i];
      
      if (!mcq.question || typeof mcq.question !== 'string' || mcq.question.trim() === '') {
        throw new Error(`MCQ ${i + 1} must have a valid question`);
      }
      
      if (!Array.isArray(mcq.options) || mcq.options.length < 2) {
        throw new Error(`MCQ ${i + 1} must have at least 2 options`);
      }
      
      if (!mcq.answer || typeof mcq.answer !== 'string' || mcq.answer.trim() === '') {
        throw new Error(`MCQ ${i + 1} must have a valid answer`);
      }
      
      if (!mcq.options.includes(mcq.answer)) {
        throw new Error(`MCQ ${i + 1} answer must be one of the provided options`);
      }
      
      // Filter out empty options
      mcq.options = mcq.options.filter((opt: string) => opt && opt.trim() !== '');
      if (mcq.options.length < 2) {
        throw new Error(`MCQ ${i + 1} must have at least 2 non-empty options`);
      }
    }
    
    return mcqs;
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update the order property in real-time for immediate UI feedback
        const updatedOrder = newOrder.map((module, index) => ({
          ...module,
          order: index
        }));
        
        return updatedOrder;
      });
      
      // Store original order if not already stored
      if (originalOrder.length === 0) {
        setOriginalOrder([...orderedModules]);
      }
      
      setIsReordering(true);
    }
  };

  // Update ordered modules when modules data changes
  React.useEffect(() => {
    if (modules && modules.length > 0 && selectedCompany) {
      // Filter out resource modules and sort by order field from database, then by ID as fallback
      const filteredModules = modules.filter(module => !module.isResourceModule);
      const sortedModules = [...filteredModules].sort((a, b) => {
        // First sort by order field (if available)
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If one has order and other doesn't, prioritize the one with order
        if (a.order !== undefined && b.order === undefined) {
          return -1;
        }
        if (a.order === undefined && b.order !== undefined) {
          return 1;
        }
        // If neither has order, sort by ID (creation order)
        return a.id - b.id;
      });
      
      setOrderedModules(sortedModules);
    }
  }, [modules, selectedCompany]);

  // Handle saving the new order
  const handleSaveOrder = async () => {
    if (isSavingOrder) return; // Prevent multiple simultaneous requests
    
    try {
      setIsSavingOrder(true);
      
      if (!selectedCompany || !selectedCompany.id) {
        toast.error('No company selected');
        return;
      }
      
      if (!displayModules || displayModules.length === 0) {
        toast.error('No modules to reorder');
        return;
      }

      const orderUpdates = displayModules.map((module, index) => ({
        id: module.id,
        order: index + 1  // Fix: Start from 1, not 0
      }));

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast.error('You are not logged in. Please log in again.');
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}/admin/modules/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          companyId: selectedCompany.id,
          moduleOrders: orderUpdates 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Module order saved successfully!');
        setIsReordering(false);
        setOriginalOrder([]); // Clear original order since changes are saved
        // Clear orderedModules to force refresh from database
        setOrderedModules([]);
        // Invalidate and refetch the modules to show the new order
        queryClient.invalidateQueries({ queryKey: ["company-modules", selectedCompany.id] });
        // Also invalidate dashboard queries to update trainee views
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["trainee-progress"] });
      } else {
        toast.error(result.message || 'Failed to update module order');
      }
    } catch (error) {
      toast.error('Failed to update module order. Please try again.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Handle canceling the order changes
  const handleCancelOrder = () => {
    // Reset to original order if available, otherwise reset to database order
    if (originalOrder.length > 0) {
      setOrderedModules([...originalOrder]);
      setOriginalOrder([]);
    } else {
      // Clear orderedModules to use database order
      setOrderedModules([]);
    }
    setIsReordering(false);
  };

  const handleCompanySelect = (company) => {

    setSelectedCompany(company);
    setShowAddModule(false);
    setVideoFile(null);
    setVideoPreview("");
    setMcqs([]);
    setModuleName("");
    setVideoDuration(0);
  };

  const handleModuleSelect = (module: Module) => {
    if (!module || !module.id) {
      return;
    }
    setSelectedModule(module);
    setShowModuleDetail(true);
  };

  const handleCloseModuleDetail = () => {
    setShowModuleDetail(false);
    setSelectedModule(null);
    setIsEditMode(false);
    handleCancelEdit();
  };

  const handleDeleteModule = async (moduleId: number, moduleName: string) => {
    if (!moduleId || !moduleName) {
      toast.error("Invalid module data");
      return;
    }

    if (!confirm(`Are you sure you want to delete the module "${moduleName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingModuleId(moduleId);

    try {
      await deleteModuleMutation.mutateAsync(moduleId);
      toast.success(`Module "${moduleName}" deleted successfully!`);
    } catch (error) {
      
      // Extract error message from the error object
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast.error(`Failed to delete module: ${errorMessage}`);
    } finally {
      setDeletingModuleId(null);
    }
  };

  const handleShowAddModule = () => {
    setShowAddModule(true);
    // Smooth scroll to top when form is opened
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setIsCalculatingDuration(true);
      setVideoDuration(0);
      
      // Get video duration with better error handling
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        
        // Validate duration
        if (duration && isFinite(duration) && duration > 0) {
          setVideoDuration(Math.floor(duration));
        } else {
          setVideoDuration(0);
        }
        setIsCalculatingDuration(false);
      };
      
      video.onerror = () => {
        setVideoDuration(0);
        setIsCalculatingDuration(false);
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      setVideoFile(null);
      setVideoPreview("");
      setVideoDuration(0);
      setIsCalculatingDuration(false);
    }
  };

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddMcq = () => {

    // Filter out empty options for validation
    const validOptions = options.filter(opt => opt.trim());
    
    if (!question.trim() || validOptions.length < 2) {

      toast.error("Please provide a question and at least 2 options");
      return;
    }
    
    // Validate that the correct answer is one of the valid options
    if (correctAnswer >= validOptions.length) {

      toast.error("Please select a valid correct answer");
      return;
    }
    
    const newMcq = {
      question: question.trim(),
      options: validOptions,
      answer: validOptions[correctAnswer],
      explanation: ""
    };

    setMcqs([
      ...mcqs,
      newMcq,
    ]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);

    toast.success("Question added successfully!");
  };

  const handleRemoveMcq = (idx) => {
    setMcqs(mcqs.filter((_, i) => i !== idx));
  };

  const handleSaveModule = async () => {
    if (!videoFile || !moduleName.trim() || !selectedCompany || isCreatingModule) return;
    
    // Validate video duration
    if (!videoDuration || videoDuration <= 0) {
      toast.error("Please wait for video duration to load or try uploading a different video file.");
      return;
    }
    
    try {
      setIsCreatingModule(true);
      setUploadProgress(0);
      
      // Show loading toast for the entire process
      const loadingToast = toast.loading("Creating module and uploading video... This may take a while depending on your internet speed.", {
        duration: 0 // Keep toast until manually dismissed
      });
      
      // 1. Add module to company
      setUploadProgress(10);
      toast.loading("Step 1/3: Creating module...", { id: loadingToast });
      const moduleRes = await addModuleMutation.mutateAsync({ companyId: selectedCompany.id, name: moduleName });
      
      const moduleId = moduleRes?.module?.id;
      if (!moduleId) {
        throw new Error(`Failed to create module: ${moduleRes?.message || 'No module ID returned'}`);
      }
      
      // 2. Add video to module (this is the critical step that needs to complete)
      setUploadProgress(30);
      toast.loading("Step 2/3: Uploading video... Please wait for complete upload.", { id: loadingToast });
      await addVideoMutation.mutateAsync({ moduleId, videoFile, duration: videoDuration });
      setUploadProgress(80);
      
      // 3. Add MCQs to module (optional)
      if (mcqs.length > 0) {

        console.log('MCQ validation:', mcqs.map(mcq => ({
          question: mcq.question,
          options: mcq.options,
          answer: mcq.answer,
          hasValidAnswer: mcq.options.includes(mcq.answer)
        })));
        setUploadProgress(90);
        toast.loading("Step 3/3: Adding quiz questions...", { id: loadingToast });
        try {
          await addMCQsMutation.mutateAsync({ moduleId, mcqs });

          setUploadProgress(100);
          toast.success("✅ Module, video, and MCQs added successfully!", { id: loadingToast });
        } catch (mcqError) {

          throw mcqError;
        }
        
        // Update selectedModule with the new MCQs
        if (selectedModule && selectedModule.id === moduleId) {
          setSelectedModule({
            ...selectedModule,
            mcqs: mcqs
          });
        }
      } else {

        setUploadProgress(100);
        toast.success("✅ Module and video added successfully! (No MCQs added)", { id: loadingToast });
      }
      
      // Reset form
      setShowAddModule(false);
      setVideoFile(null);
      setVideoPreview("");
      setMcqs([]);
      setModuleName("");
      setVideoDuration(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`❌ Failed to add module, video, or MCQs: ${errorMessage}`);
    } finally {
      setIsCreatingModule(false);
      setUploadProgress(0);
    }
  };

  const handleAddCompany = async (companyName, logoFile) => {
    try {
      const formData = new FormData();
      formData.append('name', companyName);
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      await createCompanyMutation.mutateAsync(formData);
      toast.success("Company created successfully!");
      setShowNewCompany(false);
    } catch (error) {
      toast.error("Failed to create company. Please try again.");
    }
  };

  const handleUpdateCompany = async (companyId, companyName, logoFile) => {
    try {

      const formData = new FormData();
      formData.append('name', companyName);
      if (logoFile) {

        formData.append('logo', logoFile);
      }
      await updateCompanyMutation.mutateAsync({ id: companyId, data: formData });

      toast.success("Company updated successfully!");
      setShowEditCompany(false);
      setCompanyToEdit(null);
    } catch (error) {

      toast.error("Failed to update company. Please try again.");
    }
  };

  const handleCreateResourceModule = async () => {

    if (!resourceModuleName.trim()) {
      toast.error("Please enter a resource module name");
      return;
    }
    if (!selectedCompany) {
      toast.error("Please select a company first");
      return;
    }

    try {

      const moduleRes = await addModuleMutation.mutateAsync({ 
        companyId: selectedCompany.id, 
        name: resourceModuleName 
      });

      const moduleId = moduleRes?.module?.id;
      if (!moduleId) {
        throw new Error(`Failed to create module: ${moduleRes?.message || 'No module ID returned'}`);
      }

      // Set the created module and open resource upload dialog
      setSelectedModuleForResource({ id: moduleId, name: resourceModuleName });
      setShowResourceModuleDialog(false);
      setShowResourceUpload(true);
      
      // Reset the module name
      setResourceModuleName("");
      
      toast.success("Resource module created! Now upload your files.");
    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create resource module: ${errorMessage}`);
    }
  };

  const handleCreateResourceModuleWithFiles = async () => {
    if (!resourceModuleName.trim() || !selectedCompany) return;
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast.error('You are not logged in. Please log in again.');
        return;
      }

      // First create the module
      const moduleResponse = await fetch(`${getApiBaseUrl()}/admin/companies/${selectedCompany.id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: resourceModuleName,
          isResourceModule: true
        })
      });

      if (!moduleResponse.ok) {
        const errorData = await moduleResponse.json();
        throw new Error(errorData.message || 'Failed to create resource module');
      }

      const moduleResult = await moduleResponse.json();
      const moduleId = moduleResult.module?.id;

      if (!moduleId) {
        throw new Error('Failed to get module ID');
      }

      // Upload files if any were selected
      if (resourceFiles.length > 0) {
        const uploadPromises = resourceFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('resourceFile', file);
          formData.append('moduleId', moduleId.toString());
          formData.append('type', getFileType(file.name));

          const uploadResponse = await fetch(`${getApiBaseUrl()}/admin/resources`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            body: formData
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          return uploadResponse.json();
        });

        await Promise.all(uploadPromises);
      }

      toast.success(`Resource module created successfully${resourceFiles.length > 0 ? ` with ${resourceFiles.length} files` : ''}!`);
      setResourceModuleName('');
      setResourceFiles([]);
      setShowResourceModuleDialog(false);
      
      // Refresh the modules list
      queryClient.invalidateQueries({ queryKey: ['companyModules', selectedCompany.id] });
    } catch (error) {

      toast.error(error.message || 'Failed to create resource module');
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'DOCUMENT';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'IMAGE';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'VIDEO';
      case 'mp3':
      case 'wav':
        return 'AUDIO';
      default:
        return 'DOCUMENT';
    }
  };

  const handleUploadResource = async (resourceFile: File, type: string, duration?: number, estimatedReadingTime?: number): Promise<void> => {
    if (!selectedModuleForResource) {
      toast.error("No module selected for resource upload");
      return;
    }

    try {
      await addResourceMutation.mutateAsync({
        moduleId: selectedModuleForResource.id,
        resourceFile,
        type,
        duration,
        estimatedReadingTime
      });
      toast.success(`Resource uploaded successfully to ${selectedModuleForResource.name}`);
      
      // Close the dialog and refresh the selected module
      setShowResourceUpload(false);
      setSelectedModuleForResource(null);
      
      // Refresh the modules data to show the new resource
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['module-resources', selectedModuleForResource.id] });
      
    } catch (error) {

      throw error; // Re-throw so ResourceUploadDialog can handle it
    }
  };

  const handleEditCompany = (company) => {

    setCompanyToEdit(company);
    setShowEditCompany(true);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    try {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      toast.success(`Company "${companyToDelete.name}" deleted successfully`);
      setCompanyToDelete(null);
      setSelectedCompany(null);
    } catch (error) {
      
      // Provide more specific error messages
      let errorMessage = 'Failed to delete company';
      if (error?.message) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage = 'Cannot delete company: It has associated data that cannot be removed';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Company not found or already deleted';
        } else if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to delete this company';
        } else {
          errorMessage = `Failed to delete company: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  // Edit mode handler functions
  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setEditModuleName(module.name);
    setEditVideoFile(null);
    setEditVideoPreview("");
    setEditVideoDuration(module.videos?.[0]?.duration || 0);
    // Load existing MCQs from the module
    setEditMcqs(module.mcqs ? [...module.mcqs] : []);
    setEditQuestion("");
    setEditOptions(["", "", "", ""]);
    setEditCorrectAnswer(0);
    setIsEditMode(true);
    setShowModuleDetail(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditModuleName("");
    setEditVideoFile(null);
    setEditVideoPreview("");
    setEditVideoDuration(0);
    setEditMcqs([]);
    setEditQuestion("");
    setEditOptions(["", "", "", ""]);
    setEditCorrectAnswer(0);
    // Reset existing MCQ editing state
    setEditingMcqIndex(null);
    setEditExistingQuestion("");
    setEditExistingOptions(["", "", "", ""]);
    setEditExistingCorrectAnswer(0);
  };

  const handleEditVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditVideoFile(file);
      setEditVideoPreview(URL.createObjectURL(file));
      setIsCalculatingEditDuration(true);
      
      // Calculate video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setEditVideoDuration(Math.round(video.duration));
        setIsCalculatingEditDuration(false);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleEditAddOption = () => {
    setEditOptions([...editOptions, ""]);
  };

  const handleEditOptionChange = (idx, value) => {
    const newOptions = [...editOptions];
    newOptions[idx] = value;
    setEditOptions(newOptions);
  };

  const handleEditAddMcq = () => {
    if (!editQuestion.trim() || editOptions.some(opt => !opt.trim())) {
      toast.error("Please fill in both question and all options");
      return;
    }
    
    const newMcq = {
      question: editQuestion,
      options: editOptions.filter(opt => opt.trim()),
      answer: editOptions[editCorrectAnswer],
      explanation: ""
    };
    
    setEditMcqs([...editMcqs, newMcq]);
    setEditQuestion("");
    setEditOptions(["", "", "", ""]);
    setEditCorrectAnswer(0);
  };

  const handleEditRemoveMcq = (idx) => {
    setEditMcqs(editMcqs.filter((_, i) => i !== idx));
  };

  // Handlers for editing existing MCQs
  const handleEditExistingMcq = (idx) => {
    const mcq = editMcqs[idx];
    setEditingMcqIndex(idx);
    setEditExistingQuestion(mcq.question);
    setEditExistingOptions([...mcq.options]);
    setEditExistingCorrectAnswer(mcq.options.indexOf(mcq.answer));
  };

  const handleCancelEditExistingMcq = () => {
    setEditingMcqIndex(null);
    setEditExistingQuestion("");
    setEditExistingOptions(["", "", "", ""]);
    setEditExistingCorrectAnswer(0);
  };

  const handleSaveEditExistingMcq = () => {
    if (!editExistingQuestion.trim() || editExistingOptions.some(opt => !opt.trim())) {
      toast.error("Please fill in both question and all options");
      return;
    }

    const updatedMcq = {
      question: editExistingQuestion,
      options: editExistingOptions.filter(opt => opt.trim()),
      answer: editExistingOptions[editExistingCorrectAnswer],
      explanation: ""
    };

    const updatedMcqs = [...editMcqs];
    updatedMcqs[editingMcqIndex] = updatedMcq;
    setEditMcqs(updatedMcqs);
    handleCancelEditExistingMcq();
  };

  const handleEditExistingOptionChange = (idx, value) => {
    const newOptions = [...editExistingOptions];
    newOptions[idx] = value;
    setEditExistingOptions(newOptions);
  };

  const handleEditExistingAddOption = () => {
    setEditExistingOptions([...editExistingOptions, ""]);
  };

  const handleSaveEdit = async () => {
    if (!editModuleName.trim() || !selectedModule) return;
    
    try {
      // Validate MCQs before sending
      const validatedMCQs = validateMCQs([...editMcqs]); // Create a copy to avoid mutating original
      
      // Update module name
      await updateModuleMutation.mutateAsync({ 
        id: selectedModule.id, 
        name: editModuleName 
      });
      
      // If new video is uploaded, update video
      if (editVideoFile) {
        await addVideoMutation.mutateAsync({ 
          moduleId: selectedModule.id, 
          videoFile: editVideoFile, 
          duration: editVideoDuration 
        });
      }
      
      // Always update MCQs (this will replace existing ones with current editMcqs)
      await addMCQsMutation.mutateAsync({ 
        moduleId: selectedModule.id, 
        mcqs: validatedMCQs 
      });
      
      toast.success("Module updated successfully");
      handleCancelEdit();
      setShowModuleDetail(false);
    } catch (error) {
      // Provide more specific error message
      let errorMessage = 'Failed to update module';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast.error(`Failed to update module: ${errorMessage}`);
    }
  };

  return (
    <Layout>
      <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
        
        {!selectedCompany ? (
          <div className="space-y-6 sm:space-y-8" style={{ scrollBehavior: 'smooth' }}>
            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Company Training Modules</h2>
                    <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Manage training content and assessments for your companies</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowNewCompany(true)} 
                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Company
                  </Button>
                  <Button 
                    onClick={() => setShowDuplicateCompanyDialog(true)} 
                    className="bg-green-600 text-white hover:bg-green-700 font-medium px-6 py-3 rounded-xl shadow-lg"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Duplicate Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Company Selection Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border-0">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Select a Company</h3>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Choose a company to manage their training modules and resources</p>
              </div>
            <NewCompanyDialog
              open={showNewCompany}
              onOpenChange={setShowNewCompany}
              onAddCompany={handleAddCompany}
            />
            <EditCompanyDialog
              open={showEditCompany}
              onOpenChange={setShowEditCompany}
              company={companyToEdit}
              onUpdateCompany={handleUpdateCompany}
            />
            <DuplicateCompanyDialog
              isOpen={showDuplicateCompanyDialog}
              onClose={() => setShowDuplicateCompanyDialog(false)}
              companies={companies}
            />
            
            <ResourceUploadDialog
              open={showResourceUpload}
              onOpenChange={setShowResourceUpload}
              onUploadResource={handleUploadResource}
              moduleName={selectedModuleForResource?.name}
            />
            
              {/* Company Cards Grid */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <span className="text-lg font-medium text-gray-600">Loading companies...</span>
                </div>
              ) : isError ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-xl font-semibold text-red-600 mb-2">Failed to load companies</p>
                  <p className="text-gray-500">Please try refreshing the page</p>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-600 mb-2">No companies found</p>
                  <p className="text-gray-500 mb-6">Get started by creating your first company</p>
                  <Button
                    onClick={() => setShowNewCompany(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Company
                  </Button>
                  
                  {/* Test Edit Dialog Button */}
                  <Button
                    onClick={() => {

                      setCompanyToEdit({ id: 1, name: 'Test Company', logo: null });
                      setShowEditCompany(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl ml-4"
                  >
                    Test Edit Dialog
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" style={{ scrollBehavior: 'smooth' }}>
                  {companies.map((company) => (
                    <div key={company.id} className="relative">
                      <div
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden transform hover:-translate-y-1"
                      >
                        {/* Company Logo/Avatar */}
                        <div className="h-32 w-full flex items-center justify-center overflow-hidden relative border-b border-gray-100">
                          {company.logo ? (
                            <img 
                              src={getLogoUrl(company.logo)} 
                              alt={company.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                  {company.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Company Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-gray-500 text-sm mb-4">Click to manage training modules</p>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  handleEditCompany(company);
                                }}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 relative"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  setCompanyToDelete(company);
                                }}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 z-10 relative"
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                handleCompanySelect(company);
                              }}
                              className="flex items-center text-blue-600 hover:text-blue-700 focus:outline-none z-10 relative"
                            >
                              <span className="text-sm font-medium">Manage</span>
                              <ArrowLeft className="h-4 w-4 ml-1" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-6 sm:mb-8">
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedCompany(null)} 
                    className="text-white hover:bg-white/20 p-2 rounded-xl flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Back to Companies</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                  <div className="w-px h-6 sm:h-8 bg-white/30 hidden sm:block"></div>
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 truncate">{selectedCompany.name}</h2>
                    <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Training modules and assessments</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button 
                    onClick={handleShowAddModule}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> 
                    <span className="hidden sm:inline">Add Training Module</span>
                    <span className="sm:hidden">Add Module</span>
                  </Button>
                  <Button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      setShowResourceModuleDialog(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base"
                  >
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> 
                    <span className="hidden sm:inline">Add Resource Module</span>
                    <span className="sm:hidden">Add Resource</span>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Add module form - Moved to top */}
            {showAddModule && (
              <Card className="mb-8 border-2 border-blue-200 shadow-lg sticky top-4 z-10 bg-white max-h-[80vh] overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                  <CardTitle className="flex items-center justify-between text-blue-900">
                    <div className="flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Training Module
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        Active Form
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAddModule(false)}
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                  {/* Module Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Module Name</label>
                    <Input
                      type="text"
                      placeholder="Enter module name..."
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  
                  {/* Video Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Upload Video Tutorial</label>
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition group bg-gray-50 hover:bg-blue-50"
                      onClick={handleBoxClick}
                    >
                      <Upload className="h-12 w-12 text-gray-400 group-hover:text-blue-500 mb-3" />
                      <span className="text-gray-600 group-hover:text-blue-600 font-medium text-lg">Click to upload video</span>
                      <span className="text-sm text-gray-400 mt-2">MP4, WebM, or Ogg (max 100MB)</span>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoChange}
                      />
                    </div>
                    {videoPreview && (
                      <div className="mt-4">
                        <video src={videoPreview} controls className="w-full max-w-2xl rounded-lg shadow-md border" />
                        <div className="mt-2 flex items-center space-x-2">
                          {isCalculatingDuration ? (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm">Calculating duration...</span>
                            </div>
                          ) : videoDuration > 0 ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                Duration: {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-red-600">
                              <span className="text-sm">⚠️ Could not determine video duration</span>
                            </div>
                          )}
                        </div>
                      </div>
                      )}
                    </div>

                  {/* MCQ Section - Only show for video modules */}
                  {!showResourceModuleDialog && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Add Multiple Choice Questions (Optional)
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      You can add assessment questions to test trainees' understanding. This is optional - modules can be created with just video content.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Question</label>
                        <Input
                          type="text"
                          placeholder="Enter your question here..."
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-2">Options</label>
                        <div className="space-y-2">
                          {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                correctAnswer === idx ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                              }`}>
                                {correctAnswer === idx && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <Input
                                type="text"
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                className="flex-1"
                              />
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={correctAnswer === idx}
                                onChange={() => setCorrectAnswer(idx)}
                                className="ml-2"
                              />
                              <span className="text-xs text-gray-500">Correct</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="mt-2" 
                          onClick={handleAddOption}
                        >
                          + Add Option
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        {/* Debug info */}
                        <div className="text-xs text-gray-500 mr-2">
                          Question: "{question}" | Options: {options.filter(opt => opt.trim()).length}/{options.length}
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={() => {

                            const validOptions = options.filter(opt => opt.trim());
                            console.log('Button disabled:', !question.trim() || validOptions.length < 2);
                            handleAddMcq();
                          }}
                          disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add MCQ
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setQuestion("");
                            setOptions(["", "", "", ""]);
                            setCorrectAnswer(0);
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                  )}
                  
                  {/* Display Added MCQs */}
                  {mcqs.length > 0 ? (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Added Questions ({mcqs.length})
                      </h4>
                      <div className="space-y-3">
                        {mcqs.map((mcq, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 mb-2">{mcq.question}</p>
                                <div className="space-y-1">
                                  {mcq.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex items-center space-x-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        option === mcq.answer ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                      }`}>
                                        {option === mcq.answer && (
                                          <Check className="h-3 w-3 text-white" />
                                        )}
                                      </div>
                                      <span className={`text-sm ${
                                        option === mcq.answer ? 'text-green-700 font-medium' : 'text-gray-600'
                                      }`}>
                                        {option}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMcq(idx)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No questions added yet. Add some questions above to test trainees' understanding.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  {isCreatingModule && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Creating module and uploading video...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-xs text-gray-500">
                        Please wait for the complete upload. Do not close this window.
                      </p>
                    </div>
                  )}

                  {/* Summary Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Module Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Module Name: {moduleName || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>Video: {videoFile ? videoFile.name : 'No video selected'}</span>
                        {videoDuration > 0 && (
                          <span className="text-blue-600">({Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4" />
                        <span>MCQs: {mcqs.length} question{mcqs.length !== 1 ? 's' : ''} added</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <Button 
                      onClick={handleSaveModule} 
                      disabled={!videoFile || !moduleName.trim() || isCalculatingDuration || !videoDuration || videoDuration <= 0 || isCreatingModule}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreatingModule ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Module...
                        </>
                      ) : isCalculatingDuration ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Calculating Duration...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Save Module {mcqs.length > 0 && `(${mcqs.length} MCQs)`}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddModule(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* List existing modules */}
            <div className="space-y-6 mb-8">
              {modulesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading modules...</p>
                </div>
              ) : modulesError ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <FileText className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-red-600 font-medium">Failed to load modules.</p>
                  <p className="text-gray-500 text-sm mt-1">Please try refreshing the page.</p>
                </div>
              ) : modules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first training module.</p>
                  <Button 
                    onClick={handleShowAddModule}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" /> 
                    Add First Module
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-0 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Modules</h3>
                            <p className="text-sm sm:text-base text-gray-600">Manage your training modules and assessments</p>
                          </div>
                        </div>
                        {isReordering && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 px-3 py-1 self-start sm:self-auto">
                              Order Changed
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {displayModules.length} modules reordered
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Live Preview</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {!isReordering ? (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {activeTab === 'video' && (
                            <Button
                              onClick={() => setIsReordering(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base whitespace-nowrap"
                            >
                              <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Reorder Video Modules</span>
                              <span className="sm:hidden">Reorder</span>
                            </Button>
                          )}
                          {activeTab === 'resource' && (
                            <Button
                              onClick={() => setShowResourceModuleDialog(true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base whitespace-nowrap"
                            >
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Add Resource Module</span>
                              <span className="sm:hidden">Add Resource</span>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={handleSaveOrder}
                            disabled={isSavingOrder}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                          >
                            {isSavingOrder ? 'Saving...' : 'Save Order'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelOrder}
                            className="px-6 py-3 rounded-xl font-medium"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="mt-4 sm:mt-6 border-b border-gray-200">
                      <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                        <button
                          onClick={() => setActiveTab('video')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                            activeTab === 'video'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Video Modules</span>
                            <span className="sm:hidden">Video</span>
                            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                              {modules.filter(module => !module.isResourceModule).length}
                            </Badge>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('resource')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                            activeTab === 'resource'
                              ? 'border-purple-500 text-purple-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Resource Modules</span>
                            <span className="sm:hidden">Resource</span>
                            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                              {modules.filter(module => module.isResourceModule).length}
                            </Badge>
                          </div>
                        </button>
                      </nav>
                    </div>
                  </div>
                  
                  {isReordering ? (
                    <>
                      {/* Drag and Drop Instructions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <GripVertical className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Drag & Drop to Reorder Video Modules</h4>
                            <p className="text-sm text-blue-700">
                              Use the grip handle (⋮⋮) on the left of each video module to drag and reorder them. 
                              The order will determine how modules appear to trainees. 
                              Resource modules are not included in reordering as they are managed separately.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={displayModules.map(module => module.id)}
                      strategy={verticalListSortingStrategy}
                    >
                                           <div className="space-y-1">
                       {displayModules.map((mod, idx) => (
                         <div key={mod.id}>
                           <SortableModule
                             module={mod}
                             index={idx}
                             onModuleSelect={handleModuleSelect}
                             onEditModule={handleEditModule}
                             onDeleteModule={handleDeleteModule}
                             onUploadResource={(module) => {
                               setSelectedModuleForResource({ id: module.id, name: module.name });
                               setShowResourceUpload(true);
                             }}
                             deletingModuleId={deletingModuleId}
                             getVideoUrl={getVideoUrl}
                             capitalizeModuleName={capitalizeModuleName}
                           />
                           {idx < orderedModules.length - 1 && (
                             <div className="h-px bg-gray-200 mx-4 my-1"></div>
                           )}
                         </div>
                       ))}
                     </div>
                    </SortableContext>
                      </DndContext>
                    </>
                  ) : (
                  <div className="space-y-4">
                    {/* Video Modules Tab Content */}
                    {activeTab === 'video' && (
                      <>
                        {displayModules.map((module, index) => (
                      <div key={module.id}>
                        <div 
                          className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-300 group transform hover:-translate-y-1"
                          onClick={() => handleModuleSelect(module)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:justify-between">
                            {/* Left side - Module info */}
                            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                              <span className="text-sm sm:text-lg font-bold text-gray-600 bg-gray-100 px-2 py-1 sm:px-3 sm:py-2 rounded-full min-w-[2.5rem] sm:min-w-[3rem] text-center flex-shrink-0">
                                #{index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base sm:text-lg mb-1 truncate" title={capitalizeModuleName(module.name) || `Module ${index + 1}`}>
                                  {capitalizeModuleName(module.name) || `Module ${index + 1}`}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                  Click to view full details
                                </p>
                              </div>
                            </div>
                            
                            {/* Right side - Stats and actions */}
                            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 overflow-x-auto">
                              {/* Module stats */}
                              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                {module.isResourceModule ? (
                                  <>
                                    <Badge variant="outline" className="text-xs sm:text-sm bg-purple-50 text-purple-700 border-purple-200 px-2 py-1 sm:px-3 whitespace-nowrap">
                                      <FileText className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">{module.resources?.length || 0} Resources</span>
                                      <span className="sm:hidden">{module.resources?.length || 0}</span>
                                    </Badge>
                                    {module.mcqs && module.mcqs.length > 0 && (
                                      <Badge variant="outline" className="text-xs sm:text-sm bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 sm:px-3 whitespace-nowrap">
                                        <span className="hidden sm:inline">{module.mcqs.length} MCQs</span>
                                        <span className="sm:hidden">{module.mcqs.length}</span>
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <Badge variant="outline" className="text-xs sm:text-sm bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 sm:px-3 whitespace-nowrap">
                                      <span className="hidden sm:inline">{module.mcqs?.length || 0} MCQs</span>
                                      <span className="sm:hidden">{module.mcqs?.length || 0}</span>
                                    </Badge>
                                    {module.videos && module.videos.length > 0 && (
                                      <Badge variant="outline" className="text-xs sm:text-sm bg-green-50 text-green-700 border-green-200 px-2 py-1 sm:px-3 whitespace-nowrap">
                                        <Play className="h-3 w-3 mr-1" />
                                        <span className="hidden sm:inline">{module.videos.length} Videos</span>
                                        <span className="sm:hidden">{module.videos.length}</span>
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex items-center space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {module.isResourceModule && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 sm:h-9 sm:w-9 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedModuleForResource({ id: module.id, name: module.name });
                                      setShowResourceUpload(true);
                                    }}
                                    title="Upload resources"
                                  >
                                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 sm:h-9 sm:w-9 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditModule(module);
                                  }}
                                  title="Edit module"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteModule(module.id, module.name);
                                  }}
                                  disabled={deletingModuleId === module.id}
                                  title="Delete module"
                                >
                                  {deletingModuleId === module.id ? (
                                    <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                  ) : (
                                    <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                                  )}
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
                      </>
                    )}
                    
                    {/* Resource Modules Tab Content */}
                    {activeTab === 'resource' && (
                      <>
                        {modules.filter(module => module.isResourceModule).length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No resource modules yet</h3>
                            <p className="text-gray-600 mb-4">Get started by adding your first resource module.</p>
                            <Button 
                              onClick={() => setShowResourceModuleDialog(true)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <FileText className="h-4 w-4 mr-2" /> 
                              Add Resource Module
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {modules
                              .filter(module => module.isResourceModule)
                              .map((module) => (
                                <div key={module.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="p-2 bg-purple-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900">{capitalizeModuleName(module.name)}</h4>
                                        <p className="text-sm text-gray-500">Resource Module</p>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                      {module.resources?.length || 0} Resources
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-4">Click to manage resources</p>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedModuleForResource({ id: module.id, name: module.name });
                                        setShowResourceUpload(true);
                                      }}
                                      className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleModuleSelect(module)}
                                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legacy Resources Section - Keep for backward compatibility but hide when using tabs */}
        {selectedCompany && modules.some(module => module.isResourceModule) && activeTab !== 'resource' && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Learning Resources</h2>
                      <p className="text-sm text-gray-600">Manage documents, PDFs, and other learning materials</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {modules
                    .filter(module => module.isResourceModule)
                    .map((module) => (
                      <div key={module.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                              <FileText className="h-4 w-4 text-purple-600" />
                            </div>
                            <h3 className="font-medium text-gray-900 truncate text-sm">{module.name}</h3>
                          </div>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs flex-shrink-0 ml-2">
                            {module.resources?.length || 0} Resources
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Click to manage resources</p>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedModuleForResource({ id: module.id, name: module.name });
                              setShowResourceUpload(true);
                            }}
                            className="flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleModuleSelect(module)}
                            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Module Detail Modal */}
        <Dialog open={showModuleDetail && !!selectedModule} onOpenChange={setShowModuleDetail}>
          <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                      {capitalizeModuleName(selectedModule?.name) || 'Module Details'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">Training module overview and content</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {selectedModule && !isEditMode && selectedModule.isResourceModule && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 text-green-500 hover:text-green-700 hover:bg-green-50"
                        onClick={() => {
                          setSelectedModuleForResource({ id: selectedModule.id, name: selectedModule.name });
                          setShowResourceUpload(true);
                        }}
                        title="Add Resources"
                      >
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditModule(selectedModule)}
                        title="Edit Module"
                      >
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </>
                  )}
                  {selectedModule && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={deletingModuleId === selectedModule.id}
                      onClick={() => {
                        handleCloseModuleDetail();
                        handleDeleteModule(selectedModule.id, capitalizeModuleName(selectedModule.name));
                      }}
                    >
                      {deletingModuleId === selectedModule.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedModule && (
              <div className="space-y-6">
                {isEditMode ? (
                  // Edit Form
                  <div className="space-y-6">
                    {/* Module Name */}
                    <div className="space-y-2">
                      <Label htmlFor="editModuleName" className="text-sm font-medium text-gray-700">
                        Module Name
                      </Label>
                      <Input
                        id="editModuleName"
                        value={editModuleName}
                        onChange={(e) => setEditModuleName(e.target.value)}
                        placeholder="Enter module name"
                        className="w-full"
                      />
                    </div>

                    {/* Video Upload - Only show for non-resource modules */}
                    {selectedModule && !selectedModule.isResourceModule && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Play className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Video Tutorial</h3>
                        </div>
                      
                      {/* Current Video */}
                      {selectedModule.videos?.[0]?.url && !editVideoFile && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">Current video:</p>
                          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg min-h-[200px]">
                            <video 
                              src={getVideoUrl(selectedModule.videos?.[0].url)} 
                              controls 
                              controlsList="nodownload nofullscreen noremoteplayback"
                              disablePictureInPicture
                              className="w-full h-auto"
                              preload="metadata"
                              onError={(e) => {

                                console.error('Video URL:', getVideoUrl(selectedModule.videos?.[0].url));

                                // Show error message
                                const videoElement = e.target as HTMLVideoElement;
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-red-900 text-white p-4';
                                errorDiv.innerHTML = `
                                  <div class="text-center">
                                    <div class="text-2xl mb-2">⚠️</div>
                                    <div class="font-semibold">Video failed to load</div>
                                    <div class="text-sm mt-1">Check console for details</div>
                                    <div class="text-xs mt-2 opacity-75">URL: ${getVideoUrl(selectedModule.videos?.[0].url)}</div>
                                  </div>
                                `;
                                videoElement.parentNode?.appendChild(errorDiv);
                              }}
                              onLoadStart={() => {
                                console.log('Video loading started:', getVideoUrl(selectedModule.videos?.[0].url));
                                // Test if the video URL is accessible
                                fetch(getVideoUrl(selectedModule.videos?.[0].url), { method: 'HEAD' })
                                  .then(response => {

                                    if (!response.ok) {

                                    }
                                  })
                                  .catch(error => {

                                  });
                              }}
                              onCanPlay={() => {
                                console.log('Video can play:', getVideoUrl(selectedModule.videos?.[0].url));
                                // Hide loading placeholder
                                const placeholder = document.getElementById('video-loading-placeholder');
                                if (placeholder) {
                                  placeholder.style.display = 'none';
                                }
                              }}
                              onLoadedMetadata={() => {
                                console.log('Video metadata loaded:', getVideoUrl(selectedModule.videos?.[0].url));
                              }}
                            />
                            {/* Loading placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white" id="video-loading-placeholder">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                <div>Loading video...</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* New Video Upload */}
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          {selectedModule.videos?.[0]?.url ? "Upload new video (optional):" : "Upload video:"}
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            ref={editFileInputRef}
                            onChange={handleEditVideoChange}
                            accept="video/*"
                            className="hidden"
                          />
                          {editVideoPreview ? (
                            <div className="space-y-3">
                              <video 
                                src={editVideoPreview} 
                                controls 
                                controlsList="nodownload nofullscreen noremoteplayback"
                                disablePictureInPicture
                                className="w-full max-w-md mx-auto rounded-lg shadow-md"
                                preload="metadata"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                              />
                              <div className="flex justify-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditVideoFile(null);
                                    setEditVideoPreview("");
                                    setEditVideoDuration(0);
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="cursor-pointer"
                              onClick={() => editFileInputRef.current?.click()}
                            >
                              <div className="p-4 bg-blue-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Play className="h-8 w-8 text-blue-600" />
                              </div>
                              <p className="text-gray-600 mb-2">Click to upload video</p>
                              <p className="text-xs text-gray-500">MP4, WebM, or OGG up to 100MB</p>
                            </div>
                          )}
                        </div>
                        {isCalculatingEditDuration && (
                          <p className="text-sm text-blue-600">Calculating video duration...</p>
                        )}
                        {editVideoDuration > 0 && (
                          <p className="text-sm text-green-600">
                            Duration: {Math.floor(editVideoDuration / 60)}:{(editVideoDuration % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                    )}

                    {/* MCQs Section - Only show for video modules */}
                    {selectedModule && !selectedModule.isResourceModule && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Multiple Choice Questions ({editMcqs.length})
                          </h3>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Assessment
                        </Badge>
                      </div>

                      {/* Current MCQs */}
                      {editMcqs.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">Current questions:</p>
                          {editMcqs.map((mcq, idx) => (
                            <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="p-4">
                                {editingMcqIndex === idx ? (
                                  // Edit mode for existing MCQ
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">Editing Question {idx + 1}</h4>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={handleSaveEditExistingMcq}
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                          <Save className="h-3 w-3 mr-1" />
                                          Save
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={handleCancelEditExistingMcq}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Question</Label>
                                      <Textarea
                                        value={editExistingQuestion}
                                        onChange={(e) => setEditExistingQuestion(e.target.value)}
                                        placeholder="Enter your question"
                                        className="mt-1"
                                        rows={2}
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Options</Label>
                                      <div className="space-y-2 mt-2">
                                        {editExistingOptions.map((option, oidx) => (
                                          <div key={oidx} className="flex items-center space-x-2">
                                            <input
                                              type="radio"
                                              name="editExistingCorrectAnswer"
                                              checked={editExistingCorrectAnswer === oidx}
                                              onChange={() => setEditExistingCorrectAnswer(oidx)}
                                              className="text-blue-600"
                                            />
                                            <Input
                                              value={option}
                                              onChange={(e) => handleEditExistingOptionChange(oidx, e.target.value)}
                                              placeholder={`Option ${oidx + 1}`}
                                              className="flex-1"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEditExistingAddOption}
                                        className="mt-2"
                                      >
                                        Add Option
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  // View mode for existing MCQ
                                  <>
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                                          <span className="text-xs font-semibold text-blue-600">{idx + 1}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900">{mcq.question}</h4>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-blue-500 hover:text-blue-700"
                                          onClick={() => handleEditExistingMcq(idx)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-500 hover:text-red-700"
                                          onClick={() => handleEditRemoveMcq(idx)}
                                        >
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      {mcq.options.map((option, oidx) => (
                                        <div 
                                          key={oidx} 
                                          className={`flex items-center p-2 rounded border ${
                                            option === mcq.answer 
                                              ? 'bg-green-50 border-green-200' 
                                              : 'bg-gray-50 border-gray-200'
                                          }`}
                                        >
                                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                            option === mcq.answer 
                                              ? 'border-green-500 bg-green-500' 
                                              : 'border-gray-300'
                                          }`}>
                                            {option === mcq.answer && (
                                              <Check className="h-2 w-2 text-white" />
                                            )}
                                          </div>
                                          <span className={`text-sm ${
                                            option === mcq.answer ? 'font-medium text-green-800' : 'text-gray-700'
                                          }`}>
                                            {option}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New MCQ */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium mb-3">Add New Question</h4>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Question</Label>
                            <Textarea
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              placeholder="Enter your question"
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Options</Label>
                            <div className="space-y-2 mt-2">
                              {editOptions.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="editCorrectAnswer"
                                    checked={editCorrectAnswer === idx}
                                    onChange={() => setEditCorrectAnswer(idx)}
                                    className="text-blue-600"
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => handleEditOptionChange(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    className="flex-1"
                                  />
                                </div>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEditAddOption}
                              className="mt-2"
                            >
                              Add Option
                            </Button>
                          </div>
                          
                          <Button
                            onClick={handleEditAddMcq}
                            disabled={!editQuestion.trim() || editOptions.some(opt => !opt.trim())}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </div>
                      </div>
                    </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleSaveEdit}
                        disabled={!editModuleName.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Read-only View
                  <>
                    {/* Module Overview - Mobile Optimized */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {selectedModule && selectedModule.isResourceModule ? (
                          <>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Type</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">Resource Module</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Questions</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {selectedModule.mcqs?.length || 0} MCQs
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3 sm:col-span-2 lg:col-span-1">
                              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Company</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                  {selectedCompany?.name || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Duration</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {selectedModule.videos?.[0]?.duration 
                                    ? `${Math.floor(selectedModule.videos?.[0].duration / 60)}:${(selectedModule.videos?.[0].duration % 60).toString().padStart(2, '0')}`
                                    : 'Not specified'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Questions</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {selectedModule.mcqs?.length || 0} MCQs
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3 sm:col-span-2 lg:col-span-1">
                              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Company</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                  {selectedCompany?.name || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Video Section - Only show for non-resource modules */}
                    {selectedModule && !selectedModule.isResourceModule && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Play className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Video Tutorial</h3>
                        </div>
                        
                        {selectedModule.videos?.[0]?.url ? (
                          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                            <video 
                              src={getVideoUrl(selectedModule.videos[0].url)} 
                              controls 
                              className="w-full h-auto max-h-[50vh] sm:max-h-[60vh]"
                              preload="metadata"
                              onError={(e) => {

                                console.error('Video URL:', getVideoUrl(selectedModule.videos[0].url));
                              }}
                              onLoadStart={() => {
                                console.log('Video loading started:', getVideoUrl(selectedModule.videos[0].url));
                              }}
                              onCanPlay={() => {
                                console.log('Video can play:', getVideoUrl(selectedModule.videos[0].url));
                              }}
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-lg p-6 sm:p-8 text-center">
                            <Play className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                            <p className="text-gray-600 font-medium text-sm sm:text-base">No video uploaded</p>
                            <p className="text-xs sm:text-sm text-gray-500">Upload a video to get started</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Module Resources - Only show for resource modules */}
                    {selectedModule && selectedModule.isResourceModule && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Learning Resources</h3>
                        </div>
                        
                        <ModuleResources
                          moduleId={selectedModule.id}
                          onAddResource={(module) => {
                            setSelectedModuleForResource({ id: module.id, name: selectedModule.name });
                            setShowResourceUpload(true);
                          }}
                          onViewResource={(resource) => {
                            // Handle resource viewing if needed

                          }}
                        />
                      </div>
                    )}

                    {/* MCQs Section - Only show for video modules */}
                    {selectedModule && !selectedModule.isResourceModule && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Multiple Choice Questions ({selectedModule?.mcqs?.length || 0})
                          </h3>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm w-fit">
                          Assessment
                        </Badge>
                      </div>
                      
                      {selectedModule.mcqs && selectedModule.mcqs.length > 0 ? (
                        <div className="space-y-6">
                          {selectedModule.mcqs.map((mcq, qidx) => (
                            <div key={qidx} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex-shrink-0">
                                      <span className="text-xs sm:text-sm font-semibold text-blue-600">{qidx + 1}</span>
                                    </div>
                                    <h4 className="text-sm sm:text-lg font-medium text-gray-900 break-words">
                                      {mcq.question}
                                    </h4>
                                  </div>
                                  <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                                    {mcq.options?.length || 0} options
                                  </Badge>
                                </div>
                                
                                {mcq.options && mcq.options.length > 0 && (
                                  <div className="space-y-2 sm:space-y-3">
                                    {mcq.options.map((option, oidx) => (
                                      <div 
                                        key={oidx} 
                                        className={`flex items-center p-3 sm:p-4 rounded-lg border-2 transition-all ${
                                          option === mcq.answer 
                                            ? 'bg-green-50 border-green-300 shadow-sm' 
                                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0 ${
                                          option === mcq.answer 
                                            ? 'border-green-500 bg-green-500' 
                                            : 'border-gray-400'
                                        }`}>
                                          {option === mcq.answer && (
                                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
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
                                            <span className="sm:hidden">Correct</span>
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {mcq.explanation && (
                                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-300">
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
                      ) : (
                        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Questions Added</h4>
                          <p className="text-sm sm:text-base text-gray-600">This module doesn't have any assessment questions yet.</p>
                        </div>
                      )}
                    </div>
                    )}

                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        onClick={handleCloseModuleDetail}
                        className="w-full sm:w-auto text-sm sm:text-base"
                      >
                        Close
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
                        onClick={() => {
                          handleCloseModuleDetail();
                          handleShowAddModule();
                        }}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Add Another Module</span>
                        <span className="sm:hidden">Add Module</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Company Delete Confirmation Dialog */}
        <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Company</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{companyToDelete?.name}</strong>? This action will also delete:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>All training modules for this company</li>
                  <li>All trainees associated with this company</li>
                  <li>All progress data and assessment results</li>
                </ul>
                <p className="mt-3 font-medium text-red-600">This action cannot be undone.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCompany}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteCompanyMutation.isPending}
              >
                {deleteCompanyMutation.isPending ? "Deleting..." : "Delete Company"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Resource Module Dialog */}
        <Dialog open={showResourceModuleDialog} onOpenChange={setShowResourceModuleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Create Resource Module
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Name
                </label>
                <Input
                  placeholder="Enter resource module name..."
                  value={resourceModuleName}
                  onChange={(e) => setResourceModuleName(e.target.value)}
                />
              </div>
              
              {/* Resource Upload Section */}
              <div className="border-2 border-dashed border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Resources</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload documents, PDFs, images, and other learning resources for this module
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setResourceFiles(files);
                        }}
                        className="hidden"
                        id="resource-upload"
                      />
                      <label
                        htmlFor="resource-upload"
                        className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </label>
                    </div>
                    
                    {resourceFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                        <div className="space-y-2">
                          {resourceFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFiles = resourceFiles.filter((_, i) => i !== index);
                                  setResourceFiles(newFiles);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Resource Module</span>
                </div>
                <p className="text-sm text-green-700">
                  This will create a module specifically for documents, PDFs, and other learning resources.
                  You can upload files now or add more later.
                </p>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowResourceModuleDialog(false);
                    setResourceFiles([]);
                    setResourceModuleName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateResourceModuleWithFiles}
                  disabled={!resourceModuleName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Create Module & Upload Files
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
} 