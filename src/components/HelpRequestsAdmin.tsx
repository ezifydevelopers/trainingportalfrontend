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
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Help Requests</h1>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Manage trainee support requests and provide assistance</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="bg-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg">
              {pendingCount} Pending
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Requests</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{helpRequests.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{helpRequests.filter(r => r.status === 'PENDING').length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">In Progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{helpRequests.filter(r => r.status === 'IN_PROGRESS').length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Resolved</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{helpRequests.filter(r => r.status === 'RESOLVED').length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Help Requests List */}
      {helpRequests.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 lg:p-16 shadow-lg border-0 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No Help Requests</h3>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">All trainees are doing well! No support requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {helpRequests.map((request) => {
            const StatusIcon = statusIcons[request.status];
            return (
              <div key={request.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      {/* Header with Status - Mobile Optimized */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                              <Badge className={`${statusColors[request.status]} px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold w-fit`}>
                                {request.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-lg w-fit">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trainee Info - Compact Grid */}
                      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-gray-500">Trainee</p>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{request.trainee.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-gray-500">Email</p>
                              <p className="font-semibold text-gray-900 text-xs sm:text-sm break-words">{request.trainee.email}</p>
                            </div>
                          </div>
                          {request.trainee.company && (
                            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 sm:col-span-2 lg:col-span-1">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">Company</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{request.trainee.company.name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Module Info - Compact */}
                      {request.module && (
                        <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-blue-300">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-blue-600 font-medium">Related Module</p>
                              <p className="font-semibold text-blue-900 text-sm sm:text-base break-words">{request.module.name}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message - Compact */}
                      {request.message && (
                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1 sm:mb-2">Trainee Message</p>
                              <p className="text-gray-700 text-sm sm:text-base break-words line-clamp-3">{request.message}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Admin Notes - Compact */}
                      {request.adminNotes && (
                        <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-green-300">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-green-600 font-medium mb-1 sm:mb-2">Admin Notes</p>
                              <p className="text-green-800 text-sm sm:text-base break-words line-clamp-3">{request.adminNotes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button - Responsive */}
                    <div className="flex-shrink-0 lg:ml-6">
                      <Button
                        onClick={() => openUpdateDialog(request)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium shadow-lg text-sm sm:text-base"
                      >
                        Update Request
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
              Update Help Request
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Request Info */}
            {selectedRequest && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Trainee:</span>
                    <span className="ml-2 font-medium">{selectedRequest.trainee.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Company:</span>
                    <span className="ml-2 font-medium">{selectedRequest.trainee.company?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Status:</span>
                    <Badge className={`ml-2 ${statusColors[selectedRequest.status]}`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="status" className="text-base font-semibold text-gray-900">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING" className="text-base">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-base">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="RESOLVED" className="text-base">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Resolved</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CLOSED" className="text-base">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-gray-600" />
                        <span>Closed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-semibold text-gray-900">Admin Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this request or resolution steps..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[120px] text-base"
                />
                <p className="text-sm text-gray-500">These notes will be visible to the trainee and help track the resolution process.</p>
              </div>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 h-12 text-base font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRequest}
                disabled={!newStatus || updateHelpRequestMutation.isPending}
                className="flex-1 h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
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