import { describe, it, expect } from "vitest";
import {
    setupVault,
    unlockVault,
    changePin,
    encryptForStorage,
    decryptFromStorage,
    InvalidPinError,
    VAULT_VERSION,
} from "./vault";

// Fast iterations for tests. Production uses 600_000.
const FAST = { iterations: 10_000 };
const PIN = "1234";
const WRONG_PIN = "9999";

// Bytes -> hex string (replaces Node's Buffer so ESLint's no-undef stays happy)
const hex = (bytes) =>
    Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/* ============================================================
   Setup
   ============================================================ */
describe("setupVault", () => {
    it("returns DEK bytes and metadata with the expected shape", async () => {
        const { dekBytes, metadata } = await setupVault(PIN, FAST);

        expect(dekBytes).toBeInstanceOf(Uint8Array);
        expect(dekBytes.length).toBe(32);

        expect(metadata.version).toBe(VAULT_VERSION);
        expect(metadata.salt).toBeInstanceOf(Uint8Array);
        expect(metadata.salt.length).toBe(16);
        expect(metadata.iv).toBeInstanceOf(Uint8Array);
        expect(metadata.iv.length).toBe(12);
        expect(metadata.wrappedDEK).toBeInstanceOf(Uint8Array);
        expect(metadata.wrappedDEK.length).toBe(32 + 16); // DEK + GCM tag
        expect(metadata.iterations).toBe(FAST.iterations);
        expect(typeof metadata.createdAt).toBe("string");
    });

    it("generates a unique salt and DEK on each call", async () => {
        const a = await setupVault(PIN, FAST);
        const b = await setupVault(PIN, FAST);
        expect(hex(a.metadata.salt)).not.toBe(hex(b.metadata.salt));
        expect(hex(a.dekBytes)).not.toBe(hex(b.dekBytes));
    });

    it("rejects empty PIN", async () => {
        await expect(setupVault("", FAST)).rejects.toThrow("PIN_REQUIRED");
        await expect(setupVault(null, FAST)).rejects.toThrow("PIN_REQUIRED");
    });
});

/* ============================================================
   Unlock
   ============================================================ */
describe("unlockVault", () => {
    it("returns the same DEK when given the correct PIN", async () => {
        const { dekBytes, metadata } = await setupVault(PIN, FAST);
        const unlocked = await unlockVault(PIN, metadata);
        expect(hex(unlocked)).toBe(hex(dekBytes));
    });

    it("throws InvalidPinError on wrong PIN", async () => {
        const { metadata } = await setupVault(PIN, FAST);
        await expect(unlockVault(WRONG_PIN, metadata)).rejects.toBeInstanceOf(
            InvalidPinError,
        );
    });

    it("remains unlockable after a failed attempt", async () => {
        const { dekBytes, metadata } = await setupVault(PIN, FAST);
        await expect(unlockVault(WRONG_PIN, metadata)).rejects.toThrow();
        const unlocked = await unlockVault(PIN, metadata);
        expect(hex(unlocked)).toBe(hex(dekBytes));
    });

    it("throws on unsupported vault version", async () => {
        const { metadata } = await setupVault(PIN, FAST);
        await expect(
            unlockVault(PIN, { ...metadata, version: 99 }),
        ).rejects.toThrow("UNSUPPORTED_VAULT_VERSION");
    });

    it("throws on tampered wrappedDEK", async () => {
        const { metadata } = await setupVault(PIN, FAST);
        const tampered = new Uint8Array(metadata.wrappedDEK);
        tampered[0] ^= 0xff;
        await expect(
            unlockVault(PIN, { ...metadata, wrappedDEK: tampered }),
        ).rejects.toBeInstanceOf(InvalidPinError);
    });
});

/* ============================================================
   Change PIN
   ============================================================ */
describe("changePin", () => {
    it("returns the same DEK wrapped with the new PIN", async () => {
        const { dekBytes, metadata } = await setupVault(PIN, FAST);
        const result = await changePin(PIN, "5678", metadata);

        // DEK unchanged — records encrypted with it are unaffected
        expect(hex(result.dekBytes)).toBe(hex(dekBytes));

        // Old PIN no longer works
        await expect(unlockVault(PIN, result.metadata)).rejects.toBeInstanceOf(
            InvalidPinError,
        );

        // New PIN works and yields the same DEK
        const unlocked = await unlockVault("5678", result.metadata);
        expect(hex(unlocked)).toBe(hex(dekBytes));
    });

    it("throws InvalidPinError when the old PIN is wrong", async () => {
        const { metadata } = await setupVault(PIN, FAST);
        await expect(changePin(WRONG_PIN, "5678", metadata)).rejects.toBeInstanceOf(
            InvalidPinError,
        );
    });

    it("regenerates salt and IV", async () => {
        const { metadata } = await setupVault(PIN, FAST);
        const result = await changePin(PIN, "5678", metadata);
        expect(hex(result.metadata.salt)).not.toBe(hex(metadata.salt));
        expect(hex(result.metadata.iv)).not.toBe(hex(metadata.iv));
    });

    it("rejects empty new PIN", async () => {
        const { metadata } = await setupVault(PIN, FAST);
        await expect(changePin(PIN, "", metadata)).rejects.toThrow(
            "NEW_PIN_REQUIRED",
        );
    });
});

/* ============================================================
   Record encryption round-trip
   ============================================================ */
describe("encryptForStorage / decryptFromStorage", () => {
    it("round-trips arbitrary objects", async () => {
        const { dekBytes } = await setupVault(PIN, FAST);
        const original = {
            id: "tx1",
            amount: 4500000,
            type: "income",
            note: "October salary",
            nested: { tags: ["work", "monthly"] },
        };
        const { iv, ct } = await encryptForStorage(original, dekBytes);
        const decoded = await decryptFromStorage({ iv, ct }, dekBytes);
        expect(decoded).toEqual(original);
    });

    it("fails to decrypt with the wrong key", async () => {
        const { dekBytes } = await setupVault(PIN, FAST);
        const { dekBytes: otherKey } = await setupVault(PIN, FAST);
        const { iv, ct } = await encryptForStorage({ hello: "world" }, dekBytes);
        await expect(decryptFromStorage({ iv, ct }, otherKey)).rejects.toThrow();
    });

    it("uses a fresh IV for each encryption (ciphertext differs)", async () => {
        const { dekBytes } = await setupVault(PIN, FAST);
        const data = { id: "tx1", amount: 100 };
        const a = await encryptForStorage(data, dekBytes);
        const b = await encryptForStorage(data, dekBytes);
        expect(hex(a.iv)).not.toBe(hex(b.iv));
        expect(hex(a.ct)).not.toBe(hex(b.ct));
    });

    it("survives a PIN change — old ciphertext decrypts with the same DEK", async () => {
        const { dekBytes, metadata } = await setupVault(PIN, FAST);
        const { iv, ct } = await encryptForStorage({ amount: 500 }, dekBytes);

        // Change PIN
        const result = await changePin(PIN, "5678", metadata);

        // Ciphertext was never re-encrypted — same DEK, same plaintext
        const decoded = await decryptFromStorage({ iv, ct }, result.dekBytes);
        expect(decoded).toEqual({ amount: 500 });
    });
});