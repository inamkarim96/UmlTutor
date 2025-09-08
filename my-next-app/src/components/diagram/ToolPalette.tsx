import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  User, 
  Circle, 
  ArrowRight, 
  GitBranch, 
  Square,
  Minus
} from 'lucide-react';

interface ToolPaletteProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  mode?: 'development' | 'tutorial' | 'checking';
  diagramType?: 'usecase' | 'ssd' | 'description';
}

export function ToolPalette({
  selectedTool,
  onToolSelect,
  mode = 'development',
  diagramType = 'usecase',
}: ToolPaletteProps) {
  const isDisabled = mode === 'checking';

  const tools = [
    {
      id: 'select',
      icon: MousePointer,
      label: 'Select Tool',
      description: 'Select and move elements',
    },
    ...(diagramType === 'usecase' ? [
      {
        id: 'actor',
        icon: User,
        label: 'Add Actor',
        description: 'Add an actor to represent users or external systems',
      },
      {
        id: 'usecase',
        icon: Circle,
        label: 'Add Use Case',
        description: 'Add a use case to represent system functionality',
      },
      {
        id: 'system',
        icon: Square,
        label: 'Add System',
        description: 'Add a system boundary',
      },
      {
        id: 'association',
        icon: ArrowRight,
        label: 'Add Association',
        description: 'Connect actors to use cases',
      },
      {
        id: 'include',
        icon: GitBranch,
        label: 'Add Include',
        description: 'Add include relationship between use cases',
      },
      {
        id: 'extend',
        icon: GitBranch,
        label: 'Add Extend',
        description: 'Add extend relationship between use cases',
      },
    ] : []),
    ...(diagramType === 'ssd' ? [
      {
        id: 'lifeline',
        icon: Minus,
        label: 'Add Lifeline',
        description: 'Add object lifeline',
      },
      {
        id: 'message',
        icon: ArrowRight,
        label: 'Add Message',
        description: 'Add message between objects',
      },
    ] : []),
  ];

  return (
    <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isSelected = selectedTool === tool.id;
        
        return (
          <Button
            key={tool.id}
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            className={`p-2 ${isSelected ? 'shadow-elevation-1' : ''}`}
            onClick={() => onToolSelect(tool.id)}
            disabled={isDisabled}
            title={`${tool.label} - ${tool.description}`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
      
      {/* Tool info */}
      {selectedTool !== 'select' && (
        <div className="ml-4 text-xs text-text-secondary">
          <span className="font-medium">
            {tools.find(t => t.id === selectedTool)?.label}
          </span>
          {!isDisabled && (
            <span className="block">Click on canvas to add</span>
          )}
        </div>
      )}
    </div>
  );
}
