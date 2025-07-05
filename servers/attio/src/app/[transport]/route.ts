import { createMcpHandler } from "@vercel/mcp-adapter";
import { toolDefinitions } from "../../lib/tools";
import { actions } from "../../lib/actions";

const handler = createMcpHandler(
  async (server) => {
    const registerTool = (
      name: string,
      action: (args: any) => Promise<any>,
    ) => {
      const toolDef = toolDefinitions[name as keyof typeof toolDefinitions];
      if (!toolDef) {
        throw new Error(`Tool definition not found for: ${name}`);
      }

      const schema = toolDef.schema || null;

      if (Object.keys(toolDef.schema || {}).length === 0) {
        server.tool(name, toolDef.description, async (args) => {
          try {
            // Ensure args is always an object, even if empty
            const safeArgs = args === undefined ? {} : args;
            return await action(safeArgs);
          } catch (error) {
            console.error(`Error in ${name}:`, error);
            return {
              content: [
                {
                  type: "text",
                  text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
              ],
            };
          }
        });
      } else {
        // @ts-ignore
        server.tool(name, toolDef.description, schema, async (args) => {
          try {
            // Ensure args is always an object, even if empty
            const safeArgs = args === undefined ? {} : args;
            return await action(safeArgs);
          } catch (error) {
            console.error(`Error in ${name}:`, error);
            return {
              content: [
                {
                  type: "text",
                  text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
              ],
            };
          }
        });
      }
    };

    // Register test tools (these have special inline handlers)
    server.tool(
      "test_connection",
      toolDefinitions.test_connection.description,
      toolDefinitions.test_connection.schema,
      async ({ message }) => ({
        content: [
          {
            type: "text",
            text: `Attio MCP Server is working! ${message ? `Message: ${message}` : ""}`,
          },
        ],
      }),
    );

    // Register all other tools using the helper function
    registerTool("introspect_workspace", actions.introspect_workspace);
    registerTool("get_workspace_members", actions.get_workspace_members);
    registerTool("get_workspace_member", actions.get_workspace_member);
    registerTool("list_objects", actions.list_objects);
    registerTool("get_object", actions.get_object);
    registerTool("get_object_attributes", actions.get_object_attributes);
    registerTool("search_records", actions.search_records);
    registerTool("get_record", actions.get_record);
    registerTool("create_record", actions.create_record);
    registerTool("update_record", actions.update_record);
    registerTool("upsert_record", actions.upsert_record);
    registerTool("delete_record", actions.delete_record);
    registerTool("list_lists", actions.list_lists);
    registerTool("get_list", actions.get_list);
    registerTool("search_list_entries", actions.search_list_entries);
    registerTool("add_to_list", actions.add_to_list);
    registerTool("remove_from_list", actions.remove_from_list);
    registerTool("update_list_entry", actions.update_list_entry);
    registerTool("list_notes", actions.list_notes);
    registerTool("get_note", actions.get_note);
    registerTool("create_note", actions.create_note);
    registerTool("delete_note", actions.delete_note);
    registerTool("list_tasks", actions.list_tasks);
    registerTool("get_task", actions.get_task);
    registerTool("create_task", actions.create_task);
    registerTool("update_task", actions.update_task);
    registerTool("delete_task", actions.delete_task);
    registerTool("list_threads", actions.list_threads);
    registerTool("get_thread", actions.get_thread);
    registerTool("create_comment", actions.create_comment);
    registerTool("get_comment", actions.get_comment);
    registerTool("delete_comment", actions.delete_comment);

    console.log("Successfully registered all Attio MCP tools:");
    console.log("- Workspace Introspection: 3 tools");
    console.log("- Object Management: 3 tools");
    console.log("- Record Operations: 6 tools");
    console.log("- List Operations: 6 tools");
    console.log("- Notes Management: 4 tools");
    console.log("- Tasks Management: 5 tools");
    console.log("- Comments and Threads: 5 tools");
    console.log("- Test Connection: 2 tools");
    console.log("Total: 34 tools registered");
  },
  {
    capabilities: {
      tools: Object.fromEntries(
        Object.entries(toolDefinitions).map(([name, def]) => [
          name,
          { description: def.description },
        ]),
      ),
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true, // Disable SSE for now
  },
);

export { handler as GET, handler as POST, handler as DELETE };
