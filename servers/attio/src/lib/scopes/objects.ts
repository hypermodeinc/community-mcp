import { z } from "zod";
import {
  makeAttioRequest,
  createMcpResponse,
  createErrorResponse,
  McpResponse,
} from "../base/api-client";

// ===============================
// OBJECTS SCHEMAS
// ===============================

export const listObjectsSchema = {};

export const getObjectSchema = {
  object: z
    .string()
    .describe(
      "Object ID or slug (e.g., 'people', 'companies', 'opportunities')",
    ),
};

export const createObjectSchema = {
  data: z
    .object({
      api_slug: z.string().describe("API slug for the object"),
      singular_noun: z.string().describe("Singular noun for the object"),
      plural_noun: z.string().describe("Plural noun for the object"),
      icon: z.string().optional().describe("Icon for the object"),
      is_enabled: z
        .boolean()
        .optional()
        .describe("Whether the object is enabled"),
    })
    .describe("Object data to create"),
};

export const updateObjectSchema = {
  object: z.string().describe("Object ID or slug"),
  data: z
    .object({
      singular_noun: z
        .string()
        .optional()
        .describe("Singular noun for the object"),
      plural_noun: z.string().optional().describe("Plural noun for the object"),
      icon: z.string().optional().describe("Icon for the object"),
      is_enabled: z
        .boolean()
        .optional()
        .describe("Whether the object is enabled"),
    })
    .describe("Object data to update"),
};

export const getObjectAttributesSchema = {
  object: z.string().describe("Object ID or slug"),
};

// ===============================
// OBJECTS ACTIONS
// ===============================

export async function listObjects(): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest("/v2/objects");
    return createMcpResponse(
      response,
      `Objects in workspace:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "listing objects");
  }
}

export async function getObject(args: {
  object: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/objects/${args.object}`);
    return createMcpResponse(
      response,
      `Object details:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting object");
  }
}

export async function createObject(args: { data: any }): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest("/v2/objects", {
      method: "POST",
      body: JSON.stringify(args.data),
    });

    return createMcpResponse(
      response,
      `Successfully created object:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "creating object");
  }
}

export async function updateObject(args: {
  object: string;
  data: any;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(`/v2/objects/${args.object}`, {
      method: "PATCH",
      body: JSON.stringify(args.data),
    });

    return createMcpResponse(
      response,
      `Successfully updated object:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "updating object");
  }
}

export async function getObjectAttributes(args: {
  object: string;
}): Promise<McpResponse> {
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${args.object}/attributes`,
    );
    return createMcpResponse(
      response,
      `Attributes for ${args.object}:\n\n${JSON.stringify(response, null, 2)}`,
    );
  } catch (error) {
    return createErrorResponse(error, "getting object attributes");
  }
}

// ===============================
// OBJECTS TOOL DEFINITIONS
// ===============================

export const objectsToolDefinitions = {
  list_objects: {
    description: "List all objects (both system and custom) in the workspace",
    schema: listObjectsSchema,
  },
  get_object: {
    description: "Get detailed information about a specific object",
    schema: getObjectSchema,
  },
  create_object: {
    description: "Create a new custom object in the workspace",
    schema: createObjectSchema,
  },
  update_object: {
    description: "Update an existing object",
    schema: updateObjectSchema,
  },
  get_object_attributes: {
    description: "List all attributes for a specific object",
    schema: getObjectAttributesSchema,
  },
};

// ===============================
// OBJECTS ACTIONS MAPPING
// ===============================

export const objectsActions = {
  list_objects: listObjects,
  get_object: getObject,
  create_object: createObject,
  update_object: updateObject,
  get_object_attributes: getObjectAttributes,
};
