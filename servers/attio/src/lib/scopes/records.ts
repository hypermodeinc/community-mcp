import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// RECORDS SCHEMAS
// ===============================

export const searchRecordsSchema = {
  object: z
    .string()
    .describe(
      "The object type to search (e.g., 'people', 'companies', 'opportunities')",
    ),
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of records to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of records to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getRecordSchema = {
  object: z.string().describe("The object type (e.g., 'people', 'companies')"),
  record_id: z.string().describe("The ID of the record to retrieve"),
};

export const createRecordSchema = {
  object: z
    .string()
    .describe("The object type (e.g., 'people', 'companies', 'opportunities')"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes for the new record"),
    })
    .describe("The record data to create"),
};

export const updateRecordSchema = {
  object: z
    .string()
    .describe("The object type (e.g., 'people', 'companies', 'opportunities')"),
  record_id: z.string().describe("The ID of the record to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The record data to update"),
};

export const putUpdateRecordSchema = {
  object: z
    .string()
    .describe("The object type (e.g., 'people', 'companies', 'opportunities')"),
  record_id: z.string().describe("The ID of the record to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to overwrite"),
    })
    .describe("The record data to overwrite"),
};

export const upsertRecordSchema = {
  object: z.string().describe("The object type"),
  data: z
    .object({
      values: z.record(z.any()).describe("Key-value pairs of attributes"),
      matching_attribute: z
        .string()
        .optional()
        .describe("Attribute to match against for existing records"),
    })
    .describe("The record data with matching criteria"),
};

export const deleteRecordSchema = {
  object: z.string().describe("The object type"),
  record_id: z.string().describe("The ID of the record to delete"),
};

export const getRecordAttributeValuesSchema = {
  object: z.string().describe("The object type"),
  record_id: z.string().describe("The ID of the record"),
  attribute: z.string().describe("The attribute ID or slug"),
  show_historic: z.boolean().optional().describe("Include historic values"),
};

export const getRecordEntriesSchema = {
  object: z.string().describe("The object type"),
  record_id: z.string().describe("The ID of the record"),
};

// ===============================
// RECORDS ACTIONS
// ===============================

export async function searchRecords(args: {
  object: string;
  query?: any;
}): Promise<McpResponse> {
  try {
    const { object, query = {} } = args;
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        }),
      },
    );

    return createMcpResponse(
      response,
      `Found ${response.data?.length || 0} records:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching records");
  }
}

export async function getRecord(args: {
  object: string;
  record_id: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/records/${args.record_id}`,
    );
    return createMcpResponse(
      response,
      `Record details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting record");
  }
}

export async function createRecord(args: {
  object: string;
  data: any;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/records`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
    );

    return createMcpResponse(
      response,
      `Successfully created new record:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating record");
  }
}

export async function updateRecord(args: {
  object: string;
  record_id: string;
  data: any;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/records/${args.record_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
    );

    return createMcpResponse(
      response,
      `Successfully updated record ${args.record_id}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating record");
  }
}

export async function putUpdateRecord(args: {
  object: string;
  record_id: string;
  data: any;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/records/${args.record_id}`,
      {
        method: "PUT",
        body: JSON.stringify(args.data),
      },
    );

    return createMcpResponse(
      response,
      `Successfully updated record ${args.record_id} (overwrite):\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating record");
  }
}

export async function upsertRecord(args: {
  object: string;
  data: any;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/records`,
      {
        method: "PUT",
        body: JSON.stringify(args.data),
      },
    );

    return createMcpResponse(
      response,
      `Successfully upserted record:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "upserting record");
  }
}

export async function deleteRecord(args: {
  object: string;
  record_id: string;
}): Promise<McpResponse> {
  try {
    await makeAttioRequest(
      `/v2/objects/${args.object}/records/${args.record_id}`,
      {
        method: "DELETE",
      },
    );

    return createMcpResponse(
      null,
      `Successfully deleted record ${args.record_id}`,
    );
  } catch (error) {
    return createErrorResponse(error, "deleting record");
  }
}

export async function getRecordAttributeValues(args: {
  object: string;
  record_id: string;
  attribute: string;
  show_historic?: boolean;
}): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.show_historic) queryParams.append("show_historic", "true");

    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/records/${args.record_id}/attributes/${args.attribute}/values?${queryParams}`,
    );
    return createMcpResponse(
      response,
      `Attribute values:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting record attribute values");
  }
}

export async function getRecordEntries(args: {
  object: string;
  record_id: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/records/${args.record_id}/entries`,
    );
    return createMcpResponse(
      response,
      `Record entries:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting record entries");
  }
}

// ===============================
// RECORDS TOOL DEFINITIONS
// ===============================

export const recordsToolDefinitions = {
  search_records: {
    description:
      "Search for records in Attio CRM with advanced filtering and sorting options",
    schema: searchRecordsSchema,
  },
  get_record: {
    description: "Get a specific record by ID with all its data",
    schema: getRecordSchema,
  },
  create_record: {
    description: "Create a new record in Attio CRM",
    schema: createRecordSchema,
  },
  update_record: {
    description:
      "Update an existing record in Attio CRM (appends to multiselect fields)",
    schema: updateRecordSchema,
  },
  put_update_record: {
    description:
      "Update an existing record in Attio CRM (overwrites multiselect fields)",
    schema: putUpdateRecordSchema,
  },
  upsert_record: {
    description:
      "Create or update a record based on matching criteria (assert operation)",
    schema: upsertRecordSchema,
  },
  delete_record: {
    description: "Delete a record by ID",
    schema: deleteRecordSchema,
  },
  get_record_attribute_values: {
    description: "Get all values for a specific attribute on a record",
    schema: getRecordAttributeValuesSchema,
  },
  get_record_entries: {
    description: "List all list entries for a specific record",
    schema: getRecordEntriesSchema,
  },
};

// ===============================
// RECORDS ACTIONS MAPPING
// ===============================

export const recordsActions = {
  search_records: searchRecords,
  get_record: getRecord,
  create_record: createRecord,
  update_record: updateRecord,
  put_update_record: putUpdateRecord,
  upsert_record: upsertRecord,
  delete_record: deleteRecord,
  get_record_attribute_values: getRecordAttributeValues,
  get_record_entries: getRecordEntries,
};
