import neo4j, { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./types";

export class Neo4jClient {
  private driver: Driver | null = null;
  private config: Neo4jConfig;

  constructor(config: Neo4jConfig) {
    this.config = config;
  }

  private async connect(): Promise<Driver> {
    if (this.driver) {
      return this.driver;
    }

    try {
      if (!this.config.username || !this.config.password) {
        throw new Error(
          "Neo4j username and password must be provided in headers",
        );
      }

      const auth = neo4j.auth.basic(this.config.username, this.config.password);

      this.driver = neo4j.driver(this.config.uri, auth, {
        maxConnectionLifetime: 30 * 60 * 1000, // 30 minutes
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
      });

      // Verify connectivity
      await this.driver.verifyConnectivity();

      return this.driver;
    } catch (error) {
      throw new Error(
        `Failed to connect to Neo4j: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
  }

  async getSchema(): Promise<any> {
    const driver = await this.connect();
    const session = driver.session({ database: this.config.database });

    try {
      // Check if APOC is available
      const apocCheck = await session.run(
        "CALL dbms.procedures() YIELD name WHERE name = 'apoc.meta.schema' RETURN count(*) as count",
      );

      const apocAvailable = apocCheck.records[0]?.get("count") > 0;

      if (apocAvailable) {
        // Use APOC for rich schema information
        const result = await session.run("CALL apoc.meta.schema()");
        const schema = result.records[0]?.get("value");

        return {
          content: [
            {
              type: "text",
              text: `Neo4j Schema (APOC):\n\n${JSON.stringify(this.cleanSchema(schema), null, 2)}`,
            },
          ],
        };
      } else {
        // Fallback to basic schema information
        const constraints = await session.run("SHOW CONSTRAINTS");
        const indexes = await session.run("SHOW INDEXES");
        const labels = await session.run("CALL db.labels()");
        const relationships = await session.run("CALL db.relationshipTypes()");
        const properties = await session.run("CALL db.propertyKeys()");

        const schema = {
          labels: labels.records.map((r) => r.get("label")),
          relationshipTypes: relationships.records.map((r) =>
            r.get("relationshipType"),
          ),
          propertyKeys: properties.records.map((r) => r.get("propertyKey")),
          constraints: constraints.records.map((r) => r.toObject()),
          indexes: indexes.records.map((r) => r.toObject()),
        };

        return {
          content: [
            {
              type: "text",
              text: `Neo4j Schema (Basic):\n\n${JSON.stringify(schema, null, 2)}\n\nNote: Install APOC plugin for detailed schema information including property types and relationships.`,
            },
          ],
        };
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("ProcedureNotFound")
      ) {
        return {
          content: [
            {
              type: "text",
              text: "Error: APOC plugin is not installed. Please install and enable APOC for full schema introspection capabilities.",
            },
          ],
        };
      }
      throw error;
    } finally {
      await session.close();
    }
  }

  private cleanSchema(schema: any): any {
    if (!schema) return {};

    const cleaned: any = {};

    for (const [key, entry] of Object.entries(schema as Record<string, any>)) {
      const cleanEntry: any = {
        type: entry.type,
      };

      if (entry.count !== undefined) {
        cleanEntry.count = entry.count;
      }

      if (entry.labels?.length > 0) {
        cleanEntry.labels = entry.labels;
      }

      if (entry.properties && Object.keys(entry.properties).length > 0) {
        cleanEntry.properties = {};
        for (const [propName, propInfo] of Object.entries(
          entry.properties as Record<string, any>,
        )) {
          const cleanProp: any = {};
          if (propInfo.indexed) cleanProp.indexed = propInfo.indexed;
          if (propInfo.type) cleanProp.type = propInfo.type;
          if (Object.keys(cleanProp).length > 0) {
            cleanEntry.properties[propName] = cleanProp;
          }
        }
      }

      if (entry.relationships && Object.keys(entry.relationships).length > 0) {
        cleanEntry.relationships = {};
        for (const [relName, relInfo] of Object.entries(
          entry.relationships as Record<string, any>,
        )) {
          const cleanRel: any = {};
          if (relInfo.direction) cleanRel.direction = relInfo.direction;
          if (relInfo.labels?.length > 0) cleanRel.labels = relInfo.labels;
          if (
            relInfo.properties &&
            Object.keys(relInfo.properties).length > 0
          ) {
            cleanRel.properties = {};
            for (const [propName, propInfo] of Object.entries(
              relInfo.properties as Record<string, any>,
            )) {
              const cleanProp: any = {};
              if (propInfo.indexed) cleanProp.indexed = propInfo.indexed;
              if (propInfo.type) cleanProp.type = propInfo.type;
              if (Object.keys(cleanProp).length > 0) {
                cleanRel.properties[propName] = cleanProp;
              }
            }
          }
          if (Object.keys(cleanRel).length > 0) {
            cleanEntry.relationships[relName] = cleanRel;
          }
        }
      }

      cleaned[key] = cleanEntry;
    }

    return cleaned;
  }

  async executeQuery(
    query: string,
    params: Record<string, any> = {},
    mode: "READ" | "WRITE" = "READ",
  ): Promise<any> {
    const driver = await this.connect();
    const sessionConfig: any = { database: this.config.database };

    if (mode === "WRITE") {
      sessionConfig.defaultAccessMode = neo4j.session.WRITE;
    } else {
      sessionConfig.defaultAccessMode = neo4j.session.READ;
    }

    const session = driver.session(sessionConfig);

    try {
      const result = await session.run(query, params);

      if (mode === "WRITE") {
        // For write queries, return summary information
        const summary = result.summary;
        const counters = summary.counters.updates();

        return {
          content: [
            {
              type: "text",
              text: `Write operation completed successfully:\n\n${JSON.stringify(counters, null, 2)}`,
            },
          ],
        };
      } else {
        // For read queries, return the data
        const records = result.records.map((record) => record.toObject());

        return {
          content: [
            {
              type: "text",
              text: `Query returned ${records.length} results:\n\n${JSON.stringify(records, null, 2)}`,
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(
        `Query execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      await session.close();
    }
  }

  async explainQuery(
    query: string,
    params: Record<string, any> = {},
  ): Promise<any> {
    const driver = await this.connect();
    const session = driver.session({ database: this.config.database });

    try {
      const explainQuery = `EXPLAIN ${query}`;
      const result = await session.run(explainQuery, params);

      const plan = result.summary.plan;

      return {
        content: [
          {
            type: "text",
            text: `Query Execution Plan:\n\n${this.formatPlan(plan)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Query explanation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      await session.close();
    }
  }

  private formatPlan(plan: any, depth: number = 0): string {
    if (!plan) return "No plan available";

    const indent = "  ".repeat(depth);
    let result = `${indent}${plan.operatorType}`;

    if (plan.arguments) {
      const args = Object.entries(plan.arguments)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(", ");
      result += ` (${args})`;
    }

    if (plan.children && plan.children.length > 0) {
      for (const child of plan.children) {
        result += "\n" + this.formatPlan(child, depth + 1);
      }
    }

    return result;
  }
}
