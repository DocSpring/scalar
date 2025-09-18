DocSpring Dev Notes: Improving Scalar Dev UX

Overview

- Our fork optimizes for fast iteration across Scalar’s monorepo by importing packages from `src` during development instead of relying on prebuilt `dist` artifacts.
- The main change enabling this is a scoped Vite alias per package (e.g., `@icons`, `@scalar/api-reference`) so local imports resolve to source files without conflicting with other packages using a generic `@` alias.

Scoped alias helper

- We extended Scalar’s build tooling helper to support a package‑scoped alias:
- File: `docs/scalar/packages/build-tooling/src/helpers.ts`
- Function: `alias(url: string, pkgAlias?: string)`
- Behavior:
  - If `pkgAlias` is provided (e.g., `@icons`), the helper generates:
    - `@icons` → `<pkg>/src`
    - `@icons-test` → `<pkg>/test`
  - If not provided, it falls back to the original behavior:
    - `@` → `<pkg>/src`
    - `@test` → `<pkg>/test`

Example usage

- Icons package (`docs/scalar/packages/icons/vite.config.ts`):
  - Use `alias(import.meta.url, '@icons')` so all internal imports can reference `@icons/...` and resolve to `src`:
  - This removes the need to build dependencies first when iterating on icons.

Why this helps

- Scalar’s dev setup often requires building each package individually because many import from published `dist` outputs. When customizing multiple packages, this slows the feedback loop.
- With scoped aliases, each package can import its own source cleanly (`@package/...`) and avoid cross‑package alias collisions caused by the ubiquitous `@` alias.

Guidelines

- When converting a package to use source imports:
  - Update its `vite.config.ts` to call `alias(import.meta.url, '@<package>')`.
  - Update internal imports to use the scoped alias (e.g., `@icons/hooks`), or add an `src/hooks/index.ts` barrel file if needed.
  - Ensure `tsconfig.json` has the matching `paths` and optional `baseUrl` for editor support.

Docs app (Astro) wiring

- The docs site (Astro) also resolves workspace packages from `src` so you can preview changes without rebuilding packages:
  - `docs/astro.config.mjs` → `vite.resolve.alias` includes mappings such as:
    - `@scalar/api-reference` → `./scalar/packages/api-reference/src`
    - `@scalar/components` → `./scalar/packages/components/src`
    - `@icons` → `./scalar/packages/icons/src`
  - `docs/tsconfig.json` → `compilerOptions.paths` mirrors those aliases for TypeScript tooling:
    - `"@scalar/api-reference": ["scalar/packages/api-reference/src"]`
    - `"@scalar/components": ["scalar/packages/components/src"]`
    - `"@icons": ["scalar/packages/icons/src"]`

With these in place, the docs app imports code directly from package sources, keeping iteration tight while maintaining compatibility with Scalar’s build outputs for release builds.

Notes

- We want to keep changes scoped and reversible. Packages can continue to work with their original `@` alias unless they are migrated to the scoped pattern.
- For consistency, new changes should prefer scoped `@<package>` aliases.
