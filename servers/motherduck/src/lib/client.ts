import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import {
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "@hypermode/mcp-shared";

export class MotherDuckClient {
  private connectionString: string;
  private connection: DuckDBConnection | null = null;

  constructor(authToken?: string) {
    if (!authToken) {
      throw new Error("MotherDuck token is required for authentication");
    }

    // Use MotherDuck connection string with token
    this.connectionString = `md:?motherduck_token=${authToken}`;
  }

  private async getConnection(): Promise<DuckDBConnection> {
    if (!this.connection) {
      try {
        this.connection = await DuckDBConnection.create(
          await DuckDBInstance.create(this.connectionString),
        );
      } catch (error) {
        throw new Error(
          `Failed to connect to MotherDuck: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
    return this.connection;
  }

  async executeQuery(query: string): Promise<McpResponse> {
    try {
      const conn = await this.getConnection();

      // Execute the query and get results
      const result = await conn.runAndReadAll(query);

      // Format the results for display
      const columns = result.columnNames();
      const rows = [];

      // Convert results to readable format
      for (let i = 0; i < result.currentRowCount; i++) {
        const row: Record<string, any> = {};
        for (let j = 0; j < columns.length; j++) {
          const column = result.getColumns()[j];
          row[columns[j]] = column[i];
        }
        rows.push(row);
      }

      // Create a formatted table output
      if (rows.length === 0) {
        return createMcpResponse(
          { columns, rows: [], rowCount: 0 },
          `Query executed successfully. No rows returned.\n\nColumns: ${columns.join(", ")}`,
        );
      }

      // Create a simple table format
      const tableOutput = this.formatAsTable(columns, rows);

      return createMcpResponse(
        { columns, rows, rowCount: rows.length },
        `Query executed successfully. ${rows.length} row(s) returned.\n\n${tableOutput}`,
      );
    } catch (error) {
      return createErrorResponse(error, "executing MotherDuck query");
    }
  }

  private formatAsTable(
    columns: string[],
    rows: Record<string, any>[],
  ): string {
    if (rows.length === 0) return "No data";

    // Calculate column widths
    const widths = columns.map((col) => {
      const maxDataWidth = Math.max(
        ...rows.map((row) => String(row[col] ?? "").length),
      );
      return Math.max(col.length, maxDataWidth, 3);
    });

    // Create header
    const header = columns.map((col, i) => col.padEnd(widths[i])).join(" | ");
    const separator = widths.map((w) => "-".repeat(w)).join(" | ");

    // Create data rows
    const dataRows = rows.map((row) =>
      columns
        .map((col, i) => String(row[col] ?? "").padEnd(widths[i]))
        .join(" | "),
    );

    return [header, separator, ...dataRows].join("\n");
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.closeSync();
      this.connection = null;
    }
  }
}
