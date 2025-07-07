import { google } from "googleapis";
import mcpConfig from '../../mcp.json';

const CLIENT_ID = mcpConfig.userCredentials.googleDrive.clientId;
const CLIENT_SECRET = mcpConfig.userCredentials.googleDrive.clientSecret;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // Keep as env or add to mcp.json if needed

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: mcpConfig.userCredentials.googleDrive.refreshToken
});

/**
 * List all Google Docs in the user's Drive.
 * @returns Array of { id, name } objects or error
 */
export async function listGoogleDocs(): Promise<Array<{ id: string; name: string }> | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name)',
      pageSize: 100,
    });
    const files = (res.data.files || []).filter(f => f.id && f.name).map(f => ({ id: String(f.id), name: String(f.name) }));
    return files;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Search Google Docs in the user's Drive by name or content.
 * @param query The search query string
 * @returns Array of { id, name } objects or error
 */
export async function searchGoogleDocs(query: string): Promise<Array<{ id: string; name: string }> | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and fullText contains '${query.replace(/'/g, "\\'")}'`,
      fields: 'files(id, name)',
      pageSize: 100,
    });
    const files = (res.data.files || []).filter(f => f.id && f.name).map(f => ({ id: String(f.id), name: String(f.name) }));
    return files;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Fetch metadata for a specific Google Doc by file ID.
 * @param fileId The Google Doc file ID
 * @returns File metadata or error
 */
export async function fetchGoogleDocMetadata(fileId: string): Promise<{ id: string; name: string; mimeType: string } | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType',
    });
    if (res.data.id && res.data.name && res.data.mimeType) {
      return { id: res.data.id, name: res.data.name, mimeType: res.data.mimeType };
    } else {
      return { error: 'File not found or missing metadata.' };
    }
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Export the content of a Google Doc as plain text.
 * @param fileId The Google Doc file ID
 * @returns The plain text content or error
 */
export async function exportGoogleDocAsText(fileId: string): Promise<{ content: string } | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.export({
      fileId,
      mimeType: 'text/plain',
    }, { responseType: 'text' });
    // @ts-ignore
    return { content: res.data };
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * List all files in the user's Drive, optionally filtered by mimeType or parent folder.
 * @param options Optional: { mimeType?: string, folderId?: string, pageSize?: number }
 * @returns Array of { id, name, mimeType, parents } objects or error
 */
export async function listDriveFiles(options?: { mimeType?: string, folderId?: string, pageSize?: number }): Promise<Array<{ id: string; name: string; mimeType: string; parents?: string[] }> | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    let q = [];
    if (options?.mimeType) q.push(`mimeType='${options.mimeType}'`);
    if (options?.folderId) q.push(`'${options.folderId}' in parents`);
    const res = await drive.files.list({
      q: q.length ? q.join(' and ') : undefined,
      fields: 'files(id, name, mimeType, parents)',
      pageSize: options?.pageSize || 100,
    });
    const files = (res.data.files || []).map(f => ({ id: String(f.id), name: String(f.name), mimeType: String(f.mimeType), parents: f.parents ?? undefined }));
    return files;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Search files in Drive by name/content/metadata.
 * @param query The search query string
 * @returns Array of { id, name, mimeType } objects or error
 */
export async function searchDriveFiles(query: string): Promise<Array<{ id: string; name: string; mimeType: string }> | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.list({
      q: `fullText contains '${query.replace(/'/g, "\\'")}'`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
    });
    const files = (res.data.files || []).map(f => ({ id: String(f.id), name: String(f.name), mimeType: String(f.mimeType) }));
    return files;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Get metadata for any file by ID.
 * @param fileId The file ID
 * @returns File metadata or error
 */
export async function getDriveFileMetadata(fileId: string): Promise<any> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.get({
      fileId,
      fields: '*',
    });
    return res.data;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Download or export file content by ID.
 * @param fileId The file ID
 * @param mimeType Optional export mimeType (for Google Docs)
 * @returns File content (Buffer or string) or error
 */
export async function downloadDriveFile(fileId: string, mimeType?: string): Promise<{ content: any } | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    if (mimeType) {
      // Export Google Docs/Sheets/Slides
      const res = await drive.files.export({ fileId, mimeType }, { responseType: 'arraybuffer' });
      return { content: res.data };
    } else {
      // Download binary file
      const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
      return { content: res.data };
    }
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Create a new file or folder in Drive.
 * @param options { name: string, mimeType: string, parents?: string[], content?: Buffer|string }
 * @returns File metadata or error
 */
