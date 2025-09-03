import { prisma } from "./prisma.js";
import type { IStorage } from "./storage.js";
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

export class PrismaStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ?? undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const u = await prisma.user.findUnique({ where: { email } });
    return u ?? undefined;
  }

  async createUser(data: InsertUser): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email!,
        password: data.password!, // already hashed by routes
        name: data.name!,
        role: data.role ?? "student",
      },
    });
  }

  // Implement other methods later (diagrams, sessions, etc.)
  // For unimplemented ones, you can throw new Error("Not implemented");
  async getDiagram(_id: number): Promise<Diagram | undefined> {
    throw new Error("Not implemented");
  }

  async getDiagramsByUserId(_userId: number): Promise<Diagram[]> {
    throw new Error("Not implemented");
  }

  async createDiagram(_diagram: InsertDiagram): Promise<Diagram> {
    throw new Error("Not implemented");
  }

  async updateDiagram(_id: number, _updates: Partial<InsertDiagram>): Promise<Diagram | undefined> {
    throw new Error("Not implemented");
  }

  async deleteDiagram(_id: number): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async getAssignment(_id: number): Promise<Assignment | undefined> {
    throw new Error("Not implemented");
  }

  async getAssignmentsByTeacherId(_teacherId: number): Promise<Assignment[]> {
    throw new Error("Not implemented");
  }

  async createAssignment(_assignment: InsertAssignment): Promise<Assignment> {
    throw new Error("Not implemented");
  }

  async getTutorialSession(_id: number): Promise<TutorialSession | undefined> {
    throw new Error("Not implemented");
  }

  async getTutorialSessionsByStudentId(_studentId: number): Promise<TutorialSession[]> {
    throw new Error("Not implemented");
  }

  async getTutorialSessionsByTeacherId(_teacherId: number): Promise<TutorialSession[]> {
    throw new Error("Not implemented");
  }

  async createTutorialSession(_session: InsertTutorialSession): Promise<TutorialSession> {
    throw new Error("Not implemented");
  }

  async updateTutorialSession(_id: number, _updates: Partial<InsertTutorialSession>): Promise<TutorialSession | undefined> {
    throw new Error("Not implemented");
  }

  async getConsistencyCheckByDiagramId(_diagramId: number): Promise<ConsistencyCheck | undefined> {
    throw new Error("Not implemented");
  }

  async createConsistencyCheck(_check: InsertConsistencyCheck): Promise<ConsistencyCheck> {
    throw new Error("Not implemented");
  }

  async getNotificationsByUserId(_userId: number): Promise<Notification[]> {
    throw new Error("Not implemented");
  }

  async createNotification(_notification: InsertNotification): Promise<Notification> {
    throw new Error("Not implemented");
  }

  async markNotificationAsRead(_id: number): Promise<boolean> {
    throw new Error("Not implemented");
  }
}