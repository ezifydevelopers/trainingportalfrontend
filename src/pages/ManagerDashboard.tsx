import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Edit, File, Building2, ArrowRight, Play, FileText, Check, X, Clock, Eye, Save, XIcon, GripVertical, Video, Image, Music, Plus, Trash, Upload, Trophy, Upload as UploadIcon } from "lucide-react";
import EditCompanyDialog from "@/components/EditCompanyDialog";
import ResourceUploadDialog from "@/components/ResourceUploadDialog";
import ResourceViewer from "@/components/ResourceViewer";
import ModuleResources from "@/components/ModuleResources";
import { 
  useGetManagerCompanies,
  useUpdateCompany,
  useCompanyModules,
  useAddModuleToCompany,
  useAddVideoToModule,
  useAddMCQsToModule,
  useDeleteModule,
  useUpdateModule,
  useAddResource,
  useGetModuleResources,
  useDeleteResource,
  useTraineeProgress,
  useAllTrainees
} from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Simple interface for company data
interface Company {
  id: number;
  name: string;
  logo?: string;
}

// Module interface
interface Module {
  id: number;
  name: string;
  order?: number;
  description?: string;
  isResourceModule?: boolean;
  resources?: Array<{
    id: number;
    filename: string;
    originalName: string;
    type: 'VIDEO' | 'PDF' | 'DOCUMENT' | 'IMAGE' | 'AUDIO';
    duration?: number;
    estimatedReadingTime?: number;
    filePath: string;
    moduleId: number;
    createdAt: string;
    updatedAt: string;
  }>;
  mcqs?: Array<{
    id: number;
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>;
  videos?: Array<{
    id: number;
    url: string;
    duration: number;
  }>;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showResourceModule, setShowResourceModule] = useState(false);
  const [showResourceUpload, setShowResourceUpload] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleDeleteDialog, setShowModuleDeleteDialog] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<{ id: number; name: string } | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showEditModule, setShowEditModule] = useState(false);
  const [showResourceModuleDialog, setShowResourceModuleDialog] = useState(false);
  const [showResourceUploadDialog, setShowResourceUploadDialog] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [showVideoModuleDialog, setShowVideoModuleDialog] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  // Get only assigned companies for manager
  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useGetManagerCompanies(user?.id || 0);
  const { data: modulesData, isLoading: modulesLoading } = useCompanyModules(selectedCompany?.id || 0);
  const { data: traineesData, isLoading: traineesLoading } = useAllTrainees();
  
  // Extract companies from the manager-specific response
  const companies = companiesData?.companies?.map((assignment: { company: Company }) => assignment.company) || [];
  const modules: Module[] = modulesData || [];

  // Refresh selectedModule when modules data changes
  useEffect(() => {
    if (selectedModule && modules.length > 0) {
      const updatedModule = modules.find(m => m.id === selectedModule.id);
      if (updatedModule) {
        setSelectedModule(updatedModule);
      }
    }
  }, [modules, selectedModule]);
  const trainees = traineesData || [];

  // Helper function to construct video URL
  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) return "";
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    // Remove /api from the base URL for file uploads
    const baseUrl = getApiBaseUrl().replace('/api', '');
    return `${baseUrl}/uploads/${videoUrl}`;
  };

  // Helper function to construct image URL
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Remove /api from the base URL for file uploads
    const baseUrl = getApiBaseUrl().replace('/api', '');
    return `${baseUrl}/uploads/${imageUrl}`;
  };

  // Helper function to capitalize module name
  const capitalizeModuleName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Trainee action handlers
  const handleViewTrainee = (traineeId: number) => {
    // Navigate to trainee detail page
    navigate(`/manager/company/${selectedCompany?.id}/trainee/${traineeId}`);
  };

  const handleEditTrainee = (traineeId: number) => {
    // Navigate to trainee edit page or open edit dialog
    toast.info("Edit trainee functionality coming soon!");
  };

  const handleViewProgress = () => {
    // Navigate to progress page
    navigate(`/manager/company/${selectedCompany?.id}/progress`);
  };

  const handleAddTrainee = () => {
    // Redirect to trainee signup page
    window.open('/signup-trainee', '_blank');
  };

  // Debug logging
  if (user?.role === 'MANAGER') {
    console.log('Manager Dashboard Debug:');
    console.log('Companies:', companies);
    console.log('Selected Company:', selectedCompany);
    console.log('Modules Data:', modulesData);
    console.log('Modules:', modules);
    console.log('Trainees Data:', traineesData);
    console.log('Trainees:', trainees);
    console.log('Modules Loading:', modulesLoading);
    console.log('Trainees Loading:', traineesLoading);
  }

  // Filter companies based on search term
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
  };

  const updateCompanyMutation = useUpdateCompany();
  const addModuleMutation = useAddModuleToCompany();
  const addVideoMutation = useAddVideoToModule();
  const addMCQsMutation = useAddMCQsToModule();
  const deleteModuleMutation = useDeleteModule();
  const updateModuleMutation = useUpdateModule();
  const addResourceMutation = useAddResource();
  const deleteResourceMutation = useDeleteResource();


  const handleUpdateCompanySubmit = async (companyName: string, logoFile: File | null) => {
    try {
      const formData = new FormData();
      formData.append('name', companyName);
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      await updateCompanyMutation.mutateAsync({ id: editingCompany!.id, data: formData });
      setEditingCompany(null);
      toast.success("Company updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    } catch (error) {
      toast.error("Failed to update company");
    }
  };


  const handleAddModule = () => {
    setShowVideoModuleDialog(true);
  };

  const handleAddResourceModule = () => {
    setShowResourceModuleDialog(true);
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setShowModuleDetail(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setShowEditModule(true);
  };

  const handleDeleteModule = (moduleId: number, moduleName: string) => {
    setModuleToDelete({ id: moduleId, name: moduleName });
    setShowModuleDeleteDialog(true);
  };

  const handleAddModuleSubmit = async (moduleData: { name: string; description?: string }) => {
    try {
      await addModuleMutation.mutateAsync({
        companyId: selectedCompany!.id,
        ...moduleData
      });
      setShowAddModule(false);
      toast.success("Module added successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to add module");
    }
  };

  const handleAddResourceModuleSubmit = async (moduleData: { name: string; description?: string }) => {
    try {
      await addModuleMutation.mutateAsync({
        companyId: selectedCompany!.id,
        ...moduleData
      });
      setShowResourceModuleDialog(false);
      setShowResourceUploadDialog(true);
      toast.success("Resource module created successfully! You can now add resources.");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to add resource module");
    }
  };

  const handleAddVideoSubmit = async (resourceFile: File, type: string, duration?: number, estimatedReadingTime?: number) => {
    try {
      const formData = new FormData();
      formData.append('video', resourceFile);
      formData.append('duration', (duration || 0).toString());
      await addVideoMutation.mutateAsync({
        moduleId: selectedModule!.id,
        videoFile: resourceFile,
        duration: duration || 0
      });
      setShowResourceUpload(false);
      toast.success("Video added successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to add video");
    }
  };

  // Video module creation functions
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
        setVideoDuration(video.duration);
        setIsCalculatingDuration(false);
      };
      video.src = url;
    }
  };

  const handleBoxClick = () => {
    const input = document.getElementById('video-upload') as HTMLInputElement;
    input?.click();
  };

  const addMCQ = () => {
    if (question.trim() && options.every(opt => opt.trim())) {
      const filteredOptions = options.filter(opt => opt.trim());
      const newMCQ = {
        question: question.trim(),
        options: filteredOptions,
        answer: filteredOptions[correctAnswer],
        explanation: ""
      };
      setMcqs([...mcqs, newMCQ]);
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
    }
  };

  const removeMCQ = (index: number) => {
    setMcqs(mcqs.filter((_, i) => i !== index));
  };

  const handleCreateVideoModule = async () => {
    if (!moduleName.trim() || !videoFile) {
      toast.error("Please provide module name and video file");
      return;
    }

    try {
      // First create the module
      const moduleData = await addModuleMutation.mutateAsync({
        companyId: selectedCompany!.id,
        name: moduleName.trim(),
        description: ""
      });

      // Then add video
      await addVideoMutation.mutateAsync({
        moduleId: moduleData.id,
        videoFile: videoFile,
        duration: videoDuration
      });

      // Then add MCQs if any
      if (mcqs.length > 0) {
        console.log('Adding MCQs to module:', moduleData.id, mcqs);
        await addMCQsMutation.mutateAsync({
          moduleId: moduleData.id,
          mcqs: mcqs
        });
        console.log('MCQs added successfully');
        
        // Update selectedModule with the new MCQs if it's the same module
        if (selectedModule && selectedModule.id === moduleData.id) {
          setSelectedModule({
            ...selectedModule,
            mcqs: mcqs
          });
        }
      } else {
        console.log('No MCQs to add');
      }

      // Reset form
      setModuleName("");
      setVideoFile(null);
      setVideoPreview("");
      setVideoDuration(0);
      setMcqs([]);
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
      setShowVideoModuleDialog(false);

      toast.success("Video module created successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to create video module");
    }
  };

  const handleAddMCQsSubmit = async (mcqsData: { mcqs: { question: string; options: string[]; answer: string; explanation?: string; }[] }) => {
    try {
      await addMCQsMutation.mutateAsync({
        moduleId: selectedModule!.id,
        mcqs: mcqsData.mcqs
      });
      setShowAddModule(false);
      toast.success("MCQs added successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to add MCQs");
    }
  };

  const handleDeleteModuleConfirm = async () => {
    try {
      setDeletingModuleId(moduleToDelete!.id);
      await deleteModuleMutation.mutateAsync(moduleToDelete!.id);
      setShowModuleDeleteDialog(false);
      setModuleToDelete(null);
      setDeletingModuleId(null);
      toast.success("Module deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      setDeletingModuleId(null);
      toast.error("Failed to delete module");
    }
  };

  const handleUpdateModuleSubmit = async (moduleData: { name: string; description?: string }) => {
    try {
      await updateModuleMutation.mutateAsync({
        id: editingModule!.id,
        ...moduleData
      });
      setShowEditModule(false);
      setEditingModule(null);
      toast.success("Module updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to update module");
    }
  };

  const handleAddResourceSubmit = async (resourceFile: File, type: string, duration?: number, estimatedReadingTime?: number) => {
    try {
      const formData = new FormData();
      formData.append('resource', resourceFile);
      formData.append('type', type);
      formData.append('duration', (duration || 0).toString());
      formData.append('estimatedReadingTime', (estimatedReadingTime || 0).toString());
      await addResourceMutation.mutateAsync({
        moduleId: selectedModule!.id,
        resourceFile: resourceFile,
        type: type,
        duration: duration || 0,
        estimatedReadingTime: estimatedReadingTime || 0
      });
      setShowResourceUploadDialog(false);
      toast.success("Resource added successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to add resource");
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    try {
      await deleteResourceMutation.mutateAsync(resourceId);
      toast.success("Resource deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['company-modules', selectedCompany!.id] });
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  if (companiesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
                <p className="text-blue-100 text-lg">Manage your assigned companies and their training modules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Selection Section */}
        <Card className="bg-white shadow-xl border-0 rounded-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Select Company</CardTitle>
            <p className="text-gray-600 text-lg">Choose a company to manage its training modules</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="mb-6">
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>

            {/* Companies Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                  onClick={() => handleViewCompany(company)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
                      {company.logo ? (
                        <img 
                          src={getImageUrl(company.logo)} 
                          alt={company.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Logo loading error:', e);
                            console.error('Logo URL:', getImageUrl(company.logo));
                            console.error('Original URL:', company.logo);
                            // Hide the broken image and show fallback
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl ${company.logo ? 'hidden' : ''}`}>
                        {company.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCompany(company);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-10 w-10 p-0 hover:bg-blue-200"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 break-words">
                    {company.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manage</span>
                    <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              ))}
            </div>

            {filteredCompanies.length === 0 && companies.length > 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-600">Try adjusting your search terms.</p>
              </div>
            )}

            {companies.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies assigned</h3>
                <p className="text-gray-600">Contact your administrator to get assigned to companies.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Company Details */}
        {selectedCompany && (
          <Card className="bg-white shadow-xl border-0 rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {selectedCompany.name} - Management Dashboard
                    </CardTitle>
                    <p className="text-gray-600 mt-1">Manage training modules and trainees</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCompany(null)}
                    className="px-6 py-3 rounded-xl font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Tabs defaultValue="modules" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="modules" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Modules</span>
                  </TabsTrigger>
                  <TabsTrigger value="trainees" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Company Trainees</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="modules" className="space-y-6">
                  {modulesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading modules...</p>
                    </div>
                  ) : (
                    <>
                  {/* Module Management Header */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Module Management</h3>
                          <p className="text-gray-600">Add and organize training modules</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleAddModule}
                          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Training Module
                        </Button>
                        <Button
                          onClick={handleAddResourceModule}
                          variant="outline"
                          className="px-6 py-3 rounded-xl font-semibold border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <File className="h-4 w-4 mr-2" />
                          Add Resource Module
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Modules List */}
                  {modules.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                      <p className="text-gray-600">Add your first training module to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modules.map((module, index) => (
                        <div key={module.id}>
                        <div
                            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-300 group transform hover:-translate-y-1"
                          onClick={() => handleModuleSelect(module)}
                        >
                            <div className="flex items-center justify-between">
                              {/* Left side - Module info */}
                              <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <span className="text-lg font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded-full min-w-[3rem] text-center flex-shrink-0">
                                  #{index + 1}
                                </span>
                              <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg mb-1 truncate" title={module.name}>
                                  {module.name}
                                </h3>
                                  <p className="text-sm text-gray-500">
                                    Click to view full details
                                  </p>
                                </div>
                              </div>
                              
                              {/* Right side - Stats and actions */}
                              <div className="flex items-center space-x-4 flex-shrink-0">
                                {/* Module stats */}
                                <div className="flex items-center space-x-2">
                                  {module.isResourceModule ? (
                                    <>
                                      <Badge variant="outline" className="text-sm bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {module.resources?.length || 0} Resources
                                    </Badge>
                                  {module.mcqs && module.mcqs.length > 0 && (
                                        <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                                          {module.mcqs.length} MCQs
                                    </Badge>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                                        {module.mcqs?.length || 0} MCQs
                                      </Badge>
                                      {module.videos && module.videos.length > 0 && (
                                        <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200 px-3 py-1">
                                          <Play className="h-3 w-3 mr-1" />
                                          {module.videos.length} Videos
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {module.isResourceModule && (
                              <Button
                                variant="ghost"
                                size="sm"
                                      className="h-9 w-9 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedModule(module);
                                        setShowResourceUploadDialog(true);
                                      }}
                                      title="Upload resources"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
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
                                size="sm"
                                    className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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

                  {/* Module Details Modal */}
                  {selectedModule && showModuleDetail && (
                    <Dialog open={showModuleDetail} onOpenChange={setShowModuleDetail}>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
                            {selectedModule.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Module Stats */}
                          <div className="flex items-center space-x-4">
                            {selectedModule.videos && selectedModule.videos.length > 0 && (
                              <span className="text-sm text-gray-500 flex items-center">
                                <Play className="h-4 w-4 mr-1" />
                                {selectedModule.videos.length} Video{selectedModule.videos.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {selectedModule.mcqs && selectedModule.mcqs.length > 0 && (
                              <span className="text-sm text-gray-500 flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {selectedModule.mcqs.length} MCQ{selectedModule.mcqs.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {selectedModule.resources && selectedModule.resources.length > 0 && (
                              <span className="text-sm text-gray-500 flex items-center">
                                <File className="h-4 w-4 mr-1" />
                                {selectedModule.resources.length} Resource{selectedModule.resources.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                        {/* Video Section - Only show for non-resource modules */}
                        {!selectedModule.isResourceModule && selectedModule.videos && selectedModule.videos.length > 0 && (
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Play className="h-5 w-5 text-blue-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">Video Tutorial</h4>
                            </div>
                            
                            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                              <video 
                                src={getVideoUrl(selectedModule.videos[0].url)} 
                                controls 
                                className="w-full h-auto"
                                preload="metadata"
                                onLoadStart={() => {
                                  console.log('Video loading started:', getVideoUrl(selectedModule.videos[0].url));
                                }}
                                onCanPlay={() => {
                                  console.log('Video can play:', getVideoUrl(selectedModule.videos[0].url));
                                }}
                                onError={(e) => {
                                  console.error('Video loading error:', e);
                                  console.error('Video URL:', getVideoUrl(selectedModule.videos[0].url));
                                  console.error('Original URL:', selectedModule.videos[0].url);
                                }}
                              >
                                <div className="flex items-center justify-center h-64 text-white">
                                  <div className="text-center">
                                    <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Video not available</p>
                                    <p className="text-xs opacity-75 mt-1">Check console for details</p>
                                  </div>
                                </div>
                              </video>
                            </div>
                          </div>
                        )}

                        {/* Resources Section - Only show for resource modules */}
                        {selectedModule.isResourceModule && selectedModule.resources && selectedModule.resources.length > 0 && (
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <File className="h-5 w-5 text-purple-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">Resources</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {selectedModule.resources.map((resource) => (
                                <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                      <File className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {resource.originalName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {resource.type} • {resource.duration ? `${Math.floor(resource.duration / 60)}:${(resource.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* MCQs Section */}
                        {selectedModule.mcqs && selectedModule.mcqs.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="h-5 w-5 text-green-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">Quiz Questions</h4>
                            </div>
                            
                            <div className="space-y-4">
                              {selectedModule.mcqs.map((mcq, index) => (
                                <div key={mcq.id || index} className="border border-gray-200 rounded-lg p-4">
                                  <p className="text-sm font-medium text-gray-900 mb-3">
                                    {index + 1}. {mcq.question}
                                  </p>
                                  <div className="space-y-2">
                                    {mcq.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex items-center space-x-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                          option === mcq.answer 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-300'
                                        }`}>
                                          {option === mcq.answer && (
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                          )}
                                        </div>
                                        <span className={`text-sm ${
                                          option === mcq.answer 
                                            ? 'text-green-700 font-medium' 
                                            : 'text-gray-700'
                                        }`}>
                                          {option}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {mcq.explanation && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                      <p className="text-xs font-medium text-blue-900 mb-1">Explanation:</p>
                                      <p className="text-xs text-blue-800">{mcq.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No content message */}
                        {(!selectedModule.videos || selectedModule.videos.length === 0) && 
                         (!selectedModule.resources || selectedModule.resources.length === 0) && 
                         (!selectedModule.mcqs || selectedModule.mcqs.length === 0) && (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h4>
                            <p className="text-gray-600">This module doesn't have any videos, resources, or quiz questions yet.</p>
                          </div>
                        )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="trainees" className="space-y-6">
                  {/* Trainees Section */}
                  <div className="mt-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Company Trainees</h3>
                            <p className="text-gray-600">Manage trainees for {selectedCompany.name}</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleAddTrainee}
                          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Trainee
                        </Button>
                      </div>

                      {/* Stats Cards */}
                      {!traineesLoading && trainees.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-600">Total Trainees</p>
                                <p className="text-2xl font-bold text-blue-900">{trainees.length}</p>
                              </div>
                              <Users className="h-8 w-8 text-blue-500" />
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-600">Verified</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {trainees.filter((t: { isVerified?: boolean }) => t.isVerified).length}
                                </p>
                              </div>
                              <Check className="h-8 w-8 text-green-500" />
                            </div>
                          </div>
                          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-orange-600">Pending</p>
                                <p className="text-2xl font-bold text-orange-900">
                                  {trainees.filter((t: { isVerified?: boolean }) => !t.isVerified).length}
                                </p>
                              </div>
                              <Clock className="h-8 w-8 text-orange-500" />
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                                <p className="text-2xl font-bold text-purple-900">85%</p>
                              </div>
                              <Trophy className="h-8 w-8 text-purple-500" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Search and Actions */}
                      {!traineesLoading && trainees.length > 0 && (
                        <div className="flex items-center justify-between mb-6">
                          <div className="relative flex-1 max-w-md">
                            <input
                              type="text"
                              placeholder="Search trainees..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              className="px-4 py-2 rounded-lg"
                              onClick={handleViewProgress}
                            >
                              <Trophy className="h-4 w-4 mr-2" />
                              View Progress
                            </Button>
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                              onClick={handleAddTrainee}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Trainee
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Trainees List */}
                      {traineesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                          <p className="text-gray-600 mt-4">Loading trainees...</p>
                        </div>
                      ) : trainees.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No trainees found</h3>
                          <p className="text-gray-600 mb-6">No trainees are registered for this company yet.</p>
                          <Button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold">
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Trainee
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {trainees.map((trainee: { id?: number; name?: string; email?: string; isVerified?: boolean }, index: number) => (
                            <div
                              key={trainee.id || index}
                              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {trainee.name?.charAt(0) || '?'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                      <h4 className="font-semibold text-gray-900 text-lg">{trainee.name || 'Unknown Trainee'}</h4>
                                      <Badge className={trainee.isVerified ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"}>
                                        <Check className="h-3 w-3 mr-1" />
                                        {trainee.isVerified ? "Verified" : "Pending"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 flex items-center">
                                      <Users className="h-4 w-4 mr-1" />
                                      {trainee.email || 'No email'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 border-blue-200"
                                    onClick={() => handleViewTrainee(trainee.id || 0)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 border-gray-200"
                                    onClick={() => handleEditTrainee(trainee.id || 0)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}

        {editingCompany && (
          <EditCompanyDialog
            open={!!editingCompany}
            onOpenChange={(open) => !open && setEditingCompany(null)}
            company={editingCompany}
            onUpdateCompany={(companyId, companyName, logoFile) => handleUpdateCompanySubmit(companyName, logoFile)}
          />
        )}

        {/* Add Module Dialog */}
        {showAddModule && selectedModule && (
          <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add MCQs to {selectedModule.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="mcqs">MCQ Questions (JSON format)</Label>
                <Textarea
                  id="mcqs"
                  placeholder='[{"question": "What is...?", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "Because..."}]'
                  rows={10}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddModule(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleAddMCQsSubmit({ mcqs: [] })}>
                    Add MCQs
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Resource Upload Dialog */}
        {showResourceUpload && selectedModule && (
          <ResourceUploadDialog
            open={showResourceUpload}
            onOpenChange={setShowResourceUpload}
            onUploadResource={handleAddVideoSubmit}
            moduleName={selectedModule.name}
          />
        )}

        {/* Resource Upload Dialog for Resources */}
        {showResourceUploadDialog && selectedModule && (
          <ResourceUploadDialog
            open={showResourceUploadDialog}
            onOpenChange={setShowResourceUploadDialog}
            onUploadResource={handleAddResourceSubmit}
            moduleName={selectedModule.name}
          />
        )}

        {/* Resource Module Dialog */}
        {showResourceModuleDialog && selectedCompany && (
          <Dialog open={showResourceModuleDialog} onOpenChange={setShowResourceModuleDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Resource Module</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="moduleName">Module Name</Label>
                  <Input
                    id="moduleName"
                    placeholder="Enter module name"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowResourceModuleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleAddResourceModuleSubmit({ name: '', description: '' })}>
                    Create Module
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}


        {/* Delete Module Dialog */}
        <AlertDialog open={showModuleDeleteDialog} onOpenChange={setShowModuleDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Module</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{moduleToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteModuleConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Video Module Creation Dialog */}
        {showVideoModuleDialog && selectedCompany && (
          <Dialog open={showVideoModuleDialog} onOpenChange={setShowVideoModuleDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Create Video Module
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Module Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Module Name</label>
                  <Input
                    type="text"
                    placeholder="Enter module name..."
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                  />
                </div>
                
                {/* Video Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Upload Video Tutorial</label>
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition group bg-gray-50 hover:bg-blue-50"
                    onClick={handleBoxClick}
                  >
                    <UploadIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-500 mb-3" />
                    <span className="text-gray-600 group-hover:text-blue-600 font-medium text-lg">Click to upload video</span>
                    <span className="text-sm text-gray-400 mt-2">MP4, WebM, or Ogg (max 100MB)</span>
                    <Input
                      id="video-upload"
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
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Multiple Choice Questions (Optional)
                  </h4>
                  <p className="text-sm text-gray-600">
                    You can add assessment questions to test trainees' understanding. This is optional - modules can be created with just video content.
                  </p>
                  
                  {/* Add MCQ Form */}
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question</label>
                        <Input
                          type="text"
                          placeholder="Enter your question here..."
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {options.map((option, index) => (
                          <div key={index}>
                            <label className="block text-xs font-medium mb-1">Option {String.fromCharCode(65 + index)}</label>
                            <Input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index] = e.target.value;
                                setOptions(newOptions);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Correct Answer</label>
                        <select
                          value={correctAnswer}
                          onChange={(e) => setCorrectAnswer(Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          {options.map((_, index) => (
                            <option key={index} value={index}>
                              Option {String.fromCharCode(65 + index)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        onClick={addMCQ}
                        className="w-full"
                        disabled={!question.trim() || !options.every(opt => opt.trim())}
                      >
                        Add Question
                      </Button>
                    </div>
                  </div>

                  {/* MCQ List */}
                  {mcqs.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Added Questions ({mcqs.length})</h5>
                      {mcqs.map((mcq, index) => (
                        <div key={index} className="bg-white border rounded-lg p-3 flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{mcq.question}</p>
                            <p className="text-xs text-gray-500 mt-1">Correct: {mcq.answer}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMCQ(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowVideoModuleDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVideoModule}
                    disabled={!moduleName.trim() || !videoFile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Video Module
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default ManagerDashboard;