# Hypermode Community MCP Servers

A curated collection of Model Context Protocol (MCP) servers designed for integration with conversational agents. This repository provides MCP servers that extend the capabilities of AI assistants with external service integrations.

## Available Servers

### Attio CRM Server

A comprehensive MCP server for Attio CRM integration, providing full CRUD operations for CRM data management.

**Location**: `servers/attio/`

**Features**:

- Complete workspace introspection and member management
- Record operations for people, companies, deals, and custom objects
- List management and entry operations
- Content management (notes, tasks, comments)
- Schema management and attribute configuration
- Real-time CRM data access and manipulation

[View Attio Server Documentation](./servers/attio/README.md)

### GraphQL Server

A versatile MCP server for GraphQL API integration, enabling schema introspection and query execution against any GraphQL endpoint.

**Location**: `servers/graphql/`

**Features**:

- GraphQL schema introspection and discovery
- Query execution with automatic validation
- Mutation execution with safety checks
- Flexible authentication support
- Universal GraphQL API client
- Works with GitHub, Shopify, Contentful, and more

[View GraphQL Server Documentation](./servers/graphql/README.md)

### MotherDuck Analytics Server

A powerful MCP server for MotherDuck cloud analytics database integration, providing SQL analytics capabilities for data exploration and analysis.

**Location**: `servers/motherduck/`

**Features**:

- Cloud analytics with full DuckDB SQL dialect support
- Data lake querying (S3, GCS, Azure) without ETL
- Real-time data analysis and exploration
- Complex analytics with window functions and CTEs
- Serverless data processing at scale
- Time series and statistical analysis

[View MotherDuck Server Documentation](./servers/motherduck/README.md)

### Neo4j Graph Database Server

A Model Context Protocol server for Neo4j graph database integration, enabling complex graph queries and relationship analysis through natural language.

**Location**: `servers/neo4j/`

**Features**:

- Schema introspection with APOC support
- Cypher query execution (read/write operations)
- Query plan explanation and optimization
- Parameterized queries for security
- Connection pooling for performance
- Support for all Neo4j deployment types (Cloud, Aura, self-hosted)

[View Neo4j Server Documentation](./servers/neo4j/README.md)

## Server Capabilities Overview

| Server         | Primary Use Case | Key Strengths                                        | Data Sources           |
| -------------- | ---------------- | ---------------------------------------------------- | ---------------------- |
| **Attio**      | CRM Management   | Record CRUD, Relationship mapping, Sales pipeline    | Attio CRM platform     |
| **GraphQL**    | API Integration  | Universal client, Schema discovery, Flexible queries | Any GraphQL API        |
| **MotherDuck** | Data Analytics   | SQL analytics, Data lake access, Cloud scale         | Cloud databases, Files |
| **Neo4j**      | Graph Database   | Cypher queries, Relationship analysis, APOC support  | Neo4j graph databases  |

## Architecture

All servers follow a consistent, modern architecture:

- **Next.js Framework**: Serverless-ready with optimal performance
- **TypeScript**: Full type safety and excellent developer experience
- **MCP Protocol**: Standards-compliant Model Context Protocol implementation
- **Bearer Token Authentication**: Secure, stateless authentication
- **Zod Validation**: Runtime schema validation for all inputs
- **Error Handling**: Comprehensive error responses and logging

## Development

This is a pnpm monorepo containing multiple MCP servers and shared utilities.

### Repository Structure

```text
community-mcp/
├── packages/
│   └── shared/                 # Shared utilities and response formatting
├── servers/
│   ├── attio/                 # Attio CRM integration server
│   ├── graphql/               # GraphQL API integration server
│   ├── motherduck/            # MotherDuck analytics server
│   └── neo4j/                 # Neo4j graph database server
├── package.json               # Root workspace configuration
└── pnpm-workspace.yaml       # pnpm workspace settings
```

### Development Commands

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all servers
- `pnpm start:attio` - Start the Attio server locally
- `pnpm start:graphql` - Start the GraphQL server locally
- `pnpm start:motherduck` - Start the MotherDuck server locally
- `pnpm start:neo4j` - Start the Neo4j server locally
- `pnpm clean` - Clean all build artifacts and dependencies

### Local Development

Each server can be developed independently:

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Configure environment variables for the target server
4. Run the specific server using the commands above

## Getting Started

Each server includes detailed setup instructions in its individual README:

- **Attio**: Requires Attio API key from workspace settings
- **GraphQL**: Supports various authentication methods per API
- **MotherDuck**: Requires MotherDuck access token
- **Neo4j**: Requires Neo4j connection details via headers

Refer to individual server documentation for complete setup guides, authentication details, and usage examples.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
