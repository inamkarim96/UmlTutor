export interface DiagramElement {
  id: string;
  type: 'actor' | 'usecase' | 'system' | 'message' | 'lifeline';
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  description?: string;
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

export interface Diagram {
  id: string;
  userId: string;
  title: string;
  type: 'usecase' | 'ssd' | 'description';
  content: DiagramData;
  mode: 'development' | 'tutorial' | 'checking';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  assignmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorialSession {
  id: string;
  studentId: string;
  teacherId?: string;
  diagramId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestMessage?: string;
  feedback?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ConsistencyCheck {
  id: string;
  diagramId: string;
  issues: ConsistencyIssue[];
  score: number;
  suggestions?: string[];
  createdAt: string;
}

export interface ConsistencyIssue {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  elements?: string[];
  suggestions?: string[];
}
