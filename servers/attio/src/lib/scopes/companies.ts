import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// COMPANIES SCHEMAS
// ===============================

export const searchCompaniesSchema = {
  query: z
    .object({
      filter: z
        .record(z.any())
        .optional()
        .describe(
          "Filter object to subset records. Supports complex filtering with $and, $or operators",
        ),
      sorts: z
        .array(
          z.object({
            direction: z.enum(["asc", "desc"]).describe("Sort direction"),
            attribute: z.string().describe("Attribute to sort by"),
            field: z
              .string()
              .optional()
              .describe("Specific field for complex attributes like domains"),
          }),
        )
        .optional()
        .describe("Array of sort criteria with direction and attribute"),
      limit: z
        .number()
        .min(1)
        .max(500)
        .optional()
        .describe(
          "Maximum number of companies to return (default: 25, max: 500)",
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Number of companies to skip for pagination"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getCompanySchema = {
  company_id: z
    .string()
    .uuid()
    .describe("UUID of the company record to retrieve"),
};

export const createCompanySchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe(
          "Key-value pairs of attributes for the new company. Standard attributes include: domains (array), name (string), description (string), team (array of emails), primary_location (string), categories (array), foundation_date (string), employee_range (string), etc.",
        ),
    })
    .describe("The company data to create"),
};

export const updateCompanySchema = {
  company_id: z
    .string()
    .uuid()
    .describe("UUID of the company record to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe(
          "Key-value pairs of attributes to update. For multiselect attributes, values will be appended to existing values.",
        ),
    })
    .describe("The company data to update"),
};

export const assertCompanySchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes for the company"),
    })
    .describe("The company data to create or update"),
  matching_attribute: z
    .string()
    .optional()
    .describe(
      "The ID or slug of the attribute to use for matching existing companies. For companies, 'domains' is the default unique attribute",
    ),
};

export const deleteCompanySchema = {
  company_id: z
    .string()
    .uuid()
    .describe("UUID of the company record to delete"),
};

// New schemas based on API documentation
export const getCompanyAttributeValuesSchema = {
  company_id: z
    .string()
    .uuid()
    .describe("UUID of the company record to fetch attribute values for"),
  attribute: z
    .string()
    .describe(
      "UUID or slug of the attribute to query values for (e.g., 'domains', 'name', 'description')",
    ),
  show_historic: z
    .boolean()
    .optional()
    .describe(
      "If true, returns all historic values. If false, only current active values. Cannot be true for COMINT/enriched attributes",
    ),
  limit: z
    .number()
    .min(1)
    .optional()
    .describe("Maximum number of results to return"),
  offset: z
    .number()
    .min(0)
    .optional()
    .describe("Number of results to skip for pagination"),
};

export const getCompanyEntriesSchema = {
  company_id: z
    .string()
    .uuid()
    .describe("UUID of the company record to fetch entries for"),
  limit: z
    .number()
    .min(1)
    .max(1000)
    .optional()
    .describe("Maximum number of results to return (default: 100, max: 1000)"),
  offset: z
    .number()
    .min(0)
    .optional()
    .describe("Number of results to skip for pagination"),
};

// ===============================
// COMPANIES ACTIONS - Updated implementations
// ===============================

export async function searchCompanies(
  args: { query?: any } = {},
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const { query = {} } = args;

    // Build request body according to API documentation
    const requestBody: any = {
      limit: Math.min(query.limit || 25, 500),
      offset: query.offset || 0,
    };

    // Add filter if provided
    if (query.filter) {
      requestBody.filter = query.filter;
    }

    // Add sorts if provided
    if (query.sorts && Array.isArray(query.sorts)) {
      requestBody.sorts = query.sorts;
    }

    const response = await makeAttioRequest(
      `/v2/objects/companies/records/query`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      context?.authToken,
    );

    const companyCount = response.data?.length || 0;
    const displayData = {
      total_found: companyCount,
      limit: requestBody.limit,
      offset: requestBody.offset,
      companies: response.data || [],
    };

    return createMcpResponse(
      displayData,
      `Found ${companyCount} companies:\n\n${JSON.stringify(displayData, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching companies");
  }
}

export async function getCompany(args: {
  company_id: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${args.company_id}`,
      {},
      context?.authToken,
    );

    // Extract key information for better display
    const company = response.data;
    const summary = {
      id: company?.id?.record_id,
      name: company?.values?.name?.[0]?.value || "Unknown",
      domain: company?.values?.domains?.[0]?.domain || "No domain",
      description: company?.values?.description?.[0]?.value || "No description",
      employee_range:
        company?.values?.employee_range?.[0]?.option?.title || "Unknown",
      created_at: company?.created_at,
      web_url: company?.web_url,
    };

    return createMcpResponse(
      response,
      `Company "${summary.name}" (${summary.domain}):\n\n${JSON.stringify(summary, null, 2)}\n\nFull details:\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting company");
  }
}

export async function createCompany(args: { data: any }, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/objects/companies/records`, {
      method: "POST",
      body: JSON.stringify({ data: args.data }),
    }, context?.authToken);

    const company = response.data;
    const summary = {
      id: company?.id?.record_id,
      name: company?.values?.name?.[0]?.value || "Unknown",
      domain: company?.values?.domains?.[0]?.domain || "No domain",
      created_at: company?.created_at,
    };

    return createMcpResponse(
      response,
      `Successfully created company "${summary.name}" with ID ${summary.id}:\n\n${JSON.stringify(summary, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating company");
  }
}

export async function updateCompany(args: {
  company_id: string;
  data: any;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${args.company_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    const company = response.data;
    const summary = {
      id: company?.id?.record_id,
      name: company?.values?.name?.[0]?.value || "Unknown",
      updated_attributes: Object.keys(args.data.values || {}),
    };

    return createMcpResponse(
      response,
      `Successfully updated company "${summary.name}" (${args.company_id}):\nUpdated attributes: ${summary.updated_attributes.join(", ")}\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating company");
  }
}

