import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    recordFailure,
    recordSuccess,
    getThrottleState,
} from "./throttle";

describe("throttle", () => {
    beforeEach(() => {
        // Reset between tests
        recordSuccess();
    });

    it("starts unlocked", () => {
        const state = getThrottleState();
        expect(state.failedCount).toBe(0);
        expect(state.isLocked).toBe(false);
        expect(state.secondsRemaining).toBe(0);
    });

    it("increments failedCount", () => {
        recordFailure();
        recordFailure();
        expect(getThrottleState().failedCount).toBe(2);
    });

    it("locks after 3 failed attempts", () => {
        recordFailure();
        recordFailure();
        recordFailure();
        const state = getThrottleState();
        expect(state.isLocked).toBe(true);
        expect(state.secondsRemaining).toBeGreaterThan(0);
    });

    it("resets on success", () => {
        recordFailure();
        recordFailure();
        recordFailure();
        expect(getThrottleState().isLocked).toBe(true);
        recordSuccess();
        const state = getThrottleState();
        expect(state.failedCount).toBe(0);
        expect(state.isLocked).toBe(false);
    });

    it("expires after the wait window", () => {
        recordFailure();
        recordFailure();
        recordFailure();
        expect(getThrottleState().isLocked).toBe(true);

        // Fast-forward 31 seconds
        vi.useFakeTimers();
        vi.setSystemTime(Date.now() + 31_000);
        expect(getThrottleState().isLocked).toBe(false);
        vi.useRealTimers();
    });
});