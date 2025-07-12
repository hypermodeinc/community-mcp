import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";
import { GLOBAL_SEARCH_LIMIT, validatePagination } from "../utils/paginate";
import { SortSchema } from "../types";

export const searchDealsSchema = {
  query: z
    .object({
      sorts: z.array(SortSchema).optional().describe("Array of sort criteria"),
      limit: z
        .number()
        .min(1)
        .max(GLOBAL_SEARCH_LIMIT)
        .describe(
          `Maximum number of deals to return (required, max: ${GLOBAL_SEARCH_LIMIT})`,
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Number of deals to skip for pagination"),
    })
    .describe("Search criteria, filters, and sorting options"),
};

export const getDealSchema = {
  deal_id: z.string().describe("The ID of the deal to retrieve"),
};

export const createDealSchema = {
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe(
          "Key-value pairs of attributes for the new deal. Standard attributes include: name (string), stage (string), owner (string/email), value (number), associated_people (array), associated_company (object)",
        ),
    })
    .describe("The deal data to create"),
};

export const updateDealSchema = {
  deal_id: z.string().describe("The ID of the deal to update"),
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The deal data to update"),
};

export const assertDealSchema = {
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe("Key-value pairs of attributes for the deal"),
      matching_attribute: z
        .string()
        .optional()
        .describe(
          "The ID or slug of the attribute to use to check if a deal already exists. The attribute must be unique.",
        ),
    })
    .describe("The deal data with matching criteria for assert operation"),
};

export const deleteDealSchema = {
  deal_id: z.string().describe("The ID of the deal to delete"),
};

export const getDealAttributeValuesSchema = {
  deal_id: z.string().describe("The ID of the deal record"),
  attribute: z.string().describe("The attribute ID or slug"),
  show_historic: z.boolean().optional().describe("Include historic values"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  offset: z.number().optional().describe("Number of results to skip"),
};

export const getDealEntriesSchema = {
  deal_id: z.string().describe("The ID of the deal record"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of results to return (default: 100, max: 1000)"),
  offset: z.number().optional().describe("Number of results to skip"),
};

export async function searchDeals(
  args: { query: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const { query } = args;
    const pagination = validatePagination(query);

    const requestBody: any = {
      sorts: query.sorts || [],
      limit: pagination.limit,
      offset: pagination.offset,
    };

    const response = await makeAttioRequest(
      `/v2/objects/deals/records/query`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Found ${response.data?.length || 0} deals:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching deals");
  }
}

export async function getDeal(
  args: { deal_id: string },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${args.deal_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Deal details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting deal");
  }
}

export async function createDeal(
  args: { data: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    // Ensure the data structure matches the API expectation
    const requestBody = {
      data: {
        values: args.data.values || args.data,
      },
    };

    const response = await makeAttioRequest(
      `/v2/objects/deals/records`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created new deal:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating deal");
  }
}

export async function updateDeal(
  args: {
    deal_id: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${args.deal_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated deal ${args.deal_id}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating deal");
  }
}

export async function assertDeal(
  args: { data: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/deals/records`,
      {
        method: "PUT",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully asserted deal (created or updated):\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "asserting deal");
  }
}

export async function deleteDeal(
  args: {
    deal_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    await makeAttioRequest(
      `/v2/objects/deals/records/${args.deal_id}`,
      {
        method: "DELETE",
      },
      context?.authToken,
    );

    return createMcpResponse(null, `Successfully deleted deal ${args.deal_id}`);
  } catch (error) {
    return createErrorResponse(error, "deleting deal");
  }
}

export async function getDealAttributeValues(
  args: {
    deal_id: string;
    attribute: string;
    show_historic?: boolean;
    limit?: number;
    offset?: number;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.show_historic) queryParams.append("show_historic", "true");
    if (args.limit) queryParams.append("limit", args.limit.toString());
    if (args.offset) queryParams.append("offset", args.offset.toString());

    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${args.deal_id}/attributes/${args.attribute}/values?${queryParams}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Deal attribute values:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting deal attribute values");
  }
}

export async function getDealEntries(
  args: {
    deal_id: string;
    limit?: number;
    offset?: number;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.limit)
      queryParams.append("limit", Math.min(args.limit, 1000).toString());
    if (args.offset) queryParams.append("offset", args.offset.toString());

    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${args.deal_id}/entries?${queryParams}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Deal entries:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting deal entries");
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
  assert_deal: {
    description:
      "Create or update a deal based on matching criteria (assert operation)",
    schema: assertDealSchema,
  },
  delete_deal: {
    description: "Delete a deal by ID",
    schema: deleteDealSchema,
  },
  get_deal_attribute_values: {
    description: "Get all values for a specific attribute on a deal record",
    schema: getDealAttributeValuesSchema,
  },
  get_deal_entries: {
    description: "List all list entries for a specific deal record",
    schema: getDealEntriesSchema,
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
  assert_deal: assertDeal,
  delete_deal: deleteDeal,
  get_deal_attribute_values: getDealAttributeValues,
  get_deal_entries: getDealEntries,
};
