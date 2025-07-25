// servers/graphql/src/lib/types.ts
import { z } from "zod";

export const GraphQLEndpointConfigSchema = z.object({
  endpoint: z.string().url().describe("GraphQL endpoint URL"),
  headers: z
    .record(z.string())
    .optional()
    .describe("HTTP headers to include with requests"),
});

export type GraphQLEndpointConfig = z.infer<typeof GraphQLEndpointConfigSchema>;
