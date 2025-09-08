"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { DiagramEditor as DiagramEditorComponent } from '@/components/diagram/DiagramEditor';
import { PropertiesPanel } from '@/components/diagram/PropertiesPanel';
import { ToolPalette } from '@/components/diagram/ToolPalette';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useDiagram } from '@/hooks/useDiagram';
import { useAuth } from '@/hooks/useAuth';
import { DiagramData, DiagramElement } from '@/lib/diagram-engine';
import { Progress } from '@/components/ui/progress';
import type { Diagram } from '@/types/diagram';

export default function DiagramEditorPage() {
  const pathname = usePathname() || '/editor/usecase';
  const searchParams = useSearchParams();
  const type = pathname.split('/').pop() || 'usecase';
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedElement, setSelectedElement] = useState<DiagramElement | null>(null);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [consistencyIssues, setConsistencyIssues] = useState<any[]>([]);
  const [autoSaved, setAutoSaved] = useState(true);

  // Extract diagram ID from URL params
  const diagramId = searchParams?.get('id') || undefined;

  const {
    diagram,
    diagramEngine,
    initializeDiagramEngine,
    addElement,
    removeElement,
    updateElement,
    addConnection,
    removeConnection,
    saveDiagram,
    checkConsistency,
    isUpdating,
  } = useDiagram(diagramId) as unknown as {
    diagram?: Diagram;
    diagramEngine: any;
    initializeDiagramEngine: (el: SVGSVGElement, initial?: DiagramData | undefined) => void;
    addElement?: any;
    removeElement?: any;
    updateElement?: any;
    addConnection?: any;
    removeConnection?: any;
    saveDiagram: (args: { title: string; type: any; content: DiagramData }) => Promise<void>;
    checkConsistency?: () => { issues: any[] } | undefined;
    isUpdating: boolean;
  };

  // Initialize diagram engine when component mounts
  useEffect(() => {
    const el = document.getElementById('diagram-canvas');
    if (el instanceof SVGSVGElement && !diagramEngine) {
      initializeDiagramEngine(el, diagram?.content);
    }
  }, [diagram, diagramEngine, initializeDiagramEngine]);

  // Auto-save status
  useEffect(() => {
    setAutoSaved(!isUpdating);
  }, [isUpdating]);

  const handleDataChange = (data: DiagramData) => {
    setAutoSaved(false);
    // Trigger consistency check
    if (checkConsistency) {
      const report = checkConsistency();
      if (report) {
        setConsistencyIssues(report.issues);
      }
    }
  };

  const handleSelectionChange = (element: DiagramElement | null) => {
    setSelectedElement(element);
  };

  const handleElementUpdate = (elementId: string, updates: Partial<DiagramElement>) => {
    updateElement?.(elementId, updates);
  };

  const handleElementDelete = (elementId: string) => {
    removeElement?.(elementId);
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleRequestTutorial = () => {
    setShowTutorialModal(true);
  };

  const handleSave = async () => {
    if (diagramEngine) {
      const data = diagramEngine.getDiagramData();
      await saveDiagram({
        title: data.metadata.title,
        type: type as any,
        content: data,
      });
    }
  };

  const handleRunConsistencyCheck = () => {
    if (checkConsistency) {
      const report = checkConsistency();
      if (report) {
        setConsistencyIssues(report.issues);
      }
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'usecase':
        return 'Use Case Diagram Editor';
      case 'ssd':
        return 'System Sequence Diagram Editor';
      case 'description':
        return 'Use Case Description Editor';
      default:
        return 'Diagram Editor';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'usecase':
        return "Create and refine your system's functional requirements";
      case 'ssd':
        return 'Model object interactions and message flows';
      case 'description':
        return 'Document detailed use case specifications';
      default:
        return 'Create and edit UML diagrams';
    }
  };

  const getProgress = () => {
    if (!diagramEngine) return 0;
    const data = diagramEngine.getDiagramData();
    const elements = data.elements.length;
    const connections = data.connections.length;
    
    // Simple progress calculation based on elements and connections
    if (elements === 0) return 0;
    if (elements >= 2 && connections >= 1) return 75;
    if (elements >= 1) return 25;
    return 0;
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar
          title={getTitle()}
          subtitle={getSubtitle()}
          onRequestTutorial={handleRequestTutorial}
          onSave={handleSave}
          showTutorialButton={user?.role === 'student'}
          autoSaved={autoSaved}
        />

        {/* Workspace Area */}
        <div className="flex-1 flex">
          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {/* Tool Palette */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium">Tools</h3>
                  <ToolPalette
                    selectedTool={selectedTool}
                    onToolSelect={setSelectedTool}
                    diagramType={type as any}
                  />
                </div>
              </div>
            </div>

            {/* Diagram Editor */}
            <DiagramEditorComponent
              diagramData={diagram?.content}
              onDataChange={handleDataChange}
              onSelectionChange={handleSelectionChange}
              selectedTool={selectedTool}
              mode={diagram?.mode as any}
            />
          </div>

          {/* Properties Panel */}
          <PropertiesPanel
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
            onElementDelete={handleElementDelete}
            consistencyIssues={consistencyIssues}
            onRunConsistencyCheck={handleRunConsistencyCheck}
            mode={diagram?.mode as any}
          />
        </div>

        {/* Bottom Panel */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-text-secondary">
                  {diagramEngine?.getDiagramData().elements.length || 0} Elements
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${consistencyIssues.length > 0 ? 'bg-warning' : 'bg-success'}`}></div>
                <span className="text-sm text-text-secondary">
                  {consistencyIssues.length} {consistencyIssues.length === 1 ? 'Issue' : 'Issues'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${autoSaved ? 'bg-success' : 'bg-warning'}`}></div>
                <span className="text-sm text-text-secondary">
                  {autoSaved ? 'Saved' : 'Saving...'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress Indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">Progress:</span>
                <div className="w-32">
                  <Progress value={getProgress()} className="h-2" />
                </div>
                <span className="text-sm font-medium">{getProgress()}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        diagramId={diagram?.id}
        diagramTitle={diagram?.title || 'Current Diagram'}
        assignmentTitle="UML Modeling Assignment"
      />
    </div>
  );
}