export async function assertCompany(args: {
  data: any;
  matching_attribute?: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.matching_attribute) {
      queryParams.append("matching_attribute", args.matching_attribute);
    } else {
      // Default to domains for companies as per API docs
      queryParams.append("matching_attribute", "domains");
    }

    const response = await makeAttioRequest(
      `/v2/objects/companies/records?${queryParams}`,
      {
        method: "PUT",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    const company = response.data;
    const summary = {
      id: company?.id?.record_id,
      name: company?.values?.name?.[0]?.value || "Unknown",
      domain: company?.values?.domains?.[0]?.domain || "No domain",
      action: "created_or_updated",
    };

    return createMcpResponse(
      response,
      `Successfully asserted company "${summary.name}" (${summary.domain}):\n\n${JSON.stringify(summary, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "asserting company");
  }
}

export async function deleteCompany(args: {
  company_id: string;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    await makeAttioRequest(`/v2/objects/companies/records/${args.company_id}`, {
      method: "DELETE",
    }, context?.authToken);

    return createMcpResponse(
      { deleted: true, company_id: args.company_id },
      `Successfully deleted company ${args.company_id}`,
    );
  } catch (error) {
    return createErrorResponse(error, "deleting company");
  }
}

// New functions based on API documentation
export async function getCompanyAttributeValues(args: {
  company_id: string;
  attribute: string;
  show_historic?: boolean;
  limit?: number;
  offset?: number;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.show_historic) queryParams.append("show_historic", "true");
    if (args.limit) queryParams.append("limit", args.limit.toString());
    if (args.offset) queryParams.append("offset", args.offset.toString());

    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${args.company_id}/attributes/${args.attribute}/values?${queryParams}`,
      {},
      context?.authToken,
    );

    const valueCount = response.data?.length || 0;
    const summary = {
      company_id: args.company_id,
      attribute: args.attribute,
      value_count: valueCount,
      show_historic: args.show_historic || false,
      values: response.data || [],
    };

    return createMcpResponse(
      response,
      `Found ${valueCount} values for attribute "${args.attribute}" on company ${args.company_id}:\n\n${JSON.stringify(summary, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting company attribute values");
  }
}

export async function getCompanyEntries(args: {
  company_id: string;
  limit?: number;
  offset?: number;
}, context?: { authToken?: string }): Promise<McpResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (args.limit)
      queryParams.append("limit", Math.min(args.limit, 1000).toString());
    if (args.offset) queryParams.append("offset", args.offset.toString());

    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${args.company_id}/entries?${queryParams}`,
      {},
      context?.authToken,
    );

    const entryCount = response.data?.length || 0;
    const summary = {
      company_id: args.company_id,
      entry_count: entryCount,
      entries: response.data || [],
    };

    return createMcpResponse(
      response,
      `Found ${entryCount} list entries for company ${args.company_id}:\n\n${JSON.stringify(summary, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting company entries");
  }
}

// ===============================
// COMPANIES TOOL DEFINITIONS - Updated
// ===============================

export const companiesToolDefinitions = {
  search_companies: {
    description:
      "Search for companies in Attio CRM with advanced filtering and sorting options. Supports complex filters with $and/$or operators, field-specific sorting, and pagination.",
    schema: searchCompaniesSchema,
  },
  get_company: {
    description:
      "Get a specific company by ID with all its data including attributes, values, and metadata",
    schema: getCompanySchema,
  },
  create_company: {
    description:
      "Create a new company in Attio CRM. Standard attributes include: domains, name, description, team, primary_location, categories, foundation_date, employee_range",
    schema: createCompanySchema,
  },
  update_company: {
    description:
      "Update an existing company in Attio CRM. For multiselect attributes, values are appended to existing values",
    schema: updateCompanySchema,
  },
  assert_company: {
    description:
      "Create or update a company using a unique attribute for matching (default: domains). If company exists, it's updated; otherwise, it's created",
    schema: assertCompanySchema,
  },
  delete_company: {
    description: "Delete a company by ID. This action cannot be undone",
    schema: deleteCompanySchema,
  },
  get_company_attribute_values: {
    description:
      "Get all values for a specific attribute on a company record. Supports historic values and pagination. Cannot query historic values for COMINT/enriched attributes",
    schema: getCompanyAttributeValuesSchema,
  },
  get_company_entries: {
    description:
      "List all list entries across all lists where this company is the parent record. Useful for finding which lists contain this company",
    schema: getCompanyEntriesSchema,
  },
};

// ===============================
// COMPANIES ACTIONS MAPPING - Updated
// ===============================

export const companiesActions = {
  search_companies: searchCompanies,
  get_company: getCompany,
  create_company: createCompany,
  update_company: updateCompany,
  assert_company: assertCompany,
  delete_company: deleteCompany,
  get_company_attribute_values: getCompanyAttributeValues,
  get_company_entries: getCompanyEntries,
};
