# SRS §8 Acceptance Criteria

All items from the SRS are implemented and verified.

## Security

- [x] The user can set a PIN and lock/unlock the app.
- [x] Financial data is encrypted at rest (AES-GCM), verified in DevTools.
- [x] The app locks after the configured inactivity period (`setTimeout` engine).
- [x] Encrypted backups require the correct password to restore. (Proven by `backup.test.js`).

## Accounts and transactions

- [x] Multiple accounts can be created with opening balances. (Proven by `accounts.test.js`).
- [x] Income and expense entries update the correct account balances. (Proven by `transactions.test.js`).
- [x] Transfers update both accounts without changing income/expense totals. (Proven by `calc.test.js`).
- [x] Transactions can be edited, searched, filtered, and deleted.

## Dashboard and reports

- [x] Today's income, expenses, and net cash flow match saved transactions.
- [x] Combined balance matches the sum of included accounts.
- [x] Charts and monthly reports reflect transaction changes.
- [x] Reconciliation shows the difference between recorded and actual balances.

## Statement imports

- [x] Supported files (bKash/Bank CSV) can be selected and parsed locally.
- [x] Imported records can be reviewed before confirming.
- [x] Potential duplicates and invalid records are reported. (Proven by `importParser.test.js`).
- [x] Cancelled or failed imports create no partial transactions.

## PWA and data protection

- [x] The app can be installed on supported devices.
- [x] Core features work offline after initial caching.
- [x] Records persist across ordinary restarts.
- [x] Backup restore and explicit data deletion behave as documented.

## Test Inventory

| Test file | Coverage |
|---|---|
| `src/services/transactions.test.js` | createIncome, createExpense, createTransfer, update, delete, balance checks |
| `src/services/storage.test.js` | Storage estimate, table counts, byte formatting |
| `src/services/settings.test.js` | Auto-lock get/set, last import account |
| `src/services/importParser.test.js` | CSV parsing, format detection, duplicate detection, fee rows |
| `src/services/export.test.js` | CSV export build |
| `src/services/encryption.test.js` | encrypt/decrypt round-trip, migration |
| `src/services/categories.test.js` | list, get, create, update, duplicate detection |
| `src/services/calc.test.js` | accountBalance, computeBalances, combinedBalance, netCashFlow, expensesByCategory, dailyFlow |
| `src/services/backup.test.js` | createBackupFile, validateEnvelope, readBackupFile, restoreBackup (replace/merge), backup log |
| `src/services/accounts.test.js` | list, get, create, update, setArchived |
| `src/crypto/vault.test.js` | setupVault, unlockVault (valid/invalid PIN), changePin, rewrapDEK, encryptForStorage, decryptFromStorage |
| `src/auth/throttle.test.js` | recordFailure, recordSuccess, getThrottleState, tier escalation |
| `src/lib/money.test.js` | toMinor, fromMinor, parseMoney, formatBDT, formatBDTShort, isMinor |