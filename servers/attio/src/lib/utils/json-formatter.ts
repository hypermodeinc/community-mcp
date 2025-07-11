export function jsonToText(obj: any, depth: number = 0): string {
  if (obj === null || obj === undefined) {
    return "null";
  }

  const indent = "  ".repeat(depth);
  const bullet = depth > 0 ? "- " : "";

  if (typeof obj === "string") {
    return obj;
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return "(empty array)";
    }

    return obj
      .map((item, index) => {
        const itemText = jsonToText(item, depth + 1);
        return `${indent}${bullet}[${index}] ${itemText}`;
      })
      .join("\n");
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      return "(empty object)";
    }

    return keys
      .map((key) => {
        const value = obj[key];
        const valueText = jsonToText(value, depth + 1);

        // If value is multiline, put it on next line with extra indent
        if (valueText.includes("\n")) {
          return `${indent}${bullet}${key}:\n${valueText}`;
        } else {
          return `${indent}${bullet}${key}: ${valueText}`;
        }
      })
      .join("\n");
  }

  return String(obj);
}

/**
 * Wrap MCP responses to automatically format JSON content
 */
export function formatMcpResponse(response: any): any {
  if (!response || !response.content) {
    return response;
  }

  return {
    ...response,
    content: response.content.map((item: any) => {
      if (item.type === "text" && item.text) {
        // Try to extract and format JSON from the text
        const formatted = formatJsonInText(item.text);
        return {
          ...item,
          text: formatted,
        };
      }
      return item;
    }),
  };
}

/**
 * Format JSON content within text responses
 */
function formatJsonInText(text: string): string {
  // Look for patterns like "Response:\n\n{...}" or just raw JSON
  const jsonPattern = /(\{[\s\S]*\}|\[[\s\S]*\])/;
  const match = text.match(jsonPattern);

  if (match) {
    try {
      const jsonStr = match[1];
      const parsed = JSON.parse(jsonStr);
      const formatted = jsonToText(parsed);

      // Replace the JSON part with formatted text
      return text.replace(jsonPattern, formatted);
    } catch (e) {
      // If parsing fails, return original text
      return text;
    }
  }

  return text;
}
