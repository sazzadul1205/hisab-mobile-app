# /component — Create a shared component

Creates a new shared component in `src/components/`.

## Usage

```bash
kilo run /component <ComponentName>
```

## What it does

- Creates `src/components/<ComponentName>/<ComponentName>.jsx`
- Creates `src/components/<ComponentName>/<ComponentName>.test.jsx`
- Creates `src/components/<ComponentName>/index.js` for re-export

## Conventions followed

- Functional component only; hooks at top, never conditional
- Props destructured with default values where appropriate
- CSS variables for theming; no hardcoded colors
- Mobile-first, accessible markup
- Forwarded `ref` when the component is a leaf interactive element
- Test file uses `@testing-library/react` and `@testing-library/jest-dom`

## Notes

If the component is a form input, use the shared `Input`, `Select`, or `Button` from `src/components/ui/` instead of creating a new one.
If the component needs to access the DB, use a hook from `src/hooks/` instead of importing Dexie directly.