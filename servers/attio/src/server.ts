#!/usr/bin/env node

import { config } from "dotenv";
config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  TextContent,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { randomUUID } from "node:crypto";

import { createClient } from "./generated/client/client.js";
import {
  postV2ObjectsByObjectRecordsQuery,
  patchV2ObjectsByObjectRecordsByRecordId,
  postV2ObjectsByObjectRecords,
  putV2ObjectsByObjectRecords,
  deleteV2ObjectsByObjectRecordsByRecordId,
  getV2ObjectsByObjectRecordsByRecordId,
  getV2Objects,
  getV2ObjectsByObject,
  getV2ByTargetByIdentifierAttributes,
  getV2Lists,
  getV2ListsByList,
  postV2ListsByListEntriesQuery,
  postV2ListsByListEntries,
  putV2ListsByListEntries,
  deleteV2ListsByListEntriesByEntryId,
  getV2ListsByListEntriesByEntryId,
  patchV2ListsByListEntriesByEntryId,
  getV2Notes,
  postV2Notes,
  deleteV2NotesByNoteId,
  getV2NotesByNoteId,
  getV2Tasks,
  postV2Tasks,
  deleteV2TasksByTaskId,
  getV2TasksByTaskId,
  patchV2TasksByTaskId,
  getV2WorkspaceMembers,
  getV2WorkspaceMembersByWorkspaceMemberId,
  getV2Self,
  postV2Comments,
  getV2CommentsByCommentId,
  deleteV2CommentsByCommentId,
  getV2Threads,
  getV2ThreadsByThreadId,
} from "./generated/sdk.gen.js";

const client = createClient({
  baseUrl: process.env["ATTIO_API_BASE_URL"] || "https://api.attio.com",
  headers: {
    Authorization: `Bearer ${process.env["ATTIO_API_KEY"] || ""}`,
  },
});

export class AttioMCPServer {
  private app: express.Application;

