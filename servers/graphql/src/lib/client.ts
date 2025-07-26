import { GraphQLEndpointConfig } from "./types";
import {
  getIntrospectionQuery,
  buildClientSchema,
  parse,
  validate,
  GraphQLSchema,
  printSchema,
  lexicographicSortSchema,
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

    return result;
  }

  async introspect(
    includeDescriptions: boolean = true,
    sortSchema: boolean = true,
  ): Promise<McpResponse> {
    try {
      const result = await this.makeRequest(
        getIntrospectionQuery({
          descriptions: includeDescriptions,
        }),
      );

      const schema = buildClientSchema(result.data);
      this.schema = schema;

      const finalSchema = sortSchema ? lexicographicSortSchema(schema) : schema;

      const sdlSchema = printSchema(finalSchema);

      const typeCount = (sdlSchema.match(/^type\s+/gm) || []).length;
      const interfaceCount = (sdlSchema.match(/^interface\s+/gm) || []).length;
      const enumCount = (sdlSchema.match(/^enum\s+/gm) || []).length;
      const inputCount = (sdlSchema.match(/^input\s+/gm) || []).length;
      const scalarCount = (sdlSchema.match(/^scalar\s+/gm) || []).length;

      const summary = `GraphQL Schema (SDL) for ${this.config.endpoint}

📊 Schema Statistics:
• Types: ${typeCount}
• Interfaces: ${interfaceCount}
• Enums: ${enumCount}
• Inputs: ${inputCount}
• Custom Scalars: ${scalarCount}
• Total Lines: ${sdlSchema.split("\n").length}

🔍 The complete SDL schema is provided below. You can:
• Copy this schema to tools like GraphQL Playground
• Use it to understand the complete API structure
• Generate client code from this SDL
• Import it into GraphQL IDEs for development

Schema Definition Language (SDL):
---

${sdlSchema}`;

      return {
        content: [
          {
            type: "text",
            text: summary,
          },
        ],
      };
    } catch (error) {
      return createErrorResponse(error, "performing introspection");
    }
  }

  async query(queryString: string, variables?: any): Promise<McpResponse> {
    try {
      const document = parse(queryString);

      if (this.schema) {
        const validationErrors = validate(this.schema, document);
        if (validationErrors.length > 0) {
          throw new Error(
            `Query validation failed: ${validationErrors.map((e) => e.message).join(", ")}`,
          );
        }
      }

      const result = await this.makeRequest(queryString, variables);

      return createMcpResponse(
        result.data,
        `GraphQL query executed successfully:\n\n${JSON.stringify(result.data, null, 2)}`,
      );
    } catch (error) {
      return createErrorResponse(error, "executing query");
    }
  }

  async mutation(
    mutationString: string,
    variables?: any,
  ): Promise<McpResponse> {
    try {
      const document = parse(mutationString);

      if (this.schema) {
        const validationErrors = validate(this.schema, document);
        if (validationErrors.length > 0) {
          throw new Error(
            `Mutation validation failed: ${validationErrors.map((e) => e.message).join(", ")}`,
          );
        }
      }

      const result = await this.makeRequest(mutationString, variables);

      return createMcpResponse(
        result.data,
        `GraphQL mutation executed successfully:\n\n${JSON.stringify(result.data, null, 2)}`,
      );
    } catch (error) {
      return createErrorResponse(error, "executing mutation");
    }
  }
}
