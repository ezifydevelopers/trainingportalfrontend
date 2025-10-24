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
import { HOCPresets } from "@/components/HOCComposer";


interface TrackTraineeProps {
  user?: any;
  isAuthenticated?: boolean;
}
function TrackTrainee({ user, isAuthenticated }: TrackTraineeProps) {
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
    (trainee?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trainee?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trainee?.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      toast.success(`Trainee "${traineeToDelete?.name || 'Unknown'}" deleted successfully!`);
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


  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 sm:mb-2">Track Trainees</h1>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base xl:text-lg">Monitor trainee progress and performance in real-time</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-left sm:text-right">
                <div className="text-xs sm:text-sm text-blue-100">Last updated</div>
                <div className="text-sm sm:text-base lg:text-lg font-semibold">{lastRefresh.toLocaleTimeString()}</div>
              </div>
              <Button
                onClick={handleRefresh}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Trainees</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{trainees.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Active Trainees</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{filteredTrainees.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Avg. Progress</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {Math.round(filteredTrainees.reduce((acc, t) => acc + (t.calculatedProgress?.overallProgress || 0), 0) / filteredTrainees.length) || 0}%
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {filteredTrainees.filter(t => (t.calculatedProgress?.overallProgress || 0) === 100).length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="text-green-700 font-medium text-sm sm:text-base">Real-time progress tracking active</span>
            <span className="text-green-600 text-xs sm:text-sm hidden sm:inline">• Auto-refresh every 60 seconds</span>
          </div>
          <div className="text-xs sm:text-sm text-green-600 font-medium">
            {filteredTrainees.length} of {trainees.length} trainees
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search trainees by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg whitespace-nowrap">
              Showing {filteredTrainees.length} results
            </div>
          </div>
        </div>

        {/* Trainees Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Trainee Progress Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[200px]">Trainee</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[120px]">Company</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[150px]">Overall Progress</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[120px]">Modules Completed</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[100px]">Average Score</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[120px]">Time Invested</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[140px]">Last Activity</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 sm:py-4 min-w-[120px]">Actions</TableHead>
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
                    <TableCell className="py-4 sm:py-6">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">{trainee?.name || 'Unknown'}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{trainee?.email || 'No email'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 sm:py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">{trainee?.company?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 sm:py-6">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="flex-1 min-w-0">
                          <Progress 
                            value={trainee.calculatedProgress?.overallProgress || 0} 
                            className="h-2 sm:h-3 rounded-full"
                          />
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 min-w-[2.5rem] sm:min-w-[3rem]">
                          {trainee.calculatedProgress?.overallProgress || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 sm:py-6">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {trainee.calculatedProgress?.modulesCompleted || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          of {trainee.calculatedProgress?.totalModules || 0}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 sm:py-6">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {trainee.calculatedProgress?.averageScore || 0}%
                        </div>
                        <div className="text-xs text-gray-500">Average</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 sm:py-6">
                      <div className="text-center">
                        <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
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
                    <TableCell className="py-4 sm:py-6">
                      <div className="text-xs sm:text-sm text-gray-600">
                        {trainee.calculatedProgress?.lastUpdated ? 
                          new Date(trainee.calculatedProgress.lastUpdated).toLocaleString() : 
                          'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="py-4 sm:py-6">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          onClick={() => handleViewProgress(trainee.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View Progress</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setTraineeToDelete(trainee)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTrainees.length)} of {filteredTrainees.length} trainees
              </div>
              <Pagination>
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
                        currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-blue-50"
                      }`}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
                          currentPage === page ? "bg-blue-600 text-white" : "cursor-pointer hover:bg-blue-50"
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
                        currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-blue-50"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!traineeToDelete} onOpenChange={() => setTraineeToDelete(null)}>
          <AlertDialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">Delete Trainee</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                Are you sure you want to delete <strong>{traineeToDelete?.name}</strong>? This action will also delete:
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
                  <li>All progress records for this trainee</li>
                  <li>All assessment results and MCQ answers</li>
                  <li>All time tracking data</li>
                </ul>
                <p className="mt-3 font-medium text-red-600 text-sm sm:text-base">This action cannot be undone.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <AlertDialogCancel className="w-full sm:w-auto text-sm sm:text-base">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTrainee}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm sm:text-base"
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
// Export with essential HOCs (no auth since handled by routing)
export default HOCPresets.publicPage(TrackTrainee);
