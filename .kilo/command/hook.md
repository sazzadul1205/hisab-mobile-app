# /hook — Create a custom hook

Creates a new hook in `src/hooks/`.

## Usage

```bash
kilo run /hook <hook-name>
```

## What it does

- Creates `src/hooks/use<HookName>.js`
- Creates `use<HookName>.test.js`

## Conventions followed

- Hooks are placed in `src/hooks/`
- Hooks wrap `useLiveQuery` from `dexie-react-hooks` for DB subscriptions
- Hooks must be called at the top of the component — never conditionally, never in loops
- Hooks return derived state, not raw Dexie arrays
- Amounts returned from hooks should be in minor units (paisa); format at the component level
- `resetTestState()` in `beforeEach`; fast KDF preset `{ iterations: 10_000 }`

## Notes

If the hook only transforms data already loaded, consider putting the logic in a service function instead.
Run `kilo run /test` after creation.