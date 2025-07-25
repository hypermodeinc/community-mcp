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
        "https://community-mcp-graphql.vercel.app/mcp"
      ]
    }
  }
}
```

**Note**: Replace `YOUR_AUTH_KEY` with an auth key from the maintainers. See [Getting API Access](#getting-api-access) below.

## Features

- **Schema Introspection**: Discover available types, queries, and mutations from any GraphQL endpoint
- **Query Execution**: Execute GraphQL queries with automatic validation and error handling
- **Mutation Execution**: Perform GraphQL mutations with validation and safety checks
- **Authentication Support**: Flexible header-based authentication for protected endpoints
- **Validation**: Built-in query and mutation validation using graphql-js
- **Error Handling**: Comprehensive error reporting for debugging

## Available Tools

### GraphQL Operations

- `graphql_introspect` - Perform schema introspection to discover available operations and types
- `graphql_query` - Execute GraphQL queries with optional variables
- `graphql_mutation` - Execute GraphQL mutations with optional variables

## Tool Details

### graphql_introspect

Discovers the schema structure of a GraphQL endpoint, including all available types, queries, mutations, and their documentation.

**Parameters:**

- `endpoint` (required): GraphQL endpoint URL
- `headers` (optional): HTTP headers for authentication

**Example:**

```typescript
{
  "endpoint": "https://api.github.com/graphql",
  "headers": {
    "Authorization": "Bearer your_github_token"
  }
}
```

### graphql_query

Executes a GraphQL query against the specified endpoint with automatic validation.

**Parameters:**

- `endpoint` (required): GraphQL endpoint URL
- `query` (required): GraphQL query string
- `variables` (optional): Query variables as JSON object
- `headers` (optional): HTTP headers for authentication

**Example:**

```typescript
{
  "endpoint": "https://api.github.com/graphql",
  "query": "query GetUser($login: String!) { user(login: $login) { name bio company } }",
  "variables": { "login": "octocat" },
  "headers": {
    "Authorization": "Bearer your_github_token"
  }
}
```

### graphql_mutation

Executes a GraphQL mutation against the specified endpoint with automatic validation.

**Parameters:**

- `endpoint` (required): GraphQL endpoint URL
- `mutation` (required): GraphQL mutation string
- `variables` (optional): Mutation variables as JSON object
- `headers` (optional): HTTP headers for authentication

**Example:**

```typescript
{
  "endpoint": "https://api.github.com/graphql",
  "mutation": "mutation UpdateProfile($bio: String!) { updateUserProfile(input: { bio: $bio }) { user { bio } } }",
  "variables": { "bio": "Updated bio from MCP" },
  "headers": {
    "Authorization": "Bearer your_github_token"
  }
}
```

## Getting API Access

To request access to the hosted MCP server:

1. Contact the maintainers through GitHub issues
2. Provide your use case and requirements
3. You'll receive an auth key for authentication

## Setup

### Cloud Deployment

The server is deployed at `https://community-mcp-graphql.vercel.app` and ready for immediate use.

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
        "https://community-mcp-graphql.vercel.app/mcp"
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

4. **MCP Configuration for Local**:
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

**User**: "Get information about the octocat user"

**Assistant**: I'll query the GitHub API to get information about the octocat user.

```text
Using graphql_query to fetch user information...

Query:
query GetUser($login: String!) {
  user(login: $login) {
    name
    bio
    company
    location
    email
    websiteUrl
    twitterUsername
    followers {
      totalCount
    }
    following {
      totalCount
    }
    repositories(first: 5, orderBy: {field: STARGAZERS, direction: DESC}) {
      nodes {
        name
        description
        stargazerCount
      }
    }
  }
}

Results:
- Name: The Octocat
- Bio: GitHub's mascot and Git guru
- Company: @github
- Location: San Francisco
- Followers: 4,892
- Following: 9
- Top Repositories:
  * Hello-World: My first repository on GitHub! (2,034 stars)
  * Spoon-Knife: This repo is for demonstration purposes only (1,234 stars)
```

### API Mutation Example

**User**: "Create a new issue in my test repository"

**Assistant**: I'll help you create a new issue in your repository using a GraphQL mutation.

```text
Using graphql_mutation to create a new issue...

Mutation:
mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String) {
  createIssue(input: {
    repositoryId: $repositoryId
    title: $title
    body: $body
  }) {
    issue {
      id
      number
      title
      url
      state
    }
  }
}

Variables:
- repositoryId: "R_kgDOGBJWKw"
- title: "New feature request"
- body: "This issue was created via GraphQL MCP server"

Results:
Successfully created issue #42:
- Title: New feature request
- URL: https://github.com/username/test-repo/issues/42
- State: OPEN
- ID: I_kwDOGBJWK85HqR9K
```

## Authentication

The GraphQL MCP server uses a simple auth key system for MCP authentication, while GraphQL endpoint authentication is handled through HTTP headers:

### MCP Server Authentication

- **Auth Key**: Required for accessing the MCP server itself
- Set via `AUTH_KEY` environment variable or passed as bearer token

### GraphQL Endpoint Authentication

- **Bearer Token**: `"Authorization": "Bearer YOUR_TOKEN"`
- **API Key**: `"X-API-Key": "YOUR_API_KEY"`
- **Custom Headers**: Any custom authentication headers required by your GraphQL endpoint

## Common GraphQL Endpoints

Here are some popular GraphQL endpoints you can explore:

### GitHub API

```json
{
  "endpoint": "https://api.github.com/graphql",
  "headers": {
    "Authorization": "Bearer your_github_personal_access_token"
  }
}
```

### Shopify Storefront API

```json
{
  "endpoint": "https://your-shop.myshopify.com/api/2023-10/graphql",
  "headers": {
    "X-Shopify-Storefront-Access-Token": "your_storefront_access_token"
  }
}
```

### Contentful

```json
{
  "endpoint": "https://graphql.contentful.com/content/v1/spaces/your_space_id",
  "headers": {
    "Authorization": "Bearer your_contentful_access_token"
  }
}
```

### GraphQL Playground Examples

```json
{
  "endpoint": "https://graphql-pokemon2.vercel.app/",
  "headers": {}
}
```

## Error Handling

The server provides comprehensive error handling:

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
