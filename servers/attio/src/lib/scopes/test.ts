import { z } from "zod";
import { McpResponse } from "../base/api-client";

// ===============================
// TEST SCHEMAS
// ===============================

export const testConnectionSchema = {
  message: z.string().optional().describe("Optional test message"),
};

// ===============================
// TEST ACTIONS
// ===============================

export async function testConnection(
  args: { message?: string } = {},
): Promise<McpResponse> {
  const { message } = args;
  return {
    content: [
      {
        type: "text",
        text: `Attio MCP Server is working! ${message ? `Message: ${message}` : ""}`,
      },
    ],
  };
}

// ===============================
// TEST TOOL DEFINITIONS
// ===============================

export const testToolDefinitions = {
  test_connection: {
    description: "Test connection to Attio MCP server",
    schema: testConnectionSchema,
  },
};

// ===============================
// TEST ACTIONS MAPPING
// ===============================

export const testActions = {
  test_connection: testConnection,
};
