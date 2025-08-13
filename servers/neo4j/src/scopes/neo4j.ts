import { z } from "zod";
import { Neo4jClient } from "../lib/client";

// ===============================
// NEO4J SCHEMAS
// ===============================

export const schemaRequestSchema = {};

export const readQuerySchema = {
  query: z.string().describe("Cypher query to execute (MATCH, RETURN, etc.)"),
  params: z
    .record(z.unknown())
    .optional()
    .default({})
    .describe("Query parameters as JSON object"),
};

export const writeQuerySchema = {
  query: z
    .string()
    .describe("Cypher query to execute (CREATE, MERGE, SET, DELETE, etc.)"),
  params: z
    .record(z.unknown())
    .optional()
    .default({})
    .describe("Query parameters as JSON object"),
};

export const explainQuerySchema = {
  query: z.string().describe("Cypher query to explain"),
  params: z
    .record(z.unknown())
    .optional()
    .default({})
    .describe("Query parameters as JSON object"),
};

// ===============================
// HELPER FUNCTIONS
// ===============================

function getNeo4jConfigFromHeaders(extra?: any): any {
  // Get Neo4j connection details from headers - all are required
  const uri = String(
    extra?.requestInfo?.headers?.["x-neo4j-uri"] ??
      extra?.requestInfo?.headers?.["X-Neo4j-URI"] ??
      "",
  );

  const username = String(
    extra?.requestInfo?.headers?.["x-neo4j-username"] ??
      extra?.requestInfo?.headers?.["X-Neo4j-Username"] ??
      "",
  );

  const password = String(
    extra?.requestInfo?.headers?.["x-neo4j-password"] ??
      extra?.requestInfo?.headers?.["X-Neo4j-Password"] ??
      "",
  );

  const database = String(
    extra?.requestInfo?.headers?.["x-neo4j-database"] ??
      extra?.requestInfo?.headers?.["X-Neo4j-Database"] ??
      "",
  );

  // Validate all required fields are present
  if (!uri) {
    throw new Error("Neo4j URI must be provided in 'X-Neo4j-URI' header");
  }

  if (!username) {
    throw new Error(
      "Neo4j username must be provided in 'X-Neo4j-Username' header",
    );
  }

  if (!password) {
    throw new Error(
      "Neo4j password must be provided in 'X-Neo4j-Password' header",
    );
  }

  if (!database) {
    throw new Error(
      "Neo4j database must be provided in 'X-Neo4j-Database' header",
    );
  }

  return { uri, username, password, database };
}

function isWriteQuery(query: string): boolean {
  const writePatterns = /\b(CREATE|MERGE|SET|DELETE|REMOVE|DETACH)\b/i;
  return writePatterns.test(query);
}

function isReadQuery(query: string): boolean {
  const readPatterns = /\b(MATCH|RETURN|WITH|UNWIND|CALL|UNION)\b/i;
  const writePatterns = /\b(CREATE|MERGE|SET|DELETE|REMOVE|DETACH)\b/i;
  return readPatterns.test(query) && !writePatterns.test(query);
}

async function getSimpleSchema(client: Neo4jClient): Promise<any> {
  try {
    const [labelsResult, relTypesResult] = await Promise.all([
      client.executeQuery("CALL db.labels()", {}, "READ"),
      client.executeQuery("CALL db.relationshipTypes()", {}, "READ"),
    ]);

    const parseResult = (result: any, queryType: string) => {
      if (!result?.content?.[0]?.text) {
        return [];
      }

      const rawText = result.content[0].text;

      try {
        // Extract JSON part after "Query returned X results:"
        const jsonStart = rawText.indexOf("[");
        if (jsonStart === -1) return [];

        const jsonText = rawText.substring(jsonStart);
        const parsed = JSON.parse(jsonText);

        // Extract the actual values from the objects
        if (queryType === "labels") {
          return parsed
            .map((item: any) => item.label)
            .filter(Boolean)
            .sort();
        } else {
          return parsed
            .map((item: any) => item.relationshipType)
            .filter(Boolean)
            .sort();
        }
      } catch (parseError) {
        console.error(`Failed to parse ${queryType} response:`, parseError);
        return [];
      }
    };

    const nodeLabels = parseResult(labelsResult, "labels");
    const relationshipTypes = parseResult(relTypesResult, "relationshipTypes");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              nodeLabels,
              relationshipTypes,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to retrieve schema: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ===============================
// NEO4J ACTIONS
// ===============================

export async function getNeo4jSchema(args: {}, extra?: any) {
  try {
    const config = getNeo4jConfigFromHeaders(extra);
    const client = new Neo4jClient(config);

    try {
      // Just use simple schema discovery with standard Cypher
      return await getSimpleSchema(client);
    } finally {
      await client.close();
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error retrieving schema: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function executeReadQuery(
  args: {
    query: string;
    params?: Record<string, unknown>;
  },
  extra?: any,
) {
  try {
    // Validate it's a read query
    if (!isReadQuery(args.query) || isWriteQuery(args.query)) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Only read queries (MATCH, RETURN, etc.) are allowed with this tool. Use neo4j_write for write operations.",
          },
        ],
      };
    }

    const config = getNeo4jConfigFromHeaders(extra);
    const client = new Neo4jClient(config);

    try {
      return await client.executeQuery(args.query, args.params || {}, "READ");
    } finally {
      await client.close();
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing read query: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function executeWriteQuery(
  args: {
    query: string;
    params?: Record<string, unknown>;
  },
  extra?: any,
) {
  try {
    // Validate it's a write query
    if (!isWriteQuery(args.query)) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Only write queries (CREATE, MERGE, SET, DELETE, etc.) are allowed with this tool. Use neo4j_read for read operations.",
          },
        ],
      };
    }

    const config = getNeo4jConfigFromHeaders(extra);
    const client = new Neo4jClient(config);

    try {
      return await client.executeQuery(args.query, args.params || {}, "WRITE");
    } finally {
      await client.close();
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing write query: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function explainNeo4jQuery(
  args: {
    query: string;
    params?: Record<string, unknown>;
  },
  extra?: any,
) {
  try {
    const config = getNeo4jConfigFromHeaders(extra);
    const client = new Neo4jClient(config);

    try {
      return await client.explainQuery(args.query, args.params || {});
    } finally {
      await client.close();
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error explaining query: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// ===============================
// NEO4J TOOL DEFINITIONS
// ===============================

export const neo4jToolDefinitions = {
  neo4j_schema: {
    description:
      "Get the basic Neo4j database schema including node labels and relationship types using standard Cypher queries.",
    schema: schemaRequestSchema,
  },
  neo4j_read: {
    description:
      "Execute a read-only Cypher query on the Neo4j database. Use for MATCH, RETURN, and other read operations.",
    schema: readQuerySchema,
  },
  neo4j_write: {
    description:
      "Execute a write Cypher query on the Neo4j database. Use for CREATE, MERGE, SET, DELETE, and other write operations.",
    schema: writeQuerySchema,
  },
  neo4j_explain: {
    description:
      "Explain the execution plan for a Cypher query without running it. Useful for query optimization.",
    schema: explainQuerySchema,
  },
};

// ===============================
// NEO4J ACTIONS MAPPING
// ===============================

export const neo4jActions = {
  neo4j_schema: getNeo4jSchema,
  neo4j_read: executeReadQuery,
  neo4j_write: executeWriteQuery,
  neo4j_explain: explainNeo4jQuery,
};
