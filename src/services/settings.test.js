import { describe, it, expect, beforeEach } from "vitest";
import { resetTestState } from "../test/helpers";
import {
    getAutoLockMs,
    setAutoLockMs,
    formatAutoLock,
    DEFAULT_AUTO_LOCK_MS,
} from "./settings";

beforeEach(resetTestState);

describe("getAutoLockMs", () => {
    it("returns the default when nothing is persisted", async () => {
        expect(await getAutoLockMs()).toBe(DEFAULT_AUTO_LOCK_MS);
    });

    it("returns persisted value", async () => {
        await setAutoLockMs(30_000);
        expect(await getAutoLockMs()).toBe(30_000);
    });
});

describe("setAutoLockMs", () => {
    it("persists a valid value", async () => {
        await setAutoLockMs(5 * 60_000);
        expect(await getAutoLockMs()).toBe(5 * 60_000);
    });

    it("rejects negative", async () => {
        await expect(setAutoLockMs(-1)).rejects.toThrow("INVALID_AUTO_LOCK");
    });

    it("rejects non-number", async () => {
        await expect(setAutoLockMs("1000")).rejects.toThrow("INVALID_AUTO_LOCK");
    });
});

describe("formatAutoLock", () => {
    it("formats common values", () => {
        expect(formatAutoLock(30_000)).toBe("30 seconds");
        expect(formatAutoLock(60_000)).toBe("1 minute");
        expect(formatAutoLock(120_000)).toBe("2 minutes");
        expect(formatAutoLock(60 * 60_000)).toBe("1 hour");
    });

    it("returns Never for zero or invalid", () => {
        expect(formatAutoLock(0)).toBe("Never");
        expect(formatAutoLock(-1)).toBe("Never");
    });
});