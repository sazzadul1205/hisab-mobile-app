# Hisab v1.2 — Product, Design & Implementation Plan

<aside>
📌

**Document status:** Proposed implementation specification — review before coding
**Target release:** v1.2, building on the current v1.1 product
**Product:** Hisab — private, local-first personal finance and bookkeeping PWA
**Repository:** [sazzadul1205/hisab-mobile-app](https://github.com/sazzadul1205/hisab-mobile-app)
**Related requirements:** [Personal Finance & Bookkeeping App: SRS](https://app.notion.com/p/Personal-Finance-Bookkeeping-App-SRS-408da91f30b2802b92f4cf2be6eca3fa?pvs=21)
**Audience:** Product owner, human developers, code-generation agents, reviewers and testers

</aside>

## 1. How to use this document

This is the shared implementation contract for v1.2. A human developer, DeepSeek, Kilo Code or another coding agent should be able to understand the product goal, design the work, implement it in small batches and verify the result without inventing requirements.

### Rules for every implementer

1. Read the repository's `README.md`, `ARCHITECTURE.md`, `PWA.md`, `SRS-ACCEPTANCE.md`, `CHANGELOG.md`, package manifest, existing tests and any project instruction files such as `AGENTS.md`, `Agent.md` or equivalent before changing code.
2. Treat the current source code as the implementation truth. This document describes intended v1.2 behavior; it does not authorize rewriting working modules unnecessarily.
3. Keep the application local-first and usable offline. Do not introduce a backend, account registration, cloud database, cloud backup, remote financial integration, analytics transmission or external AI service.
4. Use the repository's existing JavaScript stack and conventions. Do not convert the project to TypeScript.
5. Reuse existing services, calculation helpers, storage abstractions, UI components and design tokens where suitable. Do not create duplicate abstractions just to follow a preferred architecture.
6. Before changing the data schema, inspect the current schema, migrations/versioning strategy, encryption boundary and backup format. Propose the smallest safe migration and test it against existing user data.
7. Keep financial arithmetic exact. Continue using integer minor units (paisa) or the established exact-money representation. Never introduce floating-point arithmetic for stored money or totals.
8. Never log PINs, encryption keys, backup passwords, transaction notes or financial records.
9. Implement and test one feature slice at a time. Do not combine unrelated refactors with feature work.
10. Update user-facing help, technical documentation, acceptance tests and changelog when behavior changes.
11. Do not mark a feature complete because the UI exists. It is complete only when persistence, validation, calculations, offline behavior, accessibility and tests work.
12. If the repository conflicts with this document, stop and report the exact conflict. Do not silently delete or replace existing behavior.

### Requirement labels

- **Existing:** already described or present in the current product/codebase; preserve it.
- **Planned:** proposed v1.2 enhancement; implement only within the agreed scope.
- **Design decision:** recommended behavior for v1.2; confirm against the current code before implementation.
- **Open question:** needs product-owner confirmation before an irreversible or schema-impacting choice.

## 2. Product vision and release goals

Hisab helps one person record, organize and understand their money across cash, bKash, Nagad and bank accounts without depending on a remote service.

v1.2 should make the existing bookkeeping experience more useful for everyday planning. It should improve budgeting, repeat-entry convenience, savings tracking, history navigation, reports, backup confidence and offline usability while preserving the privacy model.

### v1.2 outcomes

- Users can set monthly spending budgets and understand how much remains.
- Users can create recurring transaction templates and use them to create entries without duplicate or surprise transactions.
- Users can track savings goals using existing account and transaction data.
- Users can search and filter transaction history more effectively.
- Users can view useful yearly summaries based on actual saved records.
- Users can compare account balances and understand the combined position.
- Users can inspect a backup before restoring it and run a local data-integrity check.
- The reminder experience is useful without Firebase or another remote service.
- The app remains installable, offline-capable and private.

### Non-goals

The following are explicitly excluded from v1.2:

- Backend/API/server or user accounts.
- Cloud synchronization or multi-device synchronization.
- Online bank, bKash or Nagad API access.
- Automatic payment initiation or money movement.
- Cloud backup, remote file storage or remote notifications.
- AI categorization that sends records to a remote model.
- Multi-user/shared household accounts.
- Investment, loan, tax or portfolio management.
- Currency conversion or multi-currency support; BDT remains the product currency.
- Replacing the existing storage or encryption architecture without a separate approved design.
- A large visual redesign unrelated to the features in this specification.

Internet may be needed to initially install the PWA or receive a future application update. Normal bookkeeping, reports, budgets, goals, reminders and local backup operations must not require a network connection.

## 3. Current product baseline

The repository documentation and inspected service/page files indicate that the product already has the following foundation. Confirm each item against the current branch before modifying it.

| Area           | Existing baseline                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Platform       | React + Vite installable PWA                                                                                                    |
| Privacy        | Local-first; no user account or cloud data workflow                                                                             |
| Security       | PIN-based access, encryption/key derivation documentation and auto-lock settings                                                |
| Accounts       | Cash, bKash, Nagad and bank-style accounts                                                                                      |
| Ledger         | Income, expense and internal transfer                                                                                           |
| Categories     | Income and expense categories                                                                                                   |
| Reports        | Dashboard, monthly/reporting summaries and category breakdowns                                                                  |
| Imports        | Local CSV parsing, supported-format handling and duplicate detection                                                            |
| Exports        | CSV export with formula-injection mitigation                                                                                    |
| Backup         | Encrypted backup and restore                                                                                                    |
| Reconciliation | Recorded balance compared with actual balance                                                                                   |
| Calculations   | Pure calculation helpers and integer minor-unit money handling                                                                  |
| Storage        | Local storage abstraction with storage estimates/counts                                                                         |
| Reminders      | Settings exist, but the Reminders page currently appears to be a placeholder awaiting removal of Firebase-dependent assumptions |

### Important baseline checks

- The current repository metadata/changelog inspected during planning appeared to report version **1.0.1**, while this request treats the current product as **v1.1**. Resolve the actual release/version state from the active branch before changing the version. Do not overwrite version history based only on this document.
- The SRS page in Notion is an earlier v1.0 requirements baseline. This v1.2 document extends it; it does not silently rewrite the original SRS.
- The existing reminder placeholder and any Firebase package/configuration references need a focused dependency audit. Remove unused Firebase dependencies only after confirming no current feature requires them. Do not replace one cloud dependency with another.
- Account opening-balance edits need review: changing an opening balance after transactions exist can alter historical derived balances. v1.2 should prevent accidental history distortion.

## 4. Navigation and information architecture

Preserve the current navigation where possible. Add features as clear sections or screens rather than rebuilding the whole application.

### Suggested information architecture

- **Dashboard**
  - Combined balance
  - Account summary
  - Current-month income and expenses
  - Budget progress
  - Recent transactions
  - Savings-goal progress
- **Transactions**
  - All transactions
  - Search and filters
  - Transaction details
  - Add income / expense / transfer
- **Budgets**
  - Current month
  - Budget list by category
  - Budget history
- **Recurring**
  - Recurring templates
  - Due/overdue templates
  - Create transaction from template
- **Goals**
  - Savings goals
  - Goal details and progress
- **Reports**
  - Monthly reports
  - Yearly report
  - Account comparison
- **Accounts**
  - Account list and details
  - Reconciliation
- **Tools / Settings**
  - Import / export
  - Backup / restore
  - Data integrity check
  - Local reminders
  - Security and app settings

This is a logical grouping, not a mandate to create all-new routes. Fit it to the existing router and mobile navigation patterns.

## 5. Feature specifications

## 5.1 Monthly category budgets

**Priority:** P0 — core v1.2

### Purpose

Allow the user to set a monthly spending limit for an expense category and see actual spending compared with that limit.

### User stories

- As a user, I can set a monthly budget for Food, Transport or another expense category.
- I can see how much I have spent and how much remains.
- I can see when spending reaches or exceeds the budget.
- I can review past months without changing their historical transactions.

### Functional requirements

1. A budget belongs to one expense category and one calendar month.
2. Amounts are stored using the app's exact money representation.
3. The user can create, edit and delete a budget.
4. The user can view all budgets for the selected month.
5. Actual spending is calculated from saved expense transactions in the selected month and category.
6. Transfer principal is not counted as spending. Transfer fees follow the existing rule and count as expenses.
7. Income transactions are never included in an expense budget.
8. Editing or deleting a transaction updates budget actuals automatically because actuals are derived from the ledger.
9. A budget can be lower than, equal to or higher than the user's current spending.
10. A budget is a planning limit, not a hard spending restriction. The app must not block a transaction because a budget is exceeded.
11. The user can set a budget to zero only if the product explicitly supports a zero-limit warning; otherwise require a positive amount.
12. Deleting or renaming a category must not silently corrupt budget history. Use the existing category deletion policy or require a safe resolution.

### Recommended budget model

Use the existing persistence conventions. A logical model could contain:

| Field       | Meaning                   |
| ----------- | ------------------------- |
| id          | Stable local identifier   |
| categoryId  | Expense category          |
| month       | Month key such as YYYY-MM |
| limitAmount | Integer minor units       |
| createdAt   | Creation timestamp        |
| updatedAt   | Last update timestamp     |

A unique constraint or equivalent validation should prevent duplicate budgets for the same category and month.

### Calculation

- **Actual spent:** sum of eligible expense amounts for the category in the selected month.
- **Remaining:** budget limit minus actual spent.
- **Usage percentage:** actual spent divided by limit, multiplied by 100.
- When limit is zero, do not divide by zero; show a clear “No budget set” or “Zero limit” state according to the chosen UI rule.

Use a consistent date-boundary convention with the existing transaction date handling and the user's local calendar.

### UI requirements

- Month selector with previous/next month navigation.
- Budget cards or rows with category, limit, spent, remaining and progress indicator.
- Distinct but accessible states: under budget, near limit, over budget.
- Add/edit budget form with category selector and amount.
- Empty state explaining how to add the first budget.
- Do not rely on color alone to communicate status.

### Acceptance criteria

- [ ] User can create one budget for a category/month.
- [ ] Duplicate category/month budgets are prevented.
- [ ] Actuals match the ledger for the selected month.
- [ ] Editing/deleting transactions recalculates actuals.
- [ ] Transfers are excluded except for transfer fees represented as expenses.
- [ ] Month navigation shows the correct historical period.
- [ ] Exceeding a budget never blocks a transaction.
- [ ] Budgets persist across app restarts and work offline.

## 5.2 Recurring transaction templates

**Priority:** P0 — core v1.2

### Purpose

Reduce repeated manual entry for salary, rent, subscriptions, bills and other predictable transactions without creating automatic financial entries the user did not approve.

### Important product rule

**A recurring template must not silently create a financial transaction.** In v1.2, recurring schedules generate a due reminder or a draft/prompt. The user explicitly confirms each transaction before it is saved.

### User stories

- As a user, I can save a recurring transaction setup once.
- I can choose its frequency and next due date.
- When it becomes due, I can review and create the transaction.
- I can skip, pause, edit or archive the template.

### Supported transaction types

- Income
- Expense

Internal transfers are excluded from the first iteration unless the current transaction model makes them equally safe and simple. Do not add transfer recurrence by default.

### Template fields

| Field                 | Meaning                                                      |
| --------------------- | ------------------------------------------------------------ |
| id                    | Stable local identifier                                      |
| type                  | Income or expense                                            |
| title                 | Human-readable label, e.g. Salary or Rent                    |
| amount                | Suggested amount in minor units                              |
| accountId             | Destination account for income or source account for expense |
| categoryId            | Relevant category                                            |
| note                  | Optional default note                                        |
| frequency             | Weekly, monthly or yearly                                    |
| interval              | Optional repeat interval if needed                           |
| startDate             | First schedule date                                          |
| nextDueDate           | Next scheduled occurrence                                    |
| endDate               | Optional final date                                          |
| isPaused              | Whether schedule is paused                                   |
| createdAt / updatedAt | Audit timestamps                                             |

Do not add fields that duplicate data already represented in the existing model unless required.

### Schedule behavior

- Weekly: advance by seven calendar days.
- Monthly: preserve the intended day where possible; if a month has fewer days, use the last valid day of that month. The following month should return to the original intended day where possible.
- Yearly: handle leap-year dates predictably.
- Use local calendar dates for schedule dates; do not introduce timezone drift by treating date-only values as arbitrary UTC instants.
- A missed due date remains visible as due/overdue; it does not create a backlog of transactions automatically.
- When a user confirms a due item, create exactly one transaction and advance the template's next due date.
- Confirmation must be idempotent: repeated taps or retries must not create duplicate transactions.
- If the user cancels the confirmation, no transaction is created and the template remains due.
- Skipping an occurrence advances the schedule without creating a transaction.
- Pausing prevents new due prompts but does not delete historical transactions.
- Editing a template affects future suggested entries only, not transactions already created.
- Deleting/archiving a template does not delete transactions previously created from it.

### Duplicate protection

Use a stable occurrence identifier derived from the template ID and scheduled occurrence date, or an equivalent local mechanism. Store a link/reference on the created transaction if the current schema permits it. A single occurrence must not be created twice even if the UI is submitted more than once.

### UI requirements

- List templates with type, amount, account, frequency and next due date.
- Show due/overdue state.
- Provide “Create transaction”, “Skip this occurrence”, “Pause/Resume”, “Edit” and “Archive”.
- Confirmation screen must show the full transaction details before saving.
- Provide a clear empty state.

### Acceptance criteria

- [ ] User can create, edit, pause, resume and archive a template.
- [ ] Weekly, monthly and yearly date calculations pass boundary tests.
- [ ] No transaction is created without user confirmation.
- [ ] Confirming the same occurrence twice creates only one transaction.
- [ ] Skipping advances the schedule without creating a transaction.
- [ ] Editing a template does not mutate previously saved transactions.
- [ ] All functionality works offline.

## 5.3 Savings goals

**Priority:** P1 — planned v1.2

### Purpose

Help users track progress toward a target such as a laptop, emergency fund or travel budget.

### Product rule

A goal is a planning and progress feature. It must not create a new bank account, move money, reserve money or change any account balance.

### User stories

- I can create a goal with a name, target amount and target date.
- I can choose how progress is calculated.
- I can see the remaining amount and progress percentage.
- I can pause, complete or archive a goal.

### Recommended progress model

For the first implementation, use **manual progress contributions** recorded as goal-only records, not as financial transactions. This avoids pretending that money has been moved or reserved.

An optional future enhancement may allow a goal to be associated with an account and calculate progress from that account's balance. Do not implement that association unless its semantics are clearly explained and tested.

### Suggested goal fields

| Field                 | Meaning                                |
| --------------------- | -------------------------------------- |
| id                    | Stable identifier                      |
| name                  | Goal title                             |
| targetAmount          | Target in minor units                  |
| targetDate            | Optional target date                   |
| savedAmount           | Derived from goal contribution records |
| status                | Active, paused, completed or archived  |
| createdAt / updatedAt | Timestamps                             |

Goal contribution fields may include id, goalId, amount, date and optional note.

### Rules

- Contributions must be positive.
- Contributions cannot silently modify account balances.
- Progress cannot be negative.
- Progress may exceed 100%; show completed/over-target clearly rather than truncating the actual value.
- Editing a target amount recalculates progress percentage but does not rewrite contributions.
- Deleting a goal must require confirmation and must follow a clear policy for its contribution history.
- A goal marked complete remains readable.

### Acceptance criteria

- [ ] User can create and edit a goal.
- [ ] User can add and remove a contribution with confirmation.
- [ ] Goal progress is calculated correctly.
- [ ] Goal activity never changes ledger or account balances.
- [ ] Paused/completed/archived states are distinguishable.
- [ ] Goal data persists offline.

## 5.4 Advanced transaction search and filters

**Priority:** P0 — core v1.2

### Purpose

Make it easier to find a transaction in a growing ledger.

### Requirements

Support combining filters:

- Free-text search across note/description and other safe searchable transaction text.
- Transaction type: income, expense or transfer.
- Date range: today, this week, this month, previous month, custom range.
- Account: source or destination as appropriate.
- Category.
- Minimum and maximum amount.
- Sort by newest, oldest, highest amount and lowest amount.

### Rules

- Filters combine with AND semantics unless the UI explicitly groups alternatives within one filter.
- Search must not transmit text to a server.
- Filtering must not change stored records.
- Clearing filters restores the full transaction list.
- Empty results must explain that no matching transactions were found and provide a clear reset action.
- Date range boundaries must be inclusive and consistent with existing transaction date semantics.
- Transfer filters should match either source or destination account when the user selects an account.

### UI requirements

- Keep common filters accessible on mobile.
- Use a filter sheet/drawer or a compact filter panel consistent with existing UI.
- Show active filter chips or a concise active-filter summary.
- Provide “Clear all”.
- Preserve filters while navigating to transaction details and back when practical.

### Acceptance criteria

- [ ] Search and filters can be combined.
- [ ] Source/destination account filtering works for transfers.
- [ ] Amount and date boundaries work correctly.
- [ ] Sorting is deterministic when two records share the same date/amount.
- [ ] Reset restores the unfiltered list.
- [ ] Search and filtering work offline.

## 5.5 Yearly financial report

**Priority:** P1 — planned v1.2

### Purpose

Provide a clear annual view of money received, spent and retained.

### Report content

- Total income for selected year.
- Total expenses for selected year.
- Net cash flow.
- Month-by-month income and expense.
- Top expense categories.
- Account balance snapshot/current balance context, clearly labeled.
- Optional comparison with the previous year only when enough data exists.

### Calculation rules

- Derive every value from saved transactions and existing calculation helpers.
- Transfers are not income or expense; transfer fees count as expenses under the existing ledger rule.
- Do not include archived-account balances in combined active balance if the existing calculator excludes them; make inclusion rules visible.
- A year with no transactions must show a valid empty state and zero totals.
- Use the user's local calendar year and existing date semantics.
- Never show sample/demo numbers in a real report.

### UI requirements

- Year selector.
- Summary cards for income, expenses and net cash flow.
- Readable monthly chart.
- Category breakdown.
- Export/print can be considered later; do not add remote reporting services.

### Acceptance criteria

- [ ] Annual totals match the sum of monthly totals.
- [ ] Monthly totals match transaction-level data.
- [ ] Transfer principal is excluded.
- [ ] Transfer fees are included as expenses.
- [ ] Empty years render correctly.
- [ ] Changing a transaction updates the report.

## 5.6 Account comparison and balance overview

**Priority:** P1 — planned v1.2

### Purpose

Help the user understand where their money is held without changing existing account behavior.

### Requirements

- Display each active account's calculated balance.
- Display combined active-account balance.
- Show each account's share of the combined balance only when the combined total makes the percentage meaningful.
- Allow viewing archived accounts separately.
- Show account type and last relevant activity when available.
- Clearly distinguish calculated balance from an externally verified balance.
- Link to the existing reconciliation workflow.

### Rules

- Reuse existing balance calculation helpers.
- Do not count archived accounts in the active combined total if that is the existing behavior.
- Do not infer actual bank/wallet balances from local records.
- Avoid misleading percentages when total balance is zero or negative.
- Do not introduce transfers or account linking.

### Acceptance criteria

- [ ] Each account balance matches ledger calculation.
- [ ] Combined balance matches the existing combined-balance function.
- [ ] Archived accounts are clearly separated.
- [ ] Reconciliation status is not presented as live provider data.
- [ ] Account comparison works offline.

## 5.7 Backup restore preview and safety

**Priority:** P0 — reliability requirement

### Purpose

Make restore safer by showing what the selected backup contains before it changes local data.

### Requirements

Before restore, show a preview based on successfully decrypted and validated backup metadata:

- Backup format/version.
- Export/backup creation date, if available.
- Counts of accounts, transactions, categories and other supported record types.
- Whether the backup appears compatible with the current app version.
- Whether restore will replace existing local data, merge data or use another explicit strategy.

### Restore strategy

The current restore behavior must be inspected before deciding whether v1.2 keeps replace-only restore or adds merge. Do not introduce merge unless stable ID collision rules, duplicate detection, transaction relationships and rollback behavior are fully designed.

**Recommended v1.2 default:** keep the existing safe restore strategy and add a preview plus a strong final confirmation. Do not silently change the restore strategy.

### Safety rules

- Decrypt and validate before modifying current data.
- Wrong password, malformed data, unsupported version or failed validation must leave existing data unchanged.
- Use a transactional or staged restore strategy so failure cannot leave partially replaced records.
- Clearly warn the user if current local data will be replaced.
- Never display sensitive financial notes in a generic preview.
- Do not upload the backup or its metadata.

### Acceptance criteria

- [ ] Preview is shown before restore is committed.
- [ ] Wrong password leaves local data unchanged.
- [ ] Corrupt or unsupported backup leaves local data unchanged.
- [ ] User must explicitly confirm destructive replacement.
- [ ] Restore failure cannot leave partial data.
- [ ] Existing backup compatibility is tested.

## 5.8 Local data integrity checker

**Priority:** P0 — reliability requirement

### Purpose

Give users a local diagnostic tool to identify inconsistent records without sending any data away.

### Checks to consider

- Required fields missing.
- Invalid or non-integer money values.
- Transactions referencing missing accounts.
- Transactions referencing missing or incompatible categories.
- Transfer missing a destination account or referencing the same account as source.
- Invalid transfer fee or amount.
- Duplicate IDs.
- Duplicate recurring occurrence references, once recurring transactions exist.
- Orphaned goal contributions.
- Budgets referencing deleted or invalid categories.
- Invalid date values.
- Backup metadata/schema version inconsistency.

Only implement checks supported by the actual data model. Do not invent a repair for an issue that cannot be safely inferred.

### Behavior

- Read-only scan by default.
- Show issue type, count and a plain-language explanation.
- Do not expose sensitive record contents unnecessarily.
- Do not automatically delete, rewrite or repair records.
- If a safe repair is later added, show exactly what will change and require confirmation.
- Allow the user to copy/export a diagnostic summary only if it excludes sensitive data by default. No automatic transmission.

### Acceptance criteria

- [ ] Scan runs locally.
- [ ] Scan does not mutate records.
- [ ] Known invalid fixtures are detected by tests.
- [ ] Valid data produces a clear healthy state.
- [ ] Diagnostic output avoids PINs, keys, notes and full financial records.
- [ ] User can exit without changing data.

## 5.9 Local reminders and recurring due notifications

**Priority:** P1 — planned v1.2

### Purpose

Make reminders useful without Firebase, remote push services or a server.

### Requirements

- Allow the user to enable/disable local reminders.
- Allow configuration of reminder time and relevant reminder types.
- Remind users about due recurring templates and optional bookkeeping review.
- Use the browser's supported local notification capability only when permission is granted.
- Provide an in-app due list as the reliable fallback.
- If notification permission is denied or unsupported, the app must remain fully usable.
- Do not request notification permission on first launch without explaining why and obtaining a user action.
- Do not promise exact background delivery. Browser/PWA scheduling behavior varies by platform and may require the app to be opened.
- No Firebase Cloud Messaging, remote push provider or server scheduler.

### Existing-code audit

The inspected Reminders page currently appears to return no UI and includes a Firebase-related TODO. Inspect the complete reminder/settings/service-worker implementation and package dependencies before changing it. Keep or remove Firebase only after verifying actual usage and documenting the result.

### Acceptance criteria

- [ ] Reminder preferences persist locally.
- [ ] In-app due reminders work without notification permission.
- [ ] Permission is requested only after user action.
- [ ] Unsupported/denied notifications degrade gracefully.
- [ ] No remote reminder service is introduced.
- [ ] App works offline with reminders disabled or enabled.

## 5.10 Tags for transactions

**Priority:** P2 — optional; only after P0 work is stable

### Purpose

Allow flexible labels beyond the fixed category system, such as “Work”, “Family”, “Travel” or “Reimbursable”.

### Requirements

- A transaction may have zero or more tags.
- Tags are user-managed and local.
- Tags are searchable/filterable.
- Categories remain the primary income/expense classification; tags do not replace categories.
- Tag deletion must not corrupt transactions.
- Use a simple model and avoid building a complex nested tagging system.

### Acceptance criteria

- [ ] Tags can be created, renamed and removed safely.
- [ ] A transaction can have multiple tags.
- [ ] Tag filtering combines correctly with other filters.
- [ ] Tags do not affect balances or reports.

## 6. Dashboard changes

Keep the dashboard focused. It should not become a wall of charts.

### Recommended v1.2 dashboard sections

1. Combined active-account balance.
2. Current-month income, expense and net cash flow.
3. Budget summary: total planned vs spent, plus the most relevant category statuses.
4. Due recurring items, if any.
5. Savings-goal progress.
6. Recent transactions.
7. Quick actions for income, expense and transfer.

### Dashboard rules

- Each section must link to its detailed screen.
- Hide or collapse sections with no data rather than showing fake numbers.
- Keep first-screen content useful on a small phone.
- Avoid excessive animation and heavy chart rendering.
- Respect locked state: financial data must not be exposed behind the lock screen.

## 7. Data model and migration guidance

The following are logical additions, not a finalized physical schema. Inspect the existing database/storage layer and migration approach before implementation.

### Candidate new entities

**Budget**

- id
- categoryId
- monthKey (YYYY-MM)
- limitAmount
- createdAt
- updatedAt

**RecurringTemplate**

- id
- type (income/expense)
- title
- amount
- accountId
- categoryId
- note
- frequency
- startDate
- nextDueDate
- endDate (optional)
- isPaused
- createdAt
- updatedAt

**RecurringOccurrence**

- id or deterministic occurrence key
- templateId
- scheduledDate
- status (due/created/skipped)
- createdTransactionId (optional)
- createdAt / updatedAt

This may be represented on the transaction instead if that is simpler and safer. Ensure occurrence idempotency.

**SavingsGoal**

- id
- name
- targetAmount
- targetDate (optional)
- status
- createdAt
- updatedAt

**GoalContribution**

- id
- goalId
- amount
- date
- note (optional)
- createdAt

**Tag** (optional P2)

- id
- name
- createdAt
- updatedAt

Transaction-to-tag relation may be a join store or an existing supported array representation. Choose based on the current persistence layer.

### Migration principles

1. Determine the current storage engine and schema/version strategy from source code; do not assume IndexedDB just because it appears in older documentation.
2. Add new stores/fields with a forward migration that preserves existing records.
3. Existing transactions, accounts, categories, reconciliations, imports and encrypted data must remain readable.
4. Migration must be idempotent or guarded by a reliable schema version.
5. If migration fails, preserve the original data and provide a recoverable error.
6. Do not rewrite historical transactions to populate new optional fields unless there is a deterministic and tested reason.
7. Test migration using a copy of a real-shaped v1.1 data fixture, not only an empty database.
8. Update backup serialization/deserialization and compatibility tests when schema changes.
9. Never store unencrypted financial records outside the existing security boundary.
10. Document any migration that cannot be automatically reversed.

### Money and date conventions

- Money uses integer minor units (paisa) or the repository's existing exact representation.
- Formatting into BDT happens at the UI boundary.
- Never use binary floating-point for money calculations.
- Use one consistent date representation and local-calendar rule for month/year grouping.
- Recurrence calculations must be tested for month-end, leap-year and daylight/timezone boundaries.
- Keep calculation functions pure where the existing architecture does so.

## 8. Architecture and implementation boundaries

Use the architecture already present in the repository. The following responsibilities should remain separate even if the project uses different filenames.

| Responsibility       | Expected boundary                                           |
| -------------------- | ----------------------------------------------------------- |
| Pages/components     | Render state, collect input and call application services   |
| Feature services     | Budget, recurring, goals, report and integrity operations   |
| Calculation services | Pure money, date-range, budget and report calculations      |
| Storage/data access  | Read/write local records and manage schema versions         |
| Security/encryption  | Existing encryption and key-handling boundary               |
| PWA/service worker   | Asset caching and supported offline behavior                |
| Tests                | Verify calculations, persistence, migrations and user flows |

Do not introduce a large state-management framework, repository layer or dependency-injection system unless the current application demonstrably needs it.

### Suggested implementation order

1. Inspect architecture, schema, test commands and current v1.1 behavior.
2. Add/verify shared validation and date/money helpers only where needed.
3. Implement advanced transaction filters using existing transaction data.
4. Implement budgets and calculation tests.
5. Implement recurring templates and occurrence idempotency.
6. Implement backup preview and integrity checker.
7. Implement savings goals.
8. Implement yearly report and account comparison.
9. Implement local reminders after confirming browser/PWA constraints.
10. Add tags only if the release remains stable and time permits.
11. Complete regression, offline and security tests.
12. Update documentation and release metadata.

The order may be adjusted if dependencies in the actual code require it, but security/data migration work must precede features that depend on the new schema.

## 9. Validation and error handling

Every new form/service must validate input at the service boundary, not only in the UI.

### General validation rules

- Required text must not be empty after trimming.
- Amounts must be valid positive integers in minor units unless a field explicitly allows zero.
- IDs must refer to existing records of the correct type.
- Dates must be valid and within any defined range.
- Category type must match transaction type.
- Account references must be valid and active where required.
- Duplicate unique records must be rejected with a useful message.
- Updates must validate the merged final record, not just the changed fields.
- User-facing errors must be understandable and must not reveal cryptographic internals.
- Failed writes must not leave partial records.

Use the existing validation library/pattern if one is present. Avoid introducing a second validation library for the same purpose.

## 10. Privacy and security requirements

These are release blockers, not optional polish.

- All feature calculations and storage remain local.
- No transaction, account, budget, goal, reminder or import data is sent to a remote endpoint.
- No analytics or crash-reporting integration may receive sensitive data.
- No new cloud dependency.
- Preserve the current encryption/key derivation design unless a separate security review approves a change.
- Do not store PINs or backup passwords in plaintext.
- Do not expose decrypted data in console logs, error telemetry, URLs or notification bodies on locked devices.
- Lock/auto-lock behavior must continue to cover new screens and routes.
- When the app is locked, hide financial data in background/recents previews where the platform permits.
- Backup restore must validate before committing.
- Local notification content should be generic by default (for example, “Hisab reminder”) rather than exposing transaction amounts or notes.
- Review new dependencies for maintenance, bundle size, permissions and network behavior.
- Verify production network requests. Normal use must not contact any service other than the app's own static hosting/update resources.

### Security test scenarios

- Locked app cannot reveal budget, transaction, goal or account details.
- Wrong PIN behavior remains unchanged and secure.
- New feature data is protected by the same existing storage/encryption boundary.
- Backup password failure does not modify local data.
- Malformed imported or restored data cannot execute code or corrupt the database.
- No sensitive values appear in logs.
- Offline mode does not disable access to already stored records after unlock.

## 11. Accessibility and visual design

- Mobile-first layouts; test narrow phone widths.
- Controls must have labels and keyboard focus states.
- Buttons and touch targets must be comfortably usable.
- Do not rely on red/green alone; pair colors with text/icons/status labels.
- Charts must have text summaries or accessible labels.
- Forms must show validation close to the relevant field.
- Confirmation is required for destructive operations.
- Empty, loading, success and error states must be designed.
- Respect reduced-motion preferences.
- Maintain consistent typography, spacing, card style and navigation patterns already used by Hisab.
- Use BDT formatting consistently.

## 12. Testing strategy

Tests should cover pure logic first, then persistence and UI flows.

### Unit tests

- Budget actuals, remaining amount and percentages.
- Month/year boundaries and local date grouping.
- Recurrence next-date calculation: weekly, monthly, yearly, month-end and leap-year.
- Recurring occurrence idempotency.
- Goal progress and contribution arithmetic.
- Yearly report totals and transfer-fee treatment.
- Account comparison and archived-account behavior.
- Search/filter combinations and deterministic sorting.
- Integrity checker rules.

### Storage and migration tests

- New schema on an empty store.
- Upgrade from a v1.1-shaped database.
- Existing records survive migration.
- Migration failure does not destroy the original data.
- New records survive reload/restart.
- Duplicate budget and recurring occurrence constraints.
- Backup export/import round-trip with new entities.
- Old backup compatibility behavior is explicit and tested.

### UI/integration tests

- Create/edit/delete a budget.
- Create a recurring template, confirm once, retry confirmation and verify only one transaction.
- Skip and pause a recurring template.
- Create a savings goal and add contribution without changing account balance.
- Search/filter transactions and reset filters.
- View a yearly report with real fixture data.
- Preview a backup and cancel restore.
- Run integrity scan without mutation.
- Use the app with network disabled after initial installation.

### Regression tests

Re-run the existing test suite. The repository README previously reported 162 passing tests; verify the current actual count rather than assuming it remains unchanged.

### Manual device checks

- Android Chrome installed PWA.
- Desktop Chromium-based browser.
- Offline launch after initial cache.
- App update flow and stale service-worker behavior.
- PIN lock and auto-lock.
- Notification permission denied/unsupported.
- Backup/restore using a test backup.
- Small viewport and touch interactions.

## 13. Release acceptance checklist

v1.2 is ready only when all required P0 items pass.

### Product behavior

- [ ] Advanced transaction search and filters work.
- [ ] Monthly category budgets work and derive totals from the ledger.
- [ ] Recurring templates require explicit confirmation before transaction creation.
- [ ] Recurring occurrence creation is duplicate-safe.
- [ ] Backup restore preview is available.
- [ ] Integrity checker is read-only and local.

### Planned P1 features

- [ ] Savings goals work without altering account balances.
- [ ] Yearly reports match saved transactions.
- [ ] Account comparison matches existing calculation logic.
- [ ] Local reminders work without Firebase/cloud services, with graceful fallbacks.

### Optional P2

- [ ] Tags work without changing category or balance semantics.

### Privacy and reliability

- [ ] No backend, cloud sync or financial-provider API has been introduced.
- [ ] New feature data uses the existing protected local storage boundary.
- [ ] Existing v1.1 data migrates safely.
- [ ] Existing backups remain compatible or a documented migration path exists.
- [ ] Failed imports/restores/migrations do not partially mutate data.
- [ ] No sensitive data is logged or transmitted.
- [ ] Existing test suite and new tests pass.
- [ ] Core features work offline after installation.

### Documentation and release

- [ ] README reflects actual v1.2 behavior.
- [ ] Architecture and PWA documentation are updated where needed.
- [ ] SRS/acceptance documentation is updated or linked to this specification.
- [ ] Changelog lists user-visible changes and migration notes.
- [ ] Package/app version is aligned with the actual release history.
- [ ] Known limitations are documented.
- [ ] Production build succeeds.
- [ ] Manual smoke test is complete.

## 14. Delivery phases and definition of done

### Phase 0 — Repository verification and design lock

- [ ] Read all project instructions and architecture docs.
- [ ] Confirm actual v1.1 baseline and current version number.
- [ ] Map current routes, services, storage schema and test commands.
- [ ] Audit Firebase usage and reminder dependencies.
- [ ] Write a short implementation note for any required schema migration.
- [ ] Confirm no unresolved data-loss/security risk.

**Exit condition:** the implementation plan matches the real codebase and schema changes are understood.

### Phase 1 — Core usability and budgets

- [ ] Advanced transaction filters.
- [ ] Monthly category budgets.
- [ ] Budget calculation tests.
- [ ] Dashboard budget summary.

**Exit condition:** history is easier to navigate and budget values match the ledger.

### Phase 2 — Recurring workflows

- [ ] Recurring templates.
- [ ] Due/overdue list.
- [ ] Confirm/skip/pause/archive behavior.
- [ ] Idempotency protection.
- [ ] Schedule boundary tests.

**Exit condition:** no recurring transaction is created without confirmation and no occurrence can be duplicated.

### Phase 3 — Reliability and planning

- [ ] Backup preview.
- [ ] Local data integrity checker.
- [ ] Savings goals.
- [ ] Migration and backup compatibility tests.

**Exit condition:** users can inspect restore and data health safely, and goals do not alter ledger balances.

### Phase 4 — Insights and reminders

- [ ] Yearly report.
- [ ] Account comparison.
- [ ] Local reminder experience.
- [ ] Remove unused Firebase dependency/configuration only if confirmed unused.

**Exit condition:** reports reconcile to ledger data and reminders work without remote services.

### Phase 5 — Stabilization and release

- [ ] Regression and security tests.
- [ ] Offline and device checks.
- [ ] Accessibility pass.
- [ ] Documentation and changelog.
- [ ] Version alignment and production build.

**Exit condition:** all P0 requirements pass, no known data-loss issue remains, and limitations are documented.

## 15. Open decisions requiring confirmation

These should be resolved during Phase 0, before schema-changing implementation.

1. **Current release baseline:** Is the active public release v1.1, and what exact version is in package metadata?
2. **Budget month definition:** Use the user's local calendar month (recommended) or a configurable budget cycle?
3. **Recurring schedule:** Is weekly/monthly/yearly sufficient for v1.2, or is a custom interval genuinely needed?
4. **Recurring missed dates:** Keep overdue items pending until the user acts (recommended), or allow skipping multiple missed occurrences?
5. **Savings goals:** Approve manual goal-only contributions for v1.2, keeping them separate from the ledger (recommended)?
6. **Backup restore:** Confirm current restore is replace-only or merge; v1.2 should preserve current semantics and add preview.
7. **Reminders:** Which reminder types are needed: recurring due, daily entry prompt, or periodic bookkeeping review?
8. **Tags:** Include in v1.2 only if P0/P1 features are stable, or defer to v1.3?
9. **Account opening balance:** Should editing be blocked after transactions exist, or require a dedicated adjustment transaction? Recommended: never silently rewrite historical balances.

Do not block unrelated work on decisions that do not affect it. Do block any feature whose unresolved decision could cause data loss or financial misrepresentation.

## 16. Coding-agent execution prompt

The following prompt can be copied into Kilo Code, DeepSeek or another coding agent after this document is saved.

> You are working on the Hisab repository: [https://github.com/sazzadul1205/hisab-mobile-app](https://github.com/sazzadul1205/hisab-mobile-app).
>
> Read this entire Notion document, the repository README, architecture/PWA/security docs, changelog, package manifest, tests and all project instruction files ([AGENTS.md](http://AGENTS.md), [Agent.md](http://Agent.md) or equivalent) before editing.
>
> Implement Hisab v1.2 according to this specification. The product must remain a private, local-first, offline-capable React + Vite PWA. Use JavaScript, not TypeScript. Do not add a backend, accounts, cloud sync, Firebase/remote push, financial-provider APIs, remote AI or analytics transmission.
>
> First inspect and report the actual current code structure, storage engine/schema, encryption boundary, route structure, test commands, current version and existing implementations. Compare them with this document. Identify conflicts and data-migration risks before coding.
>
> Work in small, reviewable phases. Start with Phase 0, then implement one feature slice at a time. Before a schema change, explain the proposed migration and backup compatibility impact. Never rewrite or discard existing user data. Reuse existing services and UI patterns; avoid unnecessary refactors and overengineering.
>
> Financial calculations must use integer minor units or the existing exact-money representation. Reuse existing calculation helpers. Recurring templates must never create transactions without explicit user confirmation, and confirming one occurrence more than once must not create duplicates. Savings-goal contributions must not alter account balances. Backup preview and integrity scan must be local; integrity scan is read-only by default.
>
> For each phase:
>
> 1. State the files/modules you intend to change and why.
> 2. Implement only that phase.
> 3. Add/update unit, storage, migration and UI tests.
> 4. Run the relevant test suite and production build.
> 5. Report exact commands, results, changed files, unresolved issues and manual checks still required.
> 6. Update documentation and changelog.
>
> Do not claim success if a test was not run. Do not silently change requirements. If this document and the actual code conflict, stop and explain the conflict with evidence before making a destructive or architecture-level change.
>
> Begin with repository inspection and a Phase 0 implementation plan. Do not start implementing all features in one unreviewed batch.

## 17. Change log for this specification

| Revision   | Change                                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.2 draft | Initial detailed product, UX, architecture, migration, security, testing and delivery plan based on the current Hisab product description, inspected repository documentation and selected source files. |

---

**Final product principle:** Hisab should become more capable at helping a person manage their money, not more dependent on the internet. Privacy, data integrity, transparent calculations and user control take priority over feature count.
.
