import { z } from "zod";

export const Neo4jConfigSchema = z.object({
  uri: z
    .string()
    .describe("Neo4j connection URI (e.g., bolt://localhost:7687)"),
  username: z.string().describe("Neo4j username"),
  password: z.string().describe("Neo4j password"),
  database: z.string().describe("Neo4j database name"),
});

export type Neo4jConfig = z.infer<typeof Neo4jConfigSchema>;
