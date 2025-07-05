async function makeAttioRequest(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env["ATTIO_API_BASE_URL"] || "https://api.attio.com";
  const apiKey = process.env["ATTIO_API_KEY"];

  if (!apiKey) {
    return {
      content: [
        {
          type: "text",
          text: "Error: ATTIO_API_KEY environment variable is required. Please set it in your .env.local file.",
        },
      ],
    };
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Attio API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Workspace Introspection Actions
export async function introspectWorkspace() {
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

    return {
      content: [
        {
          type: "text",
          text: `Workspace Structure:\n\n${JSON.stringify(workspaceInfo, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error introspecting workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getWorkspaceMembers(args: any) {
  try {
    const response = await makeAttioRequest("/v2/workspace_members");
    return {
      content: [
        {
          type: "text",
          text: `Workspace Members:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting workspace members: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getWorkspaceMember(args: any) {
  const { workspace_member_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/workspace_members/${workspace_member_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Workspace Member Details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting workspace member: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Object Management Actions
export async function listObjects(args: any) {
  try {
    const response = await makeAttioRequest("/v2/objects");
    return {
      content: [
        {
          type: "text",
          text: `Objects in workspace:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing objects: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getObject(args: any) {
  const { object } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}`);
    return {
      content: [
        {
          type: "text",
          text: `Object details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting object: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getObjectAttributes(args: any) {
  const { object } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}/attributes`);
    return {
      content: [
        {
          type: "text",
          text: `Attributes for ${object}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting object attributes: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Record Operations Actions
export async function searchRecords(args: any) {
  const { object, query = {} } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        }),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} records:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching records: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getRecord(args: any) {
  const { object, record_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/${record_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Record details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createRecord(args: any) {
  const { object, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created new record:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateRecord(args: any) {
  const { object, record_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/${record_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated record ${record_id}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function upsertRecord(args: any) {
  const { object, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}/records`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully upserted record:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error upserting record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteRecord(args: any) {
  const { object, record_id } = args;
  try {
    await makeAttioRequest(`/v2/objects/${object}/records/${record_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted record ${record_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// List Operations Actions
export async function listLists(args: any) {
  try {
    const response = await makeAttioRequest("/v2/lists");
    return {
      content: [
        {
          type: "text",
          text: `Lists in workspace:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing lists: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getList(args: any) {
  const { list } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}`);
    return {
      content: [
        {
          type: "text",
          text: `List details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function searchListEntries(args: any) {
  const { list, query = {} } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}/entries/query`, {
      method: "POST",
      body: JSON.stringify({
        limit: query.limit || 25,
        offset: query.offset || 0,
        sorts: query.sorts || [],
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} list entries:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching list entries: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function addToList(args: any) {
  const { list, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}/entries`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully added entry to list:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error adding to list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function removeFromList(args: any) {
  const { list, entry_id } = args;
  try {
    await makeAttioRequest(`/v2/lists/${list}/entries/${entry_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully removed entry ${entry_id} from list ${list}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error removing from list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateListEntry(args: any) {
  const { list, entry_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${list}/entries/${entry_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated list entry:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating list entry: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Notes Management Actions
export async function listNotes(args: any) {
  try {
    const queryParams = new URLSearchParams();
    if (args.record_id) queryParams.append("record_id", args.record_id);
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/notes?${queryParams}`);
    return {
      content: [
        {
          type: "text",
          text: `Notes:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing notes: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getNote(args: any) {
  const { note_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/notes/${note_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Note details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting note: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createNote(args: any) {
  const { record_id, content, title, parent_object = "people" } = args;
  try {
    const response = await makeAttioRequest("/v2/notes", {
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
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created note:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating note: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteNote(args: any) {
  const { note_id } = args;
  try {
    await makeAttioRequest(`/v2/notes/${note_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted note ${note_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting note: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Tasks Management Actions
export async function listTasks(args: any) {
  try {
    const queryParams = new URLSearchParams();
    if (args.assignee_id) queryParams.append("assignee_id", args.assignee_id);
    if (args.is_completed !== undefined)
      queryParams.append("is_completed", args.is_completed.toString());
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/tasks?${queryParams}`);
    return {
      content: [
        {
          type: "text",
          text: `Tasks:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing tasks: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getTask(args: any) {
  const { task_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/tasks/${task_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Task details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createTask(args: any) {
  const { content, assignee_id, deadline_at, linked_records = [] } = args;
  try {
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
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created task:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateTask(args: any) {
  const { task_id, ...updateData } = args;
  try {
    const response = await makeAttioRequest(`/v2/tasks/${task_id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated task:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteTask(args: any) {
  const { task_id } = args;
  try {
    await makeAttioRequest(`/v2/tasks/${task_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted task ${task_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Comments and Threads Actions
export async function listThreads(args: any) {
  try {
    const queryParams = new URLSearchParams();
    if (args.record_id) queryParams.append("record_id", args.record_id);
    if (args.entry_id) queryParams.append("entry_id", args.entry_id);
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/threads?${queryParams}`);
    return {
      content: [
        {
          type: "text",
          text: `Threads:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing threads: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getThread(args: any) {
  const { thread_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/threads/${thread_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Thread details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting thread: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createComment(args: any) {
  const { content, record_id, entry_id, thread_id } = args;
  try {
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
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created comment:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getComment(args: any) {
  const { comment_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/comments/${comment_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Comment details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteComment(args: any) {
  const { comment_id } = args;
  try {
    await makeAttioRequest(`/v2/comments/${comment_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted comment ${comment_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Export action mapping
export const actions = {
  // Workspace Introspection
  introspect_workspace: introspectWorkspace,
  get_workspace_members: getWorkspaceMembers,
  get_workspace_member: getWorkspaceMember,

  // Object Management
  list_objects: listObjects,
  get_object: getObject,
  get_object_attributes: getObjectAttributes,

  // Record Operations
  search_records: searchRecords,
  get_record: getRecord,
  create_record: createRecord,
  update_record: updateRecord,
  upsert_record: upsertRecord,
  delete_record: deleteRecord,

  // List Operations
  list_lists: listLists,
  get_list: getList,
  search_list_entries: searchListEntries,
  add_to_list: addToList,
  remove_from_list: removeFromList,
  update_list_entry: updateListEntry,

  // Notes Management
  list_notes: listNotes,
  get_note: getNote,
  create_note: createNote,
  delete_note: deleteNote,

  // Tasks Management
  list_tasks: listTasks,
  get_task: getTask,
  create_task: createTask,
  update_task: updateTask,
  delete_task: deleteTask,

  // Comments and Threads
  list_threads: listThreads,
  get_thread: getThread,
  create_comment: createComment,
  get_comment: getComment,
  delete_comment: deleteComment,
};
