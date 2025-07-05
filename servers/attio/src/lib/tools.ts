import { z } from "zod";

// Test Tools
export const testConnectionSchema = {
  message: z.string().optional().describe("Optional test message"),
};

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

export const createObjectSchema = {
  data: z
    .object({
      api_slug: z.string().describe("API slug for the object"),
      singular_noun: z.string().describe("Singular noun for the object"),
      plural_noun: z.string().describe("Plural noun for the object"),
      icon: z.string().optional().describe("Icon for the object"),
      is_enabled: z
        .boolean()
        .optional()
        .describe("Whether the object is enabled"),
    })
    .describe("Object data to create"),
};

export const updateObjectSchema = {
  object: z.string().describe("Object ID or slug"),
  data: z
    .object({
      singular_noun: z
        .string()
        .optional()
        .describe("Singular noun for the object"),
      plural_noun: z.string().optional().describe("Plural noun for the object"),
      icon: z.string().optional().describe("Icon for the object"),
      is_enabled: z
        .boolean()
        .optional()
        .describe("Whether the object is enabled"),
    })
    .describe("Object data to update"),
};

export const getObjectAttributesSchema = {
  object: z.string().describe("Object ID or slug"),
};

// Attribute Management Tools
export const listAttributesSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
};

export const createAttributeSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  data: z
    .object({
      title: z.string().describe("Attribute title"),
      api_slug: z.string().describe("API slug for the attribute"),
      type: z.string().describe("Attribute type"),
      is_required: z
        .boolean()
        .optional()
        .describe("Whether the attribute is required"),
      is_multiselect: z
        .boolean()
        .optional()
        .describe("Whether the attribute allows multiple values"),
      config: z.record(z.any()).optional().describe("Additional configuration"),
    })
    .describe("Attribute data"),
};

export const getAttributeSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
};

export const updateAttributeSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  data: z
    .object({
      title: z.string().optional().describe("Attribute title"),
      is_required: z
        .boolean()
        .optional()
        .describe("Whether the attribute is required"),
      config: z.record(z.any()).optional().describe("Additional configuration"),
    })
    .describe("Attribute data to update"),
};

// Select Options Tools
export const listSelectOptionsSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
};

export const createSelectOptionSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  data: z
    .object({
      title: z.string().describe("Option title"),
      color: z.string().optional().describe("Option color"),
    })
    .describe("Select option data"),
};

export const updateSelectOptionSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  option: z.string().describe("Option ID"),
  data: z
    .object({
      title: z.string().optional().describe("Option title"),
      color: z.string().optional().describe("Option color"),
    })
    .describe("Select option data to update"),
};

// Status Management Tools
export const listStatusesSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
};

export const createStatusSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  data: z
    .object({
      title: z.string().describe("Status title"),
      color: z.string().optional().describe("Status color"),
    })
    .describe("Status data"),
};

export const updateStatusSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  status: z.string().describe("Status ID"),
  data: z
    .object({
      title: z.string().optional().describe("Status title"),
      color: z.string().optional().describe("Status color"),
    })
    .describe("Status data to update"),
};

// Generic Record Operations Tools
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

export const putUpdateRecordSchema = {
  object: z
    .string()
    .describe("The object type (e.g., 'people', 'companies', 'opportunities')"),
  record_id: z.string().describe("The ID of the record to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to overwrite"),
    })
    .describe("The record data to overwrite"),
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

export const getRecordAttributeValuesSchema = {
  object: z.string().describe("The object type"),
  record_id: z.string().describe("The ID of the record"),
  attribute: z.string().describe("The attribute ID or slug"),
  show_historic: z.boolean().optional().describe("Include historic values"),
};

export const getRecordEntriesSchema = {
  object: z.string().describe("The object type"),
  record_id: z.string().describe("The ID of the record"),
};

// =============================================================================
// PEOPLE-SPECIFIC TOOLS
// =============================================================================

export const searchPeopleSchema = {
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of people to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of people to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getPersonSchema = {
  person_id: z.string().describe("The ID of the person to retrieve"),
};

export const createPersonSchema = {
  data: z
    .object({
      values: z
        .record(z.any())
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
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The person data to update"),
};

export const deletePersonSchema = {
  person_id: z.string().describe("The ID of the person to delete"),
};

// =============================================================================
// COMPANIES-SPECIFIC TOOLS
// =============================================================================

export const searchCompaniesSchema = {
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of companies to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of companies to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getCompanySchema = {
  company_id: z.string().describe("The ID of the company to retrieve"),
};

export const createCompanySchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe(
          "Key-value pairs of attributes for the new company (e.g., name, domain, industry)",
        ),
    })
    .describe("The company data to create"),
};

export const updateCompanySchema = {
  company_id: z.string().describe("The ID of the company to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The company data to update"),
};

export const deleteCompanySchema = {
  company_id: z.string().describe("The ID of the company to delete"),
};

// =============================================================================
// DEALS-SPECIFIC TOOLS
// =============================================================================

export const searchDealsSchema = {
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of deals to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of deals to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getDealSchema = {
  deal_id: z.string().describe("The ID of the deal to retrieve"),
};

export const createDealSchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe(
          "Key-value pairs of attributes for the new deal (e.g., name, value, stage, close_date)",
        ),
    })
    .describe("The deal data to create"),
};

