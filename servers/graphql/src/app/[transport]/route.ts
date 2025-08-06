import {
  createMcpHandler,
  experimental_withMcpAuth as withMcpAuth,
} from "@vercel/mcp-adapter";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { formatMcpResponse } from "@hypermode/mcp-shared";
import { allActions, allToolDefinitions } from "@/src/scopes";
import { NextRequest, NextResponse } from "next/server";

const mcpHandler = createMcpHandler(
  async (server) => {
    const registerTool = (
      name: string,
      action: (
        args: any,
        context?: { authToken?: string; graphqlUrl?: string },
      ) => Promise<any>,
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
          // Extract GraphQL URL from headers
          const graphqlUrl =
            extra.request?.headers?.["x-graphql-url"] ||
            extra.request?.headers?.["X-GraphQL-URL"];
          const response = await action(safeArgs, {
            authToken: extra.authInfo?.token,
            graphqlUrl,
          });
          return formatMcpResponse(response);
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
    capabilities: {
      tools: Object.fromEntries(
        Object.entries(allToolDefinitions).map(([name, def]) => [
          name,
          { description: def.description },
        ]),
      ),
      auth: {
        type: "bearer",
        required: true,
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  },
);

const verifyToken = async (
  req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;

  return {
    token: bearerToken,
    clientId: "",
    scopes: [],
  };
};

const authHandler = withMcpAuth(mcpHandler, verifyToken);

// Tools endpoint handler
async function handleToolsEndpoint(request: NextRequest) {
  try {
    const tools = Object.entries(allToolDefinitions).map(
      ([name, definition]) => ({
        name,
        description: definition.description,
        // @ts-ignore
        inputSchema: definition.schema
          ? {
              type: "object",
              properties: definition.schema,
              additionalProperties: false,
              // @ts-ignore
              required: Object.entries(definition.schema)
                .filter(([_, value]) => !value.optional)
                .map(([key, _]) => key),
            }
          : {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
      }),
    );

    return NextResponse.json(
      {
        tools,
        metadata: {
          totalTools: tools.length,
          serverType: "GraphQL MCP Server",
          version: "0.0.0-alpha.1",
          usage: {
            note: "Set GraphQL endpoint URL in 'X-GraphQL-URL' header when making requests",
            headers: {
              "X-GraphQL-URL": "Your GraphQL endpoint URL (required)",
              Authorization:
                "Bearer your_auth_token (optional for GraphQL endpoint auth)",
            },
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-GraphQL-URL",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to retrieve tools: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}

// Route handlers
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/tools")) {
    return handleToolsEndpoint(request);
  }
  return authHandler(request);
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/tools")) {
    return NextResponse.json(
      { error: "Tools endpoint only supports GET requests" },
      { status: 405 },
    );
  }
  return authHandler(request);
}

export async function DELETE(request: NextRequest) {
  return authHandler(request);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-GraphQL-URL",
    },
  });
}
