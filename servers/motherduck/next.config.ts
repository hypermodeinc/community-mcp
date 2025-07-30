import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Ensure DuckDB only runs on server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };

      // Exclude DuckDB from client bundle completely
      config.externals = [...(config.externals || []), "@duckdb/node-api"];
    }

    // For server-side, mark DuckDB as external to prevent bundling
    if (isServer) {
      config.externals = [
        ...config.externals,
        "@duckdb/node-api",
        "@duckdb/node-bindings",
        "@duckdb/node-bindings-linux-x64",
        "@duckdb/node-bindings-linux-arm64",
        "@duckdb/node-bindings-darwin-x64",
        "@duckdb/node-bindings-darwin-arm64",
        "@duckdb/node-bindings-win32-x64",
      ];
    }

    return config;
  },
  // Mark DuckDB as external package for server components
  serverExternalPackages: ["@duckdb/node-api"],
};

export default nextConfig;
