// server/types/express/index.d.ts
import "express";

declare global {
  namespace Express {
    interface User {
      userId: string;
      email?: string;
      role?: "student" | "teacher" | "admin";
      firebaseUid?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
