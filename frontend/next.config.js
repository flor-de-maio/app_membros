const path = require("path");

/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

const nextConfig = {
  // Keep the tracing root pinned to this frontend/ folder so Next doesn't try
  // to infer a monorepo root from sibling directories (backend/, docs/, etc).
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    // Linting is handled separately; avoid failing the production build on
    // lint-only issues (e.g. inherited from shadcn/ui boilerplate).
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
