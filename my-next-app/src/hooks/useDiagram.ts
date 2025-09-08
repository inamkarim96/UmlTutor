import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DiagramData, Diagram, ConsistencyCheck } from '@/types/diagram';
import { DiagramEngine } from '@/lib/diagram-engine';
import { ConsistencyChecker } from '@/lib/consistency-checker';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useDiagram(diagramId?: string) {
  const [diagramEngine, setDiagramEngine] = useState<DiagramEngine | null>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [consistencyChecker] = useState(() => new ConsistencyChecker());
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch diagram data
  const { data: diagram, isLoading } = useQuery({
    queryKey: ['/api/diagrams', diagramId],
    enabled: !!diagramId && !!token,
  });

  // Fetch user diagrams
  const { data: userDiagrams = [] } = useQuery({
    queryKey: ['/api/diagrams'],
    enabled: !!token,
  });

  // Create diagram mutation
  const createDiagramMutation = useMutation({
    mutationFn: async (data: Partial<Diagram>) => {
      const response = await apiRequest('POST', '/api/diagrams', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagrams'] });
      toast({
        title: 'Diagram created',
        description: 'Your diagram has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create diagram.',
        variant: 'destructive',
      });
    },
  });

  // Update diagram mutation
  const updateDiagramMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Diagram> }) => {
      const response = await apiRequest('PUT', `/api/diagrams/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagrams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/diagrams', diagramId] });
    },
  });

  // Delete diagram mutation
  const deleteDiagramMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/diagrams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagrams'] });
      toast({
        title: 'Diagram deleted',
        description: 'The diagram has been removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete diagram.',
        variant: 'destructive',
      });
    },
  });

  // Initialize diagram engine
  const initializeDiagramEngine = useCallback((canvasElement: SVGSVGElement, initialData?: DiagramData) => {
    const engine = new DiagramEngine(canvasElement, initialData);
    
    engine.onSelectionChanged((element) => {
      setSelectedElement(element);
    });

    engine.onDataChanged((data) => {
      // Auto-save after changes
      if (diagramId) {
        updateDiagramMutation.mutate({
          id: diagramId,
          data: { content: data },
        });
      }
    });

    setDiagramEngine(engine);
    return engine;
  }, [diagramId, updateDiagramMutation]);

  // Add element to diagram
  const addElement = useCallback((type: any, x: number, y: number, name?: string) => {
    if (diagramEngine) {
      return diagramEngine.addElement(type, x, y, name);
    }
  }, [diagramEngine]);

  // Remove element from diagram
  const removeElement = useCallback((elementId: string) => {
    if (diagramEngine) {
      diagramEngine.removeElement(elementId);
    }
  }, [diagramEngine]);

  // Update element properties
  const updateElement = useCallback((elementId: string, updates: any) => {
    if (diagramEngine) {
      if (updates.name !== undefined) {
        diagramEngine.updateElementName(elementId, updates.name);
      }
      if (updates.x !== undefined && updates.y !== undefined) {
        diagramEngine.updateElementPosition(elementId, updates.x, updates.y);
      }
    }
  }, [diagramEngine]);

  // Add connection between elements
  const addConnection = useCallback((type: any, sourceId: string, targetId: string, label?: string) => {
    if (diagramEngine) {
      return diagramEngine.addConnection(type, sourceId, targetId, label);
    }
  }, [diagramEngine]);

  // Remove connection
  const removeConnection = useCallback((connectionId: string) => {
    if (diagramEngine) {
      diagramEngine.removeConnection(connectionId);
    }
  }, [diagramEngine]);

  // Check diagram consistency
  const checkConsistency = useCallback(() => {
    if (diagramEngine) {
      const diagramData = diagramEngine.getDiagramData();
      return consistencyChecker.checkDiagram(diagramData);
    }
    return null;
  }, [diagramEngine, consistencyChecker]);

  // Save diagram
  const saveDiagram = useCallback(async (data: Partial<Diagram>) => {
    if (diagramId) {
      return updateDiagramMutation.mutateAsync({
        id: diagramId,
        data,
      });
    } else {
      return createDiagramMutation.mutateAsync({
        ...data,
        userId: user?.id,
      });
    }
  }, [diagramId, user?.id, createDiagramMutation, updateDiagramMutation]);

  // Export diagram data
  const exportDiagram = useCallback((format: 'json' | 'svg' = 'json') => {
    if (!diagramEngine) return null;

    const data = diagramEngine.getDiagramData();
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    // For SVG export, you'd need to serialize the SVG element
    // This is a simplified version
    return data;
  }, [diagramEngine]);

  // Auto-save effect
  useEffect(() => {
    if (!diagramEngine || !diagramId) return;

    const autoSaveInterval = setInterval(() => {
      const data = diagramEngine.getDiagramData();
      updateDiagramMutation.mutate({
        id: diagramId,
        data: { content: data },
      });
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [diagramEngine, diagramId, updateDiagramMutation]);

  return {
    // Data
    diagram,
    userDiagrams,
    selectedElement,
    isLoading,
    
    // Diagram engine
    diagramEngine,
    initializeDiagramEngine,
    
    // Element operations
    addElement,
    removeElement,
    updateElement,
    
    // Connection operations
    addConnection,
    removeConnection,
    
    // Diagram operations
    saveDiagram,
    exportDiagram,
    checkConsistency,
    
    // Mutations
    createDiagram: createDiagramMutation.mutateAsync,
    updateDiagram: updateDiagramMutation.mutateAsync,
    deleteDiagram: deleteDiagramMutation.mutateAsync,
    
    // State
    isCreating: createDiagramMutation.isPending,
    isUpdating: updateDiagramMutation.isPending,
    isDeleting: deleteDiagramMutation.isPending,
  };
}
