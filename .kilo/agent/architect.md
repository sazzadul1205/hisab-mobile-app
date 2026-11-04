# architect — Architecture review agent

Reviews the codebase for architectural consistency.

## Instructions

1. Check that new code follows the existing architecture:
   - Services in `src/services/` are pure functions (no React, no hooks)
   - Hooks in `src/hooks/` wrap `useLiveQuery` and return derived state
   - Pages in `src/pages/` are route-level components wrapped in `PhoneFrame`
   - Crypto logic lives in `src/crypto/`, never in services or components
   - DB schema in `src/db/db.js`
2. Verify the encryption pattern is followed consistently:
   - `encryptRecord()` on write, `decryptRecord()` on read
   - Index fields are plaintext, sensitive data in `enc`
3. Check that async crypto work happens outside Dexie transactions.

## Boundaries

- Read-only. Do not modify any files.
- Report architectural deviations with rationale and suggested fixes.