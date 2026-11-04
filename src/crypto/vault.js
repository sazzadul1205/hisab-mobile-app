/* ----------------------------------------------------------------
   Vault: the PIN → DEK wrap.

   Structure:
     - master key = PBKDF2(PIN, salt, 600k, SHA-256)
     - DEK        = random 32 bytes (encrypts records)
     - wrappedDEK = AES-GCM(DEK, master key, iv)
   Metadata stores: version, salt, iterations, iv, wrappedDEK, createdAt.

   Unlock: derive master key from PIN, decrypt wrappedDEK. If GCM tag
   verification fails, the PIN is wrong. There is no separate
   plaintext comparison — the tag check IS the PIN check.

   Change PIN: unwrap DEK with old PIN, re-wrap with new PIN's master
   key. The DEK itself never changes — encrypted records are never
   touched.

   No PIN recovery: matches SRS §5 — a lost PIN must not silently
   bypass encryption. The encrypted backup is the only recovery path.
   ---------------------------------------------------------------- */

import { encryptBytes, decryptBytes, randomBytes } from "./aes";
import { deriveMasterKey, DEFAULT_ITERATIONS } from "./kdf";

export const VAULT_VERSION = 1;

const DEK_BYTES = 32;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export class InvalidPinError extends Error {
    constructor() {
        super("INVALID_PIN");
        this.name = "InvalidPinError";
    }
}

/* ----------------------------------------------------------------
   Setup — call on first launch.
   Returns { dekBytes, metadata }. Caller persists metadata and
   keeps dekBytes in memory (via session.setActiveKey).
   ---------------------------------------------------------------- */
export async function setupVault(pin, { iterations = DEFAULT_ITERATIONS } = {}) {
    if (!pin || typeof pin !== "string") {
        throw new Error("PIN_REQUIRED");
    }

    const salt = randomBytes(SALT_BYTES);
    const masterKey = await deriveMasterKey(pin, salt, iterations);

    const dekBytes = randomBytes(DEK_BYTES);
    const iv = randomBytes(IV_BYTES);
    const wrappedDEK = await encryptBytes(dekBytes, masterKey, iv);

    return {
        dekBytes,
        metadata: {
            version: VAULT_VERSION,
            salt,
            iterations,
            iv,
            wrappedDEK,
            createdAt: new Date().toISOString(),
        },
    };
}

/* ----------------------------------------------------------------
   Unlock — call after user enters PIN.
   Returns dekBytes on success; throws InvalidPinError on wrong PIN.
   ---------------------------------------------------------------- */
export async function unlockVault(pin, metadata) {
    if (!pin || typeof pin !== "string") {
        throw new InvalidPinError();
    }
    if (!metadata || metadata.version !== VAULT_VERSION) {
        throw new Error("UNSUPPORTED_VAULT_VERSION");
    }

    const masterKey = await deriveMasterKey(
        pin,
        metadata.salt,
        metadata.iterations,
    );

    try {
        const dekBytes = await decryptBytes(
            metadata.wrappedDEK,
            masterKey,
            metadata.iv,
        );
        if (dekBytes.length !== DEK_BYTES) {
            throw new InvalidPinError();
        }
        return dekBytes;
    } catch {
        // AES-GCM tag mismatch (wrong key) or malformed wrapped DEK
        throw new InvalidPinError();
    }
}

/* ----------------------------------------------------------------
   Change PIN — verify old, re-wrap DEK with new master key.
   Records stay untouched (they're encrypted with DEK, not PIN).
   ---------------------------------------------------------------- */
export async function changePin(oldPin, newPin, metadata) {
    if (!newPin || typeof newPin !== "string") {
        throw new Error("NEW_PIN_REQUIRED");
    }

    // Verify old PIN by unwrapping DEK
    const oldMasterKey = await deriveMasterKey(
        oldPin,
        metadata.salt,
        metadata.iterations,
    );
    let dekBytes;
    try {
        dekBytes = await decryptBytes(
            metadata.wrappedDEK,
            oldMasterKey,
            metadata.iv,
        );
    } catch {
        throw new InvalidPinError();
    }

    // Re-wrap with new PIN + new salt + new IV
    const newSalt = randomBytes(SALT_BYTES);
    const newMasterKey = await deriveMasterKey(
        newPin,
        newSalt,
        metadata.iterations,
    );
    const newIv = randomBytes(IV_BYTES);
    const newWrappedDEK = await encryptBytes(dekBytes, newMasterKey, newIv);

    return {
        dekBytes,
        metadata: {
            ...metadata,
            salt: newSalt,
            iv: newIv,
            wrappedDEK: newWrappedDEK,
        },
    };
}

/* ----------------------------------------------------------------
   Record-level helpers.

   Callers pass plain JS objects. The result is safe to persist as-is
   (Dexie handles Uint8Array natively). Every write uses a fresh
   random IV, so identical plaintexts produce different ciphertexts.
   ---------------------------------------------------------------- */

export async function encryptForStorage(data, dekBytes) {
    const iv = randomBytes(IV_BYTES);
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const ct = await encryptBytes(plaintext, dekBytes, iv);
    return { iv, ct };
}

export async function decryptFromStorage({ iv, ct }, dekBytes) {
    const plaintext = await decryptBytes(ct, dekBytes, iv);
    return JSON.parse(new TextDecoder().decode(plaintext));
}

/* ----------------------------------------------------------------
   Rewrap — used by the Change PIN flow after the user has been
   verified. Skips re-derivation of the old master key (caller
   already verified), so the whole change costs one PBKDF2 derive.
   ---------------------------------------------------------------- */
export async function rewrapDEK(dekBytes, newPin, metadata) {
    if (!newPin || typeof newPin !== "string") {
        throw new Error("NEW_PIN_REQUIRED");
    }
    if (!dekBytes || dekBytes.length !== DEK_BYTES) {
        throw new Error("INVALID_DEK");
    }

    const newSalt = randomBytes(SALT_BYTES);
    const newMasterKey = await deriveMasterKey(
        newPin,
        newSalt,
        metadata.iterations,
    );
    const newIv = randomBytes(IV_BYTES);
    const newWrappedDEK = await encryptBytes(dekBytes, newMasterKey, newIv);

    return {
        ...metadata,
        salt: newSalt,
        iv: newIv,
        wrappedDEK: newWrappedDEK,
    };
}