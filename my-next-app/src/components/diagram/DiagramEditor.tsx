import { useEffect, useRef, useState } from 'react';
import { DiagramEngine, DiagramElement, DiagramData } from '@/lib/diagram-engine';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Include type to support Wouter route param
interface DiagramEditorProps {
  diagramData?: DiagramData;
  onDataChange?: (data: DiagramData) => void;
  onSelectionChange?: (element: DiagramElement | null) => void;
  selectedTool?: string;
  mode?: 'development' | 'tutorial' | 'checking';
  readonly?: boolean;

  // This is the route param from /editor/:type?
  type?: string;
}

export function DiagramEditor({
  diagramData,
  onDataChange,
  onSelectionChange,
  selectedTool = 'select',
  mode = 'development',
  readonly = false,
  type
}: DiagramEditorProps) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [diagramEngine, setDiagramEngine] = useState<DiagramEngine | null>(null);
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const { user } = useAuth();

  useEffect(() => {
    if (canvasRef.current && !diagramEngine) {
      const engine = new DiagramEngine(canvasRef.current, diagramData);

      engine.onSelectionChanged((element) => {
        onSelectionChange?.(element);
      });

      engine.onDataChanged(async (data) => {
        onDataChange?.(data);
        if (user?.uid && engine.saveToFirestore) {
          setSaving(true);
          try {
            await engine.saveToFirestore(user.uid);
          } catch (err) {
            console.error('Auto-save failed:', err);
          } finally {
            setSaving(false);
          }
        }
      });

      setDiagramEngine(engine);
    }
  }, [canvasRef.current, diagramData, onDataChange, onSelectionChange, user]);

  useEffect(() => {
    if (!canvasRef.current || !diagramEngine || readonly) return;

    const handleCanvasClick = (event: MouseEvent) => {
      if (selectedTool === 'select') return;

      const rect = canvasRef.current!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      switch (selectedTool) {
        case 'actor':
          diagramEngine.addElement('actor', x - 30, y - 40);
          break;
        case 'usecase':
          diagramEngine.addElement('usecase', x - 60, y - 30);
          break;
        case 'system':
          diagramEngine.addElement('system', x - 50, y - 30);
          break;
      }
    };

    canvasRef.current.addEventListener('click', handleCanvasClick);
    return () => {
      canvasRef.current?.removeEventListener('click', handleCanvasClick);
    };
  }, [selectedTool, diagramEngine, readonly]);

  const handleZoomIn = () => setZoom(prev => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 25));
  const handleFitToScreen = () => setZoom(100);
  const handleUndo = () => diagramEngine?.undo();
  const handleRedo = () => diagramEngine?.redo();

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-elevation-1 flex flex-col relative">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-medium">Diagram Canvas {type && <span className="text-sm text-gray-500">({type})</span>}</h3>
            <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
              <Button variant="ghost" size="sm" onClick={handleUndo} disabled={readonly} title="Undo">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRedo} disabled={readonly} title="Redo">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-text-secondary min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFitToScreen} title="Fit to Screen">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        {mode !== 'development' && (
          <div className="absolute top-4 left-4 z-10 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${mode === 'tutorial' ? 'bg-accent' : 'bg-secondary'}`} />
              <span className="text-sm font-medium capitalize">{mode} Mode</span>
            </div>
          </div>
        )}

        <div
          className="w-full h-full"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
        >
          <svg
            ref={canvasRef}
            className="w-full h-full diagram-grid"
            style={{ cursor: selectedTool === 'select' ? 'default' : 'crosshair', minHeight: '600px' }}
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          />
        </div>

        <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow">
          <div className="flex items-center space-x-4 text-xs text-text-secondary">
            <span>Elements: {diagramData?.elements.length || 0}</span>
            <span>Connections: {diagramData?.connections.length || 0}</span>
            {selectedTool !== 'select' && (
              <span className="text-primary font-medium">Click to add {selectedTool}</span>
            )}
          </div>
        </div>

        {saving && (
          <div className="absolute top-2 right-4 bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded shadow">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}
