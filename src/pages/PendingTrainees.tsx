import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone
} from 'lucide-react';
import { useAllTrainees, useAllCompanies, useUpdateTrainee } from '@/hooks/useApi';
import { toast } from 'sonner';

interface PendingTrainee {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: number | null;
  company?: {
    id: number;
    name: string;
  };
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function PendingTrainees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedTrainee, setSelectedTrainee] = useState<PendingTrainee | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: traineesData, isLoading: traineesLoading, refetch: refetchTrainees } = useAllTrainees();
  const { data: companiesData, isLoading: companiesLoading } = useAllCompanies();
  const updateTraineeMutation = useUpdateTrainee();

  const trainees = traineesData || [];
  const companies = companiesData?.companies || [];

  // Filter trainees based on search and status
  const filteredTrainees = trainees.filter((trainee: PendingTrainee) => {
    const matchesSearch = trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || trainee.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Debug: Log trainees to console

  const handleApprove = async (trainee: PendingTrainee) => {
    setSelectedTrainee(trainee);
    setShowAssignDialog(true);
  };

  const handleReject = async (trainee: PendingTrainee) => {
    if (window.confirm(`Are you sure you want to reject ${trainee.name}?`)) {
      setIsProcessing(true);
      try {
        await updateTraineeMutation.mutateAsync({
          id: trainee.id,
          updates: { status: 'REJECTED' }
        });
        toast.success('Trainee rejected successfully');
        refetchTrainees();
      } catch (error) {
        toast.error('Failed to reject trainee');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAssignCompany = async () => {
    if (!selectedTrainee || !selectedCompanyId) {
      toast.error('Please select a company');
      return;
    }

    setIsProcessing(true);
    try {
      await updateTraineeMutation.mutateAsync({
        id: selectedTrainee.id,
        updates: { 
          companyId: parseInt(selectedCompanyId),
          status: 'APPROVED'
        }
      });
      toast.success('Trainee approved and assigned to company successfully');
      setShowAssignDialog(false);
      setSelectedTrainee(null);
      setSelectedCompanyId('');
      refetchTrainees();
    } catch (error) {
      toast.error('Failed to assign trainee to company');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (traineesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading trainees...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Pending Trainees</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">Review and approve trainee registrations</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Search trainees by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-sm sm:text-base">All Status</SelectItem>
                  <SelectItem value="PENDING" className="text-sm sm:text-base">Pending</SelectItem>
                  <SelectItem value="APPROVED" className="text-sm sm:text-base">Approved</SelectItem>
                  <SelectItem value="REJECTED" className="text-sm sm:text-base">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Trainees List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredTrainees.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6 sm:py-8 lg:py-12">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-2 sm:mb-3 lg:mb-4" />
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No trainees found</h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                  {searchTerm || filterStatus !== 'ALL' 
                    ? 'No trainees match your current filters' 
                    : 'No trainees have registered yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTrainees.map((trainee: PendingTrainee) => (
              <Card key={trainee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{trainee.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 lg:space-x-4 text-xs sm:text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1 min-w-0">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{trainee.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 min-w-0">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">Registered {formatDate(trainee.createdAt)}</span>
                          </div>
                        </div>
                        {trainee.company && (
                          <div className="flex items-center space-x-1 mt-1 min-w-0">
                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600 truncate">{trainee.company.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                      <div className="flex justify-center lg:justify-start">
                        {getStatusBadge(trainee.status)}
                      </div>
                      
                      {trainee.status === 'PENDING' && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button
                            onClick={() => handleApprove(trainee)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
                            size="sm"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Approve</span>
                            <span className="sm:hidden">✓</span>
                          </Button>
                          <Button
                            onClick={() => handleReject(trainee)}
                            disabled={isProcessing}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
                            size="sm"
                          >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Reject</span>
                            <span className="sm:hidden">✗</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Assign Company Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="w-[95vw] sm:w-full max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">Assign Company to Trainee</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              {selectedTrainee && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">{selectedTrainee.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedTrainee.email}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="company-select" className="text-xs sm:text-sm lg:text-base">Select Company</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="mt-1 h-9 sm:h-10 text-sm sm:text-base">
                    <SelectValue placeholder="Choose a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="text-sm sm:text-base">
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1 h-9 sm:h-10 text-sm sm:text-base"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignCompany}
                  disabled={isProcessing || !selectedCompanyId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-sm sm:text-base"
                >
                  {isProcessing ? 'Assigning...' : 'Assign & Approve'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
