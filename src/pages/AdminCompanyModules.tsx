import React, { useState } from "react";
import Layout from "@/components/Layout";
import CompanyCard from "@/components/CompanyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Upload, Play, FileText, Check, ArrowLeft, X, Clock, Users, Eye, Edit, Save, XIcon, GripVertical } from "lucide-react";
import NewCompanyDialog from "@/components/NewCompanyDialog";
import { 
  useAllCompanies, 
  useCreateCompany, 
  useCompanyModules, 
  useAddModuleToCompany, 
  useAddVideoToModule, 
  useAddMCQsToModule, 
  useDeleteModule,
  useDeleteCompany,
  useUpdateModule
} from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
}

interface SortableModuleProps {
  module: Module;
  index: number;
  onModuleSelect: (module: Module) => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: number, moduleName: string) => void;
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
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group ${
          isDragging ? 'shadow-lg border-blue-400 scale-105 bg-blue-50' : ''
        }`}
        onClick={() => onModuleSelect(module)}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Drag handle and module info */}
          <div className="flex items-center space-x-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </div>
            
            {/* Order number */}
            <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full min-w-[2rem] text-center">
              #{index + 1}
            </span>
            
            {/* Module name */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {capitalizeModuleName(module.name) || `Module ${index + 1}`}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Click to view full details
              </p>
            </div>
          </div>
          
          {/* Right side - Stats and actions */}
          <div className="flex items-center space-x-3">
            {/* Module stats */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs bg-gray-50">
                {module.mcqs?.length || 0} MCQs
              </Badge>
              {module.videos && module.videos.length > 0 && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  <Play className="h-3 w-3 mr-1" />
                  {module.videos.length}
                </Badge>
              )}
              {module.videos?.[0]?.url && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.floor((module.videos?.[0]?.duration || 0) / 60)}:{(module.videos?.[0]?.duration || 0) % 60 < 10 ? '0' : ''}{(module.videos?.[0]?.duration || 0) % 60}
                </Badge>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditModule(module);
                }}
                title="Edit module"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={deletingModuleId === module.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteModule(module.id, capitalizeModuleName(module.name) || `Module ${index + 1}`);
                }}
                title="Delete module"
              >
                {deletingModuleId === module.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Trash className="h-4 w-4" />
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
  const { data: companies = [], isLoading, isError } = useAllCompanies();
  const createCompanyMutation = useCreateCompany();
  const addModuleMutation = useAddModuleToCompany();
  const addVideoMutation = useAddVideoToModule();
  const addMCQsMutation = useAddMCQsToModule();
  const deleteModuleMutation = useDeleteModule();
  const deleteCompanyMutation = useDeleteCompany();
  const updateModuleMutation = useUpdateModule();

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
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
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
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Fetch modules for selected company
  const { data: modules = [], isLoading: modulesLoading, isError: modulesError } = useCompanyModules(selectedCompany?.id || null);

  // Helper function to construct video URL
  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) return "";
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${videoUrl}`;
    console.log('Video URL constructed:', { original: videoUrl, full: fullUrl });
    return fullUrl;
  };

  // Helper function to construct logo URL
  const getLogoUrl = (logoUrl: string) => {
    console.log('getLogoUrl input:', logoUrl);
    if (!logoUrl) {
      console.log('getLogoUrl: No logo URL provided, returning empty string');
      return "";
    }
    if (logoUrl.startsWith('http')) {
      console.log('getLogoUrl: Logo URL is already a full URL, returning as is');
      return logoUrl;
    }
    const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${logoUrl}`;
    console.log('Logo URL constructed:', { original: logoUrl, full: fullUrl });
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

        return arrayMove(items, oldIndex, newIndex);
      });
      setIsReordering(true);
    }
  };

  // Update ordered modules when modules data changes
  React.useEffect(() => {
    if (modules && modules.length > 0 && selectedCompany) {
      // Sort modules by order field from database, then by ID as fallback
      const sortedModules = [...modules].sort((a, b) => {
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
      
      if (!orderedModules || orderedModules.length === 0) {
        toast.error('No modules to reorder');
        return;
      }

      const orderUpdates = orderedModules.map((module, index) => ({
        id: module.id,
        order: index
      }));

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast.error('You are not logged in. Please log in again.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/modules/reorder`, {
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
        // Invalidate and refetch the modules to show the new order
        queryClient.invalidateQueries({ queryKey: ["company-modules", selectedCompany.id] });
      } else {
        toast.error(result.message || 'Failed to update module order');
      }
    } catch (error) {
      console.error('Error updating module order:', error);
      toast.error('Failed to update module order. Please try again.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Handle canceling the order changes
  const handleCancelOrder = () => {
    // Reset to database order
    if (modules && modules.length > 0 && selectedCompany) {
      // Sort modules by order field from database, then by ID as fallback
      const sortedModules = [...modules].sort((a, b) => {
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
      console.error('Invalid module data:', module);
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
      console.error('Failed to delete module:', error);
      
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
        console.log('Video duration detected:', duration);
        
        // Validate duration
        if (duration && isFinite(duration) && duration > 0) {
          setVideoDuration(Math.floor(duration));
          console.log('Setting video duration to:', Math.floor(duration));
        } else {
          console.warn('Invalid video duration:', duration);
          setVideoDuration(0);
        }
        setIsCalculatingDuration(false);
      };
      
      video.onerror = () => {
        console.error('Error loading video metadata');
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
    if (!question.trim() || options.some((opt) => !opt.trim())) return;
    setMcqs([
      ...mcqs,
      { question, options: [...options], answer: options[correctAnswer], explanation: "" },
    ]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  const handleRemoveMcq = (idx) => {
    setMcqs(mcqs.filter((_, i) => i !== idx));
  };

  const handleSaveModule = async () => {
    if (!videoFile || !moduleName.trim() || !selectedCompany) return;
    
    // Validate video duration
    if (!videoDuration || videoDuration <= 0) {
      toast.error("Please wait for video duration to load or try uploading a different video file.");
      return;
    }
    
    try {
      console.log('=== MODULE CREATION DEBUG ===');
      console.log('Creating module for company:', selectedCompany.id, 'with name:', moduleName);
      console.log('Video file:', videoFile);
      console.log('Video duration:', videoDuration);
      console.log('MCQs count:', mcqs.length);
      console.log('MCQs data:', JSON.stringify(mcqs, null, 2));
      
      // 1. Add module to company
      console.log('Step 1: Adding module to company...');
      const moduleRes = await addModuleMutation.mutateAsync({ companyId: selectedCompany.id, name: moduleName });
      console.log('Module creation response:', moduleRes);
      
      const moduleId = moduleRes?.module?.id;
      if (!moduleId) {
        console.error('Module creation failed - no module ID returned:', moduleRes);
        throw new Error(`Failed to create module: ${moduleRes?.message || 'No module ID returned'}`);
      }
      
      console.log('Created module with ID:', moduleId);
      
      // 2. Add video to module
      console.log('Step 2: Adding video to module...');
      await addVideoMutation.mutateAsync({ moduleId, videoFile, duration: videoDuration });
      console.log('Video added successfully');
      
      // 3. Add MCQs to module (optional)
      if (mcqs.length > 0) {
        console.log('Step 3: Adding MCQs to module...');
        console.log('Sending MCQs data:', JSON.stringify(mcqs, null, 2));
        await addMCQsMutation.mutateAsync({ moduleId, mcqs });
        console.log('MCQs added successfully');
        toast.success("Module, video, and MCQs added successfully!");
      } else {
        console.log('Step 3: No MCQs to add');
        toast.success("Module and video added successfully! (No MCQs added)");
      }
      
      setShowAddModule(false);
      setVideoFile(null);
      setVideoPreview("");
      setMcqs([]);
      setModuleName("");
      setVideoDuration(0);
    } catch (error) {
      console.error('=== MODULE CREATION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add module, video, or MCQs: ${errorMessage}`);
    }
  };

  const handleAddCompany = async (companyName, logoUrl) => {
    try {
      const formData = new FormData();
      formData.append('name', companyName);
      if (logoUrl) {
        formData.append('logo', logoUrl);
      }
      await createCompanyMutation.mutateAsync(formData);
      toast.success("Company created successfully!");
      setShowNewCompany(false);
    } catch (error) {
      console.error('Failed to create company:', error);
      toast.error("Failed to create company. Please try again.");
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    try {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      toast.success(`Company "${companyToDelete.name}" deleted successfully`);
      setCompanyToDelete(null);
      setSelectedCompany(null);
    } catch (error) {
      console.error('Delete company error:', error);
      
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
    console.log('=== HANDLE EDIT MODULE DEBUG ===');
    console.log('Module data:', module);
    console.log('Module MCQs:', module.mcqs);
    console.log('Module MCQs type:', typeof module.mcqs);
    console.log('Module MCQs is array:', Array.isArray(module.mcqs));
    console.log('Module MCQs length:', module.mcqs?.length);
    
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
      console.log('=== SAVE EDIT DEBUG ===');
      console.log('Module ID:', selectedModule.id);
      console.log('New module name:', editModuleName);
      console.log('Edit MCQs:', editMcqs);
      console.log('Edit MCQs length:', editMcqs.length);
      console.log('Has new video:', !!editVideoFile);
      
      // Validate MCQs before sending
      console.log('Validating MCQs...');
      const validatedMCQs = validateMCQs([...editMcqs]); // Create a copy to avoid mutating original
      console.log('MCQs validation passed:', validatedMCQs);
      
      // Update module name
      console.log('Step 1: Updating module name...');
      await updateModuleMutation.mutateAsync({ 
        id: selectedModule.id, 
        name: editModuleName 
      });
      console.log('Module name updated successfully');
      
      // If new video is uploaded, update video
      if (editVideoFile) {
        console.log('Step 2: Updating video...');
        await addVideoMutation.mutateAsync({ 
          moduleId: selectedModule.id, 
          videoFile: editVideoFile, 
          duration: editVideoDuration 
        });
        console.log('Video updated successfully');
      }
      
      // Always update MCQs (this will replace existing ones with current editMcqs)
      console.log('Step 3: Updating MCQs...');
      console.log('Updating MCQs with:', validatedMCQs);
      console.log('Validated MCQs stringified:', JSON.stringify(validatedMCQs));
      console.log('Validated MCQs length before sending:', validatedMCQs.length);
      
      await addMCQsMutation.mutateAsync({ 
        moduleId: selectedModule.id, 
        mcqs: validatedMCQs 
      });
      console.log('MCQs updated successfully');
      
      toast.success("Module updated successfully");
      handleCancelEdit();
      setShowModuleDetail(false);
    } catch (error) {
      console.error('=== UPDATE MODULE ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Training Modules</h1>
          <p className="text-gray-600">Manage training content and assessments for your companies</p>
        </div>
        
        {!selectedCompany ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Select a Company</h2>
                <p className="text-gray-600 mt-1">Choose a company to manage their training modules</p>
              </div>
              <Button onClick={() => setShowNewCompany(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Company
              </Button>
            </div>
            <NewCompanyDialog
              open={showNewCompany}
              onOpenChange={setShowNewCompany}
              onAddCompany={handleAddCompany}
            />
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading companies...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-red-600 font-medium">Failed to load companies.</p>
                <p className="text-gray-500 text-sm mt-1">Please try refreshing the page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    id={company.id}
                    name={company.name}
                    logoUrl={getLogoUrl(company.logo || "")}
                    contactCount={0}
                    onClick={() => handleCompanySelect(company)}
                    onDelete={(id) => setCompanyToDelete(companies.find(c => c.id === id))}
                    showDeleteButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCompany(null)} 
                className="mb-4 text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">{selectedCompany.name}</h2>
                  <p className="text-gray-600">Training modules and assessments</p>
                </div>
                <Button 
                  onClick={handleShowAddModule}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> 
                  Add Training Module
                </Button>
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
                  
                  {/* MCQ Section */}
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
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={handleAddMcq}
                          disabled={!question.trim() || options.some(opt => !opt.trim())}
                          className="bg-green-600 hover:bg-green-700"
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
                  
                  {/* List of MCQs to be added */}
                  {mcqs.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        MCQs to be added ({mcqs.length})
                      </h4>
                      <div className="space-y-2">
                        {mcqs.map((mcq, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{mcq.question}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Correct: {mcq.answer} • {mcq.options.length} options
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveMcq(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <Button 
                      onClick={handleSaveModule} 
                      disabled={!videoFile || !moduleName.trim() || isCalculatingDuration || !videoDuration || videoDuration <= 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isCalculatingDuration ? 'Calculating Duration...' : 'Save Module'}
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">Modules</h3>
                      {isReordering && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Order Changed
                        </Badge>
                      )}
                    </div>
                    {!isReordering ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsReordering(true)}
                        className="flex items-center space-x-2"
                      >
                        <GripVertical className="h-4 w-4" />
                        <span>Reorder Modules</span>
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveOrder}
                          disabled={isSavingOrder}
                          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        >
                          {isSavingOrder ? 'Saving...' : 'Save Order'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelOrder}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {isReordering ? (
                    <>
                      {/* Drag and Drop Instructions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <GripVertical className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Drag & Drop to Reorder</h4>
                            <p className="text-sm text-blue-700">
                              Use the grip handle (⋮⋮) on the left of each module to drag and reorder them. 
                              The order will determine how modules appear to trainees. 
                              Click "Save Order" when you're satisfied with the new arrangement.
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
                      items={orderedModules.map(module => module.id)}
                      strategy={verticalListSortingStrategy}
                    >
                                           <div className="space-y-1">
                       {orderedModules.map((mod, idx) => (
                         <div key={mod.id}>
                           <SortableModule
                             module={mod}
                             index={idx}
                             onModuleSelect={handleModuleSelect}
                             onEditModule={handleEditModule}
                             onDeleteModule={handleDeleteModule}
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
                  <div className="space-y-1">
                    {modules.map((module, index) => (
                      <div key={module.id}>
                        <div 
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group"
                          onClick={() => handleModuleSelect(module)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full min-w-[2rem] text-center">
                                #{index + 1}
                              </span>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {capitalizeModuleName(module.name) || `Module ${index + 1}`}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  Click to view full details
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  {module.mcqs?.length || 0} MCQs
                                </Badge>
                                {module.videos && module.videos.length > 0 && (
                                  <Badge variant="outline" className="text-xs bg-gray-50">
                                    <Play className="h-3 w-3 mr-1" />
                                    {module.videos.length}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditModule(module);
                                  }}
                                  title="Edit module"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteModule(module.id, module.name);
                                  }}
                                  disabled={deletingModuleId === module.id}
                                  title="Delete module"
                                >
                                  {deletingModuleId === module.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                  ) : (
                                    <Trash className="h-4 w-4" />
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
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Module Detail Modal */}
        <Dialog open={showModuleDetail && !!selectedModule} onOpenChange={setShowModuleDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {capitalizeModuleName(selectedModule?.name) || 'Module Details'}
                    </h2>
                    <p className="text-sm text-gray-500">Training module overview and content</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedModule && !isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditModule(selectedModule)}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  )}
                  {selectedModule && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={deletingModuleId === selectedModule.id}
                      onClick={() => {
                        handleCloseModuleDetail();
                        handleDeleteModule(selectedModule.id, capitalizeModuleName(selectedModule.name));
                      }}
                    >
                      {deletingModuleId === selectedModule.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash className="h-5 w-5" />
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

                    {/* Video Upload */}
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
                          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                            <video 
                              src={getVideoUrl(selectedModule.videos?.[0].url)} 
                              controls 
                              controlsList="nodownload nofullscreen noremoteplayback"
                              disablePictureInPicture
                              className="w-full h-auto"
                              preload="metadata"
                            />
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

                    {/* MCQs Section */}
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
                    {/* Module Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">
                              {selectedModule.videos?.[0]?.duration 
                                ? `${Math.floor(selectedModule.videos?.[0].duration / 60)}:${(selectedModule.videos?.[0].duration % 60).toString().padStart(2, '0')}`
                                : 'Not specified'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Questions</p>
                            <p className="font-semibold text-gray-900">
                              {selectedModule.mcqs?.length || 0} MCQs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Company</p>
                            <p className="font-semibold text-gray-900">
                              {selectedCompany?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Video Section */}
                    {selectedModule.videos?.[0]?.url && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Play className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Video Tutorial</h3>
                        </div>
                        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                          <video 
                            src={getVideoUrl(selectedModule.videos?.[0].url)} 
                            controls 
                            className="w-full h-auto"
                            preload="metadata"
                            onError={(e) => {
                              console.error('Modal video loading error:', e);
                              console.error('Modal video URL:', getVideoUrl(selectedModule.videos?.[0].url));
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* MCQs Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Multiple Choice Questions ({selectedModule.mcqs?.length || 0})
                          </h3>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Assessment
                        </Badge>
                      </div>
                      
                      {selectedModule.mcqs && selectedModule.mcqs.length > 0 ? (
                        <div className="space-y-6">
                          {selectedModule.mcqs.map((mcq, qidx) => (
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
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No Questions Added</h4>
                          <p className="text-gray-600">This module doesn't have any assessment questions yet.</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        onClick={handleCloseModuleDetail}
                      >
                        Close
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          handleCloseModuleDetail();
                          handleShowAddModule();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Module
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
      </div>
    </Layout>
  );
} 