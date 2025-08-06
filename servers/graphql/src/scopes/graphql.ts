// servers/graphql/src/scopes/graphql.ts
import { z } from "zod";
import { McpResponse } from "@hypermode/mcp-shared";
import { GraphQLClient } from "../lib/client";

// ===============================
// CLEAN GRAPHQL SCHEMAS (No endpoint/headers exposed)
// ===============================

export const introspectSchema = {
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
  query: z.string().describe("GraphQL query string"),
  variables: z
    .record(z.unknown())
    .optional()
    .describe("Query variables as JSON object"),
};

export const mutationSchema = {
  mutation: z.string().describe("GraphQL mutation string"),
  variables: z
    .record(z.unknown())
    .optional()
    .describe("Mutation variables as JSON object"),
};

// ===============================
// GRAPHQL ACTIONS (Using X-GraphQL-API header)
// ===============================

export async function introspectGraphQL(
  args: {
    include_descriptions?: boolean;
    sort_schema?: boolean;
  },
  extra?: any,
): Promise<McpResponse> {
  try {
    // Extract GraphQL URL from request headers
    const graphqlUrl = String(
      extra?.requestInfo?.headers?.["x-graphql-api"] ??
        extra?.requestInfo?.headers?.["X-GraphQL-API"] ??
        "",
    );

    if (!graphqlUrl) {
      return {
        content: [
          {
            type: "text",
            text: "Error: GraphQL endpoint URL must be provided in 'X-GraphQL-API' header",
          },
        ],
      };
    }

    // Extract bearer token from Authorization header
    const authToken = String(
      extra?.requestInfo?.headers?.authorization ?? "",
    ).replace("Bearer ", "");

    const client = new GraphQLClient(
      {
        endpoint: graphqlUrl,
      },
      authToken || undefined,
    );

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

export async function executeGraphQLQuery(
  args: {
    query: string;
    variables?: Record<string, unknown>;
  },
  extra?: any,
): Promise<McpResponse> {
  try {
    // Extract GraphQL URL from request headers
    const graphqlUrl = String(
      extra?.requestInfo?.headers?.["x-graphql-api"] ??
        extra?.requestInfo?.headers?.["X-GraphQL-API"] ??
        "",
    );

    if (!graphqlUrl) {
      return {
        content: [
          {
            type: "text",
            text: "Error: GraphQL endpoint URL must be provided in 'X-GraphQL-API' header",
          },
        ],
      };
    }

    // Extract bearer token from Authorization header
    const authToken = String(
      extra?.requestInfo?.headers?.authorization ?? "",
    ).replace("Bearer ", "");

    const client = new GraphQLClient(
      {
        endpoint: graphqlUrl,
      },
      authToken || undefined,
    );

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

export async function executeGraphQLMutation(
  args: {
    mutation: string;
    variables?: Record<string, unknown>;
  },
  extra?: any,
): Promise<McpResponse> {
  try {
    // Extract GraphQL URL from request headers
    const graphqlUrl = String(
      extra?.requestInfo?.headers?.["x-graphql-api"] ??
        extra?.requestInfo?.headers?.["X-GraphQL-API"] ??
        "",
    );

    if (!graphqlUrl) {
      return {
        content: [
          {
            type: "text",
            text: "Error: GraphQL endpoint URL must be provided in 'X-GraphQL-API' header",
          },
        ],
      };
    }

    // Extract bearer token from Authorization header
    const authToken = String(
      extra?.requestInfo?.headers?.authorization ?? "",
    ).replace("Bearer ", "");

    const client = new GraphQLClient(
      {
        endpoint: graphqlUrl,
      },
      authToken || undefined,
    );

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
// CLEAN GRAPHQL TOOL DEFINITIONS
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
