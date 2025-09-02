// server/types/express/index.d.ts
import "express";

declare global {
  namespace Express {
    interface User {
      userId: string;
      role: "student" | "teacher" | "admin"; // Add more roles if needed
    }

    interface Request {
      user?: User;
    }
  }
}
