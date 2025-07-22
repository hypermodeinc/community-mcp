import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";
import { GLOBAL_SEARCH_LIMIT, validatePagination } from "../utils/paginate";

export const listThreadsSchema = {
  record_id: z
    .string()
    .optional()
    .describe("Optional: filter threads by record ID"),
  entry_id: z
    .string()
    .optional()
    .describe("Optional: filter threads by list entry ID"),
  limit: z
    .number()
    .min(1)
    .max(GLOBAL_SEARCH_LIMIT)
    .describe(
      `Maximum number of threads to return (required, max: ${GLOBAL_SEARCH_LIMIT})`,
    ),
  offset: z
    .number()
    .min(0)
    .optional()
    .describe("Number of threads to skip for pagination"),
};

export const getThreadSchema = {
  thread_id: z.string().describe("The ID of the thread to retrieve"),
};

export async function listThreads(
  args: {
    record_id?: string;
    entry_id?: string;
    limit: number;
    offset?: number;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const pagination = validatePagination({
      limit: args.limit,
      offset: args.offset,
    });

    const queryParams = new URLSearchParams();
    if (args.record_id) queryParams.append("record_id", args.record_id);
    if (args.entry_id) queryParams.append("entry_id", args.entry_id);
    queryParams.append("limit", pagination.limit.toString());
    queryParams.append("offset", pagination.offset.toString());

    const response = await makeAttioRequest(
      `/v2/threads?${queryParams}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Threads:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing threads");
  }
}

export async function getThread(
  args: {
    thread_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/threads/${args.thread_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Thread details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting thread");
  }
}

export const commentsToolDefinitions = {
  list_threads: {
    description: "List comment threads, optionally filtered by record or entry",
    schema: listThreadsSchema,
  },
  get_thread: {
    description: "Get all comments in a thread",
    schema: getThreadSchema,
  },
};

export const commentsActions = {
  list_threads: listThreads,
  get_thread: getThread,
};
