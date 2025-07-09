import { createMcpHandler, experimental_withMcpAuth as withMcpAuth } from "@vercel/mcp-adapter";
import { allToolDefinitions, allActions } from "../../lib/scopes";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

const mcpHandler = createMcpHandler(
  async (server) => {
    const registerTool = (
      name: string,
      action: (args: any, context?: { authToken?: string } | { authToken?: string }) => Promise<any>,
    ) => {
      const toolDef =
        allToolDefinitions[name as keyof typeof allToolDefinitions];
      if (!toolDef) {
        throw new Error(`Tool definition not found for: ${name}`);
      }

      const schema = toolDef.schema || null;

      if (Object.keys(toolDef.schema || {}).length === 0) {
        server.tool(name, toolDef.description, async (extra) => {
          try {
            return await action({ authToken: extra.authInfo?.token });
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
        server.tool(name, toolDef.description, schema, async (args, extra) => {
          try {
            // Ensure args is always an object, even if empty
            const safeArgs = args === undefined ? {} : args;
            return await action(safeArgs, { authToken: extra.authInfo?.token });
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
      auth: {
        type: 'bearer',
        required: true,
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true, // Disable SSE for now
  },
);

const verifyToken = async (req: Request, bearerToken?: string): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;
  
  return {
      token: bearerToken,
      clientId: '',
      scopes: [],
  };
}

const authHandler = withMcpAuth(
  mcpHandler,
  verifyToken
);

export {
  authHandler as GET,
  authHandler as POST,
  authHandler as DELETE,
};
