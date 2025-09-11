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
  console.log('=== PENDING TRAINEES DEBUG ===');
  console.log('traineesData:', traineesData);
  console.log('traineesLoading:', traineesLoading);
  console.log('All trainees:', trainees);
  console.log('Filtered trainees:', filteredTrainees);
  console.log('filterStatus:', filterStatus);
  console.log('searchTerm:', searchTerm);

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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Trainees</h1>
              <p className="text-gray-600">Review and approve trainee registrations</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trainees by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Trainees List */}
        <div className="space-y-4">
          {filteredTrainees.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trainees found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'ALL' 
                    ? 'No trainees match your current filters' 
                    : 'No trainees have registered yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTrainees.map((trainee: PendingTrainee) => (
              <Card key={trainee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{trainee.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{trainee.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Registered {formatDate(trainee.createdAt)}</span>
                          </div>
                        </div>
                        {trainee.company && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{trainee.company.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(trainee.status)}
                      
                      {trainee.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleApprove(trainee)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(trainee)}
                            disabled={isProcessing}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Company to Trainee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTrainee && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedTrainee.name}</h4>
                  <p className="text-sm text-gray-600">{selectedTrainee.email}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="company-select">Select Company</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignCompany}
                  disabled={isProcessing || !selectedCompanyId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