export async function createDriveFile(options: { name: string; mimeType: string; parents?: string[]; content?: any }): Promise<any> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata: any = {
      name: options.name,
      mimeType: options.mimeType,
      parents: options.parents,
    };
    let media;
    if (options.content) {
      media = { mimeType: options.mimeType, body: options.content };
    }
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: '*',
    });
    return res.data;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Update (rename, move, or update content of) a file.
 * @param fileId The file ID
 * @param options { name?: string, addParents?: string[], removeParents?: string[], content?: Buffer|string, mimeType?: string }
 * @returns File metadata or error
 */
export async function updateDriveFile(fileId: string, options: { name?: string; addParents?: string[]; removeParents?: string[]; content?: any; mimeType?: string }): Promise<any> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const updateMetadata: any = {};
    if (options.name) updateMetadata.name = options.name;
    if (options.addParents) updateMetadata.addParents = options.addParents.join(',');
    if (options.removeParents) updateMetadata.removeParents = options.removeParents.join(',');
    let media;
    if (options.content && options.mimeType) {
      media = { mimeType: options.mimeType, body: options.content };
    }
    const res = await drive.files.update({
      fileId,
      requestBody: updateMetadata,
      media,
      fields: '*',
    });
    return res.data;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Delete or trash a file by ID.
 * @param fileId The file ID
 * @returns Success or error
 */
export async function deleteDriveFile(fileId: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    await drive.files.delete({ fileId });
    return { success: true };
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * List all folders in Drive.
 * @returns Array of { id, name } objects or error
 */
export async function listDriveFolders(): Promise<Array<{ id: string; name: string }> | { error: string }> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: 'files(id, name)',
      pageSize: 100,
    });
    const folders = (res.data.files || []).map(f => ({ id: String(f.id), name: String(f.name) }));
    return folders;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Set sharing permissions for a file.
 * @param fileId The file ID
 * @param permissions Array of permission objects (role, type, emailAddress, etc)
 * @returns Permissions or error
 */
export async function shareDriveFile(fileId: string, permissions: Array<{ role: string; type: string; emailAddress?: string }>): Promise<any> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const results = [];
    for (const perm of permissions) {
      const res = await drive.permissions.create({
        fileId,
        requestBody: perm,
        fields: '*',
      });
      results.push(res.data);
    }
    return results;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * List previous versions (revisions) of a file.
 * @param fileId The file ID
 * @returns Array of revision metadata or error
 */
export async function listDriveFileRevisions(fileId: string): Promise<any> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.revisions.list({ fileId });
    return res.data.revisions;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Copy/clone a Google Doc or Drive file, preserving all formatting and structure.
 * @param fileId The file ID to copy
 * @param name Optional new name for the copy
 * @param parents Optional array of parent folder IDs for the copy
 * @returns Metadata of the new file or error
 */
export async function copyDriveFile(fileId: string, name?: string, parents?: string[]): Promise<any> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const requestBody: any = {};
    if (name) requestBody.name = name;
    if (parents) requestBody.parents = parents;
    const res = await drive.files.copy({
      fileId,
      requestBody,
      fields: '*',
    });
    return res.data;
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}

/**
 * Update (replace) the content of a Google Doc using the Docs API.
 * @param docId The Google Doc document ID
 * @param newContent The new content to insert (plain text for now)
 * @returns Success or error
 */
export async function updateGoogleDocContent(docId: string, newContent: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    // 1. Get the current document to determine the content range
    const doc = await docs.documents.get({ documentId: docId });
    const endIndex = doc.data.body?.content?.slice(-1)[0]?.endIndex || 1;
    // Google Docs API: cannot delete the final newline, so stop before it
    const deleteEndIndex = endIndex > 1 ? endIndex - 1 : 1;
    // 2. Prepare batchUpdate requests: delete all (except final newline), then insert new content
    const requests = [];
    if (deleteEndIndex > 1) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: deleteEndIndex,
          },
        },
      });
    }
    requests.push({
      insertText: {
        location: { index: 1 },
        text: newContent,
      },
    });
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests },
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
} 