import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Users, ShieldCheck, ArrowLeft, Trash2, Eye, BarChart3, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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
import { useAllTrainees, useDeleteTrainee, useTraineeProgress } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function TrackTrainee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [traineeToDelete, setTraineeToDelete] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const itemsPerPage = 10;

  // Fetch trainees with real-time progress
  const { 
    data: trainees = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useAllTrainees();

  const deleteTraineeMutation = useDeleteTrainee();

  // Auto-refresh every 60 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefresh(new Date());
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Manual refresh
  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
    toast.success("Trainee data refreshed");
  };

  // Handle retry on error
  const handleRetry = () => {
    refetch();
    toast.info("Retrying to load trainees...");
  };

  // Filter trainees based on search term
  const filteredTrainees = trainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTrainees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrainees = filteredTrainees.slice(startIndex, endIndex);

  const handleDeleteTrainee = async () => {
    if (!traineeToDelete) return;
    
    try {
      await deleteTraineeMutation.mutateAsync(traineeToDelete.id);
      toast.success(`Trainee "${traineeToDelete.name}" deleted successfully!`);
      setTraineeToDelete(null);
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast.error(`Failed to delete trainee: ${errorMessage}`);
    }
  };

  const handleViewProgress = (traineeId) => {
    navigate(`/admin/track-trainee/${traineeId}`);
  };

  if (!user || user.role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Track Trainees</h1>
                <p className="text-blue-100 text-lg">Monitor trainee progress and performance in real-time</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Last updated</div>
                <div className="text-lg font-semibold">{lastRefresh.toLocaleTimeString()}</div>
              </div>
              <Button 
                onClick={handleRefresh}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl shadow-lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Trainees</p>
                <p className="text-3xl font-bold text-gray-900">{trainees.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Active Trainees</p>
                <p className="text-3xl font-bold text-gray-900">{filteredTrainees.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Avg. Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(filteredTrainees.reduce((acc, t) => acc + (t.calculatedProgress?.overallProgress || 0), 0) / filteredTrainees.length) || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredTrainees.filter(t => (t.calculatedProgress?.overallProgress || 0) === 100).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">Real-time progress tracking active</span>
            <span className="text-green-600 text-sm">• Auto-refresh every 60 seconds</span>
          </div>
          <div className="text-sm text-green-600 font-medium">
            {filteredTrainees.length} of {trainees.length} trainees
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-0">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search trainees by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              Showing {filteredTrainees.length} results
            </div>
          </div>
        </div>

        {/* Trainees Table */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Trainee Progress Overview</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-semibold text-gray-700 py-4">Trainee</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Company</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Overall Progress</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Modules Completed</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Average Score</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Time Invested</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Last Activity</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="text-lg font-medium text-gray-600">Loading trainees...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="space-y-6">
                      <div className="text-red-600">
                        <div className="text-xl font-semibold mb-2">Failed to load trainees</div>
                        <div className="text-gray-600 mb-6">
                          {error?.message || 'An error occurred while loading trainee data'}
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <Button 
                          variant="outline" 
                          onClick={handleRetry}
                          className="flex items-center space-x-2 px-6 py-3"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Retry</span>
                        </Button>
                        <Button 
                          onClick={handleRefresh}
                          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Refresh</span>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentTrainees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center space-y-4">
                      <Users className="h-16 w-16 text-gray-300" />
                      <div className="text-xl font-medium text-gray-600">
                        {searchTerm ? "No trainees found matching your search." : "No trainees found."}
                      </div>
                      {searchTerm && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSearchTerm("")}
                          className="mt-4"
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentTrainees.map((trainee) => (
                  <TableRow key={trainee.id} className="hover:bg-blue-50/50 transition-colors border-b">
                    <TableCell className="py-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{trainee.name}</div>
                          <div className="text-sm text-gray-500">{trainee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{trainee.company?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <Progress 
                            value={trainee.calculatedProgress?.overallProgress || 0} 
                            className="h-3 rounded-full"
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900 min-w-[3rem]">
                          {trainee.calculatedProgress?.overallProgress || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {trainee.calculatedProgress?.modulesCompleted || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          of {trainee.calculatedProgress?.totalModules || 0}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {trainee.calculatedProgress?.averageScore || 0}%
                        </div>
                        <div className="text-xs text-gray-500">Average</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {trainee.calculatedProgress?.totalTimeSpent ? 
                            (() => {
                              const totalSeconds = trainee.calculatedProgress.totalTimeSpent;
                              const hours = Math.floor(totalSeconds / 3600);
                              const minutes = Math.floor((totalSeconds % 3600) / 60);
                              const seconds = totalSeconds % 60;
                              
                              if (hours > 0) {
                                return `${hours}h ${minutes}m`;
                              } else if (minutes > 0) {
                                return `${minutes}m ${seconds}s`;
                              } else {
                                return `${seconds}s`;
                              }
                            })() : 
                            '0s'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {trainee.calculatedProgress?.totalTimeSpent ? 
                            `${Math.round(trainee.calculatedProgress.totalTimeSpent / 60)} min total` : 
                            'No time spent'
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="text-sm text-gray-600">
                        {trainee.calculatedProgress?.lastUpdated ? 
                          new Date(trainee.calculatedProgress.lastUpdated).toLocaleString() : 
                          'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleViewProgress(trainee.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Progress
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setTraineeToDelete(trainee)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTrainees.length)} of {filteredTrainees.length} trainees
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-blue-50"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-blue-600 text-white" : "cursor-pointer hover:bg-blue-50"}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-blue-50"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!traineeToDelete} onOpenChange={() => setTraineeToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trainee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{traineeToDelete?.name}</strong>? This action will also delete:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>All progress records for this trainee</li>
                  <li>All assessment results and MCQ answers</li>
                  <li>All time tracking data</li>
                </ul>
                <p className="mt-3 font-medium text-red-600">This action cannot be undone.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTrainee}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteTraineeMutation.isPending}
              >
                {deleteTraineeMutation.isPending ? "Deleting..." : "Delete Trainee"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
} 