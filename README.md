# AI Research Content Assistant

A secure, extensible platform for integrating Notion, Google Drive, GitHub, and web search tools—designed for use with Claude Desktop or any agent. Easily connect your own credentials and interact with your data securely via a unified API.

---

## Features
- **Notion Integration:** Fetch, list, and query Notion databases and pages.
- **Google Drive/Docs Integration:** List, search, fetch, and update Google Docs and Drive files.
- **GitHub Integration:** List repositories, fetch README/files.
- **Web Search:** Search the web or company culture via SerpAPI.
- **Security:** API key authentication, rate limiting, CORS, and per-request user credentials.

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/V1997/AI-Research-Content-Assistant.git
cd AI-Research-Content-Assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Your Environment
- **API Key Authentication:**
  - Generate a secret API key (e.g., `my-super-secret-key`).
  - Set it in your Vercel (or local) environment as `ALLOWED_API_KEY`.
- **mcp.json:**
  - Copy and edit the provided `mcp.json`:
```json
{
  "mcpServers": {
    "research-content-assistant": {
      "url": "http://localhost:3000/mcp"
    }
  },
  "userCredentials": {
    "notion": {
      "apiKey": "YOUR_NOTION_API_KEY_HERE"
    },
    "googleDrive": {
      "clientId": "YOUR_GOOGLE_CLIENT_ID_HERE",
      "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET_HERE",
      "refreshToken": "YOUR_GOOGLE_REFRESH_TOKEN_HERE"
    },
    "github": {
      "token": "YOUR_GITHUB_TOKEN_HERE"
    }
  },
  "apiKey": "YOUR_MCP_API_KEY_HERE"
}
```
  - Replace the credential placeholders with your own API keys/tokens.
  - Set `apiKey` to match your `ALLOWED_API_KEY`.

### 4. Start the Development Server
```bash
npm run dev
```
- The server will run at [http://localhost:3000](http://localhost:3000).

### 5. Deploying to Vercel
- Push your code to GitHub.
- Import the repo into [Vercel](https://vercel.com/).
- Set your environment variables (including `ALLOWED_API_KEY`).
- Deploy!

---

## Usage with Claude Desktop (or any agent)
- Configure your agent to point to your MCP server endpoint (e.g., `https://your-vercel-app.vercel.app/mcp`).
- Ensure every API request includes the `x-api-key` header with your API key.
- Provide your own credentials in the request body or via `mcp.json` as needed.

---

## Security
- **API Key Authentication:** All requests must include the correct `x-api-key` header.
- **Rate Limiting:** Each IP is limited to 100 requests per minute.
- **CORS:** Only trusted origins are allowed (customize in `route.ts`).
- **Credential Handling:**
  - Credentials are never logged or stored.
  - Used only for the duration of each request.
  - Always use HTTPS in production.

---

## Contributing
- Fork the repo and create a feature branch.
- Open a pull request with your changes.
- Please write clear commit messages and update documentation as needed.

---

## License
MIT
