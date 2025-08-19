import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import * as duckdb from "@duckdb/node-api";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createHash } from "crypto";

const verifyToken = async (
  req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;

  if (bearerToken.trim().length === 0) return undefined;

  const tokenHash = createHash("sha256")
    .update(bearerToken)
    .digest("hex")
    .slice(0, 12);
  const clientId = `motherduck-user-${tokenHash}`;

  return {
    token: bearerToken,
    scopes: ["motherduck:query"],
    clientId: clientId,
    extra: {
      motherduckToken: bearerToken,
    },
  };
};

function formatResultsAsTable(columns: any[], rows: any[]): string {
  if (!rows || rows.length === 0) {
    return "No results were returned.";
  }

  const columnNames = columns.map((col) => col.name || col);
  const columnWidths = columnNames.map((name) => String(name).length);

  rows.forEach((row) => {
    row.forEach((value: any, index: number) => {
      const strValue = String(value ?? "");
      columnWidths[index] = Math.max(columnWidths[index], strValue.length);
    });
  });

  const header = columnNames
    .map((name, index) => String(name).padEnd(columnWidths[index]))
    .join(" | ");

  const separator = columnWidths.map((width) => "-".repeat(width)).join("-|-");

  const formattedRows = rows.map((row) =>
    row
      .map((value: any, index: number) =>
        String(value ?? "").padEnd(columnWidths[index]),
      )
      .join(" | "),
  );

  return [header, separator, ...formattedRows].join("\n");
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "motherduck_query",
      "Execute a SQL query on the MotherDuck database using DuckDB SQL dialect. Supports analytics queries, data exploration, aggregations, joins, and more.",
      {
        query: z
          .string()
          .describe("SQL query to execute using DuckDB SQL dialect"),
      },
      async ({ query }, extra) => {
        try {
          const freshToken = String(
            extra?.requestInfo?.headers?.authorization ?? "",
          ).replace("Bearer ", "");
          const cachedToken = String(
            extra?.authInfo?.extra?.motherduckToken ?? "",
          );
          console.log("🔍 Token check:", {
            freshToken: freshToken?.substring(0, 30) + "***",
            cachedToken: cachedToken?.substring(0, 30) + "***",
            match: freshToken === cachedToken,
          });

          const motherduckToken = freshToken || cachedToken;

          if (!process.env.HOME) {
            process.env.HOME = "/tmp";
          }

          let instance;
          let connection;

          if (motherduckToken) {
            instance = await duckdb.DuckDBInstance.create(
              `md:?motherduck_token=${motherduckToken}`,
            );
            connection = await instance.connect();
          } else {
            instance = await duckdb.DuckDBInstance.create();
            connection = await instance.connect();
          }

          const result = await connection.run(query);

          const chunkCount = result.chunkCount;

          let allRows = [];
          let columnInfo = null;

          for (let i = 0; i < chunkCount; i++) {
            const chunk = result.getChunk(i);

            if (i === 0) {
              columnInfo = [];
              for (let colIdx = 0; colIdx < chunk.columnCount; colIdx++) {
                columnInfo.push({ name: `column_${colIdx}` });
              }
            }

            const chunkRows = chunk.getRows();
            allRows.push(...chunkRows);
          }

          const formattedTable = formatResultsAsTable(
            columnInfo || [],
            allRows,
          );
          const connectionType = motherduckToken
            ? "MotherDuck"
            : "Local DuckDB";

          return {
            content: [
              {
                type: "text",
                text: `Query executed successfully (using ${connectionType}):\n\n${formattedTable}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error executing query: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    );
  },
  {
    // Optional server options
  },
  {
    basePath: "", // Empty since route is at app/[transport], not app/api/[transport]
    maxDuration: 60,
    verboseLogs: true,
    disableSse: true, // Disable SSE for this handler
  },
);

const authHandler = withMcpAuth(handler, verifyToken, {
  required: false, // Allow both authenticated and unauthenticated access
  requiredScopes: [], // No specific scopes required
});

export { authHandler as GET, authHandler as POST };
