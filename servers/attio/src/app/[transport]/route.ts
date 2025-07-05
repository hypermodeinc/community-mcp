import { createMcpHandler } from "@vercel/mcp-adapter";
import { allToolDefinitions, allActions } from "../../lib/scopes";
import { NextRequest, NextResponse } from "next/server";

function authenticateRequest(request: NextRequest): boolean {
  const authKey = process.env.AUTH_KEY;

  if (!authKey) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return token === authKey;
  }

  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader === authKey;
  }

  const url = new URL(request.url);
  const queryKey = url.searchParams.get("auth_key");
  if (queryKey) {
    return queryKey === authKey;
  }

  return false;
}

const mcpHandler = createMcpHandler(
  async (server) => {
    const registerTool = (
      name: string,
      action: (args: any) => Promise<any>,
    ) => {
      const toolDef =
        allToolDefinitions[name as keyof typeof allToolDefinitions];
      if (!toolDef) {
        throw new Error(`Tool definition not found for: ${name}`);
      }

      const schema = toolDef.schema || null;

      if (Object.keys(toolDef.schema || {}).length === 0) {
        server.tool(name, toolDef.description, async (args) => {
          try {
            // Ensure args is always an object, even if empty
            const safeArgs = args === undefined ? {} : args;
            return await action(safeArgs);
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
      } else {
        // @ts-ignore
        server.tool(name, toolDef.description, schema, async (args) => {
          try {
            // Ensure args is always an object, even if empty
            const safeArgs = args === undefined ? {} : args;
            return await action(safeArgs);
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
      }
    };

    // Register test tools (these have special inline handlers)
    server.tool(
      "test_connection",
      allToolDefinitions.test_connection.description,
      allToolDefinitions.test_connection.schema,
      async ({ message }) => ({
        content: [
          {
            type: "text",
            text: `Attio MCP Server is working! ${message ? `Message: ${message}` : ""}`,
          },
        ],
      }),
    );

    // Register all other tools dynamically
    Object.keys(allActions).forEach((actionName) => {
      if (actionName !== "test_connection") {
        registerTool(
          actionName,
          allActions[actionName as keyof typeof allActions],
        );
      }
    });
  },
  {
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
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true, // Disable SSE for now
  },
);

// Authenticated wrapper function
async function authenticatedHandler(request: NextRequest, context: any) {
  // Check authentication
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing authentication credentials",
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="MCP Server"',
        },
      },
    );
  }

  // If authenticated, proceed to the MCP handler
  // @ts-ignore
  return mcpHandler(request, context);
}

export {
  authenticatedHandler as GET,
  authenticatedHandler as POST,
  authenticatedHandler as DELETE,
};