  // Store transports for each session type
  private transports = {
    streamable: {} as Record<string, StreamableHTTPServerTransport>,
    sse: {} as Record<string, SSEServerTransport>,
  };

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  private createServer(): Server {
    const server = new Server(
      {
        name: "attio-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers(server);
    return server;
  }

  private setupToolHandlers(server: Server): void {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Workspace Introspection
          {
            name: "introspect_workspace",
            description:
              "Get comprehensive information about the Attio workspace structure, including objects, attributes, lists, and current user permissions",
            inputSchema: {
              type: "object",
              properties: {},
              required: [],
            },
          },
          {
            name: "get_workspace_members",
            description: "List all workspace members and their details",
            inputSchema: {
              type: "object",
              properties: {},
              required: [],
            },
          },
          {
            name: "get_workspace_member",
            description: "Get details of a specific workspace member",
            inputSchema: {
              type: "object",
              properties: {
                workspace_member_id: {
                  type: "string",
                  description: "The ID of the workspace member to retrieve",
                },
              },
              required: ["workspace_member_id"],
            },
          },

          // Object Management
          {
            name: "list_objects",
            description:
              "List all objects (both system and custom) in the workspace",
            inputSchema: {
              type: "object",
              properties: {},
              required: [],
            },
          },
          {
            name: "get_object",
            description: "Get detailed information about a specific object",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description:
                    "Object ID or slug (e.g., 'people', 'companies', 'opportunities')",
                },
              },
              required: ["object"],
            },
          },
          {
            name: "get_object_attributes",
            description: "List all attributes for a specific object",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description: "Object ID or slug",
                },
              },
              required: ["object"],
            },
          },

          // Record Operations
          {
            name: "search_records",
            description:
              "Search for records in Attio CRM with advanced filtering and sorting options",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description:
                    "The object type to search (e.g., 'people', 'companies', 'opportunities')",
                },
                query: {
                  type: "object",
                  description: "Search criteria, filters, and sorting options",
                  properties: {
                    limit: {
                      type: "number",
                      description:
                        "Maximum number of records to return (default: 25)",
                    },
                    offset: {
                      type: "number",
                      description: "Number of records to skip for pagination",
                    },
                    sorts: {
                      type: "array",
                      description: "Array of sort criteria",
                    },
                  },
                },
              },
              required: ["object"],
            },
          },
          {
            name: "get_record",
            description: "Get a specific record by ID with all its data",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description: "The object type (e.g., 'people', 'companies')",
                },
                record_id: {
                  type: "string",
                  description: "The ID of the record to retrieve",
                },
              },
              required: ["object", "record_id"],
            },
          },
          {
            name: "create_record",
            description: "Create a new record in Attio CRM",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description:
                    "The object type (e.g., 'people', 'companies', 'opportunities')",
                },
                data: {
                  type: "object",
                  description: "The record data to create",
                  properties: {
                    values: {
                      type: "object",
                      description:
                        "Key-value pairs of attributes for the new record",
                    },
                  },
                },
              },
              required: ["object", "data"],
            },
          },
          {
            name: "update_record",
            description:
              "Update an existing record in Attio CRM (appends to multiselect fields)",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description:
                    "The object type (e.g., 'people', 'companies', 'opportunities')",
                },
                record_id: {
                  type: "string",
                  description: "The ID of the record to update",
                },
                data: {
                  type: "object",
                  description: "The record data to update",
                  properties: {
                    values: {
                      type: "object",
                      description: "Key-value pairs of attributes to update",
                    },
                  },
                },
              },
              required: ["object", "record_id", "data"],
            },
          },
          {
            name: "upsert_record",
            description:
              "Create or update a record based on matching criteria (assert operation)",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description: "The object type",
                },
                data: {
                  type: "object",
                  description: "The record data with matching criteria",
                  properties: {
                    values: {
                      type: "object",
                      description: "Key-value pairs of attributes",
                    },
                    matching_attribute: {
                      type: "string",
                      description:
                        "Attribute to match against for existing records",
                    },
                  },
                },
              },
              required: ["object", "data"],
            },
          },
          {
            name: "delete_record",
            description: "Delete a record by ID",
            inputSchema: {
              type: "object",
              properties: {
                object: {
                  type: "string",
                  description: "The object type",
                },
                record_id: {
                  type: "string",
                  description: "The ID of the record to delete",
                },
              },
              required: ["object", "record_id"],
            },
          },

          // List Operations
          {
            name: "list_lists",
            description: "Get all lists in the workspace",
            inputSchema: {
              type: "object",
              properties: {},
              required: [],
            },
          },
          {
            name: "get_list",
            description: "Get details of a specific list",
            inputSchema: {
              type: "object",
              properties: {
                list: {
                  type: "string",
                  description: "List ID or slug",
                },
              },
              required: ["list"],
            },
          },
          {
            name: "search_list_entries",
            description: "Search entries in a specific list",
            inputSchema: {
              type: "object",
              properties: {
                list: {
                  type: "string",
                  description: "List ID or slug",
                },
                query: {
                  type: "object",
                  description: "Search criteria and filters",
                  properties: {
                    limit: {
                      type: "number",
                      description: "Maximum number of entries to return",
                    },
                    offset: {
                      type: "number",
                      description: "Number of entries to skip",
                    },
                    sorts: {
                      type: "array",
                      description: "Sort criteria",
                    },
                  },
                },
              },
              required: ["list"],
            },
          },
          {
            name: "add_to_list",
            description: "Add a record to a list as a new entry",
            inputSchema: {
              type: "object",
              properties: {
                list: {
                  type: "string",
                  description: "List ID or slug",
                },
                data: {
                  type: "object",
                  description: "Entry data",
                  properties: {
                    parent_record: {
                      type: "string",
                      description: "ID of the parent record to add to the list",
                    },
                    values: {
                      type: "object",
                      description:
                        "Additional attribute values for the list entry",
                    },
                  },
                },
              },
              required: ["list", "data"],
            },
          },
          {
            name: "remove_from_list",
            description: "Remove an entry from a list",
            inputSchema: {
              type: "object",
              properties: {
                list: {
                  type: "string",
                  description: "List ID or slug",
                },
                entry_id: {
                  type: "string",
                  description: "ID of the entry to remove",
                },
              },
              required: ["list", "entry_id"],
            },
          },
          {
            name: "update_list_entry",
            description: "Update a list entry",
            inputSchema: {
              type: "object",
              properties: {
                list: {
                  type: "string",
                  description: "List ID or slug",
                },
                entry_id: {
                  type: "string",
                  description: "ID of the entry to update",
                },
                data: {
                  type: "object",
                  description: "Updated entry data",
                  properties: {
                    values: {
                      type: "object",
                      description: "Attribute values to update",
                    },
                  },
                },
              },
              required: ["list", "entry_id", "data"],
            },
          },

          // Notes Management
          {
            name: "list_notes",
            description: "List notes, optionally filtered by record",
            inputSchema: {
              type: "object",
              properties: {
                record_id: {
                  type: "string",
                  description: "Optional: filter notes by record ID",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of notes to return",
                },
              },
              required: [],
            },
          },
          {
            name: "get_note",
            description: "Get a specific note by ID",
            inputSchema: {
              type: "object",
              properties: {
                note_id: {
                  type: "string",
                  description: "The ID of the note to retrieve",
                },
              },
              required: ["note_id"],
            },
          },
          {
            name: "create_note",
            description: "Create a new note for a record",
            inputSchema: {
              type: "object",
              properties: {
                record_id: {
                  type: "string",
                  description: "ID of the record to attach the note to",
                },
                content: {
                  type: "string",
                  description: "The note content",
                },
                title: {
                  type: "string",
                  description: "Optional title for the note",
                },
                parent_object: {
                  type: "string",
                  description:
                    "The object type (e.g., 'people', 'companies') - defaults to 'people'",
                },
              },
              required: ["record_id", "content"],
            },
          },
          {
            name: "delete_note",
            description: "Delete a note by ID",
            inputSchema: {
              type: "object",
              properties: {
                note_id: {
                  type: "string",
                  description: "The ID of the note to delete",
                },
              },
              required: ["note_id"],
            },
          },

          // Tasks Management
          {
            name: "list_tasks",
            description: "List all tasks in the workspace",
            inputSchema: {
              type: "object",
              properties: {
                assignee_id: {
                  type: "string",
                  description: "Optional: filter tasks by assignee",
                },
                is_completed: {
                  type: "boolean",
                  description: "Optional: filter by completion status",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of tasks to return",
                },
              },
              required: [],
            },
          },
          {
            name: "get_task",
            description: "Get a specific task by ID",
            inputSchema: {
              type: "object",
              properties: {
                task_id: {
                  type: "string",
                  description: "The ID of the task to retrieve",
                },
              },
              required: ["task_id"],
            },
          },
          {
            name: "create_task",
            description: "Create a new task",
            inputSchema: {
              type: "object",
              properties: {
                content: {
                  type: "string",
                  description: "The task content/description",
                },
                assignee_id: {
                  type: "string",
                  description:
                    "Optional: ID of the workspace member to assign the task to",
                },
                deadline_at: {
                  type: "string",
                  description:
                    "Optional: deadline for the task (ISO 8601 format)",
                },
                linked_records: {
                  type: "array",
                  description:
                    "Optional: array of record IDs to link to the task",
                  items: {
                    type: "string",
                  },
                },
              },
              required: ["content"],
            },
          },
          {
            name: "update_task",
            description: "Update an existing task",
            inputSchema: {
              type: "object",
              properties: {
                task_id: {
                  type: "string",
                  description: "The ID of the task to update",
                },
                is_completed: {
                  type: "boolean",
                  description: "Mark task as completed or incomplete",
                },
                deadline_at: {
                  type: "string",
                  description: "Update task deadline (ISO 8601 format)",
                },
                assignees: {
                  type: "array",
                  description: "Update task assignees",
                },
                linked_records: {
                  type: "array",
                  description: "Update linked records",
                },
              },
              required: ["task_id"],
            },
          },
          {
            name: "delete_task",
            description: "Delete a task by ID",
            inputSchema: {
              type: "object",
              properties: {
                task_id: {
                  type: "string",
                  description: "The ID of the task to delete",
                },
              },
              required: ["task_id"],
            },
          },

          // Comments and Threads
          {
            name: "list_threads",
            description:
              "List comment threads, optionally filtered by record or entry",
            inputSchema: {
              type: "object",
              properties: {
                record_id: {
                  type: "string",
                  description: "Optional: filter threads by record ID",
                },
                entry_id: {
                  type: "string",
                  description: "Optional: filter threads by list entry ID",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of threads to return",
                },
              },
              required: [],
            },
          },
          {
            name: "get_thread",
            description: "Get all comments in a thread",
            inputSchema: {
              type: "object",
              properties: {
                thread_id: {
                  type: "string",
                  description: "The ID of the thread to retrieve",
                },
              },
              required: ["thread_id"],
            },
          },
          {
            name: "create_comment",
            description:
              "Create a new comment on a record, list entry, or existing thread",
            inputSchema: {
              type: "object",
              properties: {
                content: {
                  type: "string",
                  description: "The comment content",
                },
                record_id: {
                  type: "string",
                  description:
                    "Optional: ID of record to comment on (for new thread)",
                },
                entry_id: {
                  type: "string",
                  description:
                    "Optional: ID of list entry to comment on (for new thread)",
                },
                thread_id: {
                  type: "string",
                  description: "Optional: ID of existing thread to reply to",
                },
              },
              required: ["content"],
            },
          },
          {
            name: "get_comment",
            description: "Get a specific comment by ID",
            inputSchema: {
              type: "object",
              properties: {
                comment_id: {
                  type: "string",
                  description: "The ID of the comment to retrieve",
                },
              },
              required: ["comment_id"],
            },
          },
          {
            name: "delete_comment",
            description: "Delete a comment by ID",
            inputSchema: {
              type: "object",
              properties: {
                comment_id: {
                  type: "string",
                  description: "The ID of the comment to delete",
                },
              },
              required: ["comment_id"],
            },
          },
        ],
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          // Workspace Introspection
          case "introspect_workspace":
            return await this.handleIntrospectWorkspace(args);
          case "get_workspace_members":
            return await this.handleGetWorkspaceMembers(args);
          case "get_workspace_member":
            return await this.handleGetWorkspaceMember(args);

          // Object Management
          case "list_objects":
            return await this.handleListObjects(args);
          case "get_object":
            return await this.handleGetObject(args);
          case "get_object_attributes":
            return await this.handleGetObjectAttributes(args);

          // Record Operations
          case "search_records":
            return await this.handleSearchRecords(args);
          case "get_record":
            return await this.handleGetRecord(args);
          case "create_record":
            return await this.handleCreateRecord(args);
          case "update_record":
            return await this.handleUpdateRecord(args);
          case "upsert_record":
            return await this.handleUpsertRecord(args);
          case "delete_record":
            return await this.handleDeleteRecord(args);

          // List Operations
          case "list_lists":
            return await this.handleListLists(args);
          case "get_list":
            return await this.handleGetList(args);
          case "search_list_entries":
            return await this.handleSearchListEntries(args);
          case "add_to_list":
            return await this.handleAddToList(args);
          case "remove_from_list":
            return await this.handleRemoveFromList(args);
          case "update_list_entry":
            return await this.handleUpdateListEntry(args);

          // Notes Management
          case "list_notes":
            return await this.handleListNotes(args);
          case "get_note":
            return await this.handleGetNote(args);
          case "create_note":
            return await this.handleCreateNote(args);
          case "delete_note":
            return await this.handleDeleteNote(args);

          // Tasks Management
          case "list_tasks":
            return await this.handleListTasks(args);
          case "get_task":
            return await this.handleGetTask(args);
          case "create_task":
            return await this.handleCreateTask(args);
          case "update_task":
            return await this.handleUpdateTask(args);
          case "delete_task":
            return await this.handleDeleteTask(args);

          // Comments and Threads
          case "list_threads":
            return await this.handleListThreads(args);
          case "get_thread":
            return await this.handleGetThread(args);
          case "create_comment":
            return await this.handleCreateComment(args);
          case "get_comment":
            return await this.handleGetComment(args);
          case "delete_comment":
            return await this.handleDeleteComment(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`,
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${request.params.name}: ${error}`,
        );
      }
    });
  }

  // Workspace Introspection Methods
  private async handleIntrospectWorkspace(args: any): Promise<CallToolResult> {
    try {
      const [selfResponse, objectsResponse, listsResponse, membersResponse] =
        await Promise.all([
          getV2Self({ client }),
          getV2Objects({ client }),
          getV2Lists({ client }),
          getV2WorkspaceMembers({ client }),
        ]);

      const workspaceInfo = {
        workspace: selfResponse.data,
        objects: objectsResponse.data,
        lists: listsResponse.data,
        members: membersResponse.data,
        summary: {
          total_objects: objectsResponse.data?.data?.length || 0,
          total_lists: listsResponse.data?.data?.length || 0,
          total_members: membersResponse.data?.data?.length || 0,
        },
      };

      return {
        content: [
          {
            type: "text",
            text: `Workspace Structure:\n\n${JSON.stringify(workspaceInfo, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to introspect workspace: ${error}`,
      );
    }
  }

  private async handleGetWorkspaceMembers(args: any): Promise<CallToolResult> {
    try {
      const response = await getV2WorkspaceMembers({ client });
      return {
        content: [
          {
            type: "text",
            text: `Workspace Members:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get workspace members: ${error}`,
      );
    }
  }

  private async handleGetWorkspaceMember(args: any): Promise<CallToolResult> {
    try {
      const { workspace_member_id } = args;
      const response = await getV2WorkspaceMembersByWorkspaceMemberId({
        client,
        path: { workspace_member_id },
      });
      return {
        content: [
          {
            type: "text",
            text: `Workspace Member Details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get workspace member: ${error}`,
      );
    }
  }

  // Object Management Methods
  private async handleListObjects(args: any): Promise<CallToolResult> {
    try {
      const response = await getV2Objects({ client });
      return {
        content: [
          {
            type: "text",
            text: `Objects in workspace:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list objects: ${error}`,
      );
    }
  }

  private async handleGetObject(args: any): Promise<CallToolResult> {
    try {
      const { object } = args;
      const response = await getV2ObjectsByObject({
        client,
        path: { object },
      });
      return {
        content: [
          {
            type: "text",
            text: `Object details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get object: ${error}`,
      );
    }
  }

  private async handleGetObjectAttributes(args: any): Promise<CallToolResult> {
    try {
      const { object } = args;
      const response = await getV2ByTargetByIdentifierAttributes({
        client,
        path: { target: "objects", identifier: object },
      });
      return {
        content: [
          {
            type: "text",
            text: `Attributes for ${object}:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get object attributes: ${error}`,
      );
    }
  }

  // Record Operations Methods
  private async handleSearchRecords(args: any): Promise<CallToolResult> {
    const { object, query = {} } = args;

    try {
      const response = await postV2ObjectsByObjectRecordsQuery({
        client,
        path: { object },
        body: {
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Found ${response.data?.data?.length || 0} records:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search records: ${error}`,
      );
    }
  }

  private async handleGetRecord(args: any): Promise<CallToolResult> {
    try {
      const { object, record_id } = args;
      const response = await getV2ObjectsByObjectRecordsByRecordId({
        client,
        path: { object, record_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Record details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get record: ${error}`,
      );
    }
  }

  private async handleCreateRecord(args: any): Promise<CallToolResult> {
    const { object, data } = args;

    try {
      const response = await postV2ObjectsByObjectRecords({
        client,
        path: { object },
        body: data,
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully created new record:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create record: ${error}`,
      );
    }
  }

  private async handleUpdateRecord(args: any): Promise<CallToolResult> {
    const { object, record_id, data } = args;

    try {
      const response = await patchV2ObjectsByObjectRecordsByRecordId({
        client,
        path: { object, record_id },
        body: data,
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully updated record ${record_id}:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update record: ${error}`,
      );
    }
  }

  private async handleUpsertRecord(args: any): Promise<CallToolResult> {
    const { object, data } = args;

    try {
      const response = await putV2ObjectsByObjectRecords({
        client,
        path: { object },
        body: data,
        query: {
          matching_attribute: data.matching_attribute || "email",
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully upserted record:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to upsert record: ${error}`,
      );
    }
  }

  private async handleDeleteRecord(args: any): Promise<CallToolResult> {
    const { object, record_id } = args;

    try {
      const response = await deleteV2ObjectsByObjectRecordsByRecordId({
        client,
        path: { object, record_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted record ${record_id}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete record: ${error}`,
      );
    }
  }

  // List Operations Methods
  private async handleListLists(args: any): Promise<CallToolResult> {
    try {
      const response = await getV2Lists({ client });
      return {
        content: [
          {
            type: "text",
            text: `Lists in workspace:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list lists: ${error}`,
      );
    }
  }

  private async handleGetList(args: any): Promise<CallToolResult> {
    try {
      const { list } = args;
      const response = await getV2ListsByList({
        client,
        path: { list },
      });
      return {
        content: [
          {
            type: "text",
            text: `List details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get list: ${error}`,
      );
    }
  }

  private async handleSearchListEntries(args: any): Promise<CallToolResult> {
    try {
      const { list, query = {} } = args;
      const response = await postV2ListsByListEntriesQuery({
        client,
        path: { list },
        body: {
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Found ${response.data?.data?.length || 0} list entries:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search list entries: ${error}`,
      );
    }
  }

  private async handleAddToList(args: any): Promise<CallToolResult> {
    try {
      const { list, data } = args;
      const response = await postV2ListsByListEntries({
        client,
        path: { list },
        body: data,
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully added entry to list:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to add to list: ${error}`,
      );
    }
  }

  private async handleRemoveFromList(args: any): Promise<CallToolResult> {
    try {
      const { list, entry_id } = args;
      const response = await deleteV2ListsByListEntriesByEntryId({
        client,
        path: { list, entry_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully removed entry ${entry_id} from list ${list}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to remove from list: ${error}`,
      );
    }
  }

  private async handleUpdateListEntry(args: any): Promise<CallToolResult> {
    try {
      const { list, entry_id, data } = args;
      const response = await patchV2ListsByListEntriesByEntryId({
        client,
        path: { list, entry_id },
        body: data,
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully updated list entry:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update list entry: ${error}`,
      );
    }
  }

  // Notes Management Methods
  private async handleListNotes(args: any): Promise<CallToolResult> {
    try {
      const response = await getV2Notes({
        client,
        query: args,
      });

      return {
        content: [
          {
            type: "text",
            text: `Notes:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list notes: ${error}`,
      );
    }
  }

  private async handleGetNote(args: any): Promise<CallToolResult> {
    try {
      const { note_id } = args;
      const response = await getV2NotesByNoteId({
        client,
        path: { note_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Note details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get note: ${error}`,
      );
    }
  }

  private async handleCreateNote(args: any): Promise<CallToolResult> {
    try {
      const { record_id, content, title, parent_object = "people" } = args;
      const response = await postV2Notes({
        client,
        body: {
          data: {
            parent_object,
            parent_record_id: record_id,
            title: title || "Note",
            format: "plaintext",
            content,
          },
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully created note:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create note: ${error}`,
      );
    }
  }

  private async handleDeleteNote(args: any): Promise<CallToolResult> {
    try {
      const { note_id } = args;
      const response = await deleteV2NotesByNoteId({
        client,
        path: { note_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted note ${note_id}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete note: ${error}`,
      );
    }
  }

  // Tasks Management Methods
  private async handleListTasks(args: any): Promise<CallToolResult> {
    try {
      const response = await getV2Tasks({
        client,
        query: args,
      });

      return {
        content: [
          {
            type: "text",
            text: `Tasks:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list tasks: ${error}`,
      );
    }
  }

  private async handleGetTask(args: any): Promise<CallToolResult> {
    try {
      const { task_id } = args;
      const response = await getV2TasksByTaskId({
        client,
        path: { task_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Task details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get task: ${error}`,
      );
    }
  }

  private async handleCreateTask(args: any): Promise<CallToolResult> {
    try {
      const { content, assignee_id, deadline_at, linked_records = [] } = args;

      // Build assignees array with correct structure
      const assignees = assignee_id
        ? [
            {
              referenced_actor_type: "workspace-member" as const,
              referenced_actor_id: assignee_id,
            },
          ]
        : [];

      const response = await postV2Tasks({
        client,
        body: {
          data: {
            format: "plaintext",
            content,
            deadline_at: deadline_at || null,
            is_completed: false,
            linked_records: linked_records.map((recordId: string) => ({
              target_object: "people", // Default to people, could be made configurable
              target_record_id: recordId,
            })),
            assignees,
          },
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully created task:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create task: ${error}`,
      );
    }
  }

  private async handleUpdateTask(args: any): Promise<CallToolResult> {
    try {
      const { task_id, ...updateData } = args;
      const response = await patchV2TasksByTaskId({
        client,
        path: { task_id },
        body: updateData,
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully updated task:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update task: ${error}`,
      );
    }
  }

  private async handleDeleteTask(args: any): Promise<CallToolResult> {
    try {
      const { task_id } = args;
      const response = await deleteV2TasksByTaskId({
        client,
        path: { task_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted task ${task_id}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete task: ${error}`,
      );
    }
  }

  // Comments and Threads Methods
  private async handleListThreads(args: any): Promise<CallToolResult> {
    try {
      const response = await getV2Threads({
        client,
        query: args,
      });

      return {
        content: [
          {
            type: "text",
            text: `Threads:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list threads: ${error}`,
      );
    }
  }

  private async handleGetThread(args: any): Promise<CallToolResult> {
    try {
      const { thread_id } = args;
      const response = await getV2ThreadsByThreadId({
        client,
        path: { thread_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Thread details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get thread: ${error}`,
      );
    }
  }

  private async handleCreateComment(args: any): Promise<CallToolResult> {
    try {
      const { content, record_id, entry_id, thread_id } = args;

      // Build the comment data structure based on what we're commenting on
      let commentData: any = {
        format: "plaintext",
        content,
        author: {
          type: "workspace-member",
          id: "current", // This might need to be the actual user ID
        },
      };

      if (thread_id) {
        commentData.thread_id = thread_id;
      } else if (record_id) {
        commentData.record = {
          target_object: "people", // Default to people, could be made configurable
          target_record_id: record_id,
        };
      } else if (entry_id) {
        commentData.entry = {
          target_list: "default", // This would need to be specified
          target_entry_id: entry_id,
        };
      }

      const response = await postV2Comments({
        client,
        body: {
          data: commentData,
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully created comment:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create comment: ${error}`,
      );
    }
  }

  private async handleGetComment(args: any): Promise<CallToolResult> {
    try {
      const { comment_id } = args;
      const response = await getV2CommentsByCommentId({
        client,
        path: { comment_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Comment details:\n\n${JSON.stringify(response.data, null, 2)}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get comment: ${error}`,
      );
    }
  }

  private async handleDeleteComment(args: any): Promise<CallToolResult> {
    try {
      const { comment_id } = args;
      const response = await deleteV2CommentsByCommentId({
        client,
        path: { comment_id },
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted comment ${comment_id}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete comment: ${error}`,
      );
    }
  }

  private setupEndpoints(): void {
    // Modern Streamable HTTP endpoint
    this.app.post("/mcp", async (req, res) => {
      try {
        const server = this.createServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // Stateless mode
        });

        res.on("close", () => {
          transport.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: null,
          });
        }
      }
    });

    // Legacy SSE endpoint for older clients
    this.app.get("/sse", async (req, res) => {
      try {
        const server = this.createServer();
        const transport = new SSEServerTransport("/messages", res);
        const sessionId = transport.sessionId || randomUUID();

        // Store the transport by session ID
        this.transports.sse[sessionId] = transport;

        res.on("close", () => {
          console.log(`SSE connection closed for session: ${sessionId}`);
          delete this.transports.sse[sessionId];
        });

        await server.connect(transport);
        console.log(`SSE connection established for session: ${sessionId}`);
      } catch (error) {
        console.error("Error handling SSE connection:", error);
        if (!res.headersSent) {
          res.status(500).send("Internal server error");
        }
      }
    });

    // Legacy message endpoint for older clients
    this.app.post("/messages", async (req, res) => {
      try {
        const sessionId = req.query.sessionId as string;
        if (!sessionId) {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32602,
              message: "Missing sessionId parameter",
            },
            id: null,
          });
          return;
        }

        const transport = this.transports.sse[sessionId];
        if (!transport) {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32602,
              message: "No transport found for sessionId",
            },
            id: null,
          });
          return;
        }

        await transport.handlePostMessage(req, res, req.body);
      } catch (error) {
        console.error("Error handling message request:", error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: null,
          });
        }
      }
    });

    // Health check endpoint
    this.app.get("/health", (_req, res) => {
      res.json({
        status: "ok",
        message: "Enhanced Attio MCP Server is running",
        endpoints: {
          mcp: "/mcp (Streamable HTTP)",
          sse: "/sse (Legacy SSE)",
          messages: "/messages (Legacy Messages)",
          health: "/health",
        },
      });
    });
  }

  async run(): Promise<void> {
    this.setupEndpoints();

    const PORT = process.env["PORT"] || 3000;
    this.app.listen(PORT, () => {
      console.log(
        `🚀 Enhanced Attio MCP Server running on http://localhost:${PORT}`,
      );
      console.log(`📡 Modern MCP endpoint: http://localhost:${PORT}/mcp`);
      console.log(`🔗 Legacy SSE endpoint: http://localhost:${PORT}/sse`);
      console.log(
        `📨 Legacy Messages endpoint: http://localhost:${PORT}/messages`,
      );
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });
  }
}

const server = new AttioMCPServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
