/* ----------------------------------------------------------------
   Failed-attempt throttle.

   Tiers: 3 fails → 30s, 5 fails → 5min, 10 fails → 30min.
   Resets on successful unlock.

   Memory-only by design. Persisting throttle state to localStorage
   would let anyone bypass it by clearing site data, and there's no
   server to enforce it. The real protection is the encryption +
   PBKDF2 cost, not this layer. This throttle is UX friction for
   casual attempts, nothing more. Documented as a known limitation.
   ---------------------------------------------------------------- */

const TIERS = [
    { after: 3, waitMs: 30_000 },
    { after: 5, waitMs: 5 * 60_000 },
    { after: 10, waitMs: 30 * 60_000 },
];

let failedCount = 0;
let lockedUntil = 0;

export function recordFailure() {
    failedCount += 1;
    const tier = [...TIERS].reverse().find((t) => failedCount >= t.after);
    if (tier) {
        lockedUntil = Date.now() + tier.waitMs;
    }
}

export function recordSuccess() {
    failedCount = 0;
    lockedUntil = 0;
}

export function getThrottleState() {
    const now = Date.now();
    const isLocked = now < lockedUntil;
    return {
        failedCount,
        isLocked,
        msRemaining: isLocked ? lockedUntil - now : 0,
        secondsRemaining: isLocked ? Math.ceil((lockedUntil - now) / 1000) : 0,
    };
}