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
): Promise<any> {
  const baseUrl = process.env["ATTIO_API_BASE_URL"] || "https://api.attio.com";
  const apiKey = process.env["ATTIO_API_KEY"];

  if (!apiKey) {
    throw new Error(
      "ATTIO_API_KEY environment variable is required. Please set it in your .env.local file.",
    );
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
