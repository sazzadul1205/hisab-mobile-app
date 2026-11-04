import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    encryptRecord,
    decryptRecord,
    isEncrypted,
    EncryptionNotReadyError,
} from "./encryption";
import { setActiveKey, lock } from "../auth/session";
import { setupVault } from "../crypto/vault";

const FAST = { iterations: 10_000 };
let dek;

beforeEach(async () => {
    const setup = await setupVault("1234", FAST);
    dek = setup.dekBytes;
    setActiveKey(dek);
});

afterEach(() => {
    lock();
});

describe("isEncrypted", () => {
    it("is false for plaintext records", () => {
        expect(isEncrypted({ id: "a", name: "Cash" })).toBe(false);
    });
    it("is true for encrypted rows", () => {
        expect(isEncrypted({ id: "a", enc: { iv: "x", ct: "y" } })).toBe(true);
    });
});

describe("encryptRecord / decryptRecord round-trip", () => {
    it("preserves index fields plaintext", async () => {
        const tx = {
            id: "t1",
            type: "income",
            amount: 4500000,
            accountId: "a1",
            categoryId: "inc-salary",
            date: "2026-11-04T08:00:00Z",
            note: "Salary",
            createdAt: "2026-11-04T08:00:00Z",
            updatedAt: "2026-11-04T08:00:00Z",
        };
        const row = await encryptRecord("transactions", tx);
        expect(row.id).toBe("t1");
        expect(row.type).toBe("income");
        expect(row.date).toBe("2026-11-04T08:00:00Z");
        expect(row.accountId).toBe("a1");
        expect(row.destinationAccountId).toBeUndefined();
        expect(row.categoryId).toBe("inc-salary");
        // Amount is encrypted, not plaintext
        expect(row.amount).toBeUndefined();
        expect(row.note).toBeUndefined();
        expect(row.enc).toBeDefined();
    });

    it("round-trips the plaintext record", async () => {
        const original = {
            id: "a1",
            name: "City Bank — Savings",
            type: "bank",
            openingBalance: 4000000,
            isArchived: false,
            createdAt: "2026-01-01T00:00:00Z",
        };
        const row = await encryptRecord("accounts", original);
        const back = await decryptRecord("accounts", row);
        expect(back).toEqual(original);
    });

    it("uses fresh IV per encryption", async () => {
        const record = { id: "a1", name: "Cash", type: "cash", openingBalance: 0, isArchived: false, createdAt: "x" };
        const a = await encryptRecord("accounts", record);
        const b = await encryptRecord("accounts", record);
        expect(a.enc.iv).not.toBe(b.enc.iv);
        expect(a.enc.ct).not.toBe(b.enc.ct);
    });
});

describe("decryptRecord on plaintext (pre-migration)", () => {
    it("passes plaintext rows through unchanged", async () => {
        const plain = { id: "a1", name: "Cash", type: "cash", isArchived: false };
        const back = await decryptRecord("accounts", plain);
        expect(back).toBe(plain);
    });
});

describe("EncryptionNotReadyError", () => {
    it("throws when no DEK is set", async () => {
        lock();
        await expect(
            encryptRecord("accounts", {
                id: "a1",
                name: "Cash",
                type: "cash",
                openingBalance: 0,
                isArchived: false,
                createdAt: "x",
            }),
        ).rejects.toBeInstanceOf(EncryptionNotReadyError);
    });

    it("throws when decrypting an encrypted row with no DEK", async () => {
        const row = await encryptRecord("accounts", {
            id: "a1",
            name: "Cash",
            type: "cash",
            openingBalance: 0,
            isArchived: false,
            createdAt: "x",
        });
        lock();
        await expect(decryptRecord("accounts", row)).rejects.toBeInstanceOf(
            EncryptionNotReadyError,
        );
    });
});