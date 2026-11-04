import { describe, it, expect, beforeEach } from "vitest";
import { resetTestState } from "../test/helpers";
import { createAccount } from "./accounts";
import { createIncome } from "./transactions";
import { getStorageEstimate, getTableCounts, formatBytes } from "./storage";

beforeEach(resetTestState);

describe("getTableCounts", () => {
    it("returns zeros on a fresh DB", async () => {
        const counts = await getTableCounts();
        expect(counts.accounts).toBe(0);
        expect(counts.transactions).toBe(0);
        expect(counts.categories).toBe(0);
        expect(counts.reconciliations).toBe(0);
        expect(counts.imports).toBe(0);
    });

    it("reflects inserted records", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 0,
        });
        await createIncome({
            amount: 1000,
            accountId: acc.id,
            categoryId: "inc-other",
            date: new Date().toISOString(),
            note: "x",
        });
        const counts = await getTableCounts();
        expect(counts.accounts).toBe(1);
        expect(counts.transactions).toBe(1);
    });
});

describe("getStorageEstimate", () => {
    it("returns an object with the expected shape", async () => {
        const est = await getStorageEstimate();
        expect(est).toHaveProperty("supported");
        expect(est).toHaveProperty("usage");
        expect(est).toHaveProperty("quota");
        expect(est).toHaveProperty("percentUsed");
        expect(typeof est.supported).toBe("boolean");
    });

    it("returns unsupported when navigator.storage is missing", async () => {
        const original = globalThis.navigator;

        globalThis.navigator = {};
        try {
            const est = await getStorageEstimate();
            expect(est.supported).toBe(false);
        } finally {
            globalThis.navigator = original;
        }
    });
});

describe("formatBytes", () => {
    it("formats zero", () => {
        expect(formatBytes(0)).toBe("0 B");
    });
    it("formats bytes", () => {
        expect(formatBytes(512)).toBe("512 B");
    });
    it("formats kilobytes", () => {
        expect(formatBytes(2048)).toBe("2.0 KB");
    });
    it("formats megabytes", () => {
        expect(formatBytes(1536 * 1024)).toBe("1.5 MB");
    });
    it("formats gigabytes", () => {
        expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe("2.0 GB");
    });
    it("handles negative and undefined", () => {
        expect(formatBytes(-1)).toBe("0 B");
        expect(formatBytes(undefined)).toBe("0 B");
    });
});