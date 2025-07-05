# Attio MCP Server

A Model Context Protocol server for Attio CRM integration built with Next.js. This server provides comprehensive access to Attio's CRM functionality through conversational AI interfaces.

## Quick Start

Add this to your MCP client configuration to start using the hosted server:

```json
{
  "mcpServers": {
    "attio-remote": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--oauth2Bearer",
        "YOUR_API_KEY",
        "--streamableHttp",
        "https://community-mcp-attio.vercel.app/mcp"
      ]
    }
  }
}
```

**Note**: Replace `YOUR_API_KEY` with an API key from the maintainers. See [Getting API Access](#getting-api-access) below.

## Features

- **Workspace Management**: Complete workspace introspection and member management
- **Record Operations**: Full CRUD operations for people, companies, deals, and custom objects
- **List Management**: Create, update, and manage lists with entry operations
- **Content Management**: Notes, tasks, and comment thread management
- **Schema Management**: Attribute creation, modification, and option management
- **Real-time Integration**: Webhook management for real-time updates

## Available Tools

### Workspace & Authentication

- `test_connection` - Test server connectivity
- `introspect_workspace` - Get comprehensive workspace information
- `get_workspace_members` - List all workspace members
- `get_workspace_member` - Get specific member details
- `get_self` - Get current user information

### Object Management

- `list_objects` - List all objects in workspace
- `get_object` - Get specific object details
- `create_object` - Create custom objects
- `update_object` - Update object configuration
- `get_object_attributes` - List object attributes

### Record Operations

- `search_records` - Search records with filters
- `get_record` - Get specific record
- `create_record` - Create new records
- `update_record` - Update existing records
- `put_update_record` - Overwrite record data
- `upsert_record` - Create or update based on criteria
- `delete_record` - Delete records
- `get_record_attribute_values` - Get attribute values
- `get_record_entries` - List record entries

### People Management

- `search_people` - Search people with filters
- `get_person` - Get person details
- `create_person` - Create new person
- `update_person` - Update person information
- `delete_person` - Delete person

### Company Management

- `search_companies` - Search companies
- `get_company` - Get company details
- `create_company` - Create new company
- `update_company` - Update company information
- `delete_company` - Delete company

### Deal Management

- `search_deals` - Search deals with filters
- `get_deal` - Get deal details
- `create_deal` - Create new deal
- `update_deal` - Update deal information
- `assert_deal` - Create or update deal
- `delete_deal` - Delete deal
- `get_deal_attribute_values` - Get deal attribute values
- `get_deal_entries` - List deal entries

### List Operations

- `list_lists` - Get all lists
- `create_list` - Create new list
- `get_list` - Get list details
- `update_list` - Update list configuration
- `search_list_entries` - Search list entries
- `add_to_list` - Add record to list
- `upsert_list_entry` - Create or update list entry
- `remove_from_list` - Remove entry from list
- `get_list_entry` - Get specific list entry
- `update_list_entry` - Update list entry
- `put_update_list_entry` - Overwrite list entry
- `get_list_entry_attribute_values` - Get entry attribute values

### Attribute Management

- `list_attributes` - List object/list attributes
- `create_attribute` - Create new attribute
- `get_attribute` - Get attribute details
- `update_attribute` - Update attribute configuration
- `list_select_options` - List select attribute options
- `create_select_option` - Create select option
- `update_select_option` - Update select option
- `list_statuses` - List status attribute options
- `create_status` - Create status option
- `update_status` - Update status option

### Content Management

- `list_notes` - List notes
- `get_note` - Get note details
- `create_note` - Create new note
- `delete_note` - Delete note
- `list_tasks` - List tasks
- `get_task` - Get task details
- `create_task` - Create new task
- `update_task` - Update task
- `delete_task` - Delete task
- `list_threads` - List comment threads
- `get_thread` - Get thread details
- `create_comment` - Create comment
- `get_comment` - Get comment details
- `delete_comment` - Delete comment

### System Management

- `search_users` - Search system users
- `get_user` - Get user details
- `create_user` - Create new user
- `update_user` - Update user information
- `delete_user` - Delete user
- `search_workspaces` - Search workspaces
- `get_workspace` - Get workspace details
- `create_workspace` - Create workspace
- `update_workspace` - Update workspace
- `delete_workspace` - Delete workspace
- `get_meeting` - Get meeting details
- `list_webhooks` - List webhooks
- `create_webhook` - Create webhook
- `get_webhook` - Get webhook details
- `update_webhook` - Update webhook
- `delete_webhook` - Delete webhook

## Getting API Access

To request access to the hosted MCP server:

1. Contact the maintainers through GitHub issues
2. Provide your use case and requirements
3. You'll receive an API key for authentication

## Setup

### Cloud Deployment

The server is deployed at `https://community-mcp-attio.vercel.app` and ready for immediate use.

**MCP Configuration**:

```json
{
  "mcpServers": {
    "attio-remote": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--oauth2Bearer",
        "YOUR_API_KEY",
        "--streamableHttp",
        "https://community-mcp-attio.vercel.app/mcp"
      ]
    }
  }
}
```

### Local Development

1. **Clone and Install**:

   ```bash
   git clone https://github.com/hypermodeinc/community-mcp.git
   cd community-mcp/servers/attio
   pnpm install
   ```

2. **Environment Setup**:

   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local`:

   ```env
   ATTIO_API_KEY=your_attio_api_key
   ATTIO_API_BASE_URL=https://api.attio.com
   AUTH_KEY=your_auth_secret
   ```

3. **Start Development Server**:

   ```bash
   pnpm dev
   ```

4. **MCP Configuration for Local**:
   ```json
   {
     "mcpServers": {
       "attio-local": {
         "command": "npx",
         "args": [
           "-y",
           "supergateway",
           "--oauth2Bearer",
           "your_auth_secret",
           "--streamableHttp",
           "http://localhost:3000/mcp"
         ]
       }
     }
   }
   ```

## Example Conversations

### Basic CRM Operations

**User**: "Show me all people in my Attio workspace"

**Assistant**: I'll search for all people in your Attio workspace.

```text
Using search_people with default parameters to get all people...

Found 25 people in your workspace. Here are the results:
- John Smith (john@company.com) - Software Engineer at TechCorp
- Sarah Johnson (sarah@startup.io) - CEO at StartupCo
- Mike Wilson (mike@agency.com) - Marketing Director at Creative Agency
...
```

**User**: "Create a new deal for TechCorp worth $50,000"

**Assistant**: I'll create a new deal for TechCorp with a value of $50,000.

```text
Using create_deal to add the new opportunity...

Successfully created deal "TechCorp Opportunity":
- Name: TechCorp Opportunity
- Value: $50,000
- Stage: Prospecting
- Company: TechCorp
- Deal ID: deal_abc123
```

### Advanced Data Management

**User**: "Find all deals in the 'Negotiation' stage and add them to a 'Priority Deals' list"

**Assistant**: I'll search for deals in the negotiation stage and add them to a priority list.

```text
First, searching for deals in 'Negotiation' stage...
Found 8 deals in negotiation stage.

Creating 'Priority Deals' list...
List created successfully.

Adding deals to the priority list:
- Added "Enterprise Software Deal" ($75,000)
- Added "Marketing Services Contract" ($25,000)
- Added "Consulting Agreement" ($40,000)
...

All 8 negotiation-stage deals have been added to the Priority Deals list.
```

### Workflow Automation

**User**: "Create a task to follow up with all companies that don't have any deals, and assign it to sarah"

**Assistant**: I'll identify companies without deals and create a follow-up task.

```text
Searching all companies...
Found 45 companies total.

Searching all deals to identify companies with existing opportunities...
Found 23 companies with active deals.

Identified 22 companies without any deals:
- InnovateTech Solutions
- Digital Marketing Pro
- CloudFirst Systems
...

Creating follow-up task assigned to sarah@company.com...

Task created successfully:
- Title: "Follow up with companies without deals"
- Description: "Reach out to 22 companies that currently have no active deals"
- Assignee: sarah@company.com
- Linked to all 22 company records
- Task ID: task_xyz789
```

## Authentication

The server supports multiple authentication methods:

- **Bearer Token**: `Authorization: Bearer YOUR_API_KEY`
- **API Key Header**: `X-API-Key: YOUR_API_KEY`
- **Query Parameter**: `?auth_key=YOUR_API_KEY`

## API Requirements

You'll need an Attio API key to use this server. Get one from your Attio workspace settings under "API & Webhooks".

## Support

For issues specific to the Attio MCP server:

1. Check the Attio API documentation
2. Verify your API key has the necessary permissions
3. Review the server logs for detailed error messages
4. Submit issues via GitHub with relevant error details

## License

MIT License - see the main repository LICENSE file for details.
