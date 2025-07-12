import z from "zod";

export const SortSchema = z.object({
  direction: z.enum(["asc", "desc"]),
  field: z.string(),
  attribute: z.string().optional(),
});
