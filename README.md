# Hypermode Community MCP Servers

A curated collection of Model Context Protocol (MCP) servers designed for integration with conversational agents. This repository provides production-ready MCP servers that extend the capabilities of AI assistants with external service integrations.

## Available Servers

### Attio CRM Server

A comprehensive MCP server for Attio CRM integration, providing full CRUD operations for CRM data management.

**Location**: `servers/attio/`

**Deployment**: Available at `https://community-mcp-attio.vercel.app`

**Features**:

- Complete workspace introspection
- Record management across all objects
- List operations and entry management
- Notes, tasks, and comment management
- Attribute and schema management

[View Attio Server Documentation](./servers/attio/README.md)

## Development

This is a pnpm monorepo containing multiple MCP servers. Each server is located in the `servers/` directory.

### Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/hypermodeinc/community-mcp.git
   cd community-mcp
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Development**:
   Each server can be run independently. See individual server documentation for specific setup instructions.

### Available Scripts

- `pnpm build` - Build all servers
- `pnpm start:attio` - Start the Attio server
- `pnpm clean` - Clean all build artifacts and dependencies

## Getting API Access

To request access to our hosted MCP servers:

1. Contact the maintainers through GitHub issues
2. Provide your use case and requirements
3. You'll receive an API key for authentication

## Contributing

We welcome contributions of new MCP servers and improvements to existing ones. Please follow our contribution guidelines and ensure your servers meet our quality standards.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support, feature requests, or bug reports, please use the GitHub issues system. For server-specific issues, check the individual server documentation first.
