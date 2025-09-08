import { doc as firestoreDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // adjust path if needed




export interface DiagramElement {
  id: string;
  type: 'actor' | 'usecase' | 'system' | 'message' | 'lifeline';
  name: string;
  description?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  data?: any;
}

export interface DiagramConnection {
  id: string;
  type: 'association' | 'include' | 'extend' | 'generalization' | 'message';
  source: string;
  target: string;
  points?: { x: number; y: number }[];
  label?: string;
  data?: any;
}

export interface DiagramData {
  elements: DiagramElement[];
  connections: DiagramConnection[];
  metadata: {
    title: string;
    type: 'usecase' | 'ssd' | 'description';
    version: number;
    lastModified: string;
  };
}

export class DiagramEngine {
  private canvas: SVGSVGElement | null = null;
  private data: DiagramData;
  private selectedElement: DiagramElement | null = null;
  private onSelectionChange?: (element: DiagramElement | null) => void;
  private onDataChange?: (data: DiagramData) => void;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  constructor(canvasElement: SVGSVGElement, initialData?: DiagramData) {
    this.canvas = canvasElement;
    this.data = initialData || this.createEmptyDiagram();
    this.setupEventListeners();
    this.render();
  }
// ✅ ADDED: Undo/Redo Stack Fields
private undoStack: DiagramData[] = [];
private redoStack: DiagramData[] = [];

// ✅ ADDED: Save State for Undo
private saveStateForUndo() {
  this.undoStack.push(JSON.parse(JSON.stringify(this.data)));
  this.redoStack = []; // Clear redo stack on new action
}

// ✅ ADDED: Undo Method
public undo() {
  if (this.undoStack.length > 0) {
    this.redoStack.push(JSON.parse(JSON.stringify(this.data)));
    this.data = this.undoStack.pop()!;
    this.render();
    this.onDataChange?.(this.data);
  }
}

// ✅ ADDED: Redo Method
public redo() {
  if (this.redoStack.length > 0) {
    this.undoStack.push(JSON.parse(JSON.stringify(this.data)));
    this.data = this.redoStack.pop()!;
    this.render();
    this.onDataChange?.(this.data);
  }
}


public async saveToFirestore(userId: string): Promise<void> {
  try {
    const ref = firestoreDoc(db, 'diagrams', `${userId}_${this.data.metadata.type}`);
    await setDoc(ref, {
      ...this.data,
      savedAt: new Date().toISOString(),
      userId,
    });
  } catch (error) {
    console.error("Error saving diagram to Firestore:", error);
  }
}


  private createEmptyDiagram(): DiagramData {
    return {
      elements: [],
      connections: [],
      metadata: {
        title: 'Untitled Diagram',
        type: 'usecase',
        version: 1,
        lastModified: new Date().toISOString(),
      },
    };
  }

  private setupEventListeners() {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleCanvasClick(event: MouseEvent) {
    const target = event.target as SVGElement;
    const elementId = target.getAttribute('data-element-id');
    
    if (elementId) {
      const element = this.data.elements.find(el => el.id === elementId);
      this.selectElement(element || null);
    } else {
      this.selectElement(null);
    }
  }

  private handleMouseDown(event: MouseEvent) {
    const target = event.target as SVGElement;
    const elementId = target.getAttribute('data-element-id');
    
    if (elementId && this.selectedElement?.id === elementId) {
      this.isDragging = true;
      const rect = this.canvas!.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left - this.selectedElement.x,
        y: event.clientY - rect.top - this.selectedElement.y,
      };
    }
  }

  private handleMouseMove(event: MouseEvent) {
    if (this.isDragging && this.selectedElement && this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      const newX = event.clientX - rect.left - this.dragOffset.x;
      const newY = event.clientY - rect.top - this.dragOffset.y;
      
      this.updateElementPosition(this.selectedElement.id, newX, newY);
    }
  }

  private handleMouseUp() {
    this.isDragging = false;
  }

  public addElement(type: DiagramElement['type'], x: number, y: number, name?: string): string {
     this.saveStateForUndo();
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const element: DiagramElement = {
      id,
      type,
      name: name || this.getDefaultName(type),
      x,
      y,
      width: this.getDefaultWidth(type),
      height: this.getDefaultHeight(type),
    };

    this.data.elements.push(element);
    this.updateMetadata();
    this.render();
    this.onDataChange?.(this.data);
    
    return id;
  }

  public removeElement(elementId: string) {
    this.saveStateForUndo();
    this.data.elements = this.data.elements.filter(el => el.id !== elementId);
    this.data.connections = this.data.connections.filter(
      conn => conn.source !== elementId && conn.target !== elementId
    );
    
    if (this.selectedElement?.id === elementId) {
      this.selectElement(null);
    }
    
    this.updateMetadata();
    this.render();
    this.onDataChange?.(this.data);
  }

  public updateElementPosition(elementId: string, x: number, y: number) {
     this.saveStateForUndo();
    const element = this.data.elements.find(el => el.id === elementId);
    if (element) {
      element.x = Math.max(0, x);
      element.y = Math.max(0, y);
      this.updateMetadata();
      this.render();
      this.onDataChange?.(this.data);
    }
  }

  public updateElementName(elementId: string, name: string) {
    this.saveStateForUndo();
    const element = this.data.elements.find(el => el.id === elementId);
    if (element) {
      element.name = name;
      this.updateMetadata();
      this.render();
      this.onDataChange?.(this.data);
    }
  }

  public addConnection(type: DiagramConnection['type'], sourceId: string, targetId: string, label?: string): string {
    this.saveStateForUndo();
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const connection: DiagramConnection = {
      id,
      type,
      source: sourceId,
      target: targetId,
      label,
    };

    this.data.connections.push(connection);
    this.updateMetadata();
    this.render();
    this.onDataChange?.(this.data);
    
    return id;
  }

  public removeConnection(connectionId: string) {
    this.saveStateForUndo();
    this.data.connections = this.data.connections.filter(conn => conn.id !== connectionId);
    this.updateMetadata();
    this.render();
    this.onDataChange?.(this.data);
  }

  public selectElement(element: DiagramElement | null) {
    this.selectedElement = element;
    this.render();
    this.onSelectionChange?.(element);
  }

  public getSelectedElement(): DiagramElement | null {
    return this.selectedElement;
  }

  public getDiagramData(): DiagramData {
    return { ...this.data };
  }

  public setDiagramData(data: DiagramData) {
    this.data = data;
    this.selectedElement = null;
    this.render();
    this.onDataChange?.(this.data);
  }

  public onSelectionChanged(callback: (element: DiagramElement | null) => void) {
    this.onSelectionChange = callback;
  }

  public onDataChanged(callback: (data: DiagramData) => void) {
    this.onDataChange = callback;
  }

  private getDefaultName(type: DiagramElement['type']): string {
    switch (type) {
      case 'actor':
        return 'Actor';
      case 'usecase':
        return 'Use Case';
      case 'system':
        return 'System';
      case 'lifeline':
        return 'Lifeline';
      case 'message':
        return 'Message';
      default:
        return 'Element';
    }
  }

  private getDefaultWidth(type: DiagramElement['type']): number {
    switch (type) {
      case 'actor':
        return 60;
      case 'usecase':
        return 120;
      case 'system':
        return 100;
      case 'lifeline':
        return 80;
      case 'message':
        return 100;
      default:
        return 80;
    }
  }

  private getDefaultHeight(type: DiagramElement['type']): number {
    switch (type) {
      case 'actor':
        return 80;
      case 'usecase':
        return 60;
      case 'system':
        return 60;
      case 'lifeline':
        return 200;
      case 'message':
        return 20;
      default:
        return 60;
    }
  }

  private updateMetadata() {
    this.data.metadata.lastModified = new Date().toISOString();
    this.data.metadata.version += 1;
  }

  private render() {
    if (!this.canvas) return;

    // Clear canvas
    this.canvas.innerHTML = '';

    // Render grid background
    this.renderGrid();

    // Render connections first (so they appear behind elements)
    this.data.connections.forEach(connection => {
      this.renderConnection(connection);
    });

    // Render elements
    this.data.elements.forEach(element => {
      this.renderElement(element);
    });
  }

  private renderGrid() {
    if (!this.canvas) return;

    const defs = document.createElementNS('http://localhost:3000', 'defs');
    const pattern = document.createElementNS('http://localhost:3000', 'pattern');
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', '20');
    pattern.setAttribute('height', '20');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const circle = document.createElementNS('http://localhost:3000', 'circle');
    circle.setAttribute('cx', '1');
    circle.setAttribute('cy', '1');
    circle.setAttribute('r', '1');
    circle.setAttribute('fill', 'currentColor');
    circle.setAttribute('opacity', '0.3');

    pattern.appendChild(circle);
    defs.appendChild(pattern);
    this.canvas.appendChild(defs);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'url(#grid)');
    this.canvas.appendChild(rect);
  }

  private renderElement(element: DiagramElement) {
    if (!this.canvas) return;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('data-element-id', element.id);
    group.setAttribute('class', 'diagram-element cursor-pointer');

    if (this.selectedElement?.id === element.id) {
      group.setAttribute('class', 'diagram-element diagram-element-selected cursor-pointer');
    }

    switch (element.type) {
      case 'actor':
        this.renderActor(group, element);
        break;
      case 'usecase':
        this.renderUseCase(group, element);
        break;
      case 'system':
        this.renderSystem(group, element);
        break;
      default:
        this.renderGenericElement(group, element);
    }

    this.canvas.appendChild(group);
  }

  private renderActor(group: SVGGElement, element: DiagramElement) {
    // Actor stick figure
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    head.setAttribute('cx', String(element.x + 30));
    head.setAttribute('cy', String(element.y + 15));
    head.setAttribute('r', '8');
    head.setAttribute('fill', 'none');
    head.setAttribute('stroke', 'hsl(var(--primary))');
    head.setAttribute('stroke-width', '2');

    const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    body.setAttribute('x1', String(element.x + 30));
    body.setAttribute('y1', String(element.y + 23));
    body.setAttribute('x2', String(element.x + 30));
    body.setAttribute('y2', String(element.y + 45));
    body.setAttribute('stroke', 'hsl(var(--primary))');
    body.setAttribute('stroke-width', '2');

    const arms = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arms.setAttribute('x1', String(element.x + 15));
    arms.setAttribute('y1', String(element.y + 30));
    arms.setAttribute('x2', String(element.x + 45));
    arms.setAttribute('y2', String(element.y + 30));
    arms.setAttribute('stroke', 'hsl(var(--primary))');
    arms.setAttribute('stroke-width', '2');

    const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftLeg.setAttribute('x1', String(element.x + 30));
    leftLeg.setAttribute('y1', String(element.y + 45));
    leftLeg.setAttribute('x2', String(element.x + 20));
    leftLeg.setAttribute('y2', String(element.y + 60));
    leftLeg.setAttribute('stroke', 'hsl(var(--primary))');
    leftLeg.setAttribute('stroke-width', '2');

    const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightLeg.setAttribute('x1', String(element.x + 30));
    rightLeg.setAttribute('y1', String(element.y + 45));
    rightLeg.setAttribute('x2', String(element.x + 40));
    rightLeg.setAttribute('y2', String(element.y + 60));
    rightLeg.setAttribute('stroke', 'hsl(var(--primary))');
    rightLeg.setAttribute('stroke-width', '2');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(element.x + 30));
    text.setAttribute('y', String(element.y + 75));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'text-sm font-medium fill-current');
    text.textContent = element.name;

    group.appendChild(head);
    group.appendChild(body);
    group.appendChild(arms);
    group.appendChild(leftLeg);
    group.appendChild(rightLeg);
    group.appendChild(text);
  }

  private renderUseCase(group: SVGGElement, element: DiagramElement) {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', String(element.x + (element.width || 120) / 2));
    ellipse.setAttribute('cy', String(element.y + (element.height || 60) / 2));
    ellipse.setAttribute('rx', String((element.width || 120) / 2));
    ellipse.setAttribute('ry', String((element.height || 60) / 2));
    ellipse.setAttribute('fill', 'white');
    ellipse.setAttribute('stroke', 'hsl(var(--primary))');
    ellipse.setAttribute('stroke-width', '2');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(element.x + (element.width || 120) / 2));
    text.setAttribute('y', String(element.y + (element.height || 60) / 2 + 5));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'text-sm font-medium fill-current');
    text.textContent = element.name;

    group.appendChild(ellipse);
    group.appendChild(text);
  }

  private renderSystem(group: SVGGElement, element: DiagramElement) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(element.x));
    rect.setAttribute('y', String(element.y));
    rect.setAttribute('width', String(element.width || 100));
    rect.setAttribute('height', String(element.height || 60));
    rect.setAttribute('fill', 'white');
    rect.setAttribute('stroke', 'hsl(var(--secondary))');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '4');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(element.x + (element.width || 100) / 2));
    text.setAttribute('y', String(element.y + (element.height || 60) / 2 + 5));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'text-sm font-medium fill-current');
    text.textContent = element.name;

    group.appendChild(rect);
    group.appendChild(text);
  }

  private renderGenericElement(group: SVGGElement, element: DiagramElement) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(element.x));
    rect.setAttribute('y', String(element.y));
    rect.setAttribute('width', String(element.width || 80));
    rect.setAttribute('height', String(element.height || 60));
    rect.setAttribute('fill', 'white');
    rect.setAttribute('stroke', 'hsl(var(--border))');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '4');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(element.x + (element.width || 80) / 2));
    text.setAttribute('y', String(element.y + (element.height || 60) / 2 + 5));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'text-sm font-medium fill-current');
    text.textContent = element.name;

    group.appendChild(rect);
    group.appendChild(text);
  }

  private renderConnection(connection: DiagramConnection) {
    if (!this.canvas) return;

    const sourceElement = this.data.elements.find(el => el.id === connection.source);
    const targetElement = this.data.elements.find(el => el.id === connection.target);

    if (!sourceElement || !targetElement) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(sourceElement.x + (sourceElement.width || 80) / 2));
    line.setAttribute('y1', String(sourceElement.y + (sourceElement.height || 60) / 2));
    line.setAttribute('x2', String(targetElement.x + (targetElement.width || 80) / 2));
    line.setAttribute('y2', String(targetElement.y + (targetElement.height || 60) / 2));
    line.setAttribute('stroke', 'hsl(var(--primary))');
    line.setAttribute('stroke-width', '2');

    if (connection.type === 'include' || connection.type === 'extend') {
      line.setAttribute('stroke-dasharray', '5,5');
    }

    this.canvas.appendChild(line);

    // Add label if present
    if (connection.label) {
      const midX = (sourceElement.x + targetElement.x + (sourceElement.width || 80) / 2 + (targetElement.width || 80) / 2) / 2;
      const midY = (sourceElement.y + targetElement.y + (sourceElement.height || 60) / 2 + (targetElement.height || 60) / 2) / 2;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(midX));
      text.setAttribute('y', String(midY - 5));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'text-xs fill-current');
      text.textContent = connection.label;

      this.canvas.appendChild(text);
    }
  }
}
