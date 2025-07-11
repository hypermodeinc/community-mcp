import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";
import { GLOBAL_SEARCH_LIMIT, validatePagination } from "../utils/paginate";

// ===============================
// LISTS SCHEMAS
// ===============================

export const listListsSchema = {};

export const createListSchema = {
  data: z
    .object({
      name: z.string().describe("List name"),
      parent_object: z.string().describe("Parent object ID or slug"),
      workspace_access: z
        .string()
        .optional()
        .describe("Workspace access level"),
      workspace_member_access: z
        .array(z.any())
        .optional()
        .describe("Workspace member access"),
    })
    .describe("List data to create"),
};

export const getListSchema = {
  list: z.string().describe("List ID or slug"),
};

export const updateListSchema = {
  list: z.string().describe("List ID or slug"),
  data: z
    .object({
      name: z.string().optional().describe("List name"),
      workspace_access: z
        .string()
        .optional()
        .describe("Workspace access level"),
      workspace_member_access: z
        .array(z.any())
        .optional()
        .describe("Workspace member access"),
    })
    .describe("List data to update"),
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
      sorts: z.array(z.any()).optional().describe("Sort criteria"),
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
        .record(z.any())
        .optional()
        .describe("Additional attribute values for the list entry"),
    })
    .describe("Entry data"),
};

export const upsertListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  data: z
    .object({
      parent_record: z.string().describe("ID of the parent record"),
      values: z
        .record(z.any())
        .optional()
        .describe("Attribute values for the list entry"),
    })
    .describe("Entry data"),
};

export const removeFromListSchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to remove"),
};

export const getListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to get"),
};

export const updateListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to update"),
  data: z
    .object({
      values: z.record(z.any()).describe("Attribute values to update"),
    })
    .describe("Updated entry data"),
};

export const putUpdateListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to update"),
  data: z
    .object({
      values: z.record(z.any()).describe("Attribute values to overwrite"),
    })
    .describe("Entry data to overwrite"),
};

export const getListEntryAttributeValuesSchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry"),
  attribute: z.string().describe("The attribute ID or slug"),
  show_historic: z.boolean().optional().describe("Include historic values"),
};

// ===============================
// LISTS ACTIONS
// ===============================

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

export async function createList(
  args: { data: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      "/v2/lists",
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created list:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating list");
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

export async function updateList(
  args: {
    list: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${args.list}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated list:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating list");
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

export async function addToList(
  args: {
    list: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${args.list}/entries`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully added entry to list:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "adding to list");
  }
}

export async function upsertListEntry(
  args: {
    list: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${args.list}/entries`,
      {
        method: "PUT",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully upserted list entry:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "upserting list entry");
  }
}

export async function removeFromList(
  args: {
    list: string;
    entry_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    await makeAttioRequest(
      `/v2/lists/${args.list}/entries/${args.entry_id}`,
      {
        method: "DELETE",
      },
      context?.authToken,
    );

    return createMcpResponse(
      null,
      `Successfully removed entry ${args.entry_id} from list ${args.list}`,
    );
  } catch (error) {
    return createErrorResponse(error, "removing from list");
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

export async function updateListEntry(
  args: {
    list: string;
    entry_id: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${args.list}/entries/${args.entry_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated list entry:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating list entry");
  }
}

export async function putUpdateListEntry(
  args: {
    list: string;
    entry_id: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${args.list}/entries/${args.entry_id}`,
      {
        method: "PUT",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated list entry (overwrite):\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating list entry");
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
    schema: listListsSchema,
  },
  create_list: {
    description: "Create a new list",
    schema: createListSchema,
  },
  get_list: {
    description: "Get details of a specific list",
    schema: getListSchema,
  },
  update_list: {
    description: "Update an existing list",
    schema: updateListSchema,
  },
  search_list_entries: {
    description: "Search entries in a specific list",
    schema: searchListEntriesSchema,
  },
  add_to_list: {
    description: "Add a record to a list as a new entry",
    schema: addToListSchema,
  },
  upsert_list_entry: {
    description: "Create or update a list entry by parent record",
    schema: upsertListEntrySchema,
  },
  remove_from_list: {
    description: "Remove an entry from a list",
    schema: removeFromListSchema,
  },
  get_list_entry: {
    description: "Get a specific list entry by ID",
    schema: getListEntrySchema,
  },
  update_list_entry: {
    description: "Update a list entry (appends to multiselect fields)",
    schema: updateListEntrySchema,
  },
  put_update_list_entry: {
    description: "Update a list entry (overwrites multiselect fields)",
    schema: putUpdateListEntrySchema,
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
  create_list: createList,
  get_list: getList,
  update_list: updateList,
  search_list_entries: searchListEntries,
  add_to_list: addToList,
  upsert_list_entry: upsertListEntry,
  remove_from_list: removeFromList,
  get_list_entry: getListEntry,
  update_list_entry: updateListEntry,
  put_update_list_entry: putUpdateListEntry,
  get_list_entry_attribute_values: getListEntryAttributeValues,
};
