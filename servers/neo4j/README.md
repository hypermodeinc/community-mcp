# Neo4j MCP Server

A Model Context Protocol server for Neo4j graph database integration built with Next.js. This server provides comprehensive graph database capabilities through conversational AI interfaces, enabling complex graph queries, data exploration, and relationship analysis through natural language.

## Quick Start

Add this to your MCP client configuration (e.g., Claude Desktop) to connect to your Neo4j database:

```json
{
  "mcpServers": {
    "neo4j": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "http://localhost:3000/mcp",
        "--header",
        "X-Neo4j-URI:${NEO4J_URI}",
        "--header",
        "X-Neo4j-Username:${NEO4J_USER}",
        "--header",
        "X-Neo4j-Password:${NEO4J_PASS}",
        "--header",
        "X-Neo4j-Database:${NEO4J_DB}"
      ],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASS": "your-password",
        "NEO4J_DB": "neo4j"
      }
    }
  }
}
```

**Note**: Update the environment variables with your Neo4j connection details. For Neo4j Aura, use `neo4j+s://` protocol.

## Features

- **Schema Introspection**: Discover node labels, relationship types, properties, constraints, and indexes
- **Cypher Query Execution**: Execute read and write Cypher queries with full language support
- **Query Optimization**: Explain query execution plans for performance tuning
- **APOC Support**: Enhanced functionality with APOC procedures when available
- **Parameterized Queries**: Secure query execution with parameter binding
- **Connection Pooling**: Optimized database connections for better performance

## Available Tools

### Graph Operations

- `neo4j_schema` - Get complete database schema information
  - **Inputs**: None required
  - **Features**:
    - Node labels and counts
    - Relationship types
    - Property keys and types
    - Constraints and indexes
    - APOC-enhanced details when available

- `neo4j_read` - Execute read-only Cypher queries
  - **Inputs**:
    - `query` (string, required): Cypher read query
    - `params` (object, optional): Query parameters
  - **Features**:
    - MATCH, RETURN, WITH operations
    - Aggregations and filtering
    - Pattern matching
    - Graph algorithms

- `neo4j_write` - Execute write Cypher queries
  - **Inputs**:
    - `query` (string, required): Cypher write query
    - `params` (object, optional): Query parameters
  - **Features**:
    - CREATE, MERGE operations
    - SET, DELETE, REMOVE
    - Batch operations
    - Transaction support

- `neo4j_explain` - Analyze query execution plans
  - **Inputs**:
    - `query` (string, required): Query to explain
    - `params` (object, optional): Query parameters
  - **Features**:
    - Execution plan visualization
    - Cost estimation
    - Index usage analysis
    - Performance optimization hints

## Authentication

The server uses a two-layer authentication approach:

### MCP Server Authentication (Optional)

- **Auth Key**: Can be required for accessing the MCP server
- Set via `AUTH_KEY` environment variable
- If set, include in the MCP configuration with `Authorization` header

### Neo4j Database Authentication

- **Connection Details**: Always passed via headers
- Supports standard Neo4j authentication
- Compatible with Neo4j Cloud, Aura, and self-hosted instances
- All connection parameters are required (no defaults)

## Troubleshooting

### Common Issues

1. **"Neo4j URI must be provided in 'X-Neo4j-URI' header" error**
   - Ensure you're using the correct header format with colons (`:`) not equals (`=`)
   - Use environment variables to avoid escaping issues
   - Check that all four required headers are present

2. **Connection refused errors**
   - Verify Neo4j is running on the specified port
   - Check firewall settings
   - Ensure the URI protocol matches your Neo4j setup (bolt vs neo4j+s)

3. **Authentication failures**
   - Verify username and password are correct
   - Check that the database name exists
   - For Neo4j Aura, ensure you're using the full connection string

### Debug Commands

Test the connection directly:

```bash
# Test with mcp-remote client mode
npx -p mcp-remote@latest mcp-remote-client http://localhost:3000/mcp \
  --header "X-Neo4j-URI:bolt://localhost:7687" \
  --header "X-Neo4j-Username:neo4j" \
  --header "X-Neo4j-Password:your-password" \
  --header "X-Neo4j-Database:neo4j"
```

Check Claude Desktop logs:

```bash
# macOS
tail -n 20 -F ~/Library/Logs/Claude/mcp*.log

# Windows (PowerShell)
Get-Content "C:\Users\YourUsername\AppData\Local\Claude\Logs\mcp.log" -Wait -Tail 20
```

