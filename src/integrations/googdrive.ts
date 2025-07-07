import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
}

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