# MotherDuck MCP Server

A Model Context Protocol server for MotherDuck analytics database integration built with Next.js. This server provides SQL analytics capabilities through conversational AI interfaces, enabling data exploration, analysis, and visualization through natural language queries.

## Quick Start

Add this to your MCP client configuration to start using the hosted server:

```json
{
  "mcpServers": {
    "motherduck-remote": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--oauth2Bearer",
        "YOUR_MOTHERDUCK_TOKEN",
        "--streamableHttp",
        "http://localhost:3000/mcp"
      ]
    }
  }
}
```

**Note**: Replace `YOUR_MOTHERDUCK_TOKEN` with your MotherDuck access token. See [Getting API Access](#getting-api-access) below.

## Features

- **Cloud Analytics**: Execute SQL queries on MotherDuck's cloud analytics platform
- **DuckDB Compatibility**: Full DuckDB SQL dialect support for complex analytics
- **Data Lake Integration**: Query data from cloud storage (S3, GCS, Azure) without ETL
- **Real-time Analysis**: Interactive data exploration and visualization
- **Serverless**: No infrastructure management required

## Available Tools

### SQL Query Execution

- `query` - Execute SQL queries using DuckDB dialect
  - **Inputs**:
    - `query` (string, required): SQL query to execute
  - **Features**:
    - Full DuckDB SQL support
    - Analytics functions and window functions
    - Data lake querying (Parquet, CSV, JSON)
    - Complex joins and aggregations
    - Time series analysis

## Getting API Access

1. Sign up for a [MotherDuck account](https://app.motherduck.com/?auth_flow=signup)
2. Navigate to [Settings > Tokens](https://app.motherduck.com/settings/tokens)
3. Create a new access token
4. Use the token in your MCP configuration

## Setup

**MCP Configuration**:

```json
{
  "mcpServers": {
    "motherduck-remote": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--oauth2Bearer",
        "YOUR_MOTHERDUCK_TOKEN",
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
   cd community-mcp/servers/motherduck
   pnpm install
   ```

2. **Environment Setup**:

   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local`:

   ```env
   MOTHERDUCK_TOKEN=your_motherduck_token_here
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
       "motherduck-local": {
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

### Data Exploration

**User**: "What tables do I have available in my MotherDuck database?"

**Assistant**: I'll check what tables are available in your MotherDuck database.

```sql
SHOW TABLES;
```

Results:

```text
table_name          | table_type
--------------------|------------
customer_data       | BASE TABLE
sales_transactions  | BASE TABLE
product_catalog     | BASE TABLE
```

**User**: "Show me the top 10 customers by total sales amount"

**Assistant**: I'll analyze your sales data to find the top customers by revenue.

```sql
SELECT
    c.customer_name,
    c.customer_id,
    SUM(s.amount) as total_sales,
    COUNT(s.transaction_id) as transaction_count,
    AVG(s.amount) as avg_transaction_value
FROM customer_data c
JOIN sales_transactions s ON c.customer_id = s.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY total_sales DESC
LIMIT 10;
```

Results show your top customers with Enterprise Corp leading at $1.2M in total sales.

### Advanced Analytics

**User**: "Create a monthly sales trend analysis for the last 12 months"

**Assistant**: I'll create a comprehensive monthly sales trend analysis.

```sql
SELECT
    DATE_TRUNC('month', transaction_date) as month,
    SUM(amount) as monthly_revenue,
    COUNT(*) as transaction_count,
    AVG(amount) as avg_transaction_size,
    SUM(amount) - LAG(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', transaction_date)) as month_over_month_change
FROM sales_transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month;
```

The analysis shows strong growth in Q4 with December revenue up 23% month-over-month.

### Data Lake Querying

**User**: "Analyze the CSV file I uploaded to S3 for customer segmentation"

**Assistant**: I'll analyze your S3 data for customer segmentation insights.

```sql
SELECT
    CASE
        WHEN total_spent > 10000 THEN 'Premium'
        WHEN total_spent > 5000 THEN 'Gold'
        WHEN total_spent > 1000 THEN 'Silver'
        ELSE 'Bronze'
    END as customer_segment,
    COUNT(*) as customer_count,
    AVG(total_spent) as avg_spent,
    SUM(total_spent) as segment_revenue,
    AVG(recency_days) as avg_days_since_last_purchase
FROM 's3://your-bucket/customer-data.csv'
GROUP BY customer_segment
ORDER BY avg_spent DESC;
```

Your segmentation reveals 15% Premium customers generating 60% of total revenue.

## Authentication

The server requires a MotherDuck access token for authentication:

1. **Server Authentication**: Uses bearer token for MCP server access
2. **MotherDuck Authentication**: Uses your MotherDuck token for database access

### Token Types

- **Standard Token**: Full read/write access to your MotherDuck databases
- **Read-Only Token**: Limited to SELECT queries for safer production use
- **Service Account Token**: For automated/programmatic access

## SQL Capabilities

MotherDuck supports the full DuckDB SQL dialect with additional cloud features:

### Analytics Functions

- Window functions (ROW_NUMBER, RANK, LAG/LEAD)
- Statistical functions (PERCENTILE, STDDEV, CORR)
- Time series functions (DATE_TRUNC, EXTRACT)

### Data Lake Integration

- Direct querying of Parquet files
- CSV and JSON file support
- Iceberg table support
- Delta Lake compatibility

### Advanced Features

- CTEs (Common Table Expressions)
- Array and JSON processing
- Geospatial functions
- Machine learning functions

## Example Queries

### Sales Analysis

```sql
-- Monthly revenue trend with growth rates
SELECT
    DATE_TRUNC('month', order_date) as month,
    SUM(total_amount) as revenue,
    LAG(SUM(total_amount)) OVER (ORDER BY DATE_TRUNC('month', order_date)) as prev_month,
    (SUM(total_amount) / LAG(SUM(total_amount)) OVER (ORDER BY DATE_TRUNC('month', order_date)) - 1) * 100 as growth_rate
FROM orders
GROUP BY month
ORDER BY month;
```

### Customer Cohort Analysis

```sql
-- Customer retention cohort analysis
WITH cohorts AS (
    SELECT
        customer_id,
        DATE_TRUNC('month', MIN(order_date)) as cohort_month,
        DATE_TRUNC('month', order_date) as order_month
    FROM orders
    GROUP BY customer_id, DATE_TRUNC('month', order_date)
)
SELECT
    cohort_month,
    order_month,
    COUNT(DISTINCT customer_id) as customers
FROM cohorts
GROUP BY cohort_month, order_month
ORDER BY cohort_month, order_month;
```

### Real-time Data Processing

```sql
-- Real-time streaming data analysis
SELECT
    window_start,
    COUNT(*) as event_count,
    AVG(value) as avg_value,
    MAX(value) as max_value
FROM table_windowed('events', 'timestamp', INTERVAL '5 minutes')
GROUP BY window_start
ORDER BY window_start DESC
LIMIT 10;
```

## Best Practices

### Query Optimization

- Use column pruning for better performance
- Leverage DuckDB's vectorized execution
- Use appropriate data types for better compression

### Security

- Use read-only tokens for production analytics
- Implement proper access controls
- Audit query logs regularly

### Data Management

- Organize data in Parquet format for best performance
- Use partitioning for large datasets
- Implement data quality checks

## Support

For issues specific to the MotherDuck MCP server:

1. Check your MotherDuck token has the necessary permissions
2. Verify your SQL syntax against DuckDB documentation
3. Test queries directly in the MotherDuck console first
4. Submit issues via GitHub with query examples and error messages

## License

MIT License - see the main repository LICENSE file for details.
