// servers/graphql/src/scopes/graphql.ts
import { z } from "zod";
import { McpResponse } from "@hypermode/mcp-shared";
import { GraphQLClient } from "../lib/client";

// ===============================
// GRAPHQL SCHEMAS
// ===============================

export const introspectSchema = {
  endpoint: z.string().url().describe("GraphQL endpoint URL"),
  headers: z
    .record(z.string())
    .optional()
    .describe("HTTP headers to include with requests"),
  include_descriptions: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include field and type descriptions in the SDL output"),
  sort_schema: z
    .boolean()
    .optional()
    .default(true)
    .describe("Sort the schema types alphabetically for better readability"),
};

export const querySchema = {
  endpoint: z.string().url().describe("GraphQL endpoint URL"),
  query: z.string().describe("GraphQL query string"),
  variables: z
    .record(z.unknown())
    .optional()
    .describe("Query variables as JSON object"),
  headers: z
    .record(z.string())
    .optional()
    .describe("HTTP headers to include with requests"),
};

export const mutationSchema = {
  endpoint: z.string().url().describe("GraphQL endpoint URL"),
  mutation: z.string().describe("GraphQL mutation string"),
  variables: z
    .record(z.unknown())
    .optional()
    .describe("Mutation variables as JSON object"),
  headers: z
    .record(z.string())
    .optional()
    .describe("HTTP headers to include with requests"),
};

// ===============================
// GRAPHQL ACTIONS
// ===============================

export async function introspectGraphQL(args: {
  endpoint: string;
  headers?: Record<string, string>;
  include_descriptions?: boolean;
  sort_schema?: boolean;
}): Promise<McpResponse> {
  try {
    const client = new GraphQLClient({
      endpoint: args.endpoint,
      headers: args.headers,
    });

    return await client.introspect(
      args.include_descriptions ?? true,
      args.sort_schema ?? true,
    );
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error performing introspection: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function executeGraphQLQuery(args: {
  endpoint: string;
  query: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
}): Promise<McpResponse> {
  try {
    const client = new GraphQLClient({
      endpoint: args.endpoint,
      headers: args.headers,
    });

    return await client.query(args.query, args.variables);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing query: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function executeGraphQLMutation(args: {
  endpoint: string;
  mutation: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
}): Promise<McpResponse> {
  try {
    const client = new GraphQLClient({
      endpoint: args.endpoint,
      headers: args.headers,
    });

    return await client.mutation(args.mutation, args.variables);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing mutation: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// ===============================
// GRAPHQL TOOL DEFINITIONS
// ===============================

export const graphqlToolDefinitions = {
  graphql_introspect: {
    description:
      "Introspect a GraphQL endpoint and return the complete schema in SDL (Schema Definition Language) format. This provides a human-readable schema that can be used with GraphQL tools, IDEs, and for understanding the complete API structure.",
    schema: introspectSchema,
  },
  graphql_query: {
    description:
      "Execute a GraphQL query against a specified endpoint with optional variables",
    schema: querySchema,
  },
  graphql_mutation: {
    description:
      "Execute a GraphQL mutation against a specified endpoint with optional variables",
    schema: mutationSchema,
  },
};

// ===============================
// GRAPHQL ACTIONS MAPPING
// ===============================

export const graphqlActions = {
  graphql_introspect: introspectGraphQL,
  graphql_query: executeGraphQLQuery,
  graphql_mutation: executeGraphQLMutation,
};
