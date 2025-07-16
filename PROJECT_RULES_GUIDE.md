# Project Rules Definition Guide

## Understanding User and Project Rules

User and project rules help maintain consistency, quality, and best practices across your codebase. Here's how to identify and define appropriate rules for your AI Research Content Assistant project.

## 1. Code Style and Formatting Rules

### TypeScript/JavaScript Rules
- **Naming Conventions:**
  - Use camelCase for variables and functions
  - Use PascalCase for classes and React components
  - Use UPPER_SNAKE_CASE for constants
  - Use kebab-case for file names (except React components)

- **Import Organization:**
  - Group imports: React/Next.js first, then external libraries, then internal modules
  - Use absolute imports with path aliases when possible
  - Sort imports alphabetically within groups

### Example ESLint Rule Configuration
```javascript
// Add to eslint.config.mjs
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variableLike",
        "format": ["camelCase"]
      }
    ],
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal"],
        "alphabetize": { "order": "asc" }
      }
    ]
  }
}
```

## 2. API and Integration Rules

### Credential Security Rules
- Never commit API keys or secrets to version control
- Use environment variables for all credentials
- Validate all incoming API requests
- Implement proper error handling for external API calls

### MCP Server Rules
- All endpoints must require API key authentication
- Implement rate limiting (current: 100 requests/minute)
- Use TypeScript interfaces for all API request/response types
- Follow consistent error response format

### Example Implementation Rule
```typescript
// All API handlers must follow this pattern
export async function POST(request: Request) {
  try {
    // 1. Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ALLOWED_API_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // 2. Validate request body
    const body = await request.json();
    // ... validation logic
    
    // 3. Process request
    // ... business logic
    
    // 4. Return consistent response
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## 3. File Organization Rules

### Directory Structure Rules
```
src/
├── app/                    # Next.js App Router pages
├── integrations/          # External service integrations
├── lib/                   # Utility functions and configs
├── types/                 # TypeScript type definitions
└── components/           # Reusable React components
```

### File Naming Rules
- API routes: `route.ts` (Next.js convention)
- Components: `ComponentName.tsx`
- Utilities: `utilityName.ts`
- Types: `typeName.types.ts`
- Tests: `fileName.test.ts`

## 4. Documentation Rules

### Code Documentation
- Add JSDoc comments for all public functions
- Document complex business logic with inline comments
- Maintain up-to-date README.md
- Document API endpoints with examples

### Example Documentation Rule
```typescript
/**
 * Fetches content from a Notion database
 * @param databaseId - The Notion database ID
 * @param credentials - User's Notion API credentials
 * @returns Promise<NotionDatabaseContent>
 * @throws {Error} When database is not accessible
 */
export async function fetchNotionDatabase(
  databaseId: string,
  credentials: NotionCredentials
): Promise<NotionDatabaseContent> {
  // Implementation
}
```

## 5. Testing Rules

### Test Coverage Rules
- All API endpoints must have integration tests
- All utility functions must have unit tests
- Minimum 80% code coverage
- Mock external API calls in tests

### Test File Organization
```
__tests__/
├── integration/          # API endpoint tests
├── unit/                # Function unit tests
└── mocks/               # Mock data and functions
```

## 6. Git and Version Control Rules

### Commit Message Rules
- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep subject line under 50 characters
- Include breaking changes in commit body

### Branch Naming Rules
- `feature/description` for new features
- `fix/description` for bug fixes
- `docs/description` for documentation updates
- `refactor/description` for refactoring

### Example Commit Messages
```
feat(notion): add database query functionality
fix(auth): resolve API key validation issue
docs(readme): update integration setup guide
refactor(types): consolidate API response interfaces
```

## 7. Environment and Configuration Rules

### Environment Variables
- Use `.env.local` for local development
- Document all required environment variables in README
- Use validation for environment variables at startup
- Never expose sensitive data in client-side code

### Required Environment Variables
```
ALLOWED_API_KEY=your-secret-api-key
NOTION_API_KEY=notion_secret_key
GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret
GITHUB_TOKEN=github_personal_access_token
SERPAPI_KEY=serpapi_key
```

## 8. Performance and Security Rules

### Performance Rules
- Implement caching for external API responses
- Use Next.js Image optimization for images
- Minimize bundle size with tree shaking
- Implement pagination for large datasets

### Security Rules
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement CORS properly
- Rate limit all endpoints
- Never log sensitive information

## 9. Deployment Rules

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Security headers configured
- [ ] API documentation updated
- [ ] Performance tested

### Vercel Deployment Rules
- Use environment variables for all secrets
- Configure custom domains with HTTPS
- Set up proper error pages
- Monitor application performance

## 10. Implementation Steps

### Getting Started with Rules
1. **Choose Your Tools:**
   - ESLint for code style
   - Prettier for formatting
   - Husky for git hooks
   - Jest for testing

2. **Create Configuration Files:**
   ```bash
   # Install dependencies
   npm install --save-dev eslint prettier husky jest

   # Create config files
   touch .eslintrc.js .prettierrc commitlint.config.js
   ```

3. **Set Up Git Hooks:**
   ```json
   // package.json
   {
     "husky": {
       "hooks": {
         "pre-commit": "lint-staged",
         "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
       }
     }
   }
   ```

4. **Document Your Rules:**
   - Create `CONTRIBUTING.md` with coding standards
   - Update `README.md` with setup instructions
   - Add inline code documentation

## Next Steps

1. Review your current codebase against these suggestions
2. Prioritize rules based on your team size and project complexity
3. Start with essential rules (formatting, security) and gradually add more
4. Automate rule enforcement where possible
5. Regularly review and update rules as the project evolves

## Project-Specific Recommendations

Based on your AI Research Content Assistant project:

- **Priority 1:** Security rules for API credentials and authentication
- **Priority 2:** TypeScript strict mode and type safety rules
- **Priority 3:** API response consistency and error handling rules
- **Priority 4:** Documentation for integration endpoints
- **Priority 5:** Testing rules for external API integrations

Remember: Rules should enable productivity, not hinder it. Start simple and evolve based on your team's needs and project growth.