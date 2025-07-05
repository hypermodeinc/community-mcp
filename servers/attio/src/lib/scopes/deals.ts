import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// DEALS SCHEMAS
// ===============================

export const searchDealsSchema = {
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of deals to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of deals to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getDealSchema = {
  deal_id: z.string().describe("The ID of the deal to retrieve"),
};

export const createDealSchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe(
          "Key-value pairs of attributes for the new deal (e.g., name, value, stage, close_date)",
        ),
    })
    .describe("The deal data to create"),
};

export const updateDealSchema = {
  deal_id: z.string().describe("The ID of the deal to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The deal data to update"),
};

export const deleteDealSchema = {
  deal_id: z.string().describe("The ID of the deal to delete"),
};

// ===============================
// DEALS ACTIONS
// ===============================

export async function searchDeals(
  args: { query?: any } = {},
): Promise<McpResponse> {
  try {
    const { query = {} } = args;
    const response = await makeAttioRequest(`/v2/objects/deals/records/query`, {
      method: "POST",
      body: JSON.stringify({
        limit: query.limit || 25,
        offset: query.offset || 0,
        sorts: query.sorts || [],
      }),
    });

    return createMcpResponse(
      response,
      `Found ${response.data?.length || 0} deals:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching deals");
  }
}

export async function getDeal(args: { deal_id: string }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${args.deal_id}`,
    );
    return createMcpResponse(
      response,
      `Deal details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting deal");
  }
}

export async function createDeal(args: { data: any }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/objects/deals/records`, {
      method: "POST",
      body: JSON.stringify(args.data),
    });

    return createMcpResponse(
      response,
      `Successfully created new deal:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating deal");
  }
}

export async function updateDeal(args: {
  deal_id: string;
  data: any;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${args.deal_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
    );

    return createMcpResponse(
      response,
      `Successfully updated deal ${args.deal_id}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating deal");
  }
}

export async function deleteDeal(args: {
  deal_id: string;
}): Promise<McpResponse> {
  try {
    await makeAttioRequest(`/v2/objects/deals/records/${args.deal_id}`, {
      method: "DELETE",
    });

    return createMcpResponse(null, `Successfully deleted deal ${args.deal_id}`);
  } catch (error) {
    return createErrorResponse(error, "deleting deal");
  }
}

// ===============================
// DEALS TOOL DEFINITIONS
// ===============================

export const dealsToolDefinitions = {
  search_deals: {
    description:
      "Search for deals in Attio CRM with filtering and sorting options",
    schema: searchDealsSchema,
  },
  get_deal: {
    description: "Get a specific deal by ID with all its data",
    schema: getDealSchema,
  },
  create_deal: {
    description: "Create a new deal in Attio CRM",
    schema: createDealSchema,
  },
  update_deal: {
    description: "Update an existing deal in Attio CRM",
    schema: updateDealSchema,
  },
  delete_deal: {
    description: "Delete a deal by ID",
    schema: deleteDealSchema,
  },
};

// ===============================
// DEALS ACTIONS MAPPING
// ===============================

export const dealsActions = {
  search_deals: searchDeals,
  get_deal: getDeal,
  create_deal: createDeal,
  update_deal: updateDeal,
  delete_deal: deleteDeal,
};
