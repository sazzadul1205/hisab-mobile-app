import { useCallback, useEffect, useRef, useState } from "react";
import { db, seedDefaultCategories } from "../db/db";
import { setupVault, unlockVault, rewrapDEK } from "../crypto/vault";
import {
  setActiveKey,
  getActiveKey,
  isUnlocked as sessionIsUnlocked,
  touch,
  lock as sessionLock,
  shouldAutoLock,
} from "./session";
import { recordSuccess } from "./throttle";
import { AuthContext } from "./authContext";
import { ensureEncryptedAtRest } from "../services/encryption";

const VAULT_SETTINGS_KEY = "vault";
const AUTO_LOCK_TICK_MS = 10_000;
const ACTIVITY_THROTTLE_MS = 1_000;

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("booting");
  const [vaultMeta, setVaultMeta] = useState(null);
  const lastActivityAt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const row = await db.appSettings.get(VAULT_SETTINGS_KEY);
        if (cancelled) return;
        const meta = row?.value;
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

  useEffect(() => {
    if (status !== "unlocked") return;
    const handler = () => {
      const now = Date.now();
      if (now - lastActivityAt.current > ACTIVITY_THROTTLE_MS) {
        lastActivityAt.current = now;
        touch();
      }
    };
    const events = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    for (const e of events) {
      window.addEventListener(e, handler, { passive: true });
    }
    return () => {
      for (const e of events) window.removeEventListener(e, handler);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "unlocked") return;
    const id = setInterval(() => {
      if (shouldAutoLock()) {
        sessionLock();
        setStatus("locked");
      }
    }, AUTO_LOCK_TICK_MS);
    return () => clearInterval(id);
  }, [status]);

  // Run migration if needed — non-blocking, safe to fire-and-forget.
  // Failures log but never block the app: decryption handles both
  // pre-migration (plaintext) and post-migration (encrypted) rows.
  const kickMigration = useCallback(() => {
    ensureEncryptedAtRest().catch((err) =>
      console.error("Encryption migration failed:", err),
    );
  }, []);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
