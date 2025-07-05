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
      limit: z
        .number()
        .optional()
        .describe("Maximum number of companies to return (default: 25)"),
      offset: z
        .number()
        .optional()
        .describe("Number of companies to skip for pagination"),
      sorts: z.array(z.any()).optional().describe("Array of sort criteria"),
    })
    .optional()
    .describe("Search criteria, filters, and sorting options"),
};

export const getCompanySchema = {
  company_id: z.string().describe("The ID of the company to retrieve"),
};

export const createCompanySchema = {
  data: z
    .object({
      values: z
        .record(z.any())
        .describe(
          "Key-value pairs of attributes for the new company (e.g., name, domain, industry)",
        ),
    })
    .describe("The company data to create"),
};

export const updateCompanySchema = {
  company_id: z.string().describe("The ID of the company to update"),
  data: z
    .object({
      values: z
        .record(z.any())
        .describe("Key-value pairs of attributes to update"),
    })
    .describe("The company data to update"),
};

export const deleteCompanySchema = {
  company_id: z.string().describe("The ID of the company to delete"),
};

// ===============================
// COMPANIES ACTIONS
// ===============================

export async function searchCompanies(
  args: { query?: any } = {},
): Promise<McpResponse> {
  try {
    const { query = {} } = args;
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        }),
      },
    );

    return createMcpResponse(
      response,
      `Found ${response.data?.length || 0} companies:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "searching companies");
  }
}

export async function getCompany(args: {
  company_id: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${args.company_id}`,
    );
    return createMcpResponse(
      response,
      `Company details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting company");
  }
}

export async function createCompany(args: { data: any }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/objects/companies/records`, {
      method: "POST",
      body: JSON.stringify(args.data),
    });

    return createMcpResponse(
      response,
      `Successfully created new company:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating company");
  }
}

export async function updateCompany(args: {
  company_id: string;
  data: any;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${args.company_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
    );

    return createMcpResponse(
      response,
      `Successfully updated company ${args.company_id}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating company");
  }
}

export async function deleteCompany(args: {
  company_id: string;
}): Promise<McpResponse> {
  try {
    await makeAttioRequest(`/v2/objects/companies/records/${args.company_id}`, {
      method: "DELETE",
    });

    return createMcpResponse(
      null,
      `Successfully deleted company ${args.company_id}`,
    );
  } catch (error) {
    return createErrorResponse(error, "deleting company");
  }
}

// ===============================
// COMPANIES TOOL DEFINITIONS
// ===============================

export const companiesToolDefinitions = {
  search_companies: {
    description:
      "Search for companies in Attio CRM with filtering and sorting options",
    schema: searchCompaniesSchema,
  },
  get_company: {
    description: "Get a specific company by ID with all its data",
    schema: getCompanySchema,
  },
  create_company: {
    description: "Create a new company in Attio CRM",
    schema: createCompanySchema,
  },
  update_company: {
    description: "Update an existing company in Attio CRM",
    schema: updateCompanySchema,
  },
  delete_company: {
    description: "Delete a company by ID",
    schema: deleteCompanySchema,
  },
};

// ===============================
// COMPANIES ACTIONS MAPPING
// ===============================

export const companiesActions = {
  search_companies: searchCompanies,
  get_company: getCompany,
  create_company: createCompany,
  update_company: updateCompany,
  delete_company: deleteCompany,
};
