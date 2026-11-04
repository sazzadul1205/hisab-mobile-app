import { webcrypto } from "node:crypto";
import "fake-indexeddb/auto";

// jsdom doesn't ship Web Crypto. Node 20+ does.
if (typeof globalThis.crypto?.subtle === "undefined") {
    globalThis.crypto = webcrypto;
}

// fake-indexeddb/auto sets globalThis.indexedDB.
// Dexie picks it up automatically.