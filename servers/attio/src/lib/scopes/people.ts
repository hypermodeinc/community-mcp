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
};

// ===============================
// PEOPLE ACTIONS MAPPING
// ===============================

export const peopleActions = {
  search_people: searchPeople,
  get_person: getPerson,
};
