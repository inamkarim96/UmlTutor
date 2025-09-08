import { Bell, Save, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onRequestTutorial?: () => void;
  onSave?: () => void;
  showTutorialButton?: boolean;
  showSaveButton?: boolean;
  autoSaved?: boolean;
  notificationCount?: number;
}

export function TopBar({
  title,
  subtitle,
  onRequestTutorial,
  onSave,
  showTutorialButton = true,
  showSaveButton = true,
  autoSaved = false,
  notificationCount = 0,
}: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
          
          {/* Save Status */}
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${autoSaved ? 'bg-success' : 'bg-warning'} ${autoSaved ? 'animate-pulse' : ''}`}></div>
            <span className="text-text-secondary">
              {autoSaved ? 'Auto-saved' : 'Saving...'}
            </span>
          </div>
          
          {/* Action Buttons */}
          {showTutorialButton && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRequestTutorial}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Request Tutorial
            </Button>
          )}
          
          {showSaveButton && (
            <Button 
              size="sm" 
              onClick={onSave}
              className="elevation-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save & Continue
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
