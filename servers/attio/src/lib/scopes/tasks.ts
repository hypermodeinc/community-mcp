import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// TASKS SCHEMAS
// ===============================

export const listTasksSchema = {
  assignee_id: z
    .string()
    .optional()
    .describe("Optional: filter tasks by assignee"),
  is_completed: z
    .boolean()
    .optional()
    .describe("Optional: filter by completion status"),
  limit: z.number().optional().describe("Maximum number of tasks to return"),
};

export const getTaskSchema = {
  task_id: z.string().describe("The ID of the task to retrieve"),
};

export const createTaskSchema = {
  content: z.string().describe("The task content/description"),
  assignee_id: z
    .string()
    .optional()
    .describe("Optional: ID of the workspace member to assign the task to"),
  deadline_at: z
    .string()
    .optional()
    .describe("Optional: deadline for the task (ISO 8601 format)"),
  linked_records: z
    .array(z.string())
    .optional()
    .describe("Optional: array of record IDs to link to the task"),
};

export const updateTaskSchema = {
  task_id: z.string().describe("The ID of the task to update"),
  is_completed: z
    .boolean()
    .optional()
    .describe("Mark task as completed or incomplete"),
  deadline_at: z
    .string()
    .optional()
    .describe("Update task deadline (ISO 8601 format)"),
  assignees: z.array(z.any()).optional().describe("Update task assignees"),
  linked_records: z.array(z.any()).optional().describe("Update linked records"),
};

export const deleteTaskSchema = {
  task_id: z.string().describe("The ID of the task to delete"),
};

// ===============================
// TASKS ACTIONS
// ===============================

export async function listTasks(
  args: {
    assignee_id?: string;
    is_completed?: boolean;
    limit?: number;
  } = {},
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.assignee_id) queryParams.append("assignee_id", args.assignee_id);
    if (args.is_completed !== undefined)
      queryParams.append("is_completed", args.is_completed.toString());
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/tasks?${queryParams}`, {}, context?.authToken);
    return createMcpResponse(
      response,
      `Tasks:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing tasks");
  }
}

export async function getTask(args: { task_id: string }, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/tasks/${args.task_id}`, {}, context?.authToken);
    return createMcpResponse(
      response,
      `Task details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting task");
  }
}

export async function createTask(args: {
  content: string;
  assignee_id?: string;
  deadline_at?: string;
  linked_records?: string[];
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const { content, assignee_id, deadline_at, linked_records = [] } = args;
    const assignees = assignee_id
      ? [
          {
            referenced_actor_type: "workspace-member",
            referenced_actor_id: assignee_id,
          },
        ]
      : [];

    const response = await makeAttioRequest("/v2/tasks", {
      method: "POST",
      body: JSON.stringify({
        data: {
          format: "plaintext",
          content,
          deadline_at: deadline_at || null,
          is_completed: false,
          linked_records: linked_records.map((recordId: string) => ({
            target_object: "people",
            target_record_id: recordId,
          })),
          assignees,
        },
      }),
    }, context?.authToken);

    return createMcpResponse(
      response,
      `Successfully created task:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating task");
  }
}

export async function updateTask(args: {
  task_id: string;
  is_completed?: boolean;
  deadline_at?: string;
  assignees?: any[];
  linked_records?: any[];
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const { task_id, ...updateData } = args;
    const response = await makeAttioRequest(`/v2/tasks/${task_id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }, context?.authToken);

    return createMcpResponse(
      response,
      `Successfully updated task:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating task");
  }
}

export async function deleteTask(args: {
  task_id: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    await makeAttioRequest(`/v2/tasks/${args.task_id}`, {
      method: "DELETE",
    }, context?.authToken);

    return createMcpResponse(null, `Successfully deleted task ${args.task_id}`);
  } catch (error) {
    return createErrorResponse(error, "deleting task");
  }
}

// ===============================
// TASKS TOOL DEFINITIONS
// ===============================

export const tasksToolDefinitions = {
  list_tasks: {
    description: "List all tasks in the workspace",
    schema: listTasksSchema,
  },
  get_task: {
    description: "Get a specific task by ID",
    schema: getTaskSchema,
  },
  create_task: {
    description: "Create a new task",
    schema: createTaskSchema,
  },
  update_task: {
    description: "Update an existing task",
    schema: updateTaskSchema,
  },
  delete_task: {
    description: "Delete a task by ID",
    schema: deleteTaskSchema,
  },
};

// ===============================
// TASKS ACTIONS MAPPING
// ===============================

export const tasksActions = {
  list_tasks: listTasks,
  get_task: getTask,
  create_task: createTask,
  update_task: updateTask,
  delete_task: deleteTask,
};
