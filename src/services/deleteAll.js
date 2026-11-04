/* ----------------------------------------------------------------
   Complete data wipe.

   Uses db.delete() — removes the entire IndexedDB database, not just
   rows. This is the cleanest possible state: no schema, no indexes,
   no orphaned keys, no vault metadata. On the next boot, Dexie
   re-creates the database fresh, and the app sees a "no-vault"
   state, forcing PIN setup.

   Do NOT clear appSettings.vault manually — if a partial wipe leaves
   a stale wrappedDEK while removing the encrypted records, the app
   would boot into a broken vault. Full DB deletion can't leave that
   state.
   ---------------------------------------------------------------- */

import { db } from "../db/db";

export async function wipeAllData() {
    db.close();
    await db.delete();
}