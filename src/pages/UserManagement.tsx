import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Search, Plus, User, Users, ShieldCheck, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HOCPresets } from "@/components/HOCComposer";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  mobile?: string;
  lastActive: string;
  status: "Active" | "Inactive";
}

interface UserManagementProps {
  user?: any;
  isAuthenticated?: boolean;
}

function UserManagement({ user, isAuthenticated }: UserManagementProps) {
  const { createUser, updateUserById, deleteUser, user: currentUser, allUsers } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialogs state
  const [createMemberOpen, setCreateMemberOpen] = useState(false);
  const [createManagerOpen, setCreateManagerOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  // Form state for creating or editing users
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    company: "",
    mobile: "",
    role: "member" as UserRole
  });

  // Reset form when dialog closes
  const resetForm = () => {
    setUserData({
      id: "",
      name: "",
      email: "",
      password: "",
      company: "",
      mobile: "",
      role: "member"
    });
    setSelectedUser(null);
  };

  // Handle dialog open and close events to ensure form data is reset
  useEffect(() => {
    if (!createMemberOpen && !createManagerOpen && !editUserOpen) {
      resetForm();
    }
  }, [createMemberOpen, createManagerOpen, editUserOpen]);

  // Transform allUsers into UserData format
  const users: UserData[] = allUsers.map(user => ({
    ...user,
    lastActive: "Today", // Mock data
    status: "Active" // Mock data
  }));

  // Filter users based on search query and role permissions
  const filteredUsers = users.filter((user) => {
    // Text search filtering
    const matchesSearch = (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.mobile && user.mobile.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Role-based filtering
    if (currentUser && currentUser.role === "manager") {
      // Managers can only see members
      return matchesSearch && user.role === "member";
    }
    
    // Super admins can see everyone
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle form submission for creating users
  const handleCreateUser = async (role: UserRole) => {
    try {
      // Set the role based on which form is being submitted
      const newUserData = { ...userData, role };
      
      // Call the createUser function from auth context
      const success = await createUser(newUserData);
      
      if (success) {
        // Close the dialog
        if (role === "member") {
          setCreateMemberOpen(false);
        } else {
          setCreateManagerOpen(false);
        }
      }
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  // Handle form submission for editing users
  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      const success = await updateUserById({
        ...userData,
        id: selectedUser.id
      });
      
      if (success) {
        setEditUserOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const success = await deleteUser(selectedUser.id);
      
      if (success) {
        setDeleteUserOpen(false);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Set up the edit form with the selected user's data
  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setUserData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "", // Don't prefill password for security
      company: user.company || "",
      mobile: user.mobile || "",
      role: user.role
    });
    setEditUserOpen(true);
  };

  // Set up the delete confirmation with the selected user
  const handleDeleteClick = (user: UserData) => {
    setSelectedUser(user);
    setDeleteUserOpen(true);
  };

  // Get an icon based on user role
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "member":
        return <User className="h-4 w-4 text-blue-500" />;
      case "manager":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "superadmin":
        return <ShieldCheck className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  // Check if current user can edit a given user
  const canEditUser = (userToEdit: UserData) => {
    if (!currentUser) return false;
    
    if (currentUser.role === "superadmin") {
      // Super admin can edit anyone
      return true;
    } else if (currentUser.role === "manager") {
      // Manager can only edit members
      return userToEdit.role === "member";
    }
    
    return false;
  };

  // Check if current user can delete a given user
  const canDeleteUser = (userToDelete: UserData) => {
    // Same rules as editing
    return canEditUser(userToDelete);
  };

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.role === "manager" 
                ? "Manage members and their access levels." 
                : "Manage all users and their access levels."}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {currentUser && currentUser.role === "manager" && (
              <Button onClick={() => {
                resetForm(); // Clear form data first
                setCreateMemberOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-1" />
                Add New Member
              </Button>
            )}
            {currentUser && currentUser.role === "superadmin" && (
              <>
                <Button onClick={() => {
                  resetForm(); // Clear form data first
                  setCreateMemberOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Member
                </Button>
                <Button onClick={() => {
                  resetForm(); // Clear form data first
                  setCreateManagerOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Manager
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search users by name, email, role, company or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.company}</TableCell>
                      <TableCell>{user.mobile}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className="ml-1.5 capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEditUser(user) && (
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          {canDeleteUser(user) && (
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteClick(user)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Create Member Dialog */}
        <Dialog 
          open={createMemberOpen} 
          onOpenChange={(open) => {
            if (!open) resetForm();
            setCreateMemberOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Member</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input 
                  id="name" 
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Enter full name" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="Enter email address" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">Company</label>
                <Input 
                  id="company" 
                  value={userData.company}
                  onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                  placeholder="Enter company name" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="mobile" className="text-sm font-medium">Mobile Number</label>
                <Input 
                  id="mobile" 
                  value={userData.mobile}
                  onChange={(e) => setUserData({ ...userData, mobile: e.target.value })}
                  placeholder="Enter mobile number" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input 
                  id="password" 
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })} 
                  placeholder="Create a password"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setCreateMemberOpen(false);
              }}>Cancel</Button>
              <Button onClick={() => handleCreateUser("member")}>Create Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Manager Dialog */}
        <Dialog 
          open={createManagerOpen} 
          onOpenChange={(open) => {
            if (!open) resetForm();
            setCreateManagerOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Manager</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="manager-name" className="text-sm font-medium">Full Name</label>
                <Input 
                  id="manager-name" 
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Enter full name" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="manager-email" className="text-sm font-medium">Email</label>
                <Input 
                  id="manager-email" 
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="Enter email address" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="manager-company" className="text-sm font-medium">Company</label>
                <Input 
                  id="manager-company" 
                  value={userData.company}
                  onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                  placeholder="Enter company name" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="manager-mobile" className="text-sm font-medium">Mobile Number</label>
                <Input 
                  id="manager-mobile" 
                  value={userData.mobile}
                  onChange={(e) => setUserData({ ...userData, mobile: e.target.value })}
                  placeholder="Enter mobile number" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="manager-password" className="text-sm font-medium">Password</label>
                <Input 
                  id="manager-password" 
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })} 
                  placeholder="Create a password"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setCreateManagerOpen(false);
              }}>Cancel</Button>
              <Button onClick={() => handleCreateUser("manager")}>Create Manager</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog 
          open={editUserOpen} 
          onOpenChange={(open) => {
            if (!open) resetForm();
            setEditUserOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Full Name</label>
                <Input 
                  id="edit-name" 
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Enter full name" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="Enter email address" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-company" className="text-sm font-medium">Company</label>
                <Input 
                  id="edit-company" 
                  value={userData.company}
                  onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                  placeholder="Enter company name" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-mobile" className="text-sm font-medium">Mobile Number</label>
                <Input 
                  id="edit-mobile" 
                  value={userData.mobile}
                  onChange={(e) => setUserData({ ...userData, mobile: e.target.value })}
                  placeholder="Enter mobile number" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-password" className="text-sm font-medium">Password (Leave blank to keep current)</label>
                <Input 
                  id="edit-password" 
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })} 
                  placeholder="Enter new password or leave blank"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setEditUserOpen(false);
              }}>Cancel</Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation */}
        <AlertDialog 
          open={deleteUserOpen} 
          onOpenChange={(open) => {
            if (!open) setSelectedUser(null);
            setDeleteUserOpen(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

// Export with authentication and role protection (ADMIN only)
// Export with comprehensive HOC protection
export default HOCPresets.adminPage(UserManagement);
