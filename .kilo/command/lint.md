# /lint — Lint and auto-fix

Runs ESLint across the codebase.

## Usage

```bash
kilo run /lint
```

## What it does

- Runs `npm run lint` to check for issues
- Use `/lint:fix` to auto-fix what can be fixed

## Notes

The ESLint config uses flat config with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.