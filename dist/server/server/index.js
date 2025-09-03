import express from "express";
import { registerRoutes } from "./routes.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            console.log(logLine);
        }
    });
    next();
});
(async () => {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    // Serve static client in production (built assets expected in dist/public)
    if (process.env.NODE_ENV === "production") {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const publicDir = path.resolve(__dirname, "..", "..", "public");
        if (fs.existsSync(publicDir)) {
            app.use(express.static(publicDir));
            app.get("*", (_req, res) => {
                res.sendFile(path.join(publicDir, "index.html"));
            });
        }
    }
    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
        console.log(`serving on port ${port}`);
    });
})();
