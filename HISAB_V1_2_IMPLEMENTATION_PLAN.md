# Hisab v1.2 — Implementation Plan (Generated from Specification)

## Project Overview

- **Product:** Hisab — private, local-first personal finance and bookkeeping PWA
- **Repository:** sazzadul1205/hisab-mobile-app
- **Current baseline:** v1.1 (React + Vite PWA, local-first, no backend)
- **Target:** v1.2 with budgeting, recurring templates, savings goals, enhanced search, yearly reports, backup safety, local reminders

---

## Phase 0 — Repository Verification & Design Lock ✅ COMPLETE

- [x] Read all project docs: README, ARCHITECTURE.md, PWA.md, SRS-ACCEPTANCE.md, CHANGELOG.md, AGENTS.md
- [x] Confirmed actual current version: **v1.0.1** (package.json and CHANGELOG both report 1.0.1, not v1.1)
- [x] Mapped routes (32 routes in App.jsx), services, storage schema (6 Dexie tables), encryption boundary (encryption.js with INDEX_FIELDS), test commands (npm run test:run)
- [x] Audited Firebase usage: **Firebase is installed but NOT configured** — VITE_FIREBASE_API_KEY is empty, notifications.js and firebase.js short-circuit to no-ops, Reminders page renders null, Settings hides Reminders link. No Firebase config in .env.example.
- [x] Migration notes prepared for new entities (see below)
- [x] No unresolved data-loss/security risks identified

**Exit:** Implementation plan matches real codebase; schema changes understood

### Phase 0 Findings Summary

| Area | Current State | Notes |
|------|---------------|-------|
| **Version** | v1.0.1 | Package.json & CHANGELOG agree. v1.1 in spec was aspirational. |
| **Stack** | React 19 + Vite + Tailwind v4, Dexie 4, Vitest | JavaScript (no TypeScript) |
| **DB Schema** | 6 tables (accounts, transactions, categories, reconciliationRecords, importRecords, appSettings) | Version 1, no migration system yet |
| **Encryption** | Two-layer (PBKDF2 600k → DEK → AES-GCM) | Index fields plaintext, rest in `enc` blob |
| **Money** | Integer paisa (1 BDT = 100) | `toMinor`/`fromMinor`/`parseMoney`/`formatBDT` in lib/money.js |
| **Tests** | 162 passing across 13 files | Uses fake-indexeddb, fast KDF preset |
| **PWA** | Workbox, autoUpdate, offline-ready | Installable on iOS/Android/desktop |
| **Firebase** | Installed, unconfigured | Safe to remove or keep dormant for v1.2 local reminders |
| **Reminders** | Placeholder page, settings exist but hidden | Daily morning/evening nudges in settings.js |
| **Backup** | Replace/merge modes, encrypted .hisab | Password independent of PIN |
| **Routes** | 32 routes with auth guards | RequireAuth, RequireNoVault, RequireVaultLocked |

### Migration Notes for New Entities

New tables needed (Dexie version 2):

```js
// budgets: id, categoryId, monthKey (YYYY-MM), limitAmount, createdAt, updatedAt
// recurringTemplates: id, type, title, amount, accountId, categoryId, note, frequency, interval, startDate, nextDueDate, endDate, isPaused, createdAt, updatedAt
// recurringOccurrences: id, templateId, scheduledDate, status (due/created/skipped), createdTransactionId, createdAt, updatedAt
// savingsGoals: id, name, targetAmount, targetDate, status, createdAt, updatedAt
// goalContributions: id, goalId, amount, date, note, createdAt
// tags: id, name, createdAt, updatedAt (P2 optional)
```

Index fields for encryption (add to INDEX_FIELDS):
- budgets: id, categoryId, monthKey
- recurringTemplates: id, accountId, categoryId
- recurringOccurrences: id, templateId, scheduledDate, status
- savingsGoals: id, status
- goalContributions: id, goalId, date

Migration strategy: Idempotent version bump, seed empty tables, preserve all v1.0.1 data.

---

## Phase 1 — Core Usability & Budgets (P0) ✅ COMPLETE

### 1.1 Advanced Transaction Search & Filters ✅
- Free-text search (note/description) ✅
- Filters: type, date range (presets + custom), account, category, amount range ✅
- Sort: newest, oldest, highest, lowest ✅
- AND semantics for combined filters ✅
- Active filter chips + "Clear all" ✅
- Filter sheet/modal with all options ✅

### 1.2 Monthly Category Budgets ✅
- Budget model: id, categoryId, monthKey (YYYY-MM), limitAmount, timestamps ✅
- Unique constraint: category + month (enforced in service) ✅
- Calculations: actual spent (expenses only, no transfer principal), remaining, usage % ✅
- Month navigation (prev/next) with URL state ✅
- Dashboard budget summary section ✅
- Budget page with create/edit/delete ✅

### 1.3 Tests ✅
- Budget actuals, remaining, percentages (24 tests passing) ✅
- Month/year boundaries, local date grouping ✅
- Filter combinations, deterministic sorting ✅
- Storage/migration: new schema (Dexie v2) on empty store ✅

**Exit:** History easier to navigate; budget values match ledger

---

## Phase 2 — Recurring Workflows (P0)

### 2.1 Recurring Templates

- Fields: id, type (income/expense), title, amount, accountId, categoryId, note, frequency, interval, startDate, nextDueDate, endDate, isPaused
- Frequencies: weekly, monthly (preserve day, handle month-end), yearly (leap year)
- **Critical rule:** Never auto-create transactions — user confirms each

### 2.2 Due/Overdue Management

