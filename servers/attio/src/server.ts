#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  TextContent,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";

export class AttioMCPServer {
  private server: Server;
  private app: express.Application;

  constructor() {
    this.server = new Server(
      {
        name: "attio-mcp-server",
        version: "0.0.0-alpha.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.app = express();
    this.app.use(express.json());
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "say_hello",
            description: "Say hello to someone",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the person to greet",
                },
              },
              required: ["name"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "say_hello":
            return await this.handleSayHello(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`,
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${request.params.name}: ${error}`,
        );
      }
    });
  }

  private async handleSayHello(args: any): Promise<CallToolResult> {
    const { name } = args;
    const greeting = `Hello, ${name}! 👋`;

    return {
      content: [
        {
          type: "text",
          text: greeting,
        } as TextContent,
      ],
    };
  }

  async run(): Promise<void> {
    this.app.post("/mcp", async (req, res) => {
      try {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // Stateless mode
        });

        res.on("close", () => {
          transport.close();
        });

        await this.server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: null,
          });
        }
      }
    });

    this.app.get("/health", (_req, res) => {
      res.json({ status: "ok", message: "Hello World MCP Server is running" });
    });

    const PORT = process.env["PORT"] || 3000;
    this.app.listen(PORT, () => {
      console.log(
        `🚀 Hello World MCP Server running on http://localhost:${PORT}`,
      );
      console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });
  }
}

const server = new AttioMCPServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
