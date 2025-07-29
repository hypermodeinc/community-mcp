/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@modelcontextprotocol/sdk",
    "@duckdb/node-api",
    "@duckdb/node-bindings",
    "@duckdb/node-bindings-linux-x64",
    "@duckdb/node-bindings-linux-arm64",
    "@duckdb/node-bindings-darwin-x64",
    "@duckdb/node-bindings-win32-x64",
  ],
  env: {
    AUTH_KEY: process.env.AUTH_KEY,
  },
  publicRuntimeConfig: {},
  serverRuntimeConfig: {
    AUTH_KEY: process.env.AUTH_KEY,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // External DuckDB native modules - don't bundle them
      config.externals = [
        ...config.externals,
        {
          "@duckdb/node-bindings": "commonjs @duckdb/node-bindings",
          "@duckdb/node-bindings-linux-x64":
            "commonjs @duckdb/node-bindings-linux-x64",
          "@duckdb/node-bindings-linux-arm64":
            "commonjs @duckdb/node-bindings-linux-arm64",
          "@duckdb/node-bindings-darwin-x64":
            "commonjs @duckdb/node-bindings-darwin-x64",
          "@duckdb/node-bindings-win32-x64":
            "commonjs @duckdb/node-bindings-win32-x64",
        },
      ];

      // Handle .node files if they exist
      config.module.rules.push({
        test: /\.node$/,
        use: [
          {
            loader: "node-loader",
            options: {
              name: "[name].[ext]",
            },
          },
        ],
      });
    }

    return config;
  },
};

export default nextConfig;
