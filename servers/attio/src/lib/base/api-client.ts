export interface AttioApiResponse<T = any> {
  data?: T;
  [key: string]: any;
}

export interface McpResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

export async function makeAttioRequest(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string,
): Promise<any> {
  const baseUrl = process.env["ATTIO_API_BASE_URL"] || "https://api.attio.com";

  if (!authToken) {
    throw new Error(
      "Authentication token is required. Please provide a valid Attio API key.",
    );
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Attio API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function createMcpResponse(data: any, message?: string): McpResponse {
  const displayMessage =
    message || `Response:\n\n${JSON.stringify(data, null, 2)}`;
  return {
    content: [
      {
        type: "text",
        text: displayMessage,
      },
    ],
  };
}

export function createErrorResponse(
  error: unknown,
  operation: string,
): McpResponse {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return {
    content: [
      {
        type: "text",
        text: `Error ${operation}: ${errorMessage}`,
      },
    ],
  };
}