- List templates with due/overdue state
- Actions: Create transaction, Skip, Pause/Resume, Edit, Archive
- Confirmation screen shows full transaction details
- Idempotency: stable occurrence key (templateId + scheduledDate) prevents duplicates

### 2.3 Tests

- Recurrence next-date: weekly, monthly, yearly, month-end, leap-year
- Occurrence idempotency (confirm twice = one transaction)
- Skip advances schedule, pause prevents new due prompts
- Edit template doesn't mutate existing transactions

**Exit:** No recurring transaction created without confirmation; no duplicate occurrences

---

## Phase 3 — Reliability & Planning (P0/P1)

### 3.1 Backup Restore Preview

- Decrypt + validate before modifying data
- Preview: format/version, creation date, record counts, compatibility, restore strategy
- Wrong password/corrupt data → leave local data unchanged
- Transactional/staged restore (no partial state)
- Strong final confirmation for destructive replace

### 3.2 Local Data Integrity Checker

- Read-only scan by default
- Checks: required fields, valid money integers, valid account/category refs, transfer validity, duplicate IDs, orphaned contributions, budget refs, invalid dates, schema version
- Show issue type, count, plain-language explanation
- No auto-repair; safe repair later requires explicit confirmation

### 3.3 Savings Goals (P1)

- Manual contributions only (goal-only records, no ledger impact)
- Fields: id, name, targetAmount, targetDate, status (active/paused/completed/archived)
- Contributions: id, goalId, amount, date, note
- Progress = sum(contributions) / targetAmount (can exceed 100%)
- Never modifies account balances

### 3.4 Tests

- Migration: upgrade v1.1 fixture, existing records survive, failure preserves original
- Backup round-trip with new entities
- Old backup compatibility behavior tested
- Goal progress arithmetic; contributions don't alter balances
- Integrity scan detects known invalid fixtures, valid data = healthy

**Exit:** Users can inspect restore/data health safely; goals don't alter ledger

---

## Phase 4 — Insights & Reminders (P1)

### 4.1 Yearly Financial Report

- Year selector
- Total income, expenses, net cash flow
- Month-by-month breakdown
- Top expense categories
- Account balance snapshot (calculated, not live)
- Previous year comparison when data exists

### 4.2 Account Comparison

- Each active account balance + combined total
- Share of combined (when meaningful)
- Archived accounts separate
- Link to reconciliation
- Reuse existing balance helpers

### 4.3 Local Reminders

- Enable/disable, configure time/types
- Types: recurring due, daily entry prompt, periodic review
- Browser local notifications (permission on user action, not first launch)
- In-app due list as fallback
- Graceful degradation when denied/unsupported
- **Audit & remove Firebase** if confirmed unused

### 4.4 Tests

- Yearly totals = sum of monthly totals
- Transfer principal excluded, fees included
- Account comparison matches existing calculator
- Reminders work offline, no remote service
- Notification permission flow correct

**Exit:** Reports reconcile to ledger; reminders work without remote services

---

## Phase 5 — Stabilization & Release

- [ ] Regression test suite (verify existing 162+ tests still pass)
- [ ] Security tests: locked app hides data, wrong PIN behavior, new data encrypted, backup failure safe, no sensitive logs
- [ ] Offline checks: Android Chrome PWA, desktop Chromium, offline launch, update flow, PIN lock, small viewport
- [ ] Accessibility: labels, focus, touch targets, color+text, chart summaries, reduced motion
- [ ] Documentation: README, ARCHITECTURE, PWA, SRS/acceptance, CHANGELOG
- [ ] Version alignment, production build success
- [ ] Manual smoke test complete

**Exit:** All P0 pass, no known data-loss issues, limitations documented

---

## Open Decisions (Resolve in Phase 0)

1. **Baseline version:** Is active release v1.1? What exact version in package.json?
2. **Budget month:** Local calendar month (recommended) or configurable cycle?
3. **Recurring frequencies:** Weekly/monthly/yearly sufficient, or custom interval needed?
4. **Missed recurring dates:** Keep overdue pending (recommended) or allow bulk skip?
5. **Savings goals:** Approve manual goal-only contributions (recommended)?
6. **Backup restore:** Current = replace-only? v1.2 keeps semantics + adds preview?
7. **Reminder types:** Recurring due, daily entry, periodic review?
8. **Tags:** Include in v1.2 (P2) or defer to v1.3?
9. **Account opening balance:** Block edit after transactions exist, or require adjustment transaction?

---

## Non-Goals (Explicitly Excluded)

- Backend/API/user accounts
- Cloud sync/multi-device
- Online bank/bKash/Nagad APIs
- Automatic payments
- Cloud backup/remote notifications
- AI categorization (remote)
- Multi-user/shared accounts
- Investment/loan/tax/portfolio
- Currency conversion (BDT only)
- Replace storage/encryption without separate design
- Large visual redesign unrelated to features

---

## Key Technical Constraints

- **Stack:** React + Vite PWA, JavaScript (not TypeScript)
- **Money:** Integer minor units (paisa) — never floating-point
- **Privacy:** All local, no network for normal operations
- **Architecture:** Reuse existing services, calculation helpers, storage, UI components
- **Migration:** Idempotent, preserves existing data, test with real-shaped v1.1 fixture
- **Testing:** Unit → storage/migration → UI/integration → regression → manual device

---

## Priority Summary

| Priority | Features                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------ |
| **P0**   | Advanced search/filters, Monthly budgets, Recurring templates, Backup preview, Integrity checker |
| **P1**   | Savings goals, Yearly report, Account comparison, Local reminders                                |
| **P2**   | Transaction tags (optional, after P0/P1 stable)                                                  |

.
