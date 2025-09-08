import request from "supertest";
import express from "express";
import { registerRoutes } from "../routes";
import { PrismaClient } from "@prisma/client";
import { beforeAll, describe, it, expect, afterAll, jest } from "@jest/globals";

// In-memory SQLite database setup
const prisma = new PrismaClient();
let app: express.Express;

// Mock Firebase (skip actual token verification in tests)
jest.mock("../firebase", () => ({
  firebaseAuth: { verifyIdToken: async () => { throw new Error("skip in tests"); } },
}));

beforeAll(async () => {
  // Set the database to in-memory for testing
  process.env.DATABASE_URL = "sqlite::memory:";

  app = express();
  app.use(express.json());
  await registerRoutes(app);

  // Reset database (no need to specify schema as it's in-memory)
  await prisma.$connect();
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF`;  // Disable foreign key checks temporarily for SQLite
  // Database schema should be set up via migrations before running tests
});

describe("Auth routes", () => {
  const userData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    role: "student" as const,
  };

  it("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send(userData);
    expect(response.statusCode).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });

  it("should login a user", async () => {
    const response = await request(app).post("/api/auth/login").send(userData);
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });

  it("should fail to login with wrong credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "wrong@example.com",
      password: "wrongpassword",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should fail to register with existing email", async () => {
    const response = await request(app).post("/api/auth/register").send(userData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should fail to register with invalid data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "invalidemail",
      password: "password123",
      name: "Test User",
      role: "student" as const,
    });
    expect(response.statusCode).toBe(400);
  });

  afterAll(async () => {
    // Clean up the database after tests
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
});
