# Contributing to Hisab

Thanks for your interest in improving Hisab! This document covers how to set up a development environment, run tests, and submit changes.

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd hisab-mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

   The app runs on `http://localhost:5173` with PWA support enabled.

## Development Workflow

### Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test
```

Tests use `fake-indexeddb` and the Web Crypto polyfill, so they run in Node without a browser.

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix what can be fixed
npm run lint:fix
```

### Building

```bash
npm run build
```

The build output goes to `dist/`. The PWA service worker is registered automatically via `vite-plugin-pwa`.

## Code Style

- **Formatting:** 2-space indentation, single quotes, no semicolons (matches existing codebase).
- **Components:** Functional components only. Hooks must be at the top of every component, never conditionally.
- **Amounts:** All amounts are integer minor units (paisa). Never use floats for arithmetic.
- **Encryption:** Every write goes through `encryptRecord()`, every read through `decryptRecord()`.
- **Theme:** Use CSS variables (`--bg`, `--brand`, `--ink`). Never hardcode colors.

See [AGENTS.md](AGENTS.md) for the full coding guidelines.

## Pull Request Process

1. Create a feature branch from `main`.
2. Make your changes with clear, descriptive commits.
3. Ensure all tests pass: `npm run test:run`.
4. Ensure linting passes: `npm run lint`.
5. Open a pull request describing the change and referencing any related issue.

## Reporting Issues

Include:
- Steps to reproduce
- Expected vs. actual behavior
- Browser/OS version
- Any relevant screenshots or console output

**Note:** Hisab stores all data locally and encrypted. We cannot see your financial data, so we cannot debug transactions you've entered.