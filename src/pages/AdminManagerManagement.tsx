import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash, 
  Users, 
  Building, 
  UserPlus,
  Settings,
  X
} from "lucide-react";
import { 
  useGetManagers, 
  useCreateManager, 
  useUpdateManager, 
  useDeleteManager,
  useGetManagerCompanies,
  useAssignCompanyToManager,
  useUnassignCompanyFromManager
} from "@/hooks/useApi";
import { useAllCompanies } from "@/hooks/useApi";
import { toast } from "sonner";
import type { Manager, Company } from "@/lib/api";
import { HOCPresets } from "@/components/HOCComposer";


interface AdminManagerManagementProps {
  user?: any;
  isAuthenticated?: boolean;
}

const AdminManagerManagement = ({ user, isAuthenticated }: AdminManagerManagementProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  
  // Form states
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  // API hooks
  const { data: managersData, isLoading: managersLoading } = useGetManagers();
  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useAllCompanies();
  const createManagerMutation = useCreateManager();
  const updateManagerMutation = useUpdateManager();
  const deleteManagerMutation = useDeleteManager();
  const assignCompanyMutation = useAssignCompanyToManager();
  const unassignCompanyMutation = useUnassignCompanyFromManager();

  const managers = managersData?.managers || [];
  const companies = companiesData?.companies || [];

  // Debug logging
  const handleCreateManager = async () => {
    if (!managerName || !managerEmail || !managerPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const result = await createManagerMutation.mutateAsync({
        name: managerName,
        email: managerEmail,
        password: managerPassword
      });
      toast.success("Manager created successfully!");
      setShowCreateDialog(false);
      setManagerName("");
      setManagerEmail("");
      setManagerPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create manager");
    }
  };

  const handleEditManager = async () => {
    if (!editingManager || !managerName || !managerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateManagerMutation.mutateAsync({
        id: editingManager.id,
        data: {
          name: managerName,
          email: managerEmail,
          ...(managerPassword && { password: managerPassword })
        }
      });
      
      toast.success("Manager updated successfully!");
      setShowEditDialog(false);
      setEditingManager(null);
      setManagerName("");
      setManagerEmail("");
      setManagerPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update manager");
    }
  };

  const handleDeleteManager = async (manager: Manager) => {
    if (!confirm(`Are you sure you want to delete manager "${manager.name}"?`)) {
      return;
    }

    try {
      await deleteManagerMutation.mutateAsync(manager.id);
      toast.success("Manager deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete manager");
    }
  };

  const handleAssignCompany = async () => {
    if (!selectedManager || !selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }

    try {
      await assignCompanyMutation.mutateAsync({
        managerId: selectedManager.id,
        companyId: selectedCompanyId
      });
      
      toast.success("Company assigned to manager successfully!");
      setShowAssignDialog(false);
      setSelectedCompanyId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to assign company");
    }
  };

  const handleUnassignCompany = async (managerId: number, companyId: number) => {
    if (!confirm("Are you sure you want to unassign this company from the manager?")) {
      return;
    }

    try {
      await unassignCompanyMutation.mutateAsync({
        managerId,
        companyId
      });
      
      toast.success("Company unassigned from manager successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to unassign company");
    }
  };

  const openEditDialog = (manager: Manager) => {
    setEditingManager(manager);
    setManagerName(manager.name);
    setManagerEmail(manager.email);
    setManagerPassword("");
    setShowEditDialog(true);
  };

  const openAssignDialog = (manager: Manager) => {
    setSelectedManager(manager);
    setShowAssignDialog(true);
  };

  if (managersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading managers...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Manager Management</h1>
              <p className="text-blue-100 text-sm sm:text-base">Manage managers and their company assignments</p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg shadow-lg w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">Add Manager</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Managers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{managers.length}</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Active Managers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{managers.length}</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Assignments</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {managers.reduce((total, manager) => total + (manager.managedCompanies?.length || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Managers List */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager) => (
            <Card key={manager.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 truncate">{manager.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 truncate">{manager.email}</p>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Manager
                        </span>
                        <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(manager)}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteManager(manager)}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Assigned Companies</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {manager.managedCompanies?.length || 0}
                    </span>
                  </div>
                  
                  {/* Companies List */}
                  {manager.managedCompanies && manager.managedCompanies.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Companies:</h4>
                      {manager.managedCompanies.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                              <Building className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{assignment.company.name}</p>
                              <p className="text-xs text-gray-500">Assigned {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnassignCompany(manager.id, assignment.companyId)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Building className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No companies assigned</p>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <Button
                    size="sm"
                    onClick={() => openAssignDialog(manager)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Companies
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {managers.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No managers found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first manager to assign companies and manage training modules.
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Create First Manager
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Manager Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <span className="text-sm sm:text-base">Create New Manager</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                placeholder="Enter manager's full name..."
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter manager's email address..."
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter a secure password..."
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateManager}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 font-medium text-sm sm:text-base"
                disabled={createManagerMutation.isPending}
              >
                {createManagerMutation.isPending ? "Creating..." : "Create Manager"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Manager Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-sm sm:text-base">
              <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Edit Manager
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                placeholder="Enter manager name..."
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter manager email..."
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password (leave blank to keep current)
              </label>
              <Input
                type="password"
                placeholder="Enter new password..."
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditManager}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm sm:text-base"
                disabled={updateManagerMutation.isPending}
              >
                {updateManagerMutation.isPending ? "Updating..." : "Update Manager"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Company Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-sm sm:text-base">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
              <span className="truncate">Assign Company to {selectedManager?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Company
              </label>
              {companiesLoading ? (
                <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100">
                  Loading companies...
                </div>
              ) : companiesError ? (
                <div className="w-full p-2 border border-red-300 rounded-md bg-red-50 text-red-600">
                  Error loading companies: {companiesError.message}
                </div>
              ) : (
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedCompanyId || ""}
                  onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                >
                  <option value="">Choose a company...</option>
                  {companies
                    .filter(company => 
                      !selectedManager?.managedCompanies?.some(assignment => 
                        assignment.companyId === company.id
                      )
                    )
                    .map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                </select>
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAssignDialog(false)}
                className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignCompany}
                className="flex-1 bg-green-600 hover:bg-green-700 h-10 sm:h-11 text-sm sm:text-base"
                disabled={assignCompanyMutation.isPending}
              >
                {assignCompanyMutation.isPending ? "Assigning..." : "Assign Company"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Export with essential HOCs (no auth since handled by routing)
export default HOCPresets.publicPage(AdminManagerManagement);
