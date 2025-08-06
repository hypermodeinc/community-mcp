# GraphQL MCP Server

A Model Context Protocol server for GraphQL API integration. This server provides tools to introspect, query, and mutate any GraphQL endpoint through conversational AI interfaces.

## Quick Start

Add this to your MCP client configuration to start using the hosted server:

```json
{
  "mcpServers": {
    "graphql-remote": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--oauth2Bearer",
        "YOUR_AUTH_KEY",
        "--streamableHttp",
        "http://localhost:3000/mcp"
      ]
    }
  }
}
```

**Note**: Replace `YOUR_AUTH_KEY` with an auth key from the maintainers. See [Getting API Access](#getting-api-access) below.

## Endpoints

- **MCP Endpoint**: `/mcp` - Main MCP protocol endpoint
- **Tools Introspection**: `/tools` - GET endpoint to discover available tools and their schemas

## New Header-Based Approach

The GraphQL endpoint URL is now passed via headers instead of as a parameter in each tool call:

### Required Headers

- `X-GraphQL-URL`: The GraphQL endpoint URL (required for all operations)
- `Authorization`: Bearer token for GraphQL endpoint authentication (optional)

### Example Usage

```bash
# Introspect tools
curl -X GET http://localhost:3000/tools

# Example MCP request with headers
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "X-GraphQL-URL: https://api.github.com/graphql" \
  -H "Authorization: Bearer your_github_token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "graphql_introspect",
      "arguments": {
        "include_descriptions": true,
        "sort_schema": true
      }
    }
  }'
```

## Features

- **Schema Introspection**: Discover available types, queries, and mutations from any GraphQL endpoint
- **Query Execution**: Execute GraphQL queries with automatic validation and error handling
- **Mutation Execution**: Perform GraphQL mutations with validation and safety checks
- **Authentication Support**: Flexible header-based authentication for protected endpoints
- **Validation**: Built-in query and mutation validation using graphql-js
- **Error Handling**: Comprehensive error reporting for debugging
- **Tools Discovery**: `/tools` endpoint for runtime tool introspection

## Available Tools

### GraphQL Operations

- `graphql_introspect` - Perform schema introspection to discover available operations and types
- `graphql_query` - Execute GraphQL queries with optional variables
- `graphql_mutation` - Execute GraphQL mutations with optional variables

## Tool Details

### graphql_introspect

Discovers the schema structure of a GraphQL endpoint, including all available types, queries, mutations, and their documentation.

**Headers Required:**

- `X-GraphQL-URL`: GraphQL endpoint URL
- `Authorization`: Bearer token (optional)

**Parameters:**

- `headers` (optional): Additional HTTP headers for authentication
- `include_descriptions` (optional, default: true): Include field descriptions
- `sort_schema` (optional, default: true): Sort schema alphabetically

**Example:**

```typescript
// Headers
{
  "X-GraphQL-URL": "https://api.github.com/graphql",
  "Authorization": "Bearer your_github_token"
}

// Tool parameters
{
  "include_descriptions": true,
  "sort_schema": true
}
```

### graphql_query

Executes a GraphQL query against the specified endpoint with automatic validation.

**Headers Required:**

- `X-GraphQL-URL`: GraphQL endpoint URL
- `Authorization`: Bearer token (optional)

**Parameters:**

- `query` (required): GraphQL query string
- `variables` (optional): Query variables as JSON object
- `headers` (optional): Additional HTTP headers

**Example:**

```typescript
// Headers
{
  "X-GraphQL-URL": "https://api.github.com/graphql",
  "Authorization": "Bearer your_github_token"
}

// Tool parameters
{
  "query": "query GetUser($login: String!) { user(login: $login) { name bio company } }",
  "variables": { "login": "octocat" }
}
```

### graphql_mutation

Executes a GraphQL mutation against the specified endpoint with automatic validation.

**Headers Required:**

- `X-GraphQL-URL`: GraphQL endpoint URL
- `Authorization`: Bearer token (optional)

**Parameters:**

- `mutation` (required): GraphQL mutation string
- `variables` (optional): Mutation variables as JSON object
- `headers` (optional): Additional HTTP headers

**Example:**

```typescript
// Headers
{
  "X-GraphQL-URL": "https://api.github.com/graphql",
  "Authorization": "Bearer your_github_token"
}

// Tool parameters
{
  "mutation": "mutation UpdateProfile($bio: String!) { updateUserProfile(input: { bio: $bio }) { user { bio } } }",
  "variables": { "bio": "Updated bio from MCP" }
}
```

## Tools Discovery

You can introspect available tools using the `/tools` endpoint:

```bash
curl -X GET http://localhost:3000/tools
```

Response format:

```json
{
  "tools": [
    {
      "name": "graphql_introspect",
      "description": "Introspect a GraphQL endpoint...",
      "inputSchema": {
        "type": "object",
        "properties": { ... },
        "required": [ ... ]
      }
    }
  ],
  "metadata": {
    "totalTools": 3,
    "serverType": "GraphQL MCP Server",
    "version": "0.0.0-alpha.1",
    "usage": {
      "note": "Set GraphQL endpoint URL in 'X-GraphQL-URL' header when making requests",
      "headers": {
        "X-GraphQL-URL": "Your GraphQL endpoint URL (required)",
        "Authorization": "Bearer your_auth_token (optional for GraphQL endpoint auth)"
      }
    }
  }
}
```

## Getting API Access

To request access to the hosted MCP server:

1. Contact the maintainers through GitHub issues
2. Provide your use case and requirements
3. You'll receive an auth key for authentication

## Setup

**MCP Configuration**:

```json
{
  "mcpServers": {
    "graphql-remote": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--oauth2Bearer",
        "YOUR_AUTH_KEY",
        "--streamableHttp",
        "http://localhost:3000/mcp"
      ]
    }
  }
}
```

### Local Development

1. **Clone and Install**:

   ```bash
   git clone https://github.com/hypermodeinc/community-mcp.git
   cd community-mcp/servers/graphql
   pnpm install
   ```

2. **Environment Setup**:

   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local`:

   ```env
   AUTH_KEY=your_auth_secret
   ```

3. **Start Development Server**:

   ```bash
   pnpm dev
   ```

4. **Test Tools Endpoint**:

   ```bash
   curl -X GET http://localhost:3000/tools
   ```

5. **MCP Configuration for Local**:
   ```json
   {
     "mcpServers": {
       "graphql-local": {
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

### Exploring a GraphQL API

**User**: "Can you introspect the GitHub GraphQL API for me?"

**Assistant**: I'll introspect the GitHub GraphQL API to discover its schema structure.

_Note: The GraphQL endpoint URL (https://api.github.com/graphql) is now passed via the X-GraphQL-URL header_

```text
Using graphql_introspect to examine the GitHub API...

GraphQL schema introspection completed. Found 1,247 types.

Key Query Types Available:
- viewer: The currently authenticated user
- user(login: String!): Look up a user by login
- repository(name: String!, owner: String!): Look up a repository
- organization(login: String!): Look up an organization
- search(query: String!, type: SearchType!): Search across GitHub

Key Mutation Types Available:
- createIssue: Create a new issue
- updateIssue: Update an existing issue
- addComment: Add a comment to an issue or pull request
- createPullRequest: Create a new pull request
- mergePullRequest: Merge a pull request

The API supports comprehensive GitHub operations including repositories, issues, pull requests, users, organizations, and more.
```

## Authentication

The GraphQL MCP server uses a two-layer authentication approach:

### MCP Server Authentication

- **Auth Key**: Required for accessing the MCP server itself
- Set via `AUTH_KEY` environment variable or passed as bearer token to MCP endpoint

### GraphQL Endpoint Authentication

- **Headers**: Set via `X-GraphQL-URL` and `Authorization` headers
- **Bearer Token**: `Authorization: Bearer YOUR_TOKEN`
- **API Key**: Custom headers as needed by your GraphQL endpoint

## Common GraphQL Endpoints

Here are some popular GraphQL endpoints you can explore:

### GitHub API

```bash
# Headers
X-GraphQL-URL: https://api.github.com/graphql
Authorization: Bearer your_github_personal_access_token
```

### Shopify Storefront API

```bash
# Headers
X-GraphQL-URL: https://your-shop.myshopify.com/api/2023-10/graphql
X-Shopify-Storefront-Access-Token: your_storefront_access_token
```

### Contentful

```bash
# Headers
X-GraphQL-URL: https://graphql.contentful.com/content/v1/spaces/your_space_id
Authorization: Bearer your_contentful_access_token
```

### GraphQL Playground Examples

```bash
# Headers
X-GraphQL-URL: https://graphql-pokemon2.vercel.app/
```

## Error Handling

The server provides comprehensive error handling:

- **Missing GraphQL URL**: Clear error when `X-GraphQL-URL` header is not provided
- **Syntax Errors**: Malformed GraphQL queries are caught and reported
- **Validation Errors**: Schema validation failures are detailed
- **Network Errors**: Connection issues are handled gracefully
- **Authentication Errors**: Auth failures are clearly reported
- **Rate Limiting**: Respects API rate limits and provides helpful messages

## Security Considerations

- **No Credential Storage**: The server never stores your API keys or tokens
- **Request Validation**: All GraphQL operations are validated before execution
- **Error Sanitization**: Sensitive information is not exposed in error messages
- **HTTPS Only**: All communications use secure HTTPS connections
- **Header-based URLs**: GraphQL endpoints passed via headers for better security isolation

## Limitations

- **Introspection Dependency**: Some features require introspection to be enabled on the target GraphQL endpoint
- **Rate Limits**: Subject to the rate limits of the target GraphQL API
- **Schema Caching**: Schema information is not cached between requests (each introspection is fresh)
- **File Uploads**: Does not currently support GraphQL file upload specifications

## Support

For issues specific to the GraphQL MCP server:

1. Check the GraphQL endpoint's documentation
2. Verify your authentication headers
3. Test queries directly against the GraphQL endpoint
4. Submit issues via GitHub with query examples and error messages

## License

MIT License - see the main repository LICENSE file for details.
