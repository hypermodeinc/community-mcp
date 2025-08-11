/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@modelcontextprotocol/sdk", "neo4j-driver"],
  env: {
    AUTH_KEY: process.env.AUTH_KEY,
  },
  publicRuntimeConfig: {},
  serverRuntimeConfig: {
    AUTH_KEY: process.env.AUTH_KEY,
  },
};

export default nextConfig;
