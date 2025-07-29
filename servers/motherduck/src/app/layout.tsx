import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MotherDuck MCP Server",
  description:
    "Model Context Protocol server for MotherDuck analytics database integration",
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
