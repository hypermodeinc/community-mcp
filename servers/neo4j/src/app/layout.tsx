import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neo4j MCP Server",
  description:
    "Model Context Protocol server for Neo4j graph database integration",
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
