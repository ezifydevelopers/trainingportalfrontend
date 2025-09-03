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
    console.log('Retrying to load trainees...');
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
      console.error('Failed to delete trainee:', error);
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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track Trainees</h1>
              <p className="text-gray-600">Monitor trainee progress and performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time progress tracking active</span>
          <span className="text-xs text-green-500">• Auto-refresh every 60 seconds</span>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search trainees by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredTrainees.length} of {trainees.length} trainees
          </div>
        </div>

        {/* Trainees Table */}
        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainee</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Overall Progress</TableHead>
                <TableHead>Modules Completed</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Time Invested</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Loading trainees...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="space-y-4">
                      <div className="text-red-600">
                        <div className="text-lg font-medium mb-2">Failed to load trainees</div>
                        <div className="text-sm text-gray-600 mb-4">
                          {error?.message || 'An error occurred while loading trainee data'}
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Button 
                          variant="outline" 
                          onClick={handleRetry}
                          className="flex items-center space-x-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Retry</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleRefresh}
                          className="flex items-center space-x-2"
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
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {searchTerm ? "No trainees found matching your search." : "No trainees found."}
                  </TableCell>
                </TableRow>
              ) : (
                currentTrainees.map((trainee) => (
                  <TableRow key={trainee.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{trainee.name}</div>
                          <div className="text-sm text-gray-500">{trainee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{trainee.company?.name || 'Unknown'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={trainee.calculatedProgress?.overallProgress || 0} className="w-16" />
                        <span className="text-sm font-medium">{trainee.calculatedProgress?.overallProgress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {trainee.calculatedProgress?.modulesCompleted || 0} / {trainee.calculatedProgress?.totalModules || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {trainee.calculatedProgress?.averageScore || 0}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {trainee.calculatedProgress?.totalTimeSpent ? 
                          `${Math.round(trainee.calculatedProgress.totalTimeSpent / 60)}m` : 
                          '0m'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {trainee.calculatedProgress?.lastUpdated ? 
                          new Date(trainee.calculatedProgress.lastUpdated).toLocaleString() : 
                          'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProgress(trainee.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Progress
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTraineeToDelete(trainee)}
                          className="text-red-600 hover:text-red-800"
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
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-blue-600 text-white" : "cursor-pointer"}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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