import { prisma } from "./prisma.js";
export class PrismaStorage {
    async getUser(id) {
        const u = await prisma.user.findUnique({ where: { id } });
        return u ?? undefined;
    }
    async getUserByEmail(email) {
        const u = await prisma.user.findUnique({ where: { email } });
        return u ?? undefined;
    }
    async createUser(data) {
        return prisma.user.create({
            data: {
                email: data.email,
                password: data.password, // already hashed by routes
                name: data.name,
                role: data.role ?? "student",
            },
        });
    }
    // Implement other methods later (diagrams, sessions, etc.)
    // For unimplemented ones, you can throw new Error("Not implemented");
    async getDiagram(_id) {
        throw new Error("Not implemented");
    }
    async getDiagramsByUserId(_userId) {
        throw new Error("Not implemented");
    }
    async createDiagram(_diagram) {
        throw new Error("Not implemented");
    }
    async updateDiagram(_id, _updates) {
        throw new Error("Not implemented");
    }
    async deleteDiagram(_id) {
        throw new Error("Not implemented");
    }
    async getAssignment(_id) {
        throw new Error("Not implemented");
    }
    async getAssignmentsByTeacherId(_teacherId) {
        throw new Error("Not implemented");
    }
    async createAssignment(_assignment) {
        throw new Error("Not implemented");
    }
    async getTutorialSession(_id) {
        throw new Error("Not implemented");
    }
    async getTutorialSessionsByStudentId(_studentId) {
        throw new Error("Not implemented");
    }
    async getTutorialSessionsByTeacherId(_teacherId) {
        throw new Error("Not implemented");
    }
    async createTutorialSession(_session) {
        throw new Error("Not implemented");
    }
    async updateTutorialSession(_id, _updates) {
        throw new Error("Not implemented");
    }
    async getConsistencyCheckByDiagramId(_diagramId) {
        throw new Error("Not implemented");
    }
    async createConsistencyCheck(_check) {
        throw new Error("Not implemented");
    }
    async getNotificationsByUserId(_userId) {
        throw new Error("Not implemented");
    }
    async createNotification(_notification) {
        throw new Error("Not implemented");
    }
    async markNotificationAsRead(_id) {
        throw new Error("Not implemented");
    }
}
