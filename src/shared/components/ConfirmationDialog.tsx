import React, { memo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Save, 
  Upload,
  X
} from 'lucide-react';

export type ConfirmationType = 'delete' | 'edit' | 'save' | 'upload' | 'custom';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
  destructive?: boolean;
  details?: string[];
  warning?: string;
}

const ConfirmationDialog = memo<ConfirmationDialogProps>(({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  type = 'custom',
  isLoading = false,
  destructive = false,
  details = [],
  warning
}) => {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case 'edit':
        return <Edit className="h-6 w-6 text-blue-600" />;
      case 'save':
        return <Save className="h-6 w-6 text-green-600" />;
      case 'upload':
        return <Upload className="h-6 w-6 text-purple-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getConfirmButtonVariant = () => {
    if (destructive) return 'destructive';
    if (type === 'delete') return 'destructive';
    return 'default';
  };

  const getConfirmButtonText = () => {
    if (confirmText) return confirmText;
    
    switch (type) {
      case 'delete':
        return 'Delete';
      case 'edit':
        return 'Save Changes';
      case 'save':
        return 'Save';
      case 'upload':
        return 'Upload';
      default:
        return 'Confirm';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          
          <AlertDialogDescription className="text-sm text-gray-600 mt-3">
            {description}
          </AlertDialogDescription>

          {/* Details List */}
          {details.length > 0 && (
            <div className="mt-4">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning Message */}
          {warning && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">{warning}</p>
              </div>
            </div>
          )}

          {/* Type Badge */}
          <div className="mt-4">
            <Badge 
              variant="outline" 
              className={
                destructive || type === 'delete' 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : type === 'edit' || type === 'save'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : type === 'upload'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Action
            </Badge>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={onConfirm}
              disabled={isLoading}
              className={
                destructive || type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : type === 'edit' || type === 'save'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : type === 'upload'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {getIcon()}
                  <span className="ml-2">{getConfirmButtonText()}</span>
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';

export default ConfirmationDialog;
