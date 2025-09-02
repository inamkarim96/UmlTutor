import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "umtutor-secret-key";
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Access token required" });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ message: "Invalid token" });
        req.user = {
            userId: String(user.userId),
            email: user.email,
            role: user.role
        };
        next();
    });
};
export async function registerRoutes(app) {
    app.post("/api/auth/register", async (req, res) => {
        try {
            const userData = insertUserSchema.parse(req.body);
            const existingUser = await storage.getUserByEmail(userData.email);
            if (existingUser)
                return res.status(400).json({ message: "User already exists" });
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await storage.createUser({ ...userData, password: hashedPassword });
            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            });
        }
        catch (error) {
            console.error("Registration error:", error);
            res.status(400).json({ message: "Invalid user data" });
        }
    });
    app.post("/api/auth/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await storage.getUserByEmail(email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            });
        }
        catch (error) {
            res.status(500).json({ message: "Login failed" });
        }
    });
    app.get("/api/user/profile", authenticateToken, async (req, res) => {
        try {
            const userId = Number(req.user.userId);
            const user = await storage.getUser(userId);
            if (!user)
                return res.status(404).json({ message: "User not found" });
            res.json(user);
        }
        catch {
            res.status(500).json({ message: "Failed to get user profile" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
async function runConsistencyCheck(diagram) {
    const issues = [];
    const content = diagram.content;
    if (diagram.type === "usecase") {
        if (!content.actors?.length)
            issues.push({
                type: "missing_actors",
                severity: "error",
                message: "Use case diagram must have at least one actor"
            });
        if (!content.useCases?.length)
            issues.push({
                type: "missing_usecases",
                severity: "error",
                message: "Use case diagram must have at least one use case"
            });
        if (!content.associations?.length)
            issues.push({
                type: "missing_associations",
                severity: "warning",
                message: "Consider adding associations between actors and use cases"
            });
        const connected = new Set();
        content.associations?.forEach((a) => {
            connected.add(a.source);
            connected.add(a.target);
        });
        content.actors?.forEach((a) => {
            if (!connected.has(a.id))
                issues.push({
                    type: "orphaned_actor",
                    severity: "warning",
                    message: `Actor "${a.name}" is not connected`
                });
        });
        content.useCases?.forEach((u) => {
            if (!connected.has(u.id))
                issues.push({
                    type: "orphaned_usecase",
                    severity: "warning",
                    message: `Use case "${u.name}" is not connected`
                });
        });
    }
    return issues;
}
function calculateConsistencyScore(issues) {
    return Math.max(0, 100 - issues.reduce((acc, i) => acc + (i.severity === "error" ? 20 : 10), 0));
}
function generateSuggestions(issues) {
    const suggestions = [];
    for (const issue of issues) {
        switch (issue.type) {
            case "missing_actors":
                suggestions.push("Add actors");
                break;
            case "missing_usecases":
                suggestions.push("Add use cases");
                break;
            case "missing_associations":
                suggestions.push("Add associations");
                break;
            case "orphaned_actor":
                suggestions.push("Connect or remove orphaned actors");
                break;
            case "orphaned_usecase":
                suggestions.push("Connect or remove orphaned use cases");
                break;
        }
    }
    return suggestions;
}
