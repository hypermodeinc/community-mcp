// servers/graphql/src/lib/client.ts
import { GraphQLEndpointConfig } from "./types";
import {
  getIntrospectionQuery,
  buildClientSchema,
  parse,
  validate,
  GraphQLSchema,
} from "graphql";
import {
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "@hypermode/mcp-shared";

export class GraphQLClient {
  private config: GraphQLEndpointConfig;
  private schema: GraphQLSchema | null = null;

  constructor(config: GraphQLEndpointConfig) {
    this.config = config;
  }

  private async makeRequest(query: string, variables?: any): Promise<any> {
    const response = await fetch(this.config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.config.headers,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(
        `GraphQL request failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  async introspect(): Promise<McpResponse> {
    try {
      const data = await this.makeRequest(getIntrospectionQuery());
      this.schema = buildClientSchema(data);

      return createMcpResponse(
        data,
        `GraphQL schema introspection completed. Found ${data.__schema.types?.length || 0} types.`,
      );
    } catch (error) {
      return createErrorResponse(error, "performing introspection");
    }
  }

  async query(queryString: string, variables?: any): Promise<McpResponse> {
    try {
      // Parse and validate the query
      const document = parse(queryString);

      if (this.schema) {
        const validationErrors = validate(this.schema, document);
        if (validationErrors.length > 0) {
          throw new Error(
            `Query validation failed: ${validationErrors.map((e) => e.message).join(", ")}`,
          );
        }
      }

      const data = await this.makeRequest(queryString, variables);

      return createMcpResponse(data, `Query executed successfully.`);
    } catch (error) {
      return createErrorResponse(error, "executing query");
    }
  }

  async mutation(
    mutationString: string,
    variables?: any,
  ): Promise<McpResponse> {
    try {
      // Parse and validate the mutation
      const document = parse(mutationString);

      if (this.schema) {
        const validationErrors = validate(this.schema, document);
        if (validationErrors.length > 0) {
          throw new Error(
            `Mutation validation failed: ${validationErrors.map((e) => e.message).join(", ")}`,
          );
        }
      }

      const data = await this.makeRequest(mutationString, variables);

      return createMcpResponse(data, `Mutation executed successfully.`);
    } catch (error) {
      return createErrorResponse(error, "executing mutation");
    }
  }
}
