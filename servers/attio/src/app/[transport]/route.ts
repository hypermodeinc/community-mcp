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

    // Workspace Introspection
    registerTool("introspect_workspace", actions.introspect_workspace);
    registerTool("get_workspace_members", actions.get_workspace_members);
    registerTool("get_workspace_member", actions.get_workspace_member);

    // Object Management
    registerTool("list_objects", actions.list_objects);
    registerTool("get_object", actions.get_object);
    registerTool("create_object", actions.create_object);
    registerTool("update_object", actions.update_object);
    registerTool("get_object_attributes", actions.get_object_attributes);

    // Attribute Management
    registerTool("list_attributes", actions.list_attributes);
    registerTool("create_attribute", actions.create_attribute);
    registerTool("get_attribute", actions.get_attribute);
    registerTool("update_attribute", actions.update_attribute);

    // Select Options Management
    registerTool("list_select_options", actions.list_select_options);
    registerTool("create_select_option", actions.create_select_option);
    registerTool("update_select_option", actions.update_select_option);

    // Status Management
    registerTool("list_statuses", actions.list_statuses);
    registerTool("create_status", actions.create_status);
    registerTool("update_status", actions.update_status);

    // Generic Record Operations
    registerTool("search_records", actions.search_records);
    registerTool("get_record", actions.get_record);
    registerTool("create_record", actions.create_record);
    registerTool("update_record", actions.update_record);
    registerTool("put_update_record", actions.put_update_record);
    registerTool("upsert_record", actions.upsert_record);
    registerTool("delete_record", actions.delete_record);
    registerTool(
      "get_record_attribute_values",
      actions.get_record_attribute_values,
    );
    registerTool("get_record_entries", actions.get_record_entries);

    // =============================================================================
    // PEOPLE-SPECIFIC TOOLS
    // =============================================================================
    registerTool("search_people", actions.search_people);
    registerTool("get_person", actions.get_person);
    registerTool("create_person", actions.create_person);
    registerTool("update_person", actions.update_person);
    registerTool("delete_person", actions.delete_person);

    // =============================================================================
    // COMPANIES-SPECIFIC TOOLS
    // =============================================================================
    registerTool("search_companies", actions.search_companies);
    registerTool("get_company", actions.get_company);
    registerTool("create_company", actions.create_company);
    registerTool("update_company", actions.update_company);
    registerTool("delete_company", actions.delete_company);

    // =============================================================================
    // DEALS-SPECIFIC TOOLS
    // =============================================================================
    registerTool("search_deals", actions.search_deals);
    registerTool("get_deal", actions.get_deal);
    registerTool("create_deal", actions.create_deal);
    registerTool("update_deal", actions.update_deal);
    registerTool("delete_deal", actions.delete_deal);

    // =============================================================================
    // USERS-SPECIFIC TOOLS
    // =============================================================================
    registerTool("search_users", actions.search_users);
    registerTool("get_user", actions.get_user);
    registerTool("create_user", actions.create_user);
    registerTool("update_user", actions.update_user);
    registerTool("delete_user", actions.delete_user);

    // =============================================================================
    // WORKSPACES-SPECIFIC TOOLS
    // =============================================================================
    registerTool("search_workspaces", actions.search_workspaces);
    registerTool("get_workspace", actions.get_workspace);
    registerTool("create_workspace", actions.create_workspace);
    registerTool("update_workspace", actions.update_workspace);
    registerTool("delete_workspace", actions.delete_workspace);

    // List Operations
    registerTool("list_lists", actions.list_lists);
    registerTool("create_list", actions.create_list);
    registerTool("get_list", actions.get_list);
    registerTool("update_list", actions.update_list);
    registerTool("search_list_entries", actions.search_list_entries);
    registerTool("add_to_list", actions.add_to_list);
    registerTool("upsert_list_entry", actions.upsert_list_entry);
    registerTool("remove_from_list", actions.remove_from_list);
    registerTool("get_list_entry", actions.get_list_entry);
    registerTool("update_list_entry", actions.update_list_entry);
    registerTool("put_update_list_entry", actions.put_update_list_entry);
    registerTool(
      "get_list_entry_attribute_values",
      actions.get_list_entry_attribute_values,
    );

    // Notes Management
    registerTool("list_notes", actions.list_notes);
    registerTool("get_note", actions.get_note);
    registerTool("create_note", actions.create_note);
    registerTool("delete_note", actions.delete_note);

    // Tasks Management
    registerTool("list_tasks", actions.list_tasks);
    registerTool("get_task", actions.get_task);
    registerTool("create_task", actions.create_task);
    registerTool("update_task", actions.update_task);
    registerTool("delete_task", actions.delete_task);

    // Comments and Threads
    registerTool("list_threads", actions.list_threads);
    registerTool("get_thread", actions.get_thread);
    registerTool("create_comment", actions.create_comment);
    registerTool("get_comment", actions.get_comment);
    registerTool("delete_comment", actions.delete_comment);

    // Meetings
    registerTool("get_meeting", actions.get_meeting);

    // Webhooks
    registerTool("list_webhooks", actions.list_webhooks);
    registerTool("create_webhook", actions.create_webhook);
    registerTool("get_webhook", actions.get_webhook);
    registerTool("update_webhook", actions.update_webhook);
    registerTool("delete_webhook", actions.delete_webhook);

    // Self/Identity
    registerTool("get_self", actions.get_self);

    console.log("Successfully registered all Attio MCP tools:");
    console.log("- Test Connection: 1 tool");
    console.log("- Workspace Introspection: 3 tools");
    console.log("- Object Management: 5 tools");
    console.log("- Attribute Management: 4 tools");
    console.log("- Select Options Management: 3 tools");
    console.log("- Status Management: 3 tools");
    console.log("- Generic Record Operations: 9 tools");
    console.log("- People-specific Tools: 5 tools");
    console.log("- Companies-specific Tools: 5 tools");
    console.log("- Deals-specific Tools: 5 tools");
    console.log("- Users-specific Tools: 5 tools");
    console.log("- Workspaces-specific Tools: 5 tools");
    console.log("- List Operations: 12 tools");
    console.log("- Notes Management: 4 tools");
    console.log("- Tasks Management: 5 tools");
    console.log("- Comments and Threads: 5 tools");
    console.log("- Meetings: 1 tool");
    console.log("- Webhooks: 5 tools");
    console.log("- Self/Identity: 1 tool");
    console.log("Total: 86 tools registered");
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
