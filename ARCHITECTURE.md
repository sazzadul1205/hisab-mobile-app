---

### `ARCHITECTURE.md`

```markdown
# Architecture & Security Design

## 1. The Crypto Vault

We use a two-layer key system to balance high security with fast performance.

1. **Master Key:** Derived from the user's PIN using PBKDF2-SHA256 (600,000 iterations).
2. **Data Encryption Key (DEK):** A random 32-byte key generated on first launch.
3. **The Wrap:** The DEK is encrypted by the Master Key and stored in IndexedDB.
4. **The Records:** All financial records are encrypted with the DEK using AES-GCM.

**Why this design?** Changing a PIN re-wraps the DEK in milliseconds. If we derived the record key directly from the PIN, changing the PIN would require decrypting and re-encrypting the entire database, which is slow and risks data corruption.

## 2. Database Schema (Dexie)

We use a hybrid encryption model in IndexedDB:

- **Plaintext (Indexed):** `id`, `type`, `date`, `accountId`. These are required so Dexie can sort and filter without decrypting the whole database.
- **Ciphertext (`enc`):** `name`, `amount`, `note`, `fee`. Everything sensitive is locked inside `{ iv, ct }`.

## 3. Import Parser

The CSV parser operates completely in memory.

- It uses regex to detect the bank format (bKash, City Bank, Generic).
- It uses a keyword matcher to suggest categories, but requires the user to confirm.
- It uses a signature hash `(date + amount + description)` to detect duplicates and prevent accidental double-imports.

## 4. Backup vs. Export

- **Backup (.hisab):** AES-GCM encrypted JSON file. Password-protected (independent of the PIN). Used for disaster recovery.
- **Export (.csv):** Plaintext CSV of all transactions. Used for analysis in Excel/Sheets.
```
