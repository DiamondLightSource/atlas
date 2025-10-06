# @atlas/vitest-conf

Shared Vitest configuration and test environment for the **Atlas** monorepo.

This package centralises all testing setup — including Vitest configuration, jsdom environment, and Testing Library matchers — so that individual apps and packages can keep their own configs minimal and consistent.

---

## Features

 - Shared **Vitest** configuration via `vitest.config.ts`
 - Preconfigured **jsdom** environment for React component testing
 - Includes **@testing-library/jest-dom** matchers globally
 - TypeScript definitions for `expect`, `describe`, etc.
 - Central place to update dependencies like `vitest` or `@testing-library/*`

 ---

 ## Usage

 1. add `@atlas/vitest-conf` as a workspace dependency in `apps/my-app/package.json`:
```json
"devDependencies": {
    "@atlas/vitest-conf": "workspace:*"
}
```

 2. Create a `vitest.config.ts` that simply reuses the shared base config:
```ts
// apps/my-app/vitest.config.ts
import { defineConfig } from "vitest/config";
import baseConfig from "@atlas/vitest-conf";

export default defineConfig({
  ...baseConfig,
});
```

 3. Include global type definitions in `apps/my-app/tsconfig.json`:
```json
{
    "compilerOptions": {
        "types": ["@atlas/vitest-conf/global-types"]
    }
}
```

4. Write some tests! Vitest will find tests that match `**/*.test.{ts,tsx}`.