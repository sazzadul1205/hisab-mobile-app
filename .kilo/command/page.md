# /page — Create a new page

Creates a new route-level page in `src/pages/` with the standard wrapper stack.

## Usage

```bash
kilo run /page <PageName>
```

## What it does

- Creates `src/pages/<PageName>.jsx`
- Adds the route to `src/App.jsx` with `RequireAuth` guard
- Creates `<PageName>.test.jsx`

## Conventions followed

Every page must wrap its content in this stack:

```jsx
<PhoneFrame>
  <StatusBar />
  <ScrollArea>
    {/* page content */}
  </ScrollArea>
  <BottomNav />
</PhoneFrame>
```

- Functional component only; hooks at top, never conditional
- CSS variables for theming; no hardcoded colors
- Use shared components from `src/components/` — don't re-implement buttons, inputs, list items
- Data access via hooks from `src/hooks/`, never direct Dexie calls
- `resetTestState()` in `beforeEach`; fast KDF preset `{ iterations: 10_000 }`

## Notes

If the page is `/welcome` or `/unlock`, use `RequireNoVault` or `RequireVaultLocked` instead of `RequireAuth`.
Run `kilo run /lint` and `kilo run /test` after creation.