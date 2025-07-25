// servers/graphql/src/app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          GraphQL MCP Server
        </h1>
        <p className="text-gray-600 mb-4">
          Model Context Protocol server for GraphQL API integration
        </p>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            <strong>MCP Endpoints:</strong>
          </div>
          <div className="text-sm text-gray-500">• /mcp (Streamable HTTP)</div>
        </div>
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold text-gray-700">
            Available Tools:
          </h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• GraphQL introspection</li>
            <li>• Query execution with validation</li>
            <li>• Mutation execution with validation</li>
          </ul>
        </div>
        <div className="mt-6">
          <a
            href="https://github.com/hypermodeinc/community-mcp"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}
