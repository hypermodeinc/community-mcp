import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";
import { GLOBAL_SEARCH_LIMIT, validatePagination } from "../utils/paginate";
import { SortSchema } from "../types";

export const getListSchema = {
  list: z.string().describe("List ID or slug"),
};

export const searchListEntriesSchema = {
  list: z.string().describe("List ID or slug"),
  query: z
    .object({
      limit: z
        .number()
        .min(1)
        .max(GLOBAL_SEARCH_LIMIT)
        .optional()
        .describe(
          `Maximum number of entries to return (max: ${GLOBAL_SEARCH_LIMIT})`,
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Number of entries to skip"),
      sorts: z.array(SortSchema).optional().describe("Sort criteria"),
    })
    .optional()
    .describe("Search criteria and filters"),
};

export const addToListSchema = {
  list: z.string().describe("List ID or slug"),
  data: z
    .object({
      parent_record: z
        .string()
        .describe("ID of the parent record to add to the list"),
      values: z
        .record(z.unknown())
        .optional()
        .describe("Additional attribute values for the list entry"),
    })
    .describe("Entry data"),
};

export const getListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to get"),
};

export const getListEntryAttributeValuesSchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry"),
  attribute: z.string().describe("The attribute ID or slug"),
  show_historic: z.boolean().optional().describe("Include historic values"),
};

export async function listLists(context?: {
  authToken?: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      "/v2/lists",
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Lists in workspace:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing lists");
  }
}

export async function getList(
  args: { list: string },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${args.list}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `List details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting list");
  }
}

export async function searchListEntries(
  args: {
    list: string;
    query: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const { list, query } = args;
    const pagination = validatePagination(query);

    const response = await makeAttioRequest(
      `/v2/lists/${list}/entries/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: pagination.limit,
          offset: pagination.offset,
          sorts: query.sorts || [],
        }),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Found ${response.data?.length || 0} list entries:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching list entries");
  }
}

export async function getListEntry(
  args: {
    list: string;
    entry_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${args.list}/entries/${args.entry_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `List entry details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting list entry");
  }
}

export async function getListEntryAttributeValues(
  args: {
    list: string;
    entry_id: string;
    attribute: string;
    show_historic?: boolean;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.show_historic) queryParams.append("show_historic", "true");

    const response = await makeAttioRequest(
      `/v2/lists/${args.list}/entries/${args.entry_id}/attributes/${args.attribute}/values?${queryParams}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `List entry attribute values:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting list entry attribute values");
  }
}

// ===============================
// LISTS TOOL DEFINITIONS
// ===============================

export const listsToolDefinitions = {
  list_lists: {
    description: "Get all lists in the workspace",
  },
  get_list: {
    description: "Get details of a specific list",
    schema: getListSchema,
  },
  search_list_entries: {
    description: "Search entries in a specific list",
    schema: searchListEntriesSchema,
  },
  get_list_entry: {
    description: "Get a specific list entry by ID",
    schema: getListEntrySchema,
  },
  get_list_entry_attribute_values: {
    description: "Get all values for a specific attribute on a list entry",
    schema: getListEntryAttributeValuesSchema,
  },
};

// ===============================
// LISTS ACTIONS MAPPING
// ===============================

export const listsActions = {
  list_lists: listLists,
  get_list: getList,
  search_list_entries: searchListEntries,
  get_list_entry: getListEntry,
  get_list_entry_attribute_values: getListEntryAttributeValues,
};
