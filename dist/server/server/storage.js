export class MemStorage {
    constructor() {
        this.users = new Map();
        this.diagrams = new Map();
        this.assignments = new Map();
        this.tutorialSessions = new Map();
        this.consistencyChecks = new Map();
        this.notifications = new Map();
        this.currentUserId = 1;
        this.currentDiagramId = 1;
        this.currentAssignmentId = 1;
        this.currentTutorialSessionId = 1;
        this.currentConsistencyCheckId = 1;
        this.currentNotificationId = 1;
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByEmail(email) {
        return [...this.users.values()].find(u => u.email === email);
    }
    async createUser(data) {
        const user = {
            id: this.currentUserId++,
            email: data.email,
            password: data.password,
            name: data.name,
            role: data.role ?? "student",
            createdAt: new Date()
        };
        this.users.set(user.id, user);
        return user;
    }
    async getDiagram(id) {
        return this.diagrams.get(id);
    }
    async getDiagramsByUserId(userId) {
        return [...this.diagrams.values()].filter(d => d.userId === userId);
    }
    async createDiagram(data) {
        const diagram = {
            id: this.currentDiagramId++,
            userId: data.userId,
            title: data.title,
            type: data.type,
            content: data.content,
            mode: data.mode,
            status: data.status,
            assignmentId: data.assignmentId ?? null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.diagrams.set(diagram.id, diagram);
        return diagram;
    }
    async updateDiagram(id, updates) {
        const existing = this.diagrams.get(id);
        if (!existing)
            return undefined;
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        };
        this.diagrams.set(id, updated);
        return updated;
    }
    async deleteDiagram(id) {
        return this.diagrams.delete(id);
    }
    async getAssignment(id) {
        return this.assignments.get(id);
    }
    async getAssignmentsByTeacherId(teacherId) {
        return [...this.assignments.values()].filter(a => a.teacherId === teacherId);
    }
    async createAssignment(data) {
        const assignment = {
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
    async getTutorialSession(id) {
        return this.tutorialSessions.get(id);
    }
    async getTutorialSessionsByStudentId(studentId) {
        return [...this.tutorialSessions.values()].filter(s => s.studentId === studentId);
    }
    async getTutorialSessionsByTeacherId(teacherId) {
        return [...this.tutorialSessions.values()].filter(s => s.teacherId === teacherId);
    }
    async createTutorialSession(data) {
        const session = {
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
    async updateTutorialSession(id, updates) {
        const session = this.tutorialSessions.get(id);
        if (!session)
            return undefined;
        const updated = {
            ...session,
            ...updates,
            updatedAt: new Date()
        };
        this.tutorialSessions.set(id, updated);
        return updated;
    }
    async getConsistencyCheckByDiagramId(diagramId) {
        return [...this.consistencyChecks.values()].find(c => c.diagramId === diagramId);
    }
    async createConsistencyCheck(data) {
        const check = {
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
    async getNotificationsByUserId(userId) {
        return [...this.notifications.values()]
            .filter(n => n.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async createNotification(data) {
        const notification = {
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
    async markNotificationAsRead(id) {
        const notification = this.notifications.get(id);
        if (!notification)
            return false;
        const updated = { ...notification, read: true };
        this.notifications.set(id, updated);
        return true;
    }
}
export const storage = new MemStorage();
