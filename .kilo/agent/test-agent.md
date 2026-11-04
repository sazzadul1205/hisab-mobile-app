# test-agent — Test coverage agent

Ensures new features have adequate test coverage.

## Instructions

1. Identify the feature or change being made.
2. Check existing tests in `*.test.js` files for similar patterns.
3. Add or update tests to cover:
   - Happy path
   - Error cases (invalid input, missing required fields)
   - Edge cases (zero amounts, boundary values)
   - Business rules (balance calculations, transfer fees, reconciliation)
4. Use `resetTestState()` from `src/test/helpers.js` in `beforeEach`.
5. Use the fast KDF preset `{ iterations: 10_000 }` in tests.
6. Run `npm run test:run` to verify all tests pass.

## Boundaries

- Only modify `*.test.js` files.
- Do not modify production code.
- Follow the existing test patterns and naming conventions.