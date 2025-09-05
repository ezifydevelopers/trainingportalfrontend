import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetHelpRequests, useUpdateHelpRequest } from '@/hooks/useApi';
import { toast } from 'sonner';
import { HelpCircle, Clock, User, Mail, Building, FileText, MessageSquare, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { HelpRequest } from '@/lib/api';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons = {
  PENDING: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle,
  CLOSED: XCircle,
};

export default function HelpRequestsAdmin() {
  const { data: helpRequests = [], isLoading, error } = useGetHelpRequests();
  const updateHelpRequestMutation = useUpdateHelpRequest();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const handleUpdateRequest = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      await updateHelpRequestMutation.mutateAsync({
        id: selectedRequest.id,
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined,
      });
      
      toast.success('Help request updated successfully');
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setNewStatus('');
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to update help request');
    }
  };

  const openUpdateDialog = (request: HelpRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setAdminNotes(request.adminNotes || '');
    setIsDialogOpen(true);
  };

  const pendingCount = helpRequests.filter(r => r.status === 'PENDING').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-600">Failed to load help requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Requests</h1>
          <p className="text-gray-600">Manage trainee support requests</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Help Requests List */}
      {helpRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No help requests</h3>
            <p className="text-gray-600">All trainees are doing well!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {helpRequests.map((request) => {
            const StatusIcon = statusIcons[request.status];
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center space-x-3">
                        <StatusIcon className="h-5 w-5 text-gray-500" />
                        <Badge className={statusColors[request.status]}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Trainee Info */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{request.trainee.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{request.trainee.email}</span>
                        </div>
                        {request.trainee.company && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{request.trainee.company.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Module Info */}
                      {request.module && (
                        <div className="flex items-center space-x-1 text-sm">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Module: {request.module.name}</span>
                        </div>
                      )}

                      {/* Message */}
                      {request.message && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{request.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {request.adminNotes && (
                        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Admin Notes:</strong> {request.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUpdateDialog(request)}
                      className="ml-4"
                    >
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Help Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this request..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRequest}
                disabled={!newStatus || updateHelpRequestMutation.isPending}
                className="flex-1"
              >
                {updateHelpRequestMutation.isPending ? 'Updating...' : 'Update Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 