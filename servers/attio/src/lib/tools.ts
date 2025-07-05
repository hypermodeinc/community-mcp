import { z } from "zod";

// Workspace Introspection Tools
export const introspectWorkspaceSchema = {};

export const getWorkspaceMembersSchema = {};

export const getWorkspaceMemberSchema = {
  workspace_member_id: z
    .string()
    .describe("The ID of the workspace member to retrieve"),
};

// Object Management Tools
export const listObjectsSchema = {};

export const getObjectSchema = {
  object: z
    .string()
    .describe(
      "Object ID or slug (e.g., 'people', 'companies', 'opportunities')",
    ),
};

export const getObjectAttributesSchema = {
  object: z.string().describe("Object ID or slug"),
};

// Record Operations Tools
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

// List Operations Tools
export const listListsSchema = {};

export const getListSchema = {
  list: z.string().describe("List ID or slug"),
};

export const searchListEntriesSchema = {
  list: z.string().describe("List ID or slug"),
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of entries to return"),
      offset: z.number().optional().describe("Number of entries to skip"),
      sorts: z.array(z.any()).optional().describe("Sort criteria"),
    })
    .optional()
    .describe("Search criteria and filters"),
};

export const addToListSchema = {
  list: z.string().describe("List ID or slug"),
  data: z
    .object({
      parent_record: z
        .string()
        .describe("ID of the parent record to add to the list"),
      values: z
        .record(z.any())
        .optional()
        .describe("Additional attribute values for the list entry"),
    })
    .describe("Entry data"),
};

export const removeFromListSchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to remove"),
};

export const updateListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to update"),
  data: z
    .object({
      values: z.record(z.any()).describe("Attribute values to update"),
    })
    .describe("Updated entry data"),
};

// Notes Management Tools
export const listNotesSchema = {
  record_id: z
    .string()
    .optional()
    .describe("Optional: filter notes by record ID"),
  limit: z.number().optional().describe("Maximum number of notes to return"),
};

export const getNoteSchema = {
  note_id: z.string().describe("The ID of the note to retrieve"),
};

export const createNoteSchema = {
  record_id: z.string().describe("ID of the record to attach the note to"),
  content: z.string().describe("The note content"),
  title: z.string().optional().describe("Optional title for the note"),
  parent_object: z
    .string()
    .optional()
    .describe(
      "The object type (e.g., 'people', 'companies') - defaults to 'people'",
    ),
};

export const deleteNoteSchema = {
  note_id: z.string().describe("The ID of the note to delete"),
};

// Tasks Management Tools
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

// Comments and Threads Tools
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

// Single source of truth for tool definitions
export const toolDefinitions = {
  // Test tools
  test_connection: {
    description: "Test connection to Attio MCP server",
    schema: {
      message: z.string().optional().describe("Optional test message"),
    },
  },
  test_with_args: {
    description: "Test tool with required arguments",
    schema: {
      name: z.string().describe("Name of the person"),
      age: z.number().int().min(0).describe("Age in years"),
      email: z.string().email().optional().describe("Optional email address"),
    },
  },

  // Workspace Introspection
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

  // Object Management
  list_objects: {
    description: "List all objects (both system and custom) in the workspace",
    schema: listObjectsSchema,
  },
  get_object: {
    description: "Get detailed information about a specific object",
    schema: getObjectSchema,
  },
  get_object_attributes: {
    description: "List all attributes for a specific object",
    schema: getObjectAttributesSchema,
  },

  // Record Operations
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
  upsert_record: {
    description:
      "Create or update a record based on matching criteria (assert operation)",
    schema: upsertRecordSchema,
  },
  delete_record: {
    description: "Delete a record by ID",
    schema: deleteRecordSchema,
  },

  // List Operations
  list_lists: {
    description: "Get all lists in the workspace",
    schema: listListsSchema,
  },
  get_list: {
    description: "Get details of a specific list",
    schema: getListSchema,
  },
  search_list_entries: {
    description: "Search entries in a specific list",
    schema: searchListEntriesSchema,
  },
  add_to_list: {
    description: "Add a record to a list as a new entry",
    schema: addToListSchema,
  },
  remove_from_list: {
    description: "Remove an entry from a list",
    schema: removeFromListSchema,
  },
  update_list_entry: {
    description: "Update a list entry",
    schema: updateListEntrySchema,
  },

  // Notes Management
  list_notes: {
    description: "List notes, optionally filtered by record",
    schema: listNotesSchema,
  },
  get_note: {
    description: "Get a specific note by ID",
    schema: getNoteSchema,
  },
  create_note: {
    description: "Create a new note for a record",
    schema: createNoteSchema,
  },
  delete_note: {
    description: "Delete a note by ID",
    schema: deleteNoteSchema,
  },

  // Tasks Management
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

  // Comments and Threads
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
