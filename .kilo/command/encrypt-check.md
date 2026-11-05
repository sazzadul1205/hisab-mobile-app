# /encrypt-check — Audit encryption in changed files

Checks that all DB writes and reads in the given files use the encryption layer.

## Usage

```bash
kilo run /encrypt-check <file-or-directory>
```

## What it does

Scans the specified files for:
- Direct `db.X.add()` / `db.X.put()` / `db.X.update()` calls that bypass `encryptRecord()`
- Direct `db.X.get()` / `db.X.toArray()` / `db.X.where()` calls that bypass `decryptRecord()`
- Crypto calls (Web Crypto API, PBKDF2, AES-GCM) inside Dexie transactions
- Logging of decrypted data, keys, or PINs
- Plaintext financial data (amounts, names, notes) stored outside `enc: { iv, ct }`

## Checks performed

1. Every `db.<table>.add/put/update` must be paired with `encryptRecord`
2. Every `db.<table>.get/getBulk/toArray/where` must be paired with `decryptRecord`
3. No `crypto.subtle` calls inside `db.transaction()`
4. No `console.log` of records, keys, or PINs
5. Index fields only (`id`, `type`, `date`, `accountId`, etc.) are plaintext; everything else in `enc`

## Notes

This is a static check — it cannot verify runtime behavior.
For a full security audit, use the `/security` agent.