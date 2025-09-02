import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("student"), // 'student' | 'teacher'
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const diagrams = pgTable("diagrams", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(), // 'usecase' | 'ssd' | 'description'
    content: jsonb("content").notNull(),
    mode: text("mode").notNull().default("development"), // 'development' | 'tutorial' | 'checking'
    status: text("status").notNull().default("draft"), // 'draft' | 'submitted' | 'approved' | 'rejected'
    assignmentId: integer("assignment_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const assignments = pgTable("assignments", {
    id: serial("id").primaryKey(),
    teacherId: integer("teacher_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    requirements: jsonb("requirements").notNull(),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const tutorialSessions = pgTable("tutorial_sessions", {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull(),
    teacherId: integer("teacher_id"),
    diagramId: integer("diagram_id").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected' | 'completed'
    requestMessage: text("request_message"),
    feedback: jsonb("feedback"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const consistencyChecks = pgTable("consistency_checks", {
    id: serial("id").primaryKey(),
    diagramId: integer("diagram_id").notNull(),
    issues: jsonb("issues").notNull(),
    score: integer("score").notNull().default(0),
    suggestions: jsonb("suggestions"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    type: text("type").notNull(), // 'tutorial_request' | 'tutorial_approved' | 'assignment_graded'
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: boolean("read").notNull().default(false),
    data: jsonb("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
});
export const insertDiagramSchema = createInsertSchema(diagrams).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertAssignmentSchema = createInsertSchema(assignments).omit({
    id: true,
    createdAt: true,
});
export const insertTutorialSessionSchema = createInsertSchema(tutorialSessions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertConsistencyCheckSchema = createInsertSchema(consistencyChecks).omit({
    id: true,
    createdAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
    id: true,
    createdAt: true,
});
