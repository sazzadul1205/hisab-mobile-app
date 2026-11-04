import { describe, it, expect } from "vitest";
import {
    createBackupFile,
    readBackupFile,
    validateEnvelope,
    countRecords,
    totalRecordCount,
    BackupValidationError,
    BackupPasswordError,
    BACKUP_FORMAT,
    BACKUP_VERSION,
} from "./backup";

/* Fake fixture — we don't call collectRecords here, we call
   createBackupFile after monkey patching? No — instead, we test the
   envelope format by hand-rolling a file. This keeps tests DB-free. */

const FAST = { iterations: 10_000 };
const PASSWORD = "correct horse battery";

const SAMPLE_RECORDS = {
    accounts: [
        { id: "a1", name: "Cash", type: "cash", openingBalance: 500000, isArchived: false, createdAt: "2026-01-01T00:00:00Z" },
    ],
    transactions: [
        { id: "t1", type: "income", amount: 4500000, accountId: "a1", categoryId: "inc-salary", date: "2026-11-04T08:00:00Z", note: "Salary", createdAt: "2026-11-04T08:00:00Z", updatedAt: "2026-11-04T08:00:00Z" },
    ],
    categories: [{ id: "inc-salary", name: "Salary", type: "income", isDefault: true }],
    reconciliationRecords: [],
    importRecords: [],
};

/* Helpers that mirror the internal b64 logic, so we can hand-roll envelopes
   in tests without exporting the internals. */
const b64 = (bytes) => {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
};

describe("countRecords", () => {
    it("counts each table", () => {
        const c = countRecords(SAMPLE_RECORDS);
        expect(c.accounts).toBe(1);
        expect(c.transactions).toBe(1);
        expect(c.categories).toBe(1);
        expect(c.reconciliationRecords).toBe(0);
        expect(c.importRecords).toBe(0);
    });
    it("totalRecordCount sums everything", () => {
        expect(totalRecordCount(countRecords(SAMPLE_RECORDS))).toBe(3);
    });
});

describe("validateEnvelope", () => {
    it("accepts a well-formed envelope", () => {
        const env = {
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            createdAt: "2026-11-04T00:00:00Z",
            kdf: { algorithm: "PBKDF2-SHA256", iterations: 10000, salt: "AAAA" },
            cipher: { algorithm: "AES-GCM", iv: "AAAA" },
            data: "AAAA",
        };
        expect(validateEnvelope(env)).toBe(env);
    });

    it("rejects invalid JSON", () => {
        expect(() => validateEnvelope("not-json")).toThrow(BackupValidationError);
    });

    it("rejects wrong format", () => {
        expect(() =>
            validateEnvelope({
                format: "other",
                version: 1,
                kdf: { iterations: 1, salt: "AAAA" },
                cipher: { iv: "AAAA" },
                data: "AAAA",
            }),
        ).toThrow(BackupValidationError);
    });

    it("rejects unsupported version", () => {
        expect(() =>
            validateEnvelope({
                format: BACKUP_FORMAT,
                version: 99,
                kdf: { iterations: 1, salt: "AAAA" },
                cipher: { iv: "AAAA" },
                data: "AAAA",
            }),
        ).toThrow(BackupValidationError);
    });

    it("rejects missing cipher", () => {
        expect(() =>
            validateEnvelope({
                format: BACKUP_FORMAT,
                version: 1,
                kdf: { iterations: 1, salt: "AAAA" },
                data: "AAAA",
            }),
        ).toThrow(BackupValidationError);
    });
});

/* ----------------------------------------------------------------
   Round-trip tests — we have to construct a real envelope to test
   read. Easiest way: replicate the create logic with a fake record
   source. We'll monkey patch collectRecords? No — instead, use
   readBackupFile on an envelope we build here using crypto/kdf.

   BUT — since createBackupFile uses db, we can't call it. So we do
   manual envelope creation here mirroring the same format.
   ---------------------------------------------------------------- */

import { encryptBytes, randomBytes } from "../crypto/aes";
import { deriveMasterKey } from "../crypto/kdf";

async function buildEnvelope(records, password, iterations) {
    const plaintext = new TextEncoder().encode(JSON.stringify(records));
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = await deriveMasterKey(password, salt, iterations);
    const ct = await encryptBytes(plaintext, key, iv);
    return JSON.stringify({
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        createdAt: "2026-11-04T00:00:00Z",
        kdf: { algorithm: "PBKDF2-SHA256", iterations, salt: b64(salt) },
        cipher: { algorithm: "AES-GCM", iv: b64(iv) },
        data: b64(ct),
    });
}

describe("readBackupFile", () => {
    it("decrypts a well-formed envelope with the correct password", async () => {
        const fileText = await buildEnvelope(SAMPLE_RECORDS, PASSWORD, FAST.iterations);
        const result = await readBackupFile(fileText, PASSWORD);
        expect(result.data.accounts).toHaveLength(1);
        expect(result.data.accounts[0].name).toBe("Cash");
        expect(result.data.transactions).toHaveLength(1);
        expect(result.counts.accounts).toBe(1);
    });

    it("throws BackupPasswordError on wrong password", async () => {
        const fileText = await buildEnvelope(SAMPLE_RECORDS, PASSWORD, FAST.iterations);
        await expect(readBackupFile(fileText, "wrong-password")).rejects.toBeInstanceOf(
            BackupPasswordError,
        );
    });

    it("throws on tampered ciphertext", async () => {
        const fileText = await buildEnvelope(SAMPLE_RECORDS, PASSWORD, FAST.iterations);
        const env = JSON.parse(fileText);
        // Flip a byte in the base64
        const bytes = Uint8Array.from(atob(env.data), (c) => c.charCodeAt(0));
        bytes[0] ^= 0xff;
        env.data = b64(bytes);
        await expect(readBackupFile(JSON.stringify(env), PASSWORD)).rejects.toBeInstanceOf(
            BackupPasswordError,
        );
    });

    it("rejects malformed base64", async () => {
        const fileText = await buildEnvelope(SAMPLE_RECORDS, PASSWORD, FAST.iterations);
        const env = JSON.parse(fileText);
        env.data = "not valid base64 !!!";
        await expect(readBackupFile(JSON.stringify(env), PASSWORD)).rejects.toBeInstanceOf(
            BackupValidationError,
        );
    });

    it("rejects a foreign .hisab file (wrong format)", async () => {
        const fileText = await buildEnvelope(SAMPLE_RECORDS, PASSWORD, FAST.iterations);
        const env = JSON.parse(fileText);
        env.format = "not-hisab";
        await expect(readBackupFile(JSON.stringify(env), PASSWORD)).rejects.toBeInstanceOf(
            BackupValidationError,
        );
    });
});

/* ----------------------------------------------------------------
   createBackupFile — password validation only.
   The full DB path is covered by manual/integration testing; here we
   check the guards that don't touch the DB.
   ---------------------------------------------------------------- */
describe("createBackupFile guards", () => {
    it("rejects short passwords before touching the DB", async () => {
        await expect(createBackupFile("short", FAST)).rejects.toThrow(
            "PASSWORD_TOO_SHORT",
        );
    });

    it("rejects empty passwords before touching the DB", async () => {
        await expect(createBackupFile("", FAST)).rejects.toThrow(
            "PASSWORD_TOO_SHORT",
        );
    });

    it("rejects null passwords before touching the DB", async () => {
        await expect(createBackupFile(null, FAST)).rejects.toThrow(
            "PASSWORD_TOO_SHORT",
        );
    });
});