// server/server-entry.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
// Removed Vite integration. Provide minimal helpers locally.
import fs from "fs";
// Fix for __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function log(message) {
    console.log(message);
}
// Define port and environment mode
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
async function startServer() {
    const app = express();
    const httpServer = createServer(app);
    try {
        if (IS_PRODUCTION) {
            log("Starting in production mode...");
            // Serve static files from dist/public if present
            const publicDir = path.resolve(__dirname, "..", "public");
            if (fs.existsSync(publicDir)) {
                app.use(express.static(publicDir));
                app.get("*", (_req, res) => {
                    res.sendFile(path.join(publicDir, "index.html"));
                });
            }
            else {
                log("dist/public not found. Serving API only.");
            }
        }
        else {
            log("Starting in development mode...");
            // In dev, no Vite. Serve API only.
        }
        httpServer.listen(PORT, () => {
            log(` Server running at http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error("Error during server setup:", err);
        process.exit(1);
    }
}
startServer();
