# Hisab User Manual

## Getting Started

### First Launch

1. Open Hisab in your browser (localhost or HTTPS).
2. Set a 6-digit PIN. Choose something you'll remember — it encrypts all your data.
3. Confirm your PIN.
4. You'll land on the Dashboard.

### Add Your First Account

From the Dashboard, tap **+ Add account**. Choose:
- **Cash** — physical money you hold.
- **Mobile wallet** — bKash, Nagad, Rocket.
- **Bank account** — any bank.
- **Other** — anything else.

Enter the account name and opening balance (what's in it right now).

## Dashboard

The Dashboard shows:
- **Combined balance** — total across all active accounts.
- **Today's income, expenses, and net flow**.
- **Weekly chart** — 7-day income vs. expenses.
- **Expense breakdown** — top categories this month.
- **Recent activity** — last 3 transactions.

Tap the lock icon (top-right) to lock the app. Tap any transaction to view details.

## Accounts

View all accounts with their current balances. Tap **+** to add a new one. Tap an account to see its transaction history, reconcile it, or archive it.

Archived accounts are hidden from the combined balance but their transactions remain.

## Transactions

### Add Income
Tap **Income** from the Dashboard. Enter amount, account, category, date, and optional note.

### Add Expense
Tap **Expense**. The app checks that the account has sufficient balance before saving.

### Add Transfer
Tap **Transfer**. Choose source and destination accounts. A transfer fee (if any) is debited from the source and recorded as an expense.

### Edit or Delete
Tap a transaction, then edit or delete. Edits re-check balance rules.

## Import Statements

1. Go to **Import** from the Dashboard.
2. Select a CSV file from bKash or your bank.
3. Review the parsed rows — duplicates and invalid rows are flagged.
4. Set categories for rows that need them.
5. Confirm to commit.

Supported formats: bKash, bank debit/credit, and generic date/amount CSVs.

## Reports

View monthly reports with charts and category breakdowns. Filter by date range.

## Backup & Restore

### Create Backup
1. Go to **Backup & restore** in Settings.
2. Choose a password (min 8 characters, independent of your PIN).
3. The encrypted `.hisab` file downloads to your device.

### Restore Backup
1. Select the `.hisab` file.
2. Enter the backup password.
3. Choose **Replace** (wipe current data) or **Merge** (add only new records).

## Security

- Your PIN is never stored. It derives a key via PBKDF2 (600,000 iterations).
- All records are encrypted with AES-GCM.
- The app locks after your configured inactivity period.
- Wrong PIN attempts are throttled with escalating delays.
- There is no PIN recovery. If you forget your PIN and don't have a backup, your data is unrecoverable.

## Settings

- **Change PIN** — re-wrap your encryption key with a new PIN.
- **Auto-lock** — set the inactivity timeout.
- **Security** — lock now, view key management info.
- **App Theme** — light, dark, or system.
- **Categories** — manage income and expense categories.
- **Export** — download a plaintext CSV of all transactions.
- **Backup & restore** — encrypted backup files.
- **Storage** — see how much local data is used.
- **Delete all data** — requires PIN re-authentication and typing DELETE to confirm.

## Troubleshooting

**App won't open over HTTP?** Web Crypto requires HTTPS or localhost. Use a tunnel (ngrok, Cloudflare) or open via `http://localhost:5173`.

**Forgot PIN?** Restore from an encrypted backup. There is no other recovery path.

**Data disappeared?** Check Settings > Storage. If you cleared browser data, restore from a backup.

**Import failed?** Ensure the file is a CSV with date and amount columns. Check that the file size is under 10 MB.