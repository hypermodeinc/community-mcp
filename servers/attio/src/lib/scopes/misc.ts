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

export const createUserSchema = {
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe("Key-value pairs of attributes for the new user"),
    })
    .describe("The user data to create"),
};

export const updateUserSchema = {
  user_id: z.string().describe("The ID of the user to update"),
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The user data to update"),
};

export const deleteUserSchema = {
  user_id: z.string().describe("The ID of the user to delete"),
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

export const createWorkspaceSchema = {
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe("Key-value pairs of attributes for the new workspace"),
    })
    .describe("The workspace data to create"),
};

export const updateWorkspaceSchema = {
  workspace_id: z.string().describe("The ID of the workspace to update"),
  data: z
    .object({
      values: z
        .record(z.unknown())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The workspace data to update"),
};

export const deleteWorkspaceSchema = {
  workspace_id: z.string().describe("The ID of the workspace to delete"),
};

export const getMeetingSchema = {
  meeting_id: z.string().describe("The ID of the meeting to retrieve"),
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

export async function createUser(
  args: { data: any },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/users/records`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created new user:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating user");
  }
}

export async function updateUser(
  args: {
    user_id: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/users/records/${args.user_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated user ${args.user_id}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating user");
  }
}

export async function deleteUser(
  args: {
    user_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    await makeAttioRequest(
      `/v2/objects/users/records/${args.user_id}`,
      {
        method: "DELETE",
      },
      context?.authToken,
    );

    return createMcpResponse(null, `Successfully deleted user ${args.user_id}`);
  } catch (error) {
    return createErrorResponse(error, "deleting user");
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

export async function createWorkspace(
  args: {
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/workspaces/records`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created new workspace:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating workspace");
  }
}

export async function updateWorkspace(
  args: {
    workspace_id: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/workspaces/records/${args.workspace_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated workspace ${args.workspace_id}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating workspace");
  }
}

export async function deleteWorkspace(
  args: {
    workspace_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    await makeAttioRequest(
      `/v2/objects/workspaces/records/${args.workspace_id}`,
      {
        method: "DELETE",
      },
      context?.authToken,
    );

    return createMcpResponse(
      null,
      `Successfully deleted workspace ${args.workspace_id}`,
    );
  } catch (error) {
    return createErrorResponse(error, "deleting workspace");
  }
}

// ===============================
// MEETINGS ACTIONS
// ===============================

export async function getMeeting(
  args: {
    meeting_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/meetings/${args.meeting_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Meeting details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting meeting");
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
  create_user: {
    description: "Create a new user in Attio CRM",
    schema: createUserSchema,
  },
  update_user: {
    description: "Update an existing user in Attio CRM",
    schema: updateUserSchema,
  },
  delete_user: {
    description: "Delete a user by ID",
    schema: deleteUserSchema,
  },

  // Workspaces
  search_workspaces: {
    description:
      "Search for workspaces in Attio CRM with filtering and sorting options",
    schema: searchWorkspacesSchema,
  },
  get_workspace: {
    description: "Get a specific workspace by ID with all its data",
    schema: getWorkspaceSchema,
  },
  create_workspace: {
    description: "Create a new workspace in Attio CRM",
    schema: createWorkspaceSchema,
  },
  update_workspace: {
    description: "Update an existing workspace in Attio CRM",
    schema: updateWorkspaceSchema,
  },
  delete_workspace: {
    description: "Delete a workspace by ID",
    schema: deleteWorkspaceSchema,
  },

  // Meetings
  get_meeting: {
    description: "Get a specific meeting by ID",
    schema: getMeetingSchema,
  },
};

// ===============================
// MISCELLANEOUS ACTIONS MAPPING
// ===============================

export const miscActions = {
  // Users
  search_users: searchUsers,
  get_user: getUser,
  create_user: createUser,
  update_user: updateUser,
  delete_user: deleteUser,

  // Workspaces
  search_workspaces: searchWorkspaces,
  get_workspace: getWorkspace,
  create_workspace: createWorkspace,
  update_workspace: updateWorkspace,
  delete_workspace: deleteWorkspace,

  // Meetings
  get_meeting: getMeeting,
};
