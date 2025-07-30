import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import {
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "@hypermode/mcp-shared";
import { tmpdir } from "os";



export class MotherDuckClient {
  private connectionString: string;
  private connection: DuckDBConnection | null = null;
  private instance: DuckDBInstance | null = null;

  constructor(authToken?: string) {
    if (!authToken) {
      throw new Error("MotherDuck API token is required for authentication");
    }
    this.connectionString = `md:?motherduck_token=${authToken}&saas_mode=true`;
  }

  private async getConnection(): Promise<DuckDBConnection> {
    if (!this.connection) {
      try {
        if (!process.env.HOME) {
          process.env.HOME = "/tmp";
        }
        this.instance = await DuckDBInstance.create(this.connectionString);
        this.connection = await this.instance.connect();

        try {
          const homeDir = tmpdir();
          await this.connection.runAndReadAll(
            `SET home_directory='${homeDir}'`,
          );
        } catch (homeDirError) {
          console.warn("Could not set home directory:", homeDirError);
        }
      } catch (error) {
        throw new Error(
          `Failed to connect to MotherDuck cloud API: ${error instanceof Error ? error.message : "Unknown error"}. Ensure your token is valid and you have internet connectivity.`,
        );
      }
    }
    return this.connection;
  }

  async executeQuery(query: string): Promise<McpResponse> {
    try {
      const conn = await this.getConnection();

      const result = await conn.runAndReadAll(query);

      const columns = result.columnNames();
      const rows = [];

      for (let i = 0; i < result.currentRowCount; i++) {
        const row: Record<string, any> = {};
        for (let j = 0; j < columns.length; j++) {
          const column = result.getColumns()[j];
          row[columns[j]] = column[i];
        }
        rows.push(row);
      }

      if (rows.length === 0) {
        return createMcpResponse(
          { columns, rows: [], rowCount: 0 },
          `Query executed successfully via MotherDuck cloud API. No rows returned.\n\nColumns: ${columns.join(", ")}`,
        );
      }

      const tableOutput = this.formatAsTable(columns, rows);

      return createMcpResponse(
        { columns, rows, rowCount: rows.length },
        `Query executed successfully via MotherDuck cloud API. ${rows.length} row(s) returned.\n\n${tableOutput}`,
      );
    } catch (error) {
      return createErrorResponse(error, "executing MotherDuck cloud API query");
    }
  }

  private formatAsTable(
    columns: string[],
    rows: Record<string, any>[],
  ): string {
    if (rows.length === 0) return "No data";

    const widths = columns.map((col) => {
      const maxDataWidth = Math.max(
        ...rows.map((row) => String(row[col] ?? "").length),
      );
      return Math.max(col.length, maxDataWidth, 3);
    });

    const header = columns.map((col, i) => col.padEnd(widths[i])).join(" | ");
    const separator = widths.map((w) => "-".repeat(w)).join(" | ");

    const dataRows = rows.map((row) =>
      columns
        .map((col, i) => String(row[col] ?? "").padEnd(widths[i]))
        .join(" | "),
    );

    return [header, separator, ...dataRows].join("\n");
  }

  async close(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.closeSync();
        this.connection = null;
        console.log("Disconnected from MotherDuck cloud API");
      }
      if (this.instance) {
        this.instance = null;
      }
    } catch (error) {
      console.warn("Warning during MotherDuck connection cleanup:", error);
    }
  }
}
