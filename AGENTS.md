# Workspace Instructions & Memory

## Next.js Conventions

- **Proxy File Convention**:
  - Do NOT use `middleware.ts` or `export function middleware`.
  - Next.js has deprecated the `middleware` file convention in favor of `proxy`.
  - Always use `proxy.ts` (located at the root or `src/`) and export `proxy(...)` (e.g. `export async function proxy(request: NextRequest)`).
  - Config matcher exports remain the same in `proxy.ts` (`export const config = { matcher: [...] }`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
