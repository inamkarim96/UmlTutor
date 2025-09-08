import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Send, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagramId?: string;
  diagramTitle?: string;
  assignmentTitle?: string;
}

export function TutorialModal({
  isOpen,
  onClose,
  diagramId,
  diagramTitle = 'Current Diagram',
  assignmentTitle = 'Assignment',
}: TutorialModalProps) {
  const [requestMessage, setRequestMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tutorialRequestMutation = useMutation({
    mutationFn: async (data: { diagramId: string; requestMessage?: string }) => {
      const response = await apiRequest('POST', '/api/tutorial-sessions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorial-sessions'] });
      toast({
        title: 'Tutorial Request Sent',
        description: 'Your teacher will review your diagram and respond within 24 hours.',
      });
      onClose();
      setRequestMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Request Failed',
        description: 'Failed to send tutorial request. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitRequest = () => {
    if (!diagramId) {
      toast({
        title: 'Error',
        description: 'No diagram selected for tutorial request.',
        variant: 'destructive',
      });
      return;
    }

    tutorialRequestMutation.mutate({
      diagramId,
      requestMessage: requestMessage.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!tutorialRequestMutation.isPending) {
      onClose();
      setRequestMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Request Tutorial Mode</DialogTitle>
              <p className="text-sm text-text-secondary">Get guided feedback on your diagram</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-text-primary">Current Assignment</Label>
            <div className="p-3 bg-gray-50 rounded-lg mt-2">
              <p className="text-sm font-medium">{assignmentTitle}</p>
              <p className="text-xs text-text-secondary">{diagramTitle}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-text-primary">
              Request Message (Optional)
            </Label>
            <Textarea
              rows={3}
              className="mt-2 resize-none"
              placeholder="Describe specific areas where you need help..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              disabled={tutorialRequestMutation.isPending}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <GraduationCap className="text-primary mt-0.5 h-4 w-4" />
              <div>
                <p className="text-sm font-medium text-primary">Tutorial Mode Request</p>
                <p className="text-xs text-text-secondary mt-1">
                  Your teacher will review your diagram and enable guided correction mode. 
                  You'll receive step-by-step feedback to improve your model.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={tutorialRequestMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            disabled={tutorialRequestMutation.isPending || !diagramId}
          >
            {tutorialRequestMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
