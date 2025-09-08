import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

interface NotificationToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: (id: string) => void;
}

export function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 300); // Wait for animation to complete
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-success h-5 w-5" />;
      case 'error':
        return <X className="text-error h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="text-warning h-5 w-5" />;
      case 'info':
        return <Info className="text-primary h-5 w-5" />;
      default:
        return <Info className="text-primary h-5 w-5" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-error';
      case 'warning':
        return 'bg-warning';
      case 'info':
        return 'bg-primary';
      default:
        return 'bg-primary';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <Card className="w-full max-w-sm shadow-elevation-2">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 ${getBgColor()} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-text-secondary mt-1">{message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-text-secondary hover:text-text-primary"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Toast Container Component for managing multiple toasts
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useNotificationToasts() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>>([]);

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
}
