/* ----------------------------------------------------------------
   Session key management.

   The decrypted DEK lives in memory only. Closing the tab, refreshing
   the page, or calling lock() drops it. This means:
     - A user who closes the tab must re-enter the PIN.
     - A stolen IndexedDB snapshot is worthless without the PIN.
     - Devtools can't read a persisted key — there isn't one.

   Best-effort zeroing on lock(): Uint8Array.fill(0) clears the
   buffer we hold. Copies elsewhere in the JIT/GC heap can't be
   cleared from JS. Not a security guarantee — just a good-faith
   attempt to minimize exposure.
   ---------------------------------------------------------------- */

let activeKey = null;
let autoLockMs = 2 * 60_000; // matches the mock's "2 minutes"
let lastActivityAt = Date.now();

export function setActiveKey(dekBytes) {
    activeKey = dekBytes;
    lastActivityAt = Date.now();
}

export function getActiveKey() {
    return activeKey;
}

export function isUnlocked() {
    return activeKey !== null;
}

export function touch() {
    lastActivityAt = Date.now();
}

export function shouldAutoLock() {
    if (!activeKey) return false;
    return Date.now() - lastActivityAt > autoLockMs;
}

export function setAutoLockDuration(ms) {
    autoLockMs = ms;
    // Changing the interval counts as activity. Otherwise picking
    // "5 minutes" while 4:30 idle would immediately trip the lock.
    lastActivityAt = Date.now();
}

export function getAutoLockDuration() {
    return autoLockMs;
}

export function lock() {
    if (activeKey instanceof Uint8Array) {
        activeKey.fill(0);
    }
    activeKey = null;
}