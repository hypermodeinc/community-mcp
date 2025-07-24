import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// WORKSPACE SCHEMAS
// ===============================

export const getWorkspaceMemberSchema = {
  workspace_member_id: z
    .string()
    .describe("The ID of the workspace member to retrieve"),
};

// ===============================
// WORKSPACE ACTIONS
// ===============================

export async function introspectWorkspace(context?: {
  authToken?: string;
}): Promise<McpResponse> {
  try {
    const [self, objects, lists] = await Promise.all([
      makeAttioRequest("/v2/self", {}, context?.authToken),
      makeAttioRequest("/v2/objects", {}, context?.authToken),
      makeAttioRequest("/v2/lists", {}, context?.authToken),
    ]);

    const workspaceInfo = {
      workspace: self,
      objects: objects,
      lists: lists,
      summary: {
        total_objects: objects.data?.length || 0,
        total_lists: lists.data?.length || 0,
      },
    };

    return createMcpResponse(
      workspaceInfo,
      `Workspace Structure:\n\n${JSON.stringify(workspaceInfo, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "introspecting workspace");
  }
}

export async function getWorkspaceMembers(context?: {
  authToken?: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      "/v2/workspace_members",
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Workspace Members:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting workspace members");
  }
}

export async function getWorkspaceMember(
  args: {
    workspace_member_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/workspace_members/${args.workspace_member_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Workspace Member Details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting workspace member");
  }
}

export async function getSelf(context?: {
  authToken?: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest("/v2/self", {}, context?.authToken);
    return createMcpResponse(
      response,
      `Self information:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting self");
  }
}

// ===============================
// WORKSPACE TOOL DEFINITIONS
// ===============================

export const workspaceToolDefinitions = {
  introspect_workspace: {
    description:
      "Get comprehensive information about the Attio workspace structure, including objects, attributes, lists, and current user permissions",
  },
  get_workspace_members: {
    description: "List all workspace members and their details",
  },
  get_workspace_member: {
    description: "Get details of a specific workspace member",
    schema: getWorkspaceMemberSchema,
  },
  get_self: {
    description: "Get information about the current API token and workspace",
  },
};

// ===============================
// WORKSPACE ACTIONS MAPPING
// ===============================

export const workspaceActions = {
  introspect_workspace: introspectWorkspace,
  get_workspace_members: getWorkspaceMembers,
  get_workspace_member: getWorkspaceMember,
  get_self: getSelf,
};
