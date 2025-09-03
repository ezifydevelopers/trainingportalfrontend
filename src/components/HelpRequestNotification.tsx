import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useGetHelpRequests } from '@/hooks/useApi';
import { HelpCircle } from 'lucide-react';

export default function HelpRequestNotification() {
  const { data: helpRequests = [] } = useGetHelpRequests();
  
  const pendingCount = helpRequests.filter(r => r.status === 'PENDING').length;
  
  if (pendingCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <HelpCircle className="h-4 w-4 text-red-500" />
      <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
        {pendingCount} {pendingCount === 1 ? 'request' : 'requests'}
      </Badge>
    </div>
  );
} 