export const updateDealSchema = {
  deal_id: z.string().describe("The ID of the deal to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The deal data to update"),
};

export const deleteDealSchema = {
  deal_id: z.string().describe("The ID of the deal to delete"),
};

// =============================================================================
// USERS-SPECIFIC TOOLS
// =============================================================================

export const searchUsersSchema = {
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of users to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of users to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getUserSchema = {
  user_id: z.string().describe("The ID of the user to retrieve"),
};

export const createUserSchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes for the new user"),
    })
    .describe("The user data to create"),
};

export const updateUserSchema = {
  user_id: z.string().describe("The ID of the user to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The user data to update"),
};

export const deleteUserSchema = {
  user_id: z.string().describe("The ID of the user to delete"),
};

// =============================================================================
// WORKSPACES-SPECIFIC TOOLS
// =============================================================================

export const searchWorkspacesSchema = {
  query: z
    .object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of workspaces to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of workspaces to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getWorkspaceSchema = {
  workspace_id: z.string().describe("The ID of the workspace to retrieve"),
};

export const createWorkspaceSchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes for the new workspace"),
    })
    .describe("The workspace data to create"),
};

export const updateWorkspaceSchema = {
  workspace_id: z.string().describe("The ID of the workspace to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The workspace data to update"),
};

export const deleteWorkspaceSchema = {
  workspace_id: z.string().describe("The ID of the workspace to delete"),
};

// List Operations Tools
export const listListsSchema = {};

export const createListSchema = {
  data: z
    .object({
      name: z.string().describe("List name"),
      parent_object: z.string().describe("Parent object ID or slug"),
      workspace_access: z
        .string()
        .optional()
        .describe("Workspace access level"),
      workspace_member_access: z
        .array(z.any())
        .optional()
        .describe("Workspace member access"),
    })
    .describe("List data to create"),
};

export const getListSchema = {
  list: z.string().describe("List ID or slug"),
};

export const updateListSchema = {
  list: z.string().describe("List ID or slug"),
  data: z
    .object({
      name: z.string().optional().describe("List name"),
      workspace_access: z
        .string()
        .optional()
        .describe("Workspace access level"),
      workspace_member_access: z
        .array(z.any())
        .optional()
        .describe("Workspace member access"),
    })
    .describe("List data to update"),
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

export const upsertListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  data: z
    .object({
      parent_record: z.string().describe("ID of the parent record"),
      values: z
        .record(z.any())
        .optional()
        .describe("Attribute values for the list entry"),
    })
    .describe("Entry data"),
};

export const removeFromListSchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to remove"),
};

export const getListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to get"),
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

export const putUpdateListEntrySchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry to update"),
  data: z
    .object({
      values: z.record(z.any()).describe("Attribute values to overwrite"),
    })
    .describe("Entry data to overwrite"),
};

