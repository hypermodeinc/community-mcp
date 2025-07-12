import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";
import { GLOBAL_SEARCH_LIMIT, validatePagination } from "../utils/paginate";
import { SortSchema } from "../types";

export const searchPeopleSchema = {
  query: z
    .object({
      limit: z
        .number()
        .min(1)
        .max(GLOBAL_SEARCH_LIMIT)
        .describe(
          `Maximum number of people to return (required, max: ${GLOBAL_SEARCH_LIMIT})`,
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Number of people to skip for pagination"),
      sorts: z.array(SortSchema).optional().describe("Array of sort criteria"),
    })
    .describe("Search criteria, filters, and sorting options"),
};

export const getPersonSchema = {
  person_id: z.string().describe("The ID of the person to retrieve"),
};

export const createPersonSchema = {
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe(
          "Key-value pairs of attributes for the new person (e.g., first_name, last_name, email)",
        ),
    })
    .describe("The person data to create"),
};

export const updatePersonSchema = {
  person_id: z.string().describe("The ID of the person to update"),
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The person data to update"),
};

export const deletePersonSchema = {
  person_id: z.string().describe("The ID of the person to delete"),
};

export async function searchPeople(
  args: { query: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const { query } = args;
    const pagination = validatePagination(query);

    const response = await makeAttioRequest(
      `/v2/objects/people/records/query`,
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
      `Found ${response.data?.length || 0} people:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching people");
  }
}

export async function getPerson(
  args: {
    person_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/people/records/${args.person_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Person details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting person");
  }
}

export async function createPerson(
  args: { data: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/people/records`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created new person:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating person");
  }
}

export async function updatePerson(
  args: {
    person_id: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/people/records/${args.person_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated person ${args.person_id}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating person");
  }
}

export async function deletePerson(
  args: {
    person_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    await makeAttioRequest(
      `/v2/objects/people/records/${args.person_id}`,
      {
        method: "DELETE",
      },
      context?.authToken,
    );

    return createMcpResponse(
      null,
      `Successfully deleted person ${args.person_id}`,
    );
  } catch (error) {
    return createErrorResponse(error, "deleting person");
  }
}

// ===============================
// PEOPLE TOOL DEFINITIONS
// ===============================

export const peopleToolDefinitions = {
  search_people: {
    description:
      "Search for people in Attio CRM with filtering and sorting options",
    schema: searchPeopleSchema,
  },
  get_person: {
    description: "Get a specific person by ID with all their data",
    schema: getPersonSchema,
  },
  create_person: {
    description: "Create a new person in Attio CRM",
    schema: createPersonSchema,
  },
  update_person: {
    description: "Update an existing person in Attio CRM",
    schema: updatePersonSchema,
  },
  delete_person: {
    description: "Delete a person by ID",
    schema: deletePersonSchema,
  },
};

// ===============================
// PEOPLE ACTIONS MAPPING
// ===============================

export const peopleActions = {
  search_people: searchPeople,
  get_person: getPerson,
  create_person: createPerson,
  update_person: updatePerson,
  delete_person: deletePerson,
};
