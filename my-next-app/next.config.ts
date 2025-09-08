import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence monorepo/workspace root inference warning
  outputFileTracingRoot: path.join(__dirname, ".."),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
