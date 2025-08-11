import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { allActions, allToolDefinitions } from "@/src/scopes";
import { createHash } from "crypto";

const verifyToken = async (
  req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;

  if (bearerToken.trim().length === 0) return undefined;

  // Create a simple client ID from token hash for identification
  const tokenHash = createHash("sha256")
    .update(bearerToken)
    .digest("hex")
    .slice(0, 12);
  const clientId = `neo4j-user-${tokenHash}`;

  return {
    token: bearerToken,
    scopes: ["neo4j:read", "neo4j:write", "neo4j:schema"],
    clientId: clientId,
    extra: {
      neo4jToken: bearerToken,
    },
  };
};

const handler = createMcpHandler(
  (server) => {
    const registerTool = (
      name: string,
      action: (args: any, extra?: any) => Promise<any>,
    ) => {
      const toolDef =
        allToolDefinitions[name as keyof typeof allToolDefinitions];
      if (!toolDef) {
        throw new Error(`Tool definition not found for: ${name}`);
      }

      // @ts-ignore
      const schema = toolDef.schema || null;

      // @ts-ignore
      server.tool(name, toolDef.description, schema, async (args, extra) => {
        try {
          const safeArgs = args === undefined ? {} : args;
          const response = await action(safeArgs, extra);

          // Return the standard MCP response format
          // The response should already be in { content: [...] } format
          return response;
        } catch (error) {
          console.error(`Error in ${name}:`, error);
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          };
        }
      });
    };

    // Register all tools dynamically
    Object.keys(allActions).forEach((actionName) => {
      registerTool(
        actionName,
        allActions[actionName as keyof typeof allActions],
      );
    });
  },
  {
    // Optional server options
    capabilities: {
      tools: Object.fromEntries(
        Object.entries(allToolDefinitions).map(([name, def]) => [
          name,
          { description: def.description },
        ]),
      ),
    },
  },
  {
    basePath: "", // Empty since route is at app/[transport], not app/api/[transport]
    maxDuration: 60,
    verboseLogs: true,
    disableSse: true, // Disable SSE for this handler
  },
);

// Wrap handler with authentication
const authHandler = withMcpAuth(handler, verifyToken, {
  required: false, // Allow both authenticated and unauthenticated access
  requiredScopes: [], // No specific scopes required
});

export { authHandler as GET, authHandler as POST };
