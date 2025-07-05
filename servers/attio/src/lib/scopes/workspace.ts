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

export const introspectWorkspaceSchema = {};

export const getWorkspaceMembersSchema = {};

export const getWorkspaceMemberSchema = {
  workspace_member_id: z
    .string()
    .describe("The ID of the workspace member to retrieve"),
};

export const getSelfSchema = {};

// ===============================
// WORKSPACE ACTIONS
// ===============================

export async function introspectWorkspace(): Promise<McpResponse> {
  try {
    const [self, objects, lists, members] = await Promise.all([
      makeAttioRequest("/v2/self"),
      makeAttioRequest("/v2/objects"),
      makeAttioRequest("/v2/lists"),
      makeAttioRequest("/v2/workspace_members"),
    ]);

    const workspaceInfo = {
      workspace: self,
      objects: objects,
      lists: lists,
      members: members,
      summary: {
        total_objects: objects.data?.length || 0,
        total_lists: lists.data?.length || 0,
        total_members: members.data?.length || 0,
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

export async function getWorkspaceMembers(): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest("/v2/workspace_members");
    return createMcpResponse(
      response,
      `Workspace Members:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting workspace members");
  }
}

export async function getWorkspaceMember(args: {
  workspace_member_id: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/workspace_members/${args.workspace_member_id}`,
    );
    return createMcpResponse(
      response,
      `Workspace Member Details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting workspace member");
  }
}

export async function getSelf(): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest("/v2/self");
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
    schema: introspectWorkspaceSchema,
  },
  get_workspace_members: {
    description: "List all workspace members and their details",
    schema: getWorkspaceMembersSchema,
  },
  get_workspace_member: {
    description: "Get details of a specific workspace member",
    schema: getWorkspaceMemberSchema,
  },
  get_self: {
    description: "Get information about the current API token and workspace",
    schema: getSelfSchema,
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
