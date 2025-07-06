# AI Research & Content Generation Assistant

This project is an AI-powered assistant designed to aggregate, synthesize, and deliver research content from multiple sources—including Notion, Google Docs, Wikipedia, and Samsung Notes. Built with Next.js and TypeScript, it exposes modular API endpoints for seamless integration with Claude Desktop (MCP) and similar agentic platforms.

---

## Features
- **Modular Integrations:** Easily connect to Notion, Google Docs, Wikipedia, and Samsung Notes.
- **Normalized Content Model:** Unified data structure for all sources.
- **Secure Authentication:** Environment-based credential management.
- **MCP/Claude Desktop Ready:** Exposes endpoints as tools for agentic AI workflows.
- **Extensible Architecture:** Add new integrations with minimal effort.

---

## Getting Started

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd <project-directory>
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root and add your credentials:
```
# Notion
NOTION_API_KEY=your_notion_secret

# (Add Google, Samsung, etc. as needed)
```

### 4. Run Locally
```sh
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

---

## API & Tool Endpoints
Endpoints are exposed for each integration and can be used by Claude Desktop or other MCP-compatible agents.

### Example: Notion Fetch Tool
- **Endpoint:** `/api/[transport]` (POST)
- **Input:**
  ```json
  {
    "tool": "Notion Fetch",
    "input": { "pageId": "YOUR_PAGE_ID" }
  }
  ```
- **Output:**
  ```json
  {
    "content": [
      { "type": "text", "text": "Page Title" },
      { "type": "text", "text": "Page body content..." }
    ]
  }
  ```

---

## Integrations
- **Notion:** Fetches and normalizes page content. Requires sharing the page with your Notion integration and providing the API key.
- **Google Docs, Wikipedia, Samsung Notes:** Modular endpoints to be added following the same pattern.

---

## Security
- All credentials are managed via environment variables and excluded from version control via `.gitignore`.
- Never commit sensitive information to the repository.

---

## Deployment
- Deploy to [Vercel](https://vercel.com/) or your preferred platform.
- Set environment variables in your deployment dashboard.

---

## Contributing
Contributions are welcome! Please open issues or submit pull requests for new integrations, bug fixes, or improvements.

---

## License
This project is licensed under the MIT License.
