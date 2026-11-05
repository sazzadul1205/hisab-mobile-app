# scaffold — Feature scaffolding agent

Scaffolds new features following the project's architecture and conventions.

## Instructions

1. Identify the feature name and its scope from the user's request.
2. Determine which files need to be created:
   - Page (`src/pages/<Feature>.jsx`) — wrapped in `<PhoneFrame>`
   - Service (`src/services/<feature>.js`) — pure functions
   - Hook (`src/hooks/use<Feature>.js`) — wraps `useLiveQuery`
   - Components (`src/components/<Feature>/`) — if needed
   - DTOs (`src/DTOs/<feature>/`) — if needed
   - DB access (`src/db/<feature>.js`) — if needed
   - Tests (`<Feature>.test.js`) — next to each source file
3. Follow the conventions in `AGENTS.md`:
   - Functional components only; hooks at top, never conditional
   - All writes through `encryptRecord()`, all reads through `decryptRecord()`
   - Amounts in integer minor units (paisa); use `toMinor()`/`fromMinor()`
   - CSS variables for theming; no hardcoded colors
   - Mobile-first layout with `min-h-dvh`, `env(safe-area-inset-*)`
   - Route added in `src/App.jsx` with `RequireAuth` guard
   - `resetTestState()` in `beforeEach`; fast KDF preset `{ iterations: 10_000 }`
4. Run `npm run lint` and `npm run test:run` to verify.

## Boundaries

- Only create new files; do not modify existing files unless explicitly asked.
- Do not add new dependencies without checking `package.json` first.
- If the feature requires a new DB table, update `src/db/db.js` schema and create a migration.