# /test — Run tests

Runs the full test suite using Vitest.

## Usage

```bash
kilo run /test
```

## What it does

- Runs `npm run test:run` (Vitest in headless/CI mode)
- Uses `fake-indexeddb` and Web Crypto polyfill
- Exits with non-zero code on any failure

## Notes

Tests live alongside source files (`*.test.js`). See `SRS-ACCEPTANCE.md` for the full test inventory.