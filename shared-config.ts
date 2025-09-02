// shared-config.ts
import path from "path";

export const CLIENT_ROOT = path.resolve(__dirname, "client");
export const PUBLIC_OUT_DIR = path.resolve(__dirname, "dist/public");

export const ALIASES = {
  "@": path.resolve(__dirname, "client", "src"),
  "@shared": path.resolve(__dirname, "shared"),
  "@assets": path.resolve(__dirname, "attached_assets"),
};