import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";
import { GLOBAL_SEARCH_LIMIT, validatePagination } from "../utils/paginate";

export const listNotesSchema = {
  record_id: z
    .string()
    .optional()
    .describe("Optional: filter notes by record ID"),
  limit: z
    .number()
    .min(1)
    .max(GLOBAL_SEARCH_LIMIT)
    .describe(
      `Maximum number of notes to return (required, max: ${GLOBAL_SEARCH_LIMIT})`,
    ),
  offset: z
    .number()
    .min(0)
    .optional()
    .describe("Number of notes to skip for pagination"),
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

export async function listNotes(
  args: { record_id?: string; limit: number; offset?: number },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const pagination = validatePagination({
      limit: args.limit,
      offset: args.offset,
    });

    const queryParams = new URLSearchParams();
    if (args.record_id) queryParams.append("record_id", args.record_id);
    queryParams.append("limit", pagination.limit.toString());
    queryParams.append("offset", pagination.offset.toString());

    const response = await makeAttioRequest(
      `/v2/notes?${queryParams}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Notes:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing notes");
  }
}

export async function getNote(
  args: { note_id: string },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/notes/${args.note_id}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Note details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting note");
  }
}

export async function createNote(
  args: {
    record_id: string;
    content: string;
    title?: string;
    parent_object?: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const { record_id, content, title, parent_object = "people" } = args;
    const response = await makeAttioRequest(
      "/v2/notes",
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            parent_object,
            parent_record_id: record_id,
            title: title || "Note",
            format: "plaintext",
            content,
          },
        }),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created note:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating note");
  }
}

export async function deleteNote(
  args: {
    note_id: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    await makeAttioRequest(
      `/v2/notes/${args.note_id}`,
      {
        method: "DELETE",
      },
      context?.authToken,
    );

    return createMcpResponse(null, `Successfully deleted note ${args.note_id}`);
  } catch (error) {
    return createErrorResponse(error, "deleting note");
  }
}

// ===============================
// NOTES TOOL DEFINITIONS
// ===============================

export const notesToolDefinitions = {
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
};

// ===============================
// NOTES ACTIONS MAPPING
// ===============================

export const notesActions = {
  list_notes: listNotes,
  get_note: getNote,
  create_note: createNote,
  delete_note: deleteNote,
};
