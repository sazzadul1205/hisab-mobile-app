import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/db";
import { resetTestState } from "../test/helpers";
import {
    createAccount,
    listAccounts,
    getAccount,
    updateAccount,
    setArchived,
} from "./accounts";
import { isEncrypted } from "./encryption";

beforeEach(resetTestState);

describe("createAccount", () => {
    it("creates a valid account", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 500000,
        });
        expect(acc.id).toBeTruthy();
        expect(acc.name).toBe("Cash");
        expect(acc.openingBalance).toBe(500000);
        expect(acc.isArchived).toBe(false);
    });

    it("trims whitespace from name", async () => {
        const acc = await createAccount({
            name: "  Cash  ",
            type: "cash",
            openingBalance: 0,
        });
        expect(acc.name).toBe("Cash");
    });

    it("rejects empty name", async () => {
        await expect(
            createAccount({ name: "", type: "cash", openingBalance: 0 }),
        ).rejects.toThrow("NAME_REQUIRED");
        await expect(
            createAccount({ name: "   ", type: "cash", openingBalance: 0 }),
        ).rejects.toThrow("NAME_REQUIRED");
    });

    it("rejects non-integer openingBalance", async () => {
        await expect(
            createAccount({ name: "Cash", type: "cash", openingBalance: 5000.5 }),
        ).rejects.toThrow("OPENING_BALANCE_INVALID");
    });

    it("stores the row encrypted", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 500000,
        });
        const raw = await db.accounts.get(acc.id);
        expect(isEncrypted(raw)).toBe(true);
        expect(raw.name).toBeUndefined();
        expect(raw.openingBalance).toBeUndefined();
        expect(raw.type).toBe("cash"); // index field stays plaintext
        expect(raw.isArchived).toBe(false);
    });
});

describe("listAccounts", () => {
    it("returns empty when no accounts exist", async () => {
        expect(await listAccounts()).toEqual([]);
    });

    it("returns all accounts decrypted", async () => {
        await createAccount({ name: "Cash", type: "cash", openingBalance: 100 });
        await createAccount({ name: "Bank", type: "bank", openingBalance: 200 });
        const list = await listAccounts();
        expect(list).toHaveLength(2);
        expect(list.map((a) => a.name).sort()).toEqual(["Bank", "Cash"]);
    });
});

describe("getAccount", () => {
    it("returns null for missing id", async () => {
        expect(await getAccount("nope")).toBeNull();
    });

    it("returns null for null input", async () => {
        expect(await getAccount(null)).toBeNull();
    });

    it("returns decrypted record", async () => {
        const created = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 500000,
        });
        const fetched = await getAccount(created.id);
        expect(fetched.name).toBe("Cash");
        expect(fetched.openingBalance).toBe(500000);
    });
});

describe("updateAccount", () => {
    it("updates name and type", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 100,
        });
        await updateAccount(acc.id, { name: "Cash 2", type: "wallet" });
        const fetched = await getAccount(acc.id);
        expect(fetched.name).toBe("Cash 2");
        expect(fetched.type).toBe("wallet");
    });

    it("updates openingBalance when provided", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 500000,
        });
        await updateAccount(acc.id, {
            name: "Cash",
            type: "cash",
            openingBalance: 600000,
        });
        const fetched = await getAccount(acc.id);
        expect(fetched.openingBalance).toBe(600000);
    });

    it("throws on missing account", async () => {
        await expect(
            updateAccount("nope", { name: "X", type: "cash" }),
        ).rejects.toThrow("NOT_FOUND");
    });
});

describe("setArchived", () => {
    it("archives and un-archives an account", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 0,
        });
        await setArchived(acc.id, true);
        expect((await getAccount(acc.id)).isArchived).toBe(true);
        await setArchived(acc.id, false);
        expect((await getAccount(acc.id)).isArchived).toBe(false);
    });

    it("index field isArchived stays plaintext", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 0,
        });
        await setArchived(acc.id, true);
        const raw = await db.accounts.get(acc.id);
        expect(raw.isArchived).toBe(true);
        expect(raw.name).toBeUndefined();
    });
});