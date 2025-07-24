#!/usr/bin/env tsx

import { allToolDefinitions } from "../src/lib/scopes/index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import type { JSONSchema7 } from "json-schema";

interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, any>;
    additionalProperties: boolean;
    $schema: string;
    required?: string[];
  };
}

interface McpToolsSchema {
  tools: McpTool[];
}

function convertToMcpToolsSchema(
  toolDefinitions: typeof allToolDefinitions,
): McpToolsSchema {
  const tools: McpTool[] = Object.entries(toolDefinitions).map(
    ([name, definition]) => {
      const tool: McpTool = {
        name,
        description: definition.description,
        // @ts-ignore
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      };

      // Only process schema if it exists and has properties
      // @ts-ignore
      if (definition.schema && Object.keys(definition.schema).length > 0) {
        try {
          // Create a zod object from the schema definition
          // @ts-ignore
          const zodObject = z.object(definition.schema);

          // Convert to JSON schema without refs and definitions
          const jsonSchema = zodToJsonSchema(zodObject, {
            target: "jsonSchema7",
            $refStrategy: "none",
            definitionPath: "definitions",
          }) as JSONSchema7;

          // Extract properties and required fields - type guard for object schema
          if (
            jsonSchema.type === "object" &&
            typeof jsonSchema.properties === "object" &&
            jsonSchema.properties &&
            Object.keys(jsonSchema.properties).length > 0
          ) {
            tool.inputSchema.properties = jsonSchema.properties;
            if (
              Array.isArray(jsonSchema.required) &&
              jsonSchema.required.length > 0
            ) {
              tool.inputSchema.required = jsonSchema.required;
            }
          }
        } catch (error) {
          console.error(`Error converting schema for tool ${name}:`, error);
          // Fallback: don't add properties field if there's an error
        }
      }

      return tool;
    },
  );

  return { tools };
}

// Main execution
try {
  const mcpSchema = convertToMcpToolsSchema(allToolDefinitions);
  console.log(JSON.stringify(mcpSchema, null, 2));
} catch (error) {
  console.error("Error generating MCP tools schema:", error);
  process.exit(1);
}