export const getListEntryAttributeValuesSchema = {
  list: z.string().describe("List ID or slug"),
  entry_id: z.string().describe("ID of the entry"),
  attribute: z.string().describe("The attribute ID or slug"),
  show_historic: z.boolean().optional().describe("Include historic values"),
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

// Meeting Tools
export const getMeetingSchema = {
  meeting_id: z.string().describe("The ID of the meeting to retrieve"),
};

// Webhook Tools
export const listWebhooksSchema = {};

export const createWebhookSchema = {
  data: z
    .object({
      url: z.string().describe("Webhook URL"),
      subscriptions: z.array(z.any()).describe("Webhook subscriptions"),
    })
    .describe("Webhook data to create"),
};

export const getWebhookSchema = {
  webhook_id: z.string().describe("The ID of the webhook to retrieve"),
};

export const updateWebhookSchema = {
  webhook_id: z.string().describe("The ID of the webhook to update"),
  data: z
    .object({
      url: z.string().optional().describe("Webhook URL"),
      subscriptions: z
        .array(z.any())
        .optional()
        .describe("Webhook subscriptions"),
    })
    .describe("Webhook data to update"),
};

export const deleteWebhookSchema = {
  webhook_id: z.string().describe("The ID of the webhook to delete"),
};

// Self/Identity Tools
export const getSelfSchema = {};

// Single source of truth for tool definitions
export const toolDefinitions = {
  // Test tools
  test_connection: {
    description: "Test connection to Attio MCP server",
    schema: testConnectionSchema,
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
  create_object: {
    description: "Create a new custom object in the workspace",
    schema: createObjectSchema,
  },
  update_object: {
    description: "Update an existing object",
    schema: updateObjectSchema,
  },
  get_object_attributes: {
    description: "List all attributes for a specific object",
    schema: getObjectAttributesSchema,
  },

  // Attribute Management
  list_attributes: {
    description: "List all attributes for a specific object or list",
    schema: listAttributesSchema,
  },
  create_attribute: {
    description: "Create a new attribute on an object or list",
    schema: createAttributeSchema,
  },
  get_attribute: {
    description: "Get information about a specific attribute",
    schema: getAttributeSchema,
  },
  update_attribute: {
    description: "Update an existing attribute",
    schema: updateAttributeSchema,
  },

  // Select Options Management
  list_select_options: {
    description: "List all select options for a select attribute",
    schema: listSelectOptionsSchema,
  },
  create_select_option: {
    description: "Create a new select option for a select attribute",
    schema: createSelectOptionSchema,
  },
  update_select_option: {
    description: "Update an existing select option",
    schema: updateSelectOptionSchema,
  },

  // Status Management
  list_statuses: {
    description: "List all statuses for a status attribute",
    schema: listStatusesSchema,
  },
  create_status: {
    description: "Create a new status for a status attribute",
    schema: createStatusSchema,
  },
  update_status: {
    description: "Update an existing status",
    schema: updateStatusSchema,
  },

  // Generic Record Operations
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
  put_update_record: {
    description:
      "Update an existing record in Attio CRM (overwrites multiselect fields)",
    schema: putUpdateRecordSchema,
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
  get_record_attribute_values: {
    description: "Get all values for a specific attribute on a record",
    schema: getRecordAttributeValuesSchema,
  },
  get_record_entries: {
    description: "List all list entries for a specific record",
    schema: getRecordEntriesSchema,
  },

  // =============================================================================
  // PEOPLE-SPECIFIC TOOLS
  // =============================================================================
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

  // =============================================================================
  // COMPANIES-SPECIFIC TOOLS
  // =============================================================================
  search_companies: {
    description:
      "Search for companies in Attio CRM with filtering and sorting options",
    schema: searchCompaniesSchema,
  },
  get_company: {
    description: "Get a specific company by ID with all its data",
    schema: getCompanySchema,
  },
  create_company: {
    description: "Create a new company in Attio CRM",
    schema: createCompanySchema,
  },
  update_company: {
    description: "Update an existing company in Attio CRM",
    schema: updateCompanySchema,
  },
  delete_company: {
    description: "Delete a company by ID",
    schema: deleteCompanySchema,
  },

  // =============================================================================
  // DEALS-SPECIFIC TOOLS
  // =============================================================================
  search_deals: {
    description:
      "Search for deals in Attio CRM with filtering and sorting options",
    schema: searchDealsSchema,
  },
  get_deal: {
    description: "Get a specific deal by ID with all its data",
    schema: getDealSchema,
  },
  create_deal: {
    description: "Create a new deal in Attio CRM",
    schema: createDealSchema,
  },
  update_deal: {
    description: "Update an existing deal in Attio CRM",
    schema: updateDealSchema,
  },
  delete_deal: {
    description: "Delete a deal by ID",
    schema: deleteDealSchema,
  },

  // =============================================================================
  // USERS-SPECIFIC TOOLS
  // =============================================================================
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

  // =============================================================================
  // WORKSPACES-SPECIFIC TOOLS
  // =============================================================================
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

  // List Operations
  list_lists: {
    description: "Get all lists in the workspace",
    schema: listListsSchema,
  },
  create_list: {
    description: "Create a new list",
    schema: createListSchema,
  },
  get_list: {
    description: "Get details of a specific list",
    schema: getListSchema,
  },
  update_list: {
    description: "Update an existing list",
    schema: updateListSchema,
  },
  search_list_entries: {
    description: "Search entries in a specific list",
    schema: searchListEntriesSchema,
  },
  add_to_list: {
    description: "Add a record to a list as a new entry",
    schema: addToListSchema,
  },
  upsert_list_entry: {
    description: "Create or update a list entry by parent record",
    schema: upsertListEntrySchema,
  },
  remove_from_list: {
    description: "Remove an entry from a list",
    schema: removeFromListSchema,
  },
  get_list_entry: {
    description: "Get a specific list entry by ID",
    schema: getListEntrySchema,
  },
  update_list_entry: {
    description: "Update a list entry (appends to multiselect fields)",
    schema: updateListEntrySchema,
  },
  put_update_list_entry: {
    description: "Update a list entry (overwrites multiselect fields)",
    schema: putUpdateListEntrySchema,
  },
  get_list_entry_attribute_values: {
    description: "Get all values for a specific attribute on a list entry",
    schema: getListEntryAttributeValuesSchema,
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

  // Meetings
  get_meeting: {
    description: "Get a specific meeting by ID",
    schema: getMeetingSchema,
  },

  // Webhooks
  list_webhooks: {
    description: "List all webhooks in the workspace",
    schema: listWebhooksSchema,
  },
  create_webhook: {
    description: "Create a new webhook",
    schema: createWebhookSchema,
  },
  get_webhook: {
    description: "Get a specific webhook by ID",
    schema: getWebhookSchema,
  },
  update_webhook: {
    description: "Update an existing webhook",
    schema: updateWebhookSchema,
  },
  delete_webhook: {
    description: "Delete a webhook by ID",
    schema: deleteWebhookSchema,
  },

  // Self/Identity
  get_self: {
    description: "Get information about the current API token and workspace",
    schema: getSelfSchema,
  },
};
