# /money-check — Audit amount handling in changed files

Checks that all monetary values in the given files use integer minor units (paisa).

## Usage

```bash
kilo run /money-check <file-or-directory>
```

## What it does

Scans the specified files for:
- Float literals that look like monetary amounts (e.g., `12.50`, `3.14`)
- `parseFloat()` / `Number()` calls on user input that should use `parseMoney()`
- Arithmetic on amounts that doesn't use `toMinor()` / `fromMinor()`
- `Date.now()` used for `date` fields (should be ISO strings)
- Direct amount formatting that doesn't use `formatBDT()`

## Checks performed

1. No `parseFloat` on monetary input — use `parseMoney()` from `src/lib/money.js`
2. No `toFixed` on amounts — use `formatBDT()` from `src/lib/money.js`
3. All amounts stored in DB are integers (paisa)
4. `date` fields use ISO strings, not `Date.now()`
5. Display components use `formatBDT()` for rendering

## Notes

This is a static check — it cannot verify runtime behavior.
For a full audit of amount handling, use the `/money-auditor` agent.