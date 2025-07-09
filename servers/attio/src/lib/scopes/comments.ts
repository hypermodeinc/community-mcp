import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// COMMENTS & THREADS SCHEMAS
// ===============================

export const listThreadsSchema = {
  record_id: z
    .string()
    .optional()
    .describe("Optional: filter threads by record ID"),
  entry_id: z
    .string()
    .optional()
    .describe("Optional: filter threads by list entry ID"),
  limit: z.number().optional().describe("Maximum number of threads to return"),
};

export const getThreadSchema = {
  thread_id: z.string().describe("The ID of the thread to retrieve"),
};

export const createCommentSchema = {
  content: z.string().describe("The comment content"),
  record_id: z
    .string()
    .optional()
    .describe("Optional: ID of record to comment on (for new thread)"),
  entry_id: z
    .string()
    .optional()
    .describe("Optional: ID of list entry to comment on (for new thread)"),
  thread_id: z
    .string()
    .optional()
    .describe("Optional: ID of existing thread to reply to"),
};

export const getCommentSchema = {
  comment_id: z.string().describe("The ID of the comment to retrieve"),
};

export const deleteCommentSchema = {
  comment_id: z.string().describe("The ID of the comment to delete"),
};

// ===============================
// COMMENTS & THREADS ACTIONS
// ===============================

export async function listThreads(
  args: {
    record_id?: string;
    entry_id?: string;
    limit?: number;
  } = {},
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.record_id) queryParams.append("record_id", args.record_id);
    if (args.entry_id) queryParams.append("entry_id", args.entry_id);
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/threads?${queryParams}`, {}, context?.authToken);
    return createMcpResponse(
      response,
      `Threads:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing threads");
  }
}

export async function getThread(args: {
  thread_id: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/threads/${args.thread_id}`, {}, context?.authToken);
    return createMcpResponse(
      response,
      `Thread details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting thread");
  }
}

export async function createComment(args: {
  content: string;
  record_id?: string;
  entry_id?: string;
  thread_id?: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const { content, record_id, entry_id, thread_id } = args;
    let commentData: any = {
      format: "plaintext",
      content,
      author: {
        type: "workspace-member",
        id: "current",
      },
    };

    if (thread_id) {
      commentData.thread_id = thread_id;
    } else if (record_id) {
      commentData.record = {
        target_object: "people",
        target_record_id: record_id,
      };
    } else if (entry_id) {
      commentData.entry = {
        target_list: "default",
        target_entry_id: entry_id,
      };
    }

    const response = await makeAttioRequest("/v2/comments", {
      method: "POST",
      body: JSON.stringify({
        data: commentData,
      }),
    }, context?.authToken);

    return createMcpResponse(
      response,
      `Successfully created comment:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating comment");
  }
}

export async function getComment(args: {
  comment_id: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/comments/${args.comment_id}`, {}, context?.authToken);
    return createMcpResponse(
      response,
      `Comment details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting comment");
  }
}

export async function deleteComment(args: {
  comment_id: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    await makeAttioRequest(`/v2/comments/${args.comment_id}`, {
      method: "DELETE",
    }, context?.authToken);

    return createMcpResponse(
      null,
      `Successfully deleted comment ${args.comment_id}`,
    );
  } catch (error) {
    return createErrorResponse(error, "deleting comment");
  }
}

// ===============================
// COMMENTS & THREADS TOOL DEFINITIONS
// ===============================

export const commentsToolDefinitions = {
  list_threads: {
    description: "List comment threads, optionally filtered by record or entry",
    schema: listThreadsSchema,
  },
  get_thread: {
    description: "Get all comments in a thread",
    schema: getThreadSchema,
  },
  create_comment: {
    description:
      "Create a new comment on a record, list entry, or existing thread",
    schema: createCommentSchema,
  },
  get_comment: {
    description: "Get a specific comment by ID",
    schema: getCommentSchema,
  },
  delete_comment: {
    description: "Delete a comment by ID",
    schema: deleteCommentSchema,
  },
};

// ===============================
// COMMENTS & THREADS ACTIONS MAPPING
// ===============================

export const commentsActions = {
  list_threads: listThreads,
  get_thread: getThread,
  create_comment: createComment,
  get_comment: getComment,
  delete_comment: deleteComment,
};
