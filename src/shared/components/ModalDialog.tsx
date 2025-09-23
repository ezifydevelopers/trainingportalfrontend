import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '6xl' | 'wide';

interface ModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  size?: ModalSize;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  wide: 'w-[95vw] sm:!w-[1024px]',
};

const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onOpenChange,
  title,
  icon: Icon,
  badge,
  size = '2xl',
  children,
  className = '',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-[95vw] ${sizeClasses[size]} max-h-[90vh] sm:max-h-[85vh] overflow-y-auto !max-w-none ${className}`}>
        <DialogHeader className="p-3 sm:p-4">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
            <div className="flex items-center min-w-0">
              {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />}
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{title}</span>
            </div>
            {badge && (
              <Badge 
                variant={badge.variant || 'outline'} 
                className={`${badge.className || 'bg-blue-100 text-blue-700 border-blue-300'} text-xs sm:text-sm flex-shrink-0`}
              >
                {badge.text}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDialog;
