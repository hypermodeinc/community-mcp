export interface McpResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
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
