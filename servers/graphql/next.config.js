/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  env: {
    AUTH_KEY: process.env.AUTH_KEY,
  },
  publicRuntimeConfig: {},
  serverRuntimeConfig: {
    AUTH_KEY: process.env.AUTH_KEY,
  },
};

export default nextConfig;
