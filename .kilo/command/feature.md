# /feature — Scaffold a new feature

Scaffolds a new feature following the project's architecture conventions.

## Usage

```bash
kilo run /feature <feature-name>
```

## What it does

Creates the standard files for a new feature in the correct locations:
- `src/pages/<Feature>.jsx` — page component wrapped in `<PhoneFrame>`
- `src/services/<feature>.js` — pure service functions
- `src/hooks/use<Feature>.js` — hook wrapping `useLiveQuery`
- `src/components/<Feature>/` — feature-specific components (if needed)
- `src/DTOs/<feature>/` — DTO types (if needed)
- `src/db/<feature>.js` — DB access layer (if needed)
- `<Feature>.test.js` — test file next to source

## Conventions followed

- Functional components only; hooks at top, never conditional
- All writes go through `encryptRecord()`, all reads through `decryptRecord()`
- Amounts in integer minor units (paisa); use `toMinor()`/`fromMinor()`
- CSS variables for theming; no hardcoded colors
- Mobile-first layout with `min-h-dvh`, `env(safe-area-inset-*)`
- Route added in `src/App.jsx` with `RequireAuth` guard
- `resetTestState()` in `beforeEach`; fast KDF preset `{ iterations: 10_000 }`

## Notes

Before running, ensure the feature name is descriptive and camelCase.
After scaffolding, run `kilo run /lint` and `kilo run /test` to verify.