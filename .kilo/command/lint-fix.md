# /lint:fix — Lint and auto-fix

Runs ESLint with `--fix` to automatically correct lint issues.

## Usage

```bash
kilo run /lint:fix
```

## What it does

- Runs `npm run lint:fix`
- Auto-fixes stylistic and some logical issues
- Reports any remaining unfixable issues

## Notes

Review all auto-fixes before committing. Some fixes may change behavior in edge cases.