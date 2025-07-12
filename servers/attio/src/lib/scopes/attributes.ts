import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// ATTRIBUTES SCHEMAS
// ===============================

export const listAttributesSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
};

export const createAttributeSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  data: z
    .object({
      title: z.string().describe("Attribute title"),
      api_slug: z.string().describe("API slug for the attribute"),
      type: z.string().describe("Attribute type"),
      is_required: z
        .boolean()
        .optional()
        .describe("Whether the attribute is required"),
      is_multiselect: z
        .boolean()
        .optional()
        .describe("Whether the attribute allows multiple values"),
      config: z
        .record(z.unknown())
        .optional()
        .describe("Additional configuration"),
    })
    .describe("Attribute data"),
};

export const getAttributeSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
};

export const updateAttributeSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  data: z
    .object({
      title: z.string().optional().describe("Attribute title"),
      is_required: z
        .boolean()
        .optional()
        .describe("Whether the attribute is required"),
      config: z
        .record(z.unknown())
        .optional()
        .describe("Additional configuration"),
    })
    .describe("Attribute data to update"),
};

// Select Options Schemas
export const listSelectOptionsSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
};

export const createSelectOptionSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  data: z
    .object({
      title: z.string().describe("Option title"),
      color: z.string().optional().describe("Option color"),
    })
    .describe("Select option data"),
};

export const updateSelectOptionSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  option: z.string().describe("Option ID"),
  data: z
    .object({
      title: z.string().optional().describe("Option title"),
      color: z.string().optional().describe("Option color"),
    })
    .describe("Select option data to update"),
};

// Status Schemas
export const listStatusesSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
};

export const createStatusSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  data: z
    .object({
      title: z.string().describe("Status title"),
      color: z.string().optional().describe("Status color"),
    })
    .describe("Status data"),
};

export const updateStatusSchema = {
  target: z.string().describe("Target type (objects or lists)"),
  identifier: z.string().describe("Object or list identifier"),
  attribute: z.string().describe("Attribute ID or slug"),
  status: z.string().describe("Status ID"),
  data: z
    .object({
      title: z.string().optional().describe("Status title"),
      color: z.string().optional().describe("Status color"),
    })
    .describe("Status data to update"),
};

// ===============================
// ATTRIBUTES ACTIONS
// ===============================

export async function listAttributes(
  args: {
    target: string;
    identifier: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Attributes for ${args.target}/${args.identifier}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing attributes");
  }
}

export async function createAttribute(
  args: {
    target: string;
    identifier: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created attribute:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating attribute");
  }
}

export async function getAttribute(
  args: {
    target: string;
    identifier: string;
    attribute: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Attribute details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting attribute");
  }
}

export async function updateAttribute(
  args: {
    target: string;
    identifier: string;
    attribute: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated attribute:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating attribute");
  }
}

// Select Options Actions
export async function listSelectOptions(
  args: {
    target: string;
    identifier: string;
    attribute: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}/options`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Select options:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing select options");
  }
}

export async function createSelectOption(
  args: {
    target: string;
    identifier: string;
    attribute: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}/options`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created select option:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating select option");
  }
}

export async function updateSelectOption(
  args: {
    target: string;
    identifier: string;
    attribute: string;
    option: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}/options/${args.option}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated select option:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating select option");
  }
}

// Status Actions
export async function listStatuses(
  args: {
    target: string;
    identifier: string;
    attribute: string;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}/statuses`,
      {},
      context?.authToken,
    );
    return createMcpResponse(
      response,
      `Statuses:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing statuses");
  }
}

export async function createStatus(
  args: {
    target: string;
    identifier: string;
    attribute: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}/statuses`,
      {
        method: "POST",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully created status:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating status");
  }
}

export async function updateStatus(
  args: {
    target: string;
    identifier: string;
    attribute: string;
    status: string;
    data: any;
  },
  context?: { authToken?: string },
): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/${args.target}/${args.identifier}/attributes/${args.attribute}/statuses/${args.status}`,
      {
        method: "PATCH",
        body: JSON.stringify(args.data),
      },
      context?.authToken,
    );

    return createMcpResponse(
      response,
      `Successfully updated status:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating status");
  }
}

// ===============================
// ATTRIBUTES TOOL DEFINITIONS
// ===============================

export const attributesToolDefinitions = {
  list_attributes: {
    description: "List all attributes for a specific object or list",
    schema: listAttributesSchema,
  },
  create_attribute: {
    description: "Create a new attribute on an object or list",
    schema: createAttributeSchema,
  },
  get_attribute: {
    description: "Get information about a specific attribute",
    schema: getAttributeSchema,
  },
  update_attribute: {
    description: "Update an existing attribute",
    schema: updateAttributeSchema,
  },
  list_select_options: {
    description: "List all select options for a select attribute",
    schema: listSelectOptionsSchema,
  },
  create_select_option: {
    description: "Create a new select option for a select attribute",
    schema: createSelectOptionSchema,
  },
  update_select_option: {
    description: "Update an existing select option",
    schema: updateSelectOptionSchema,
  },
  list_statuses: {
    description: "List all statuses for a status attribute",
    schema: listStatusesSchema,
  },
  create_status: {
    description: "Create a new status for a status attribute",
    schema: createStatusSchema,
  },
  update_status: {
    description: "Update an existing status",
    schema: updateStatusSchema,
  },
};

// ===============================
// ATTRIBUTES ACTIONS MAPPING
// ===============================

export const attributesActions = {
  list_attributes: listAttributes,
  create_attribute: createAttribute,
  get_attribute: getAttribute,
  update_attribute: updateAttribute,
  list_select_options: listSelectOptions,
  create_select_option: createSelectOption,
  update_select_option: updateSelectOption,
  list_statuses: listStatuses,
  create_status: createStatus,
  update_status: updateStatus,
};
