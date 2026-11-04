import { useCallback, useEffect, useState } from "react";
import { db, seedDefaultCategories } from "../db/db";
import { setupVault, unlockVault, rewrapDEK } from "../crypto/vault";
import {
  setActiveKey,
  getActiveKey,
  isUnlocked as sessionIsUnlocked,
  touch,
  lock as sessionLock,
  shouldAutoLock,
  setAutoLockDuration,
} from "./session";
import { recordSuccess } from "./throttle";
import { AuthContext } from "./authContext";
import { ensureEncryptedAtRest } from "../services/encryption";
import {
  DEFAULT_AUTO_LOCK_MS,
  getAutoLockMs,
  setAutoLockMs,
} from "../services/settings";

const VAULT_SETTINGS_KEY = "vault";
const ACTIVITY_THROTTLE_MS = 1_000;

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("booting");
  const [vaultMeta, setVaultMeta] = useState(null);
  const [autoLockMs, setAutoLockMsState] = useState(DEFAULT_AUTO_LOCK_MS);

  /* ---------- Boot: load vault metadata + auto-lock setting ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [vaultRow, autoLockValue] = await Promise.all([
          db.appSettings.get(VAULT_SETTINGS_KEY),
          getAutoLockMs(),
        ]);
        if (cancelled) return;

        setAutoLockDuration(autoLockValue);
        setAutoLockMsState(autoLockValue);

        const meta = vaultRow?.value;
        if (!meta || !meta.wrappedDEK) {
          setStatus("no-vault");
          return;
        }
        setVaultMeta(meta);
        setStatus(sessionIsUnlocked() ? "unlocked" : "locked");
      } catch (err) {
        console.error("Vault load failed:", err);
        if (!cancelled) setStatus("no-vault");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------------------------------
     Auto-lock: one setTimeout, re-armed on every activity.
     Fires exactly at autoLockMs (not "autoLockMs + up to 10s").
     visibilitychange is a safety net for background-throttled timers.
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (status !== "unlocked") return;
    if (autoLockMs <= 0) return; // "never" — not offered in v1

    let timeoutId = null;

    const armTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionLock();
        setStatus("locked");
      }, autoLockMs);
    };

    armTimer();

    let lastLocalActivity = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastLocalActivity < ACTIVITY_THROTTLE_MS) return;
      lastLocalActivity = now;
      touch();
      armTimer();
    };

    const events = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    for (const e of events) {
      window.addEventListener(e, onActivity, { passive: true });
    }

    // Safety net: if the tab was background-throttled, we might have
    // missed our timer. On return to foreground, recheck.
    const onVisibility = () => {
      if (document.visibilityState === "visible" && shouldAutoLock()) {
        sessionLock();
        setStatus("locked");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      for (const e of events) window.removeEventListener(e, onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [status, autoLockMs]);

  /* ---------- Migration kickoff (unchanged) ---------- */
  const kickMigration = useCallback(() => {
    ensureEncryptedAtRest().catch((err) =>
      console.error("Encryption migration failed:", err),
    );
  }, []);

  /* ---------- Vault lifecycle (unchanged) ---------- */
  const setupVaultAndUnlock = useCallback(
    async (pin) => {
      const { dekBytes, metadata } = await setupVault(pin);
      await seedDefaultCategories();
      await db.appSettings.put({ key: VAULT_SETTINGS_KEY, value: metadata });
      setActiveKey(dekBytes);
      setVaultMeta(metadata);
      setStatus("unlocked");
      kickMigration();
    },
    [kickMigration],
  );

  const unlockWithPin = useCallback(
    async (pin) => {
      if (!vaultMeta) throw new Error("No vault");
      const dekBytes = await unlockVault(pin, vaultMeta);
      setActiveKey(dekBytes);
      recordSuccess();
      setStatus("unlocked");
      kickMigration();
      return dekBytes;
    },
    [vaultMeta, kickMigration],
  );

  const verifyPin = useCallback(
    async (pin) => {
      if (!vaultMeta) throw new Error("No vault");
      await unlockVault(pin, vaultMeta);
    },
    [vaultMeta],
  );

  const applyNewPin = useCallback(
    async (newPin) => {
      if (!vaultMeta) throw new Error("No vault");
      const dek = getActiveKey();
      if (!dek) throw new Error("Not unlocked");
      const newMetadata = await rewrapDEK(dek, newPin, vaultMeta);
      await db.appSettings.put({
        key: VAULT_SETTINGS_KEY,
        value: newMetadata,
      });
      setVaultMeta(newMetadata);
    },
    [vaultMeta],
  );

  const updateAutoLock = useCallback(async (ms) => {
    await setAutoLockMs(ms);
    setAutoLockDuration(ms);
    setAutoLockMsState(ms);
  }, []);

  const lock = useCallback(() => {
    sessionLock();
    setStatus("locked");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        vaultMeta,
        setupVaultAndUnlock,
        unlockWithPin,
        verifyPin,
        applyNewPin,
        lock,
        autoLockMs,
        updateAutoLock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
