import { createMcpHandler } from "@vercel/mcp-adapter";
import z from "zod";
import {
  fetchNotionContent,
  listNotionDatabases,
  listNotionDatabaseEntries,
  queryNotionDatabase,
  fetchNotionPageContent,
  getNotionDatabaseSchema
} from "@/integrations/notion";
import {
  listGoogleDocs,
  searchGoogleDocs,
  fetchGoogleDocMetadata,
  exportGoogleDocAsText,
  listDriveFiles,
  searchDriveFiles,
  getDriveFileMetadata,
  downloadDriveFile,
  createDriveFile,
  updateDriveFile,
  deleteDriveFile,
  listDriveFolders,
  shareDriveFile,
  listDriveFileRevisions
} from "@/integrations/googdrive";

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
    server.tool(
      "Notion List Databases",
      "List available Notion databases for the integration",
      {},
      async () => {
        const databases = await listNotionDatabases();
        return {
          content: databases.map((db) => ({ type: "text" as const, text: `${db.id}: ${db.title}` }))
        };
      }
    );
    server.tool(
      "Notion List Database Entries",
      "List all entries (rows) from a specified Notion database (with pagination)",
      {
        databaseId: z.string().describe("The Notion database ID"),
        cursor: z.string().optional().describe("Pagination cursor (optional)"),
        pageSize: z.number().optional().describe("Page size (optional, default 20)")
      },
      async ({ databaseId, cursor, pageSize }) => {
        const result = await listNotionDatabaseEntries(databaseId, cursor, pageSize);
        if (result.error) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: result.results.map((entry) => ({ type: "text" as const, text: JSON.stringify(entry) })),
          nextCursor: result.nextCursor
        };
      }
    );
    server.tool(
      "Notion Query Database",
      "Query a Notion database with filters, sorting, and limits",
      {
        databaseId: z.string().describe("The Notion database ID"),
        filter: z.any().optional().describe("Filter object (optional)"),
        sort: z.any().optional().describe("Sort array (optional)"),
        pageSize: z.number().optional().describe("Page size (optional, default 20)"),
        cursor: z.string().optional().describe("Pagination cursor (optional)")
      },
      async ({ databaseId, filter, sort, pageSize, cursor }) => {
        const result = await queryNotionDatabase(databaseId, filter, sort, pageSize, cursor);
        if (result.error) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: result.results.map((entry) => ({ type: "text" as const, text: JSON.stringify(entry) })),
          nextCursor: result.nextCursor
        };
      }
    );
    server.tool(
      "Notion Fetch Page Content",
      "Fetch the full content (properties and blocks) of a Notion database row/page",
      {
        pageId: z.string().describe("The Notion page ID")
      },
      async ({ pageId }) => {
        const result = await fetchNotionPageContent(pageId);
        if (result.error) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: [
            { type: "text" as const, text: `Properties: ${JSON.stringify(result.properties)}` },
            { type: "text" as const, text: `Blocks: ${JSON.stringify(result.blocks)}` }
          ]
        };
      }
    );
    server.tool(
      "Notion Get Database Schema",
      "Fetch and display the schema (properties/columns) of a Notion database",
      {
        databaseId: z.string().describe("The Notion database ID")
      },
      async ({ databaseId }) => {
        const result = await getNotionDatabaseSchema(databaseId);
        if (result.error) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: [
            { type: "text" as const, text: `Schema: ${JSON.stringify(result.properties)}` }
          ]
        };
      }
    );
    server.tool(
      "Googdrive List Docs",
      "List all Google Docs in the user's Drive",
      {},
      async () => {
        const result = await listGoogleDocs();
        if ('error' in result) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: result.map((doc) => ({ type: "text" as const, text: `${doc.id}: ${doc.name}` }))
        };
      }
    );
    server.tool(
      "Googdrive Search Docs",
      "Search Google Docs in the user's Drive by name or content",
      {
        query: z.string().describe("The search query string")
      },
      async ({ query }) => {
        const result = await searchGoogleDocs(query);
        if ('error' in result) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: result.map((doc) => ({ type: "text" as const, text: `${doc.id}: ${doc.name}` }))
        };
      }
    );
    server.tool(
      "Googdrive Doc Metadata",
      "Fetch metadata for a specific Google Doc by file ID",
      {
        fileId: z.string().describe("The Google Doc file ID")
      },
      async ({ fileId }) => {
        const result = await fetchGoogleDocMetadata(fileId);
        if ('error' in result) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: [
            { type: "text" as const, text: `ID: ${result.id}` },
            { type: "text" as const, text: `Name: ${result.name}` },
            { type: "text" as const, text: `MimeType: ${result.mimeType}` }
          ]
        };
      }
    );
    server.tool(
      "Googdrive Export Doc As Text",
      "Export the content of a Google Doc as plain text",
      {
        fileId: z.string().describe("The Google Doc file ID")
      },
      async ({ fileId }) => {
        const result = await exportGoogleDocAsText(fileId);
        if ('error' in result) {
          return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        }
        return {
          content: [
            { type: "text" as const, text: result.content }
          ]
        };
      }
    );
    server.tool(
      "Google Drive List Files",
      "List all files or files of a specific type/folder",
      {
        mimeType: z.string().optional().describe("Filter by MIME type (optional)"),
        folderId: z.string().optional().describe("Filter by parent folder ID (optional)"),
        pageSize: z.number().optional().describe("Page size (optional, default 100)")
      },
      async ({ mimeType, folderId, pageSize }) => {
        const result = await listDriveFiles({ mimeType, folderId, pageSize });
        if ('error' in result) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: result.map(f => ({ type: "text" as const, text: `${f.id}: ${f.name} (${f.mimeType})` })) };
      }
    );
    server.tool(
      "Google Drive Search Files",
      "Search files by name/content/metadata",
      { query: z.string().describe("The search query string") },
      async ({ query }) => {
        const result = await searchDriveFiles(query);
        if ('error' in result) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: result.map(f => ({ type: "text" as const, text: `${f.id}: ${f.name} (${f.mimeType})` })) };
      }
    );
    server.tool(
      "Google Drive Get Metadata",
      "Get metadata for a file by ID",
      { fileId: z.string().describe("The file ID") },
      async ({ fileId }) => {
        const result = await getDriveFileMetadata(fileId);
        if (result.error) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
      }
    );
    server.tool(
      "Google Drive Download File",
      "Download or export file content by ID",
      {
        fileId: z.string().describe("The file ID"),
        mimeType: z.string().optional().describe("Export MIME type (for Google Docs/Sheets/Slides, optional)")
      },
      async ({ fileId, mimeType }) => {
        const result = await downloadDriveFile(fileId, mimeType);
        if ('error' in result) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        // For demo, just return a string indicating content was fetched
        return { content: [{ type: "text" as const, text: `File content fetched (length: ${result.content?.length ?? 0})` }] };
      }
    );
    server.tool(
      "Google Drive Create File",
      "Create a new file or folder",
      {
        name: z.string().describe("File or folder name"),
        mimeType: z.string().describe("MIME type (e.g. application/vnd.google-apps.folder for folders)"),
        parents: z.array(z.string()).optional().describe("Parent folder IDs (optional)"),
        content: z.string().optional().describe("File content (for files, not folders, optional)")
      },
      async ({ name, mimeType, parents, content }) => {
        const result = await createDriveFile({ name, mimeType, parents, content });
        if (result.error) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
      }
    );
    server.tool(
      "Google Drive Update File",
      "Rename, move, or update file content",
      {
        fileId: z.string().describe("The file ID"),
        name: z.string().optional().describe("New name (optional)"),
        addParents: z.array(z.string()).optional().describe("Add to parent folder IDs (optional)"),
        removeParents: z.array(z.string()).optional().describe("Remove from parent folder IDs (optional)"),
        content: z.string().optional().describe("New file content (optional)"),
        mimeType: z.string().optional().describe("MIME type for content (optional)")
      },
      async ({ fileId, name, addParents, removeParents, content, mimeType }) => {
        const result = await updateDriveFile(fileId, { name, addParents, removeParents, content, mimeType });
        if (result.error) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
      }
    );
    server.tool(
      "Google Drive Delete File",
      "Delete or trash a file by ID",
      { fileId: z.string().describe("The file ID") },
      async ({ fileId }) => {
        const result = await deleteDriveFile(fileId);
        if ('error' in result) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: [{ type: "text" as const, text: `Success: ${result.success}` }] };
      }
    );
    server.tool(
      "Google Drive List Folders",
      "List all folders",
      {},
      async () => {
        const result = await listDriveFolders();
        if ('error' in result) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: result.map(f => ({ type: "text" as const, text: `${f.id}: ${f.name}` })) };
      }
    );
    server.tool(
      "Google Drive Share File",
      "Set sharing permissions for a file",
      {
        fileId: z.string().describe("The file ID"),
        permissions: z.array(z.object({
          role: z.string().describe("Role (e.g. reader, writer, owner)"),
          type: z.string().describe("Type (user, group, domain, anyone)"),
          emailAddress: z.string().optional().describe("Email address (for user/group type)")
        })).describe("Array of permission objects")
      },
      async ({ fileId, permissions }) => {
        const result = await shareDriveFile(fileId, permissions);
        if (result.error) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
      }
    );
    server.tool(
      "Google Drive List Revisions",
      "List previous versions of a file",
      { fileId: z.string().describe("The file ID") },
      async ({ fileId }) => {
        const result = await listDriveFileRevisions(fileId);
        if (result.error) return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
      }
    );
  },
  { capabilities: { tools: {} } },
  {
    redisUrl: process.env.REDIS_URL,
    sseEndpoint: "/sse",
    streamableHttpEndpoint: "/mcp",
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as POST }; 