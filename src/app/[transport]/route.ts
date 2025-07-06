import { createMcpHandler } from "@vercel/mcp-adapter";
import z from "zod";
import { fetchNotionContent } from "@/integrations/notion";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "Notion Fetch",
      "Fetch content from a Notion page or database",
      {
        pageId: z.string().describe("The Notion page or database ID"),
      },
      async ({ pageId }) => {
        const data = await fetchNotionContent(pageId);
        return { content: [
          { type: "text" as const, text: data.title },
          { type: "text" as const, text: data.body }
        ] };
      }
    );
    // Future tools (Google Docs, Wikipedia, Samsung Notes) can be added here
  },
  { capabilities: { tools: {} } }
);

export { handler as POST };