Clear MCP auth cache if needed:

```bash
rm -rf ~/.mcp-auth
```

## Setup

### MCP Configuration

Add this configuration to your MCP client (e.g., `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "neo4j": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "http://localhost:3000/mcp",
        "--header",
        "X-Neo4j-URI:${NEO4J_URI}",
        "--header",
        "X-Neo4j-Username:${NEO4J_USER}",
        "--header",
        "X-Neo4j-Password:${NEO4J_PASS}",
        "--header",
        "X-Neo4j-Database:${NEO4J_DB}"
      ],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASS": "your-password",
        "NEO4J_DB": "neo4j"
      }
    }
  }
}
```

Update the `env` values for your Neo4j instance:

- **Local Neo4j**: Use `bolt://localhost:7687`
- **Neo4j Aura**: Use `neo4j+s://xxxxxxxx.databases.neo4j.io`
- **Custom port/host**: Adjust the URI accordingly

### Required Headers

All Neo4j connection details must be provided via headers:

- `X-Neo4j-URI`: Neo4j connection URI (required)
- `X-Neo4j-Username`: Neo4j username (required)
- `X-Neo4j-Password`: Neo4j password (required)
- `X-Neo4j-Database`: Database name (required)

### Local Development

1. **Clone and Install**:

   ```bash
   git clone https://github.com/hypermodeinc/community-mcp.git
   cd community-mcp/servers/neo4j
   pnpm install
   ```

2. **Environment Setup**:

   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local`:

   ```env
   AUTH_KEY=your_auth_secret
   # Note: Neo4j connection details are provided via headers, not environment variables
   ```

3. **Start Development Server**:

   ```bash
   pnpm dev
   ```

4. **Configure Claude Desktop**:

   Add to your Claude Desktop config:

   ```json
   {
     "mcpServers": {
       "neo4j-local": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote@latest",
           "http://localhost:3000/mcp",
           "--header",
           "X-Neo4j-URI:${NEO4J_URI}",
           "--header",
           "X-Neo4j-Username:${NEO4J_USER}",
           "--header",
           "X-Neo4j-Password:${NEO4J_PASS}",
           "--header",
           "X-Neo4j-Database:${NEO4J_DB}"
         ],
         "env": {
           "NEO4J_URI": "bolt://localhost:7687",
           "NEO4J_USER": "neo4j",
           "NEO4J_PASS": "your-password",
           "NEO4J_DB": "neo4j"
         }
       }
     }
   }
   ```

## Example Conversations

### Schema Discovery

**User**: "What's the structure of my Neo4j database?"

**Assistant**: I'll retrieve the schema information from your Neo4j database.

```text
Neo4j Schema (APOC):

