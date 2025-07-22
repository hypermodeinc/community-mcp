import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";
import { GLOBAL_SEARCH_LIMIT, validatePagination } from "../utils/paginate";
import { SortSchema } from "../types";

export const searchUsersSchema = {
  query: z
    .object({
      limit: z
        .number()
        .min(1)
        .max(GLOBAL_SEARCH_LIMIT)
        .describe(
          `Maximum number of users to return (required, max: ${GLOBAL_SEARCH_LIMIT})`,
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Number of users to skip for pagination"),
      sorts: z.array(SortSchema).optional().describe("Array of sort criteria"),
    })
    .describe("Search criteria, filters, and sorting options"),
};

export const getUserSchema = {
  user_id: z.string().describe("The ID of the user to retrieve"),
};

export const searchWorkspacesSchema = {
  query: z
    .object({
      limit: z
        .number()
        .min(1)
        .max(GLOBAL_SEARCH_LIMIT)
        .describe(
          `Maximum number of workspaces to return (required, max: ${GLOBAL_SEARCH_LIMIT})`,
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Number of workspaces to skip for pagination"),
      sorts: z.array(SortSchema).optional().describe("Array of sort criteria"),
    })
    .describe("Search criteria, filters, and sorting options"),
};

export const getWorkspaceSchema = {
  workspace_id: z.string().describe("The ID of the workspace to retrieve"),
};

export async function searchUsers(
  args: { query: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const { query } = args;
    const pagination = validatePagination(query);

    const response = await makeAttioRequest(
      `/v2/objects/users/records/query`,
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
      `Found ${response.data?.length || 0} users:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching users");
  }
}

export async function getUser(
  args: { user_id: string },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/users/records/${args.user_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `User details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting user");
  }
}

export async function searchWorkspaces(
  args: { query: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const { query } = args;
    const pagination = validatePagination(query);

    const response = await makeAttioRequest(
      `/v2/objects/workspaces/records/query`,
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
      `Found ${response.data?.length || 0} workspaces:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching workspaces");
  }
}

export async function getWorkspace(
  args: {
    workspace_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/workspaces/records/${args.workspace_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Workspace details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting workspace");
  }
}

export const miscToolDefinitions = {
  // Users
  search_users: {
    description:
      "Search for users in Attio CRM with filtering and sorting options",
    schema: searchUsersSchema,
  },
  get_user: {
    description: "Get a specific user by ID with all their data",
    schema: getUserSchema,
  },
  search_workspaces: {
    description:
      "Search for workspaces in Attio CRM with filtering and sorting options",
    schema: searchWorkspacesSchema,
  },
  get_workspace: {
    description: "Get a specific workspace by ID with all its data",
    schema: getWorkspaceSchema,
  },
};

export const miscActions = {
  search_users: searchUsers,
  get_user: getUser,
  search_workspaces: searchWorkspaces,
  get_workspace: getWorkspace,
};
