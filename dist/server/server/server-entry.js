// server/server-entry.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
// Use relative path to vite.ts since Node.js cannot import .js extension if the file is actually .ts
import { setupVite, serveStatic, log } from "./vite"; // No .js in import, TS will resolve
// Fix for __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define port and environment mode
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
async function startServer() {
    const app = express();
    const httpServer = createServer(app);
    try {
        if (IS_PRODUCTION) {
            log("Starting in production mode...");
            serveStatic(app); // serves from /dist/public
        }
        else {
            log("Starting in development mode...");
            await setupVite(app, httpServer); // sets up Vite dev server as middleware
        }
        httpServer.listen(PORT, () => {
            log(`🚀 Server running at http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error("❌ Error during server setup:", err);
        process.exit(1);
    }
}
startServer();
