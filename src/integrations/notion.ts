import { Client } from "@notionhq/client";
import { NormalizedContent } from "./contentModel";
import mcpConfig from '../../mcp.json';

const notion = new Client({ auth: mcpConfig.userCredentials.notion.apiKey });

/**
 * Fetches and normalizes content from a Notion page.
 * @param pageId The Notion page ID
 * @returns NormalizedContent object
 */
export async function fetchNotionContent(pageId: string): Promise<NormalizedContent> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    let title = "Untitled";
    if ("properties" in page) {
      const prop = Object.values(page.properties).find((p: any) => p.type === "title");
      if (prop && prop.type === "title" && prop.title.length > 0) {
        title = prop.title.map((t: any) => t.plain_text).join("");
      }
    }
    let body = "";
    try {
      const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 20 });
      body = blocks.results
        .map((block: any) => {
          if (block.type === "paragraph" && block.paragraph.rich_text.length > 0) {
            return block.paragraph.rich_text.map((t: any) => t.plain_text).join("");
          }
          return "";
        })
        .filter(Boolean)
        .join("\n");
    } catch (e) {
      body = "(Unable to fetch page content blocks)";
    }
    return {
      title,
      body,
      source: "notion",
      metadata: { pageId },
    };
  } catch (error: any) {
    return {
      title: "Error fetching Notion page",
      body: error.message || String(error),
      source: "notion",
      metadata: { pageId },
    };
  }
}

/**
 * Lists available Notion databases for the integration.
 * @returns Array of { id, title }
 */
export async function listNotionDatabases(): Promise<Array<{ id: string; title: string }>> {
  const results: Array<{ id: string; title: string }> = [];
  try {
    const response = await notion.search({ filter: { property: "object", value: "database" }, page_size: 20 });
    for (const db of response.results) {
      let title = "Untitled";
      if ("title" in db && Array.isArray(db.title) && db.title.length > 0) {
        title = db.title.map((t: any) => t.plain_text).join("");
      }
      results.push({ id: db.id, title });
    }
  } catch (error) {
    // Optionally handle error or return empty list
  }
  return results;
}

/**
 * List all entries (rows) from a specified Notion database.
 * Supports pagination via cursor and pageSize.
 * @param databaseId The Notion database ID
 * @param cursor Optional pagination cursor
 * @param pageSize Optional page size (default 20)
 * @returns Array of page objects or error
 * @example
 *   const entries = await listNotionDatabaseEntries('db_id');
 */
export async function listNotionDatabaseEntries(databaseId: string, cursor?: string, pageSize: number = 20): Promise<{ results: any[]; nextCursor?: string; error?: string }> {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: pageSize,
    });
    return { results: response.results, nextCursor: response.has_more && response.next_cursor ? response.next_cursor : undefined };
  } catch (error: any) {
    return { results: [], error: error.message || String(error) };
  }
}

/**
 * Query a Notion database with filters, sorting, and limiting results.
 * @param databaseId The Notion database ID
 * @param filter Optional filter object
 * @param sort Optional array of sort objects
 * @param pageSize Optional page size
 * @param cursor Optional pagination cursor
 * @returns Array of page objects or error
 * @example
 *   const filtered = await queryNotionDatabase('db_id', { property: 'Status', select: { equals: 'Done' } }, [{ property: 'Created', direction: 'descending' }], 10);
 */
export async function queryNotionDatabase(databaseId: string, filter?: any, sort?: any[], pageSize: number = 20, cursor?: string): Promise<{ results: any[]; nextCursor?: string; error?: string }> {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts: sort,
      page_size: pageSize,
      start_cursor: cursor,
    });
    return { results: response.results, nextCursor: response.has_more && response.next_cursor ? response.next_cursor : undefined };
  } catch (error: any) {
    return { results: [], error: error.message || String(error) };
  }
}

/**
 * Fetch the full content of a specific row (page) in a Notion database.
 * Returns all properties and rich content blocks.
 * @param pageId The Notion page ID
 * @returns Object with properties and blocks or error
 * @example
 *   const page = await fetchNotionPageContent('page_id');
 */
export async function fetchNotionPageContent(pageId: string): Promise<{ properties?: any; blocks?: any[]; error?: string }> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    let blocks: any[] = [];
    try {
      const blockResp = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
      blocks = blockResp.results;
    } catch (e) {
      // Ignore block fetch error
    }
    // Only return properties if they exist
    const properties = 'properties' in page ? page.properties : undefined;
    return { properties, blocks };
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Fetch and display the schema (properties/columns) of a Notion database.
 * @param databaseId The Notion database ID
 * @returns Properties object or error
 * @example
 *   const schema = await getNotionDatabaseSchema('db_id');
 */
export async function getNotionDatabaseSchema(databaseId: string): Promise<{ properties?: any; error?: string }> {
  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    // Only return properties if they exist
    const properties = 'properties' in db ? db.properties : undefined;
    return { properties };
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
} 