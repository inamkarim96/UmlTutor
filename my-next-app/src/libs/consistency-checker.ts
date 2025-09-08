import { DiagramData, DiagramElement, DiagramConnection } from './diagram-engine';

export interface ConsistencyIssue {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  elements?: string[];
  suggestions?: string[];
}

export interface ConsistencyReport {
  score: number;
  issues: ConsistencyIssue[];
  suggestions: string[];
  timestamp: string;
}

export class ConsistencyChecker {
  private rules: ConsistencyRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      new MinimumActorsRule(),
      new MinimumUseCasesRule(),
      new OrphanedElementsRule(),
      new UnconnectedActorsRule(),
      new UnconnectedUseCasesRule(),
      new NamingConventionRule(),
      new ElementOverlapRule(),
      new AssociationValidityRule(),
    ];
  }

  public checkDiagram(diagram: DiagramData): ConsistencyReport {
    const issues: ConsistencyIssue[] = [];
    
    // Run all rules
    this.rules.forEach(rule => {
      const ruleIssues = rule.check(diagram);
      issues.push(...ruleIssues);
    });

    // Calculate score
    const score = this.calculateScore(issues);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(issues, diagram);

    return {
      score,
      issues,
      suggestions,
      timestamp: new Date().toISOString(),
    };
  }

  private calculateScore(issues: ConsistencyIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 20;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  private generateSuggestions(issues: ConsistencyIssue[], diagram: DiagramData): string[] {
    const suggestions: string[] = [];
    
    issues.forEach(issue => {
      if (issue.suggestions) {
        suggestions.push(...issue.suggestions);
      }
    });

    // Add general suggestions based on diagram state
    if (diagram.elements.length === 0) {
      suggestions.push('Start by adding actors and use cases to represent your system');
    }
    
    if (diagram.connections.length === 0 && diagram.elements.length > 1) {
      suggestions.push('Connect your elements with associations to show relationships');
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }
}

abstract class ConsistencyRule {
  abstract check(diagram: DiagramData): ConsistencyIssue[];
  
  protected generateIssueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

class MinimumActorsRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const actors = diagram.elements.filter(el => el.type === 'actor');
    
    if (actors.length === 0) {
      return [{
        id: this.generateIssueId(),
        type: 'minimum_actors',
        severity: 'error',
        message: 'Use case diagram must have at least one actor',
        suggestions: ['Add an actor to represent a user or external system'],
      }];
    }
    
    return [];
  }
}

class MinimumUseCasesRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const useCases = diagram.elements.filter(el => el.type === 'usecase');
    
    if (useCases.length === 0) {
      return [{
        id: this.generateIssueId(),
        type: 'minimum_usecases',
        severity: 'error',
        message: 'Use case diagram must have at least one use case',
        suggestions: ['Add a use case to represent system functionality'],
      }];
    }
    
    return [];
  }
}

class OrphanedElementsRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const connectedElements = new Set<string>();
    
    // Find all connected elements
    diagram.connections.forEach(conn => {
      connectedElements.add(conn.source);
      connectedElements.add(conn.target);
    });
    
    // Check for orphaned elements
    diagram.elements.forEach(element => {
      if (!connectedElements.has(element.id)) {
        issues.push({
          id: this.generateIssueId(),
          type: 'orphaned_element',
          severity: 'warning',
          message: `${element.type} "${element.name}" is not connected to any other element`,
          elements: [element.id],
          suggestions: [`Connect "${element.name}" to other elements or remove it if not needed`],
        });
      }
    });
    
    return issues;
  }
}

class UnconnectedActorsRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const actors = diagram.elements.filter(el => el.type === 'actor');
    const connectedActors = new Set<string>();
    
    // Find connected actors
    diagram.connections.forEach(conn => {
      const sourceElement = diagram.elements.find(el => el.id === conn.source);
      const targetElement = diagram.elements.find(el => el.id === conn.target);
      
      if (sourceElement?.type === 'actor') {
        connectedActors.add(sourceElement.id);
      }
      if (targetElement?.type === 'actor') {
        connectedActors.add(targetElement.id);
      }
    });
    
    actors.forEach(actor => {
      if (!connectedActors.has(actor.id)) {
        issues.push({
          id: this.generateIssueId(),
          type: 'unconnected_actor',
          severity: 'warning',
          message: `Actor "${actor.name}" is not connected to any use cases`,
          elements: [actor.id],
          suggestions: [`Connect "${actor.name}" to relevant use cases`],
        });
      }
    });
    
    return issues;
  }
}

class UnconnectedUseCasesRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const useCases = diagram.elements.filter(el => el.type === 'usecase');
    const connectedUseCases = new Set<string>();
    
    // Find connected use cases
    diagram.connections.forEach(conn => {
      const sourceElement = diagram.elements.find(el => el.id === conn.source);
      const targetElement = diagram.elements.find(el => el.id === conn.target);
      
      if (sourceElement?.type === 'usecase') {
        connectedUseCases.add(sourceElement.id);
      }
      if (targetElement?.type === 'usecase') {
        connectedUseCases.add(targetElement.id);
      }
    });
    
    useCases.forEach(useCase => {
      if (!connectedUseCases.has(useCase.id)) {
        issues.push({
          id: this.generateIssueId(),
          type: 'unconnected_usecase',
          severity: 'warning',
          message: `Use case "${useCase.name}" is not connected to any actors`,
          elements: [useCase.id],
          suggestions: [`Connect "${useCase.name}" to relevant actors`],
        });
      }
    });
    
    return issues;
  }
}

class NamingConventionRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    
    diagram.elements.forEach(element => {
      // Check for empty names
      if (!element.name || element.name.trim() === '') {
        issues.push({
          id: this.generateIssueId(),
          type: 'empty_name',
          severity: 'error',
          message: `${element.type} has no name`,
          elements: [element.id],
          suggestions: [`Provide a descriptive name for the ${element.type}`],
        });
      }
      
      // Check for default names
      if (element.name === this.getDefaultName(element.type)) {
        issues.push({
          id: this.generateIssueId(),
          type: 'default_name',
          severity: 'warning',
          message: `${element.type} uses default name "${element.name}"`,
          elements: [element.id],
          suggestions: [`Rename "${element.name}" to something more descriptive`],
        });
      }
      
      // Check use case naming convention
      if (element.type === 'usecase' && !this.isValidUseCaseName(element.name)) {
        issues.push({
          id: this.generateIssueId(),
          type: 'usecase_naming',
          severity: 'info',
          message: `Use case "${element.name}" should start with a verb`,
          elements: [element.id],
          suggestions: [`Consider renaming to start with an action verb (e.g., "Create Order", "Process Payment")`],
        });
      }
    });
    
    return issues;
  }
  
  private getDefaultName(type: string): string {
    switch (type) {
      case 'actor': return 'Actor';
      case 'usecase': return 'Use Case';
      case 'system': return 'System';
      default: return 'Element';
    }
  }
  
  private isValidUseCaseName(name: string): boolean {
    const verbs = ['create', 'add', 'delete', 'update', 'manage', 'process', 'generate', 'send', 'receive', 'view', 'edit', 'search', 'login', 'logout', 'register', 'submit', 'approve', 'reject'];
    const firstWord = name.toLowerCase().split(' ')[0];
    return verbs.includes(firstWord);
  }
}

class ElementOverlapRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    
    for (let i = 0; i < diagram.elements.length; i++) {
      for (let j = i + 1; j < diagram.elements.length; j++) {
        const el1 = diagram.elements[i];
        const el2 = diagram.elements[j];
        
        if (this.elementsOverlap(el1, el2)) {
          issues.push({
            id: this.generateIssueId(),
            type: 'element_overlap',
            severity: 'warning',
            message: `"${el1.name}" and "${el2.name}" are overlapping`,
            elements: [el1.id, el2.id],
            suggestions: ['Separate overlapping elements for better visibility'],
          });
        }
      }
    }
    
    return issues;
  }
  
  private elementsOverlap(el1: DiagramElement, el2: DiagramElement): boolean {
    const margin = 10; // Minimum distance between elements
    
    const el1Right = el1.x + (el1.width || 80);
    const el1Bottom = el1.y + (el1.height || 60);
    const el2Right = el2.x + (el2.width || 80);
    const el2Bottom = el2.y + (el2.height || 60);
    
    return !(el1Right + margin < el2.x || 
             el2Right + margin < el1.x || 
             el1Bottom + margin < el2.y || 
             el2Bottom + margin < el1.y);
  }
}

class AssociationValidityRule extends ConsistencyRule {
  check(diagram: DiagramData): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    
    diagram.connections.forEach(conn => {
      const sourceElement = diagram.elements.find(el => el.id === conn.source);
      const targetElement = diagram.elements.find(el => el.id === conn.target);
      
      if (!sourceElement || !targetElement) {
        issues.push({
          id: this.generateIssueId(),
          type: 'invalid_connection',
          severity: 'error',
          message: 'Connection references non-existent elements',
          suggestions: ['Remove invalid connections'],
        });
        return;
      }
      
      // Check valid association patterns
      if (conn.type === 'association') {
        if (sourceElement.type === 'actor' && targetElement.type === 'actor') {
          issues.push({
            id: this.generateIssueId(),
            type: 'invalid_actor_association',
            severity: 'warning',
            message: `Direct association between actors "${sourceElement.name}" and "${targetElement.name}" is unusual`,
            elements: [sourceElement.id, targetElement.id],
            suggestions: ['Consider if this actor-to-actor relationship is necessary'],
          });
        }
        
        if (sourceElement.type === 'usecase' && targetElement.type === 'usecase' && conn.type === 'association') {
          issues.push({
            id: this.generateIssueId(),
            type: 'invalid_usecase_association',
            severity: 'warning',
            message: `Use cases "${sourceElement.name}" and "${targetElement.name}" should use include/extend instead of association`,
            elements: [sourceElement.id, targetElement.id],
            suggestions: ['Use include or extend relationships between use cases'],
          });
        }
      }
    });
    
    return issues;
  }
}
