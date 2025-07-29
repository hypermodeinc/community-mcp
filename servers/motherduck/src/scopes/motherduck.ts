import { z } from "zod";
import { McpResponse } from "@hypermode/mcp-shared";
import { MotherDuckClient } from "../lib/client";

// ===============================
// MOTHERDUCK SCHEMAS
// ===============================

export const querySchema = {
  query: z.string().describe("SQL query to execute using DuckDB SQL dialect"),
};

// ===============================
// MOTHERDUCK ACTIONS
// ===============================

export async function executeQuery(
  args: {
    query: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    // The authToken is forwarded from the MCP client's bearer token
    if (!context?.authToken) {
      return {
        content: [
          {
            type: "text",
            text: "Error: MotherDuck token is required. Please provide a valid MotherDuck API token in the MCP client configuration.",
          },
        ],
      };
    }

    const client = new MotherDuckClient(context.authToken);
    const result = await client.executeQuery(args.query);

    // Close the connection after use
    await client.close();

    return result;
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing MotherDuck query: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// ===============================
// MOTHERDUCK TOOL DEFINITIONS
// ===============================

export const motherDuckToolDefinitions = {
  query: {
    description:
      "Execute a SQL query on the MotherDuck database using DuckDB SQL dialect. Supports analytics queries, data exploration, aggregations, joins, and more.",
    schema: querySchema,
  },
};

// ===============================
// MOTHERDUCK ACTIONS MAPPING
// ===============================

export const motherDuckActions = {
  query: executeQuery,
};
