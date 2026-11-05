---
description: "Enforce Next.js proxy convention instead of middleware"
---

# Next.js Proxy Convention

- **Deprecated**: `middleware.ts` / `middleware.js` and `export function middleware`.
- **Standard**: Always use `proxy.ts` (or `proxy.js`) located at the project root or inside `src/`.
- Export `proxy` function instead of `middleware`:
  ```typescript
  import { type NextRequest } from "next/server";

  export async function proxy(request: NextRequest) {
    // proxy logic here
  }

  export const config = {
    matcher: [ ... ],
  };
  ```
