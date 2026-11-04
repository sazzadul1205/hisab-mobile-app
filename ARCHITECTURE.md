# Architecture & Security Design

## 1. The Crypto Vault

We use a two-layer key system to balance high security with fast performance.

1. **Master Key:** Derived from the user's PIN using PBKDF2-SHA256 (600,000 iterations).
2. **Data Encryption Key (DEK):** A random 32-byte key generated on first launch.
3. **The Wrap:** The DEK is encrypted by the Master Key and stored in IndexedDB.
4. **The Records:** All financial records are encrypted with the DEK using AES-GCM.

**Why this design?** Changing a PIN re-wraps the DEK in milliseconds. If we derived the record key directly from the PIN, changing the PIN would require decrypting and re-encrypting the entire database, which is slow and risks data corruption.

### Unlock flow

```text
PIN → PBKDF2(PIN, salt, 600k) → masterKey
masterKey + wrappedDEK + iv → AES-GCM decrypt → DEK
```

AES-GCM tag verification IS the PIN check. There is no separate plaintext comparison. A wrong PIN produces a tag mismatch → `InvalidPinError`.

### Change PIN

```text
oldPIN → masterKey → unwrap DEK → re-wrap with newPIN's masterKey
```

The DEK itself never changes — encrypted records are never touched.

### No PIN recovery

A lost PIN must not silently bypass encryption. The encrypted backup is the only recovery path.

## 2. Database Schema (Dexie)

We use a hybrid encryption model in IndexedDB:

- **Plaintext (Indexed):** `id`, `type`, `date`, `accountId`, `destinationAccountId`, `categoryId`, `isArchived`, `isDefault`, `reconciliationDate`, `importDate`, `status`. These are required so Dexie can sort and filter without decrypting the whole database.
- **Ciphertext (`enc`):** `name`, `amount`, `note`, `fee`, `openingBalance`, `actualBalance`, `difference`, `fileName`, `reconciliationDate` (full record). Everything sensitive is locked inside `{ iv, ct }`.

### Schema (src/db/db.js)

```js
db.version(1).stores({
    accounts: "id, name, type, isArchived, createdAt",
    transactions: "id, type, accountId, destinationAccountId, categoryId, date, createdAt, [accountId+date], [type+date]",
    categories: "id, name, type, isDefault",
    reconciliationRecords: "id, accountId, reconciliationDate",
    importRecords: "id, accountId, importDate, status",
    appSettings: "key",
});
```

All amounts are stored as integer minor units (paisa). 1 BDT = 100 paisa.

## 3. Import Parser

The CSV parser operates completely in memory.

- It uses regex to detect the bank format (bKash, Bank statement, Generic).
- It uses a keyword matcher to suggest categories, but requires the user to confirm.
- It uses a signature hash `(date-day + direction + amount + description prefix)` to detect duplicates and prevent accidental double-imports.

Adding a new bank = add one entry to `FORMATS` in `src/services/importParser.js`. No changes to the UI or the commit path.

## 4. Backup vs. Export

- **Backup (.hisab):** AES-GCM encrypted JSON file. Password-protected (independent of the PIN). Used for disaster recovery. Format: `hisab-backup` v1.
- **Export (.csv):** Plaintext CSV of all transactions. Used for analysis in Excel/Sheets.

## 5. Session & Auto-Lock

- The decrypted DEK lives in memory only (`src/auth/session.js`). Closing the tab, refreshing, or calling `lock()` drops it.
- Best-effort zeroing on lock: `Uint8Array.fill(0)`.
- Auto-lock uses a single `setTimeout` re-armed on every activity event (mousemove, keydown, touchstart, click, scroll). `visibilitychange` is a safety net for background-throttled timers.
- Throttle tiers (memory-only): 3 fails → 30s, 5 fails → 5min, 10 fails → 30min. Resets on success.

## 6. Route Guard State Machine

```text
booting → no-vault → /welcome (RequireNoVault)
booting → locked  → /unlock (RequireVaultLocked)
booting → unlocked → /dashboard (RequireAuth)
```

`RequireAuth` wraps every financial page. `/` redirects based on auth state.

## 7. Migration

`ensureEncryptedAtRest()` runs on first unlock. Idempotent — skips any row already in encrypted form. Flag stored in `appSettings["encryption-v1-complete"]`.