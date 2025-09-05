import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useRequestHelp } from '@/hooks/useApi';
import { toast } from 'sonner';
import { HelpCircle, Send, X } from 'lucide-react';

interface HelpRequestButtonProps {
  moduleId?: number;
  moduleName?: string;
}

export default function HelpRequestButton({ moduleId, moduleName }: HelpRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestHelpMutation = useRequestHelp();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestHelpMutation.mutateAsync({
        moduleId,
        message: message.trim()
      });
      
      toast.success('Help request submitted successfully! An admin will contact you soon.');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to submit help request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 px-6 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-base transition-all duration-200 hover:scale-105 hover:shadow-xl"
        style={{
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
        }}
      >
        <HelpCircle className="h-5 w-5 mr-2" />
        I need help
      </Button>

      {/* Help Request Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span>Request Help</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {moduleId && moduleName && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  Module
                </Badge>
                <span className="text-sm font-medium text-blue-900">{moduleName}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                What do you need help with?
              </Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or question here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Be as specific as possible to help us assist you better</span>
                <span>{message.length}/500</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 