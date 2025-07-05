/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  env: {
    ATTIO_API_KEY: process.env.ATTIO_API_KEY,
    ATTIO_API_BASE_URL:
      process.env.ATTIO_API_BASE_URL || "https://api.attio.com",
    ATTIO_OPENAPI_URL:
      process.env.ATTIO_OPENAPI_URL || "https://api.attio.com/openapi/api",
    AUTH_KEY: process.env.AUTH_KEY,
  },
  publicRuntimeConfig: {},
  serverRuntimeConfig: {
    // Server-side environment variables
    ATTIO_API_KEY: process.env.ATTIO_API_KEY,
    ATTIO_API_BASE_URL:
      process.env.ATTIO_API_BASE_URL || "https://api.attio.com",
    ATTIO_OPENAPI_URL:
      process.env.ATTIO_OPENAPI_URL || "https://api.attio.com/openapi/api",
    AUTH_KEY: process.env.AUTH_KEY,
  },
};

export default nextConfig;
