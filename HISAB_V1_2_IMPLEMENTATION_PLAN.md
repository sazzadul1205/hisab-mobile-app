# Hisab v1.2 — Implementation Plan (Generated from Specification)

## Project Overview

- **Product:** Hisab — private, local-first personal finance and bookkeeping PWA
- **Repository:** sazzadul1205/hisab-mobile-app
- **Current baseline:** v1.1 (React + Vite PWA, local-first, no backend)
- **Target:** v1.2 with budgeting, recurring templates, savings goals, enhanced search, yearly reports, backup safety, local reminders

---

## Phase 0 — Repository Verification & Design Lock

- [ ] Read all project docs: README, ARCHITECTURE.md, PWA.md, SRS-ACCEPTANCE.md, CHANGELOG.md, AGENTS.md
- [ ] Confirm actual current version (package.json vs changelog reports 1.0.1)
- [ ] Map routes, services, storage schema, encryption boundary, test commands
- [ ] Audit Firebase usage in reminders page and package dependencies
- [ ] Write migration notes for new entities (Budget, RecurringTemplate, SavingsGoal, GoalContribution, Tag)
- [ ] Confirm no unresolved data-loss/security risks

**Exit:** Implementation plan matches real codebase; schema changes understood

---

## Phase 1 — Core Usability & Budgets (P0)

### 1.1 Advanced Transaction Search & Filters

- Free-text search (note/description)
- Filters: type, date range, account, category, amount range
- Sort: newest, oldest, highest, lowest
- AND semantics for combined filters
- Filter chips + "Clear all"
- Preserve filters on detail navigation

### 1.2 Monthly Category Budgets

- Budget model: id, categoryId, monthKey (YYYY-MM), limitAmount, timestamps
- Unique constraint: category + month
- Calculations: actual spent (expenses only, no transfer principal), remaining, usage %
- Month navigation (prev/next)
- Dashboard budget summary section

### 1.3 Tests

- Budget actuals, remaining, percentages
- Month/year boundaries, local date grouping
- Filter combinations, deterministic sorting
- Storage/migration: new schema on empty store, upgrade from v1.1 fixture

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
