import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, AlertTriangle } from 'lucide-react';
import { useDuplicateCompanyData } from '@/hooks/useApi';
import { toast } from 'sonner';

interface Company {
  id: number;
  name: string;
}

interface DuplicateCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
}

export const DuplicateCompanyDialog: React.FC<DuplicateCompanyDialogProps> = ({
  isOpen,
  onClose,
  companies
}) => {
  const [sourceCompanyId, setSourceCompanyId] = useState<number | null>(null);
  const [targetCompanyId, setTargetCompanyId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const duplicateCompanyMutation = useDuplicateCompanyData();

  const handleSourceChange = (value: string) => {
    setSourceCompanyId(parseInt(value));
    // Reset target if it's the same as source
    if (targetCompanyId === parseInt(value)) {
      setTargetCompanyId(null);
    }
  };

  const handleTargetChange = (value: string) => {
    setTargetCompanyId(parseInt(value));
  };

  const handleDuplicate = async () => {
    if (!sourceCompanyId || !targetCompanyId) {
      toast.error('Please select both source and target companies');
      return;
    }

    if (sourceCompanyId === targetCompanyId) {
      toast.error('Source and target companies cannot be the same');
      return;
    }

    setIsConfirming(true);
    
    try {
      const result = await duplicateCompanyMutation.mutateAsync({
        sourceCompanyId,
        targetCompanyId
      });

      if (result.success) {
        toast.success(result.message);
        onClose();
        // Reset form
        setSourceCompanyId(null);
        setTargetCompanyId(null);
      } else {
        toast.error(result.message || 'Failed to duplicate company data');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate company data');
    } finally {
      setIsConfirming(false);
    }
  };

  const sourceCompany = companies.find(c => c.id === sourceCompanyId);
  const targetCompany = companies.find(c => c.id === targetCompanyId);

  const availableTargetCompanies = companies.filter(c => c.id !== sourceCompanyId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Company Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will copy all modules, videos, MCQs, and resources from the source company to the target company. 
              The target company must be empty (no existing modules).
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source Company</label>
            <Select value={sourceCompanyId?.toString() || ''} onValueChange={handleSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select source company" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Company</label>
            <Select 
              value={targetCompanyId?.toString() || ''} 
              onValueChange={handleTargetChange}
              disabled={!sourceCompanyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target company" />
              </SelectTrigger>
              <SelectContent>
                {availableTargetCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sourceCompany && targetCompany && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Copy from:</strong> {sourceCompany.name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Copy to:</strong> {targetCompany.name}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button 
            onClick={handleDuplicate}
            disabled={!sourceCompanyId || !targetCompanyId || isConfirming}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
