import type {
  User,
  InsertUser,
  Diagram,
  InsertDiagram,
  Assignment,
  InsertAssignment,
  TutorialSession,
  InsertTutorialSession,
  ConsistencyCheck,
  InsertConsistencyCheck,
  Notification,
  InsertNotification
} from "../shared/schema.js";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDiagram(id: number): Promise<Diagram | undefined>;
  getDiagramsByUserId(userId: number): Promise<Diagram[]>;
  createDiagram(diagram: InsertDiagram): Promise<Diagram>;
  updateDiagram(id: number, updates: Partial<InsertDiagram>): Promise<Diagram | undefined>;
  deleteDiagram(id: number): Promise<boolean>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  getAssignmentsByTeacherId(teacherId: number): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getTutorialSession(id: number): Promise<TutorialSession | undefined>;
  getTutorialSessionsByStudentId(studentId: number): Promise<TutorialSession[]>;
  getTutorialSessionsByTeacherId(teacherId: number): Promise<TutorialSession[]>;
  createTutorialSession(session: InsertTutorialSession): Promise<TutorialSession>;
  updateTutorialSession(id: number, updates: Partial<InsertTutorialSession>): Promise<TutorialSession | undefined>;
  getConsistencyCheckByDiagramId(diagramId: number): Promise<ConsistencyCheck | undefined>;
  createConsistencyCheck(check: InsertConsistencyCheck): Promise<ConsistencyCheck>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private diagrams = new Map<number, Diagram>();
  private assignments = new Map<number, Assignment>();
  private tutorialSessions = new Map<number, TutorialSession>();
  private consistencyChecks = new Map<number, ConsistencyCheck>();
  private notifications = new Map<number, Notification>();

  private currentUserId = 1;
  private currentDiagramId = 1;
  private currentAssignmentId = 1;
  private currentTutorialSessionId = 1;
  private currentConsistencyCheckId = 1;
  private currentNotificationId = 1;

  async getUser(id: number) {
    return this.users.get(id);
  }

  async getUserByEmail(email: string) {
    return [...this.users.values()].find(u => u.email === email);
  }

  async createUser(data: InsertUser) {
    const user: User = {
      id: this.currentUserId++,
      email: data.email!,
      password: data.password!,
      name: data.name!,
      role: data.role ?? "student",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getDiagram(id: number) {
    return this.diagrams.get(id);
  }

  async getDiagramsByUserId(userId: number) {
    return [...this.diagrams.values()].filter(d => d.userId === userId);
  }

  async createDiagram(data: InsertDiagram) {
    const diagram: Diagram = {
      id: this.currentDiagramId++,
      userId: data.userId,
      title: data.title,
      type: data.type,
      content: data.content,
      mode: data.mode!,
      status: data.status!,
      assignmentId: data.assignmentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.diagrams.set(diagram.id, diagram);
    return diagram;
  }

  async updateDiagram(id: number, updates: Partial<InsertDiagram>) {
    const existing = this.diagrams.get(id);
    if (!existing) return undefined;
    const updated: Diagram = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.diagrams.set(id, updated);
    return updated;
  }

  async deleteDiagram(id: number) {
    return this.diagrams.delete(id);
  }

  async getAssignment(id: number) {
    return this.assignments.get(id);
  }

  async getAssignmentsByTeacherId(teacherId: number) {
    return [...this.assignments.values()].filter(a => a.teacherId === teacherId);
  }

  async createAssignment(data: InsertAssignment) {
    const assignment: Assignment = {
      id: this.currentAssignmentId++,
      teacherId: data.teacherId,
      title: data.title,
      description: data.description || null,
      requirements: data.requirements,
      dueDate: data.dueDate || null,
      createdAt: new Date()
    };
    this.assignments.set(assignment.id, assignment);
    return assignment;
  }

  async getTutorialSession(id: number) {
    return this.tutorialSessions.get(id);
  }

  async getTutorialSessionsByStudentId(studentId: number) {
    return [...this.tutorialSessions.values()].filter(s => s.studentId === studentId);
  }

  async getTutorialSessionsByTeacherId(teacherId: number) {
    return [...this.tutorialSessions.values()].filter(s => s.teacherId === teacherId);
  }

  async createTutorialSession(data: InsertTutorialSession) {
    const session: TutorialSession = {
      id: this.currentTutorialSessionId++,
      studentId: data.studentId,
      diagramId: data.diagramId,
      status: data.status || 'pending',
      teacherId: data.teacherId || null,
      requestMessage: data.requestMessage || null,
      feedback: data.feedback,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tutorialSessions.set(session.id, session);
    return session;
  }

  async updateTutorialSession(id: number, updates: Partial<InsertTutorialSession>) {
    const session = this.tutorialSessions.get(id);
    if (!session) return undefined;
    const updated: TutorialSession = {
      ...session,
      ...updates,
      updatedAt: new Date()
    };
    this.tutorialSessions.set(id, updated);
    return updated;
  }

  async getConsistencyCheckByDiagramId(diagramId: number) {
    return [...this.consistencyChecks.values()].find(c => c.diagramId === diagramId);
  }

  async createConsistencyCheck(data: InsertConsistencyCheck) {
    const check: ConsistencyCheck = {
      id: this.currentConsistencyCheckId++,
      diagramId: data.diagramId,
      score: data.score || 0,
      issues: data.issues,
      suggestions: data.suggestions,
      createdAt: new Date()
    };
    this.consistencyChecks.set(check.id, check);
    return check;
  }

  async getNotificationsByUserId(userId: number) {
    return [...this.notifications.values()]
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(data: InsertNotification) {
    const notification: Notification = {
      id: this.currentNotificationId++,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      read: data.read || false,
      createdAt: new Date()
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number) {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    const updated = { ...notification, read: true };
    this.notifications.set(id, updated);
    return true;
  }
}

export const storage = new MemStorage();
