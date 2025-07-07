import { Octokit } from "octokit";
import mcpConfig from '../../mcp.json';

/**
 * Get an Octokit instance with the provided token or fallback to env token.
 */
function getOctokit(token?: string) {
  return new Octokit({ auth: token || mcpConfig.userCredentials.github.token });
}

/**
 * List all repositories for a user.
 */
export async function listGithubRepos(username: string, token?: string) {
  const octokit = getOctokit(token);
  const repos = await octokit.rest.repos.listForUser({ username, per_page: 100 });
  return repos.data.map(repo => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    topics: repo.topics,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    updated_at: repo.updated_at,
    html_url: repo.html_url
  }));
}

/**
 * Fetch README content for a repository.
 */
export async function fetchGithubReadme(owner: string, repo: string, token?: string) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.getReadme({ owner, repo });
  // @ts-ignore: data.content and data.encoding are present for file responses
  return Buffer.from(data.content, data.encoding as BufferEncoding).toString();
}

/**
 * Fetch package.json or other key file from a repository.
 */
export async function fetchGithubFile(owner: string, repo: string, path: string, token?: string) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
  if (Array.isArray(data)) throw new Error("Path is a directory");
  if (data.type === "file" && data.content && data.encoding) {
    return Buffer.from(data.content, data.encoding as BufferEncoding).toString();
  } else if (data.type === "symlink" && data.target) {
    return `Symlink to: ${data.target}`;
  } else {
    throw new Error("Unsupported file type or missing content");
  }
} 