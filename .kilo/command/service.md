# /service — Create a service module

Creates a new pure service module in `src/services/`.

## Usage

```bash
kilo run /service <service-name>
```

## What it does

- Creates `src/services/<service-name>.js`
- Creates `<service-name>.test.js`

## Conventions followed

- Services are **pure functions** — no React, no hooks, no side effects
- All DB writes go through `encryptRecord()` from `src/services/encryption.js`
- All DB reads go through `decryptRecord()` from `src/services/encryption.js`
- Amounts in integer minor units (paisa); use `toMinor()`/`fromMinor()` from `src/lib/money.js`
- Use ISO strings for `date` fields (schema sorts on them); never `Date.now()`
- Async crypto work happens **outside** Dexie transactions (crypto yields auto-commit zones early)
- Specific error types; never bare `throw new Error`
- Never log decrypted data, keys, or PINs

## Notes

If the service needs to access the DB, import the db instance from `src/db/db.js`.
If the service needs crypto, import from `src/services/encryption.js` and `src/auth/session.js`.
Run `kilo run /test` after creation.