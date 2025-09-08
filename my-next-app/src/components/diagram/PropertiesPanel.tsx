import { useState, useEffect } from 'react';
import { DiagramElement } from '@/lib/diagram-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  AlignCenter, 
  Link, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  X
} from 'lucide-react';
import { ConsistencyChecker, ConsistencyIssue } from '@/lib/consistency-checker';

interface PropertiesPanelProps {
  selectedElement: DiagramElement | null;
  onElementUpdate?: (elementId: string, updates: Partial<DiagramElement>) => void;
  onElementDelete?: (elementId: string) => void;
  consistencyIssues?: ConsistencyIssue[];
  onRunConsistencyCheck?: () => void;
  mode?: 'development' | 'tutorial' | 'checking';
}

export function PropertiesPanel({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  consistencyIssues = [],
  onRunConsistencyCheck,
  mode = 'development',
}: PropertiesPanelProps) {
  const [elementName, setElementName] = useState('');
  const [elementDescription, setElementDescription] = useState('');

  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setElementName(selectedElement.name);
      setElementDescription(selectedElement.description || '');
    } else {
      setElementName('');
      setElementDescription('');
    }
  }, [selectedElement]);

  const handleNameChange = (name: string) => {
    setElementName(name);
    if (selectedElement) {
      onElementUpdate?.(selectedElement.id, { name });
    }
  };

  const handleDescriptionChange = (description: string) => {
    setElementDescription(description);
    if (selectedElement) {
      onElementUpdate?.(selectedElement.id, { description });
    }
  };

  const handleDeleteElement = () => {
    if (selectedElement) {
      onElementDelete?.(selectedElement.id);
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'actor':
        return '👤';
      case 'usecase':
        return '⭕';
      case 'system':
        return '📦';
      default:
        return '📄';
    }
  };

  const getElementTypeLabel = (type: string) => {
    switch (type) {
      case 'actor':
        return 'Actor';
      case 'usecase':
        return 'Use Case';
      case 'system':
        return 'System';
      default:
        return 'Element';
    }
  };

  const getIssueSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };

  const getIssueSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <X className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'info':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const elementIssues = consistencyIssues.filter(issue => 
    issue.elements?.includes(selectedElement?.id || '')
  );

  return (
    <div className="w-80 bg-white m-4 ml-0 rounded-lg shadow-elevation-1 flex flex-col">
      {/* Panel Tabs */}
      <div className="border-b border-gray-200">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
            <TabsTrigger value="validation" className="text-xs">Validation</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {selectedElement ? (
                <>
                  {/* Selected Element Properties */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">{getElementIcon(selectedElement.type)}</span>
                      <h4 className="font-medium">{getElementTypeLabel(selectedElement.type)}: {selectedElement.name}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Name
                        </Label>
                        <Input
                          value={elementName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="mt-1"
                          placeholder="Enter element name"
                          disabled={mode === 'checking'}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Description
                        </Label>
                        <Textarea
                          rows={3}
                          value={elementDescription}
                          onChange={(e) => handleDescriptionChange(e.target.value)}
                          className="mt-1 resize-none"
                          placeholder="Brief description of the element..."
                          disabled={mode === 'checking'}
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Position
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <Label className="text-xs text-text-secondary">X</Label>
                            <Input
                              type="number"
                              value={selectedElement.x}
                              readOnly
                              className="text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-text-secondary">Y</Label>
                            <Input
                              type="number"
                              value={selectedElement.y}
                              readOnly
                              className="text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Element-specific issues */}
                      {elementIssues.length > 0 && (
                        <div className="border border-warning/20 rounded-lg p-3 bg-warning/10">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <span className="text-sm font-medium">Element Issues</span>
                          </div>
                          <div className="space-y-1">
                            {elementIssues.map((issue) => (
                              <div key={issue.id} className="text-xs text-text-secondary">
                                • {issue.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {mode !== 'checking' && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-text-secondary hover:bg-gray-50"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate Element
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-text-secondary hover:bg-gray-50"
                        >
                          <AlignCenter className="mr-2 h-4 w-4" />
                          Center Element
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-text-secondary hover:bg-gray-50"
                        >
                          <Link className="mr-2 h-4 w-4" />
                          Auto-Connect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-error hover:bg-red-50"
                          onClick={handleDeleteElement}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Element
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Copy className="h-8 w-8 text-text-secondary" />
                  </div>
                  <h4 className="font-medium text-text-primary mb-2">No Element Selected</h4>
                  <p className="text-sm text-text-secondary">
                    Click on an element in the diagram to view and edit its properties.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation" className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Consistency Checker */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Consistency Check</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRunConsistencyCheck}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Run Check
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {consistencyIssues.length === 0 ? (
                    <div className="flex items-center space-x-2 p-2 bg-success/10 border border-success/20 rounded">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">No issues found</span>
                    </div>
                  ) : (
                    consistencyIssues.map((issue) => (
                      <div key={issue.id} className={`consistency-issue ${issue.severity}`}>
                        <div className={`mt-0.5 ${getIssueSeverityColor(issue.severity)}`}>
                          {getIssueSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{issue.message}</p>
                          {issue.suggestions && issue.suggestions.length > 0 && (
                            <div className="mt-1">
                              {issue.suggestions.map((suggestion, index) => (
                                <p key={index} className="text-xs text-text-secondary">
                                  💡 {suggestion}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tutorial Mode Feedback */}
              {mode === 'tutorial' && (
                <div className="border border-accent/20 rounded-lg p-4 bg-accent/10">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">🎓</span>
                    <h4 className="font-medium">Tutorial Guidance</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-text-secondary">
                      Tutorial mode is active. You'll receive step-by-step guidance for improving your diagram.
                    </p>
                    {selectedElement && (
                      <div className="bg-white border border-accent/30 rounded p-2">
                        <p className="font-medium text-accent">
                          Selected: {selectedElement.name}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          Try adding a description to this {selectedElement.type} to improve clarity.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Recent Changes</h4>
                <div className="space-y-2">
                  <div className="text-sm text-text-secondary">
                    No change history available yet.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
