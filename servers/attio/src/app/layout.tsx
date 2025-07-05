import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attio MCP Server",
  description: "Model Context Protocol server for Attio CRM integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