{
  "Person": {
    "type": "node",
    "count": 1000,
    "properties": {
      "name": { "type": "STRING", "indexed": true },
      "age": { "type": "INTEGER" },
      "email": { "type": "STRING" }
    },
    "relationships": {
      "KNOWS": {
        "direction": "out",
        "labels": ["Person"],
        "properties": {
          "since": { "type": "DATE" }
        }
      }
    }
  }
}
```

Your database contains 1000 Person nodes with relationships indicating who knows whom.

### Graph Queries

**User**: "Find all people who know someone named 'Alice' within 2 degrees of separation"

**Assistant**: I'll search for people connected to Alice within 2 relationship hops.

```cypher
MATCH (alice:Person {name: 'Alice'})-[:KNOWS*1..2]-(connected:Person)
WHERE connected.name <> 'Alice'
RETURN DISTINCT connected.name as name, connected.age as age
ORDER BY connected.name
```

Found 47 people within 2 degrees of Alice, including Bob (age 30), Charlie (age 25), and others.

### Data Creation

**User**: "Create a new person named 'David' who knows 'Alice'"

**Assistant**: I'll create David and establish the relationship with Alice.

```cypher
MATCH (alice:Person {name: 'Alice'})
CREATE (david:Person {name: 'David', age: 28, email: 'david@example.com'})
CREATE (david)-[:KNOWS {since: date()}]->(alice)
RETURN david, alice
```

Successfully created David and established the KNOWS relationship with Alice.

### Query Optimization

**User**: "How can I optimize my query to find shortest paths?"

**Assistant**: Let me analyze your shortest path query execution plan.

```cypher
EXPLAIN
MATCH p=shortestPath((a:Person {name: $startName})-[:KNOWS*]-(b:Person {name: $endName}))
RETURN p
```

Execution Plan:

- ShortestPath
  - NodeIndexSeek (a:Person, name index)
  - NodeIndexSeek (b:Person, name index)

The query is using indexes efficiently. Consider adding a relationship index if paths are long.

## Connection Examples

### Neo4j Aura (Cloud)

```json
{
  "mcpServers": {
    "neo4j-aura": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "http://localhost:3000/mcp",
        "--header",
        "X-Neo4j-URI:${NEO4J_URI}",
        "--header",
        "X-Neo4j-Username:${NEO4J_USER}",
        "--header",
        "X-Neo4j-Password:${NEO4J_PASS}",
        "--header",
        "X-Neo4j-Database:${NEO4J_DB}"
      ],
      "env": {
        "NEO4J_URI": "neo4j+s://xxxxxxxx.databases.neo4j.io",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASS": "your-aura-password",
        "NEO4J_DB": "neo4j"
      }
    }
  }
}
```

### Local Neo4j with Custom Database

```json
{
  "mcpServers": {
    "neo4j-movies": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "http://localhost:3000/mcp",
        "--header",
        "X-Neo4j-URI:${NEO4J_URI}",
        "--header",
        "X-Neo4j-Username:${NEO4J_USER}",
        "--header",
        "X-Neo4j-Password:${NEO4J_PASS}",
        "--header",
        "X-Neo4j-Database:${NEO4J_DB}"
      ],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASS": "password123",
        "NEO4J_DB": "movies"
      }
    }
  }
}
```

## Neo4j Configuration

### Supported Neo4j Versions

- Neo4j 4.x and 5.x
- Neo4j Aura (cloud hosted)
- Neo4j Community and Enterprise editions

### APOC Plugin

For enhanced functionality, install the APOC plugin:

1. Download APOC from [Neo4j Labs](https://neo4j.com/labs/apoc/)
2. Place in Neo4j plugins directory
3. Restart Neo4j
4. Enable in neo4j.conf: `dbms.security.procedures.unrestricted=apoc.*`

### Connection Types

- **Bolt Protocol**: `bolt://localhost:7687` (standard)
- **Bolt+s Protocol**: `bolt+s://xxx.neo4j.io:7687` (encrypted)
- **Neo4j+s Protocol**: `neo4j+s://xxx.neo4j.io` (Neo4j Aura)

## Cypher Query Examples

### Pattern Matching

```cypher
// Find friends of friends
MATCH (person:Person {name: $name})-[:KNOWS]->(friend)-[:KNOWS]->(fof)
WHERE person <> fof AND NOT (person)-[:KNOWS]-(fof)
RETURN DISTINCT fof.name as suggestion
```

### Graph Algorithms

```cypher
// PageRank calculation (requires APOC)
CALL apoc.algo.pageRank('Person', 'KNOWS') YIELD node, score
RETURN node.name as person, score
ORDER BY score DESC LIMIT 10
```

### Data Import

```cypher
// Bulk create nodes from parameters
UNWIND $people as person
CREATE (p:Person)
SET p = person
RETURN count(p) as created
```

### Aggregations

```cypher
// Analyze relationship statistics
MATCH (p:Person)-[r:KNOWS]->()
RETURN p.name, count(r) as connections, avg(r.weight) as avg_weight
ORDER BY connections DESC
```

## Best Practices

### Query Performance

- Use parameters instead of string concatenation
- Create indexes on frequently queried properties
- Use EXPLAIN to understand query plans
- Limit result sets with LIMIT clause

### Security

- Always use parameterized queries
- Validate input data types
- Use read-only queries when possible
- Implement proper access controls

### Data Modeling

- Design with queries in mind
- Use meaningful relationship types
- Keep property names consistent
- Consider using node labels for type safety

## Error Handling

The server provides detailed error messages:

- **Connection Errors**: Check URI and credentials
- **Syntax Errors**: Validate Cypher syntax
- **Permission Errors**: Ensure proper database access
- **APOC Errors**: Verify APOC installation

## Limitations

- **Transaction Scope**: Each query runs in its own transaction
- **Result Size**: Large result sets may need pagination
- **Streaming**: No support for streaming large datasets
- **Procedures**: Custom procedures require server-side installation

## Support

For issues specific to the Neo4j MCP server:

1. Verify Neo4j connection settings
2. Test queries in Neo4j Browser first
3. Check Neo4j logs for detailed errors
4. Submit issues via GitHub with query examples

## License

MIT License - see the main repository LICENSE file for details.
