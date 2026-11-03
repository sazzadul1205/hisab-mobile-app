import { webcrypto } from "node:crypto";

// jsdom doesn't ship Web Crypto. Node 20+ does. Use Node's everywhere.
if (typeof globalThis.crypto?.subtle === "undefined") {
    globalThis.crypto = webcrypto;
}

// NOTE: @testing-library/jest-dom is NOT imported here.
// It requires a DOM and none of the current tests use it.
// When you add component tests, give them their own setup file
// (see Fix 3) rather than forcing jsdom on the whole suite.