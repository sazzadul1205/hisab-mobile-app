/* ----------------------------------------------------------------
   Encrypted backup export / import.

   File format (.hisab, JSON envelope):
     {
       "format": "hisab-backup",
       "version": 1,
       "createdAt": "ISO",
       "kdf": { "algorithm": "PBKDF2-SHA256", "iterations": 600000, "salt": "b64" },
       "cipher": { "algorithm": "AES-GCM", "iv": "b64" },
       "data": "base64-of-ciphertext"
     }

   The encrypted `data` payload is JSON:
     { accounts, transactions, categories, reconciliationRecords, importRecords }

   appSettings is intentionally excluded — vault metadata is device-
   specific and would be invalid on a different device/PIN.

   Backup password is independent of the PIN. A restore onto a fresh
   install (new vault) is expected: records live independent of the
   vault that holds them.
   ---------------------------------------------------------------- */

import { db } from "../db/db";
import { encryptBytes, decryptBytes, randomBytes } from "../crypto/aes";
import { deriveMasterKey, DEFAULT_ITERATIONS } from "../crypto/kdf";
import { decryptRecord, encryptRecord } from "./encryption";

export const BACKUP_FORMAT = "hisab-backup";
export const BACKUP_VERSION = 1;

const SALT_BYTES = 16;
const IV_BYTES = 12;

export class BackupValidationError extends Error {
    constructor(code) {
        super(code);
        this.name = "BackupValidationError";
        this.code = code;
    }
}

export class BackupPasswordError extends Error {
    constructor() {
        super("WRONG_PASSWORD");
        this.name = "BackupPasswordError";
    }
}

/* ----------------------------------------------------------------
   Base64 helpers (browser-safe, no Buffer)
   ---------------------------------------------------------------- */
function toB64(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
}

function fromB64(str) {
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

/* ----------------------------------------------------------------
   Collect all restorable data from the DB
   ---------------------------------------------------------------- */

export async function collectRecords() {
    const tables = [
        ["accounts", db.accounts],
        ["transactions", db.transactions],
        ["categories", db.categories],
        ["reconciliationRecords", db.reconciliationRecords],
        ["importRecords", db.importRecords],
    ];
    const out = {};
    for (const [name, table] of tables) {
        const rows = await table.toArray();
        out[name] = await Promise.all(
            rows.map((r) => decryptRecord(name, r)),
        );
    }
    return out;
}

export function countRecords(data) {
    return {
        accounts: data.accounts?.length ?? 0,
        transactions: data.transactions?.length ?? 0,
        categories: data.categories?.length ?? 0,
        reconciliationRecords: data.reconciliationRecords?.length ?? 0,
        importRecords: data.importRecords?.length ?? 0,
    };
}

export function totalRecordCount(counts) {
    return Object.values(counts).reduce((s, n) => s + n, 0);
}

/* ----------------------------------------------------------------
   Export — produces the .hisab file contents (string) plus counts
   ---------------------------------------------------------------- */
export async function createBackupFile(password, { iterations = DEFAULT_ITERATIONS } = {}) {
    if (!password || typeof password !== "string" || password.length < 8) {
        throw new BackupValidationError("PASSWORD_TOO_SHORT");
    }

    const records = await collectRecords();
    const plaintext = new TextEncoder().encode(JSON.stringify(records));

    const salt = randomBytes(SALT_BYTES);
    const iv = randomBytes(IV_BYTES);
    const key = await deriveMasterKey(password, salt, iterations);
    const ct = await encryptBytes(plaintext, key, iv);

    const envelope = {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        createdAt: new Date().toISOString(),
        kdf: {
            algorithm: "PBKDF2-SHA256",
            iterations,
            salt: toB64(salt),
        },
        cipher: {
            algorithm: "AES-GCM",
            iv: toB64(iv),
        },
        data: toB64(ct),
    };

    return {
        contents: JSON.stringify(envelope, null, 2),
        counts: countRecords(records),
        createdAt: envelope.createdAt,
    };
}

/* ----------------------------------------------------------------
   Validate + parse an envelope (throws BackupValidationError with
   a machine code on failure). No crypto here.
   ---------------------------------------------------------------- */
export function validateEnvelope(raw) {
    let env;
    try {
        env = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
        throw new BackupValidationError("INVALID_JSON");
    }

    if (!env || typeof env !== "object") {
        throw new BackupValidationError("NOT_AN_OBJECT");
    }
    if (env.format !== BACKUP_FORMAT) {
        throw new BackupValidationError("WRONG_FORMAT");
    }
    if (env.version !== BACKUP_VERSION) {
        throw new BackupValidationError("UNSUPPORTED_VERSION");
    }
    if (!env.kdf || typeof env.kdf.iterations !== "number" || !env.kdf.salt) {
        throw new BackupValidationError("MALFORMED_KDF");
    }
    if (!env.cipher || !env.cipher.iv) {
        throw new BackupValidationError("MALFORMED_CIPHER");
    }
    if (typeof env.data !== "string" || env.data.length === 0) {
        throw new BackupValidationError("MALFORMED_DATA");
    }

    return env;
}

/* ----------------------------------------------------------------
   Read + decrypt a .hisab file. Throws BackupPasswordError on wrong
   password, BackupValidationError on malformed input.
   ---------------------------------------------------------------- */
export async function readBackupFile(raw, password) {
    const env = validateEnvelope(raw);

    let salt;
    let iv;
    let ct;
    try {
        salt = fromB64(env.kdf.salt);
        iv = fromB64(env.cipher.iv);
        ct = fromB64(env.data);
    } catch {
        throw new BackupValidationError("MALFORMED_BASE64");
    }

    let plaintext;
    try {
        const key = await deriveMasterKey(password, salt, env.kdf.iterations);
        plaintext = await decryptBytes(ct, key, iv);
    } catch {
        throw new BackupPasswordError();
    }

    let data;
    try {
        data = JSON.parse(new TextDecoder().decode(plaintext));
    } catch {
        throw new BackupValidationError("INVALID_PLAINTEXT");
    }

    if (!data || typeof data !== "object" || !Array.isArray(data.accounts)) {
        throw new BackupValidationError("MALFORMED_RECORDS");
    }

    return {
        data,
        counts: countRecords(data),
        createdAt: env.createdAt,
    };
}

/* ----------------------------------------------------------------
   Restore — write decrypted records to the DB.

   Modes:
     "replace" — wipe all tables, then bulk-add (nuclear, explicit)
     "merge"   — add only records whose id is not already present
                 (never silently overwrites)

   appSettings and vault metadata are NEVER touched — that's what
   keeps the current session valid after restore.
   ---------------------------------------------------------------- */
export async function restoreBackup(data, mode = "replace") {
    if (mode !== "replace" && mode !== "merge") {
        throw new Error("INVALID_MODE");
    }

    const tableList = [
        ["accounts", db.accounts],
        ["transactions", db.transactions],
        ["categories", db.categories],
        ["reconciliationRecords", db.reconciliationRecords],
        ["importRecords", db.importRecords],
    ];

    // Phase 1 (outside tx): encrypt all incoming records.
    // Done upfront so no async crypto work happens inside the
    // Dexie transaction (which would otherwise auto-commit early).
    const encrypted = {};
    for (const [name] of tableList) {
        const incoming = data[name] ?? [];
        encrypted[name] = await Promise.all(
            incoming.map((r) => encryptRecord(name, r)),
        );
    }

    // Phase 2 (in tx): apply.
    return db.transaction("rw", tableList.map(([, t]) => t), async () => {
        let added = 0;
        let skipped = 0;

        for (const [name, table] of tableList) {
            const rows = encrypted[name];

            if (mode === "replace") {
                await table.clear();
                if (rows.length) {
                    await table.bulkAdd(rows);
                    added += rows.length;
                }
            } else {
                if (rows.length === 0) continue;
                const existing = await table.bulkGet(rows.map((r) => r.id));
                const toAdd = rows.filter((_, i) => existing[i] == null);
                skipped += rows.length - toAdd.length;
                if (toAdd.length) {
                    await table.bulkAdd(toAdd);
                    added += toAdd.length;
                }
            }
        }

        return { added, skipped };
    });
}

/* ----------------------------------------------------------------
   Backup log (for the History tab) — small metadata entries in
   appSettings under key "backup-log". Capped at 20 most recent.
   ---------------------------------------------------------------- */
const BACKUP_LOG_KEY = "backup-log";
const BACKUP_LOG_MAX = 20;

export async function recordBackupInLog({ filename, sizeBytes, counts }) {
    const row = await db.appSettings.get(BACKUP_LOG_KEY);
    const log = Array.isArray(row?.value) ? row.value : [];
    const entry = {
        id: crypto.randomUUID(),
        filename,
        sizeBytes,
        counts,
        createdAt: new Date().toISOString(),
    };
    const next = [entry, ...log].slice(0, BACKUP_LOG_MAX);
    await db.appSettings.put({ key: BACKUP_LOG_KEY, value: next });
    return entry;
}

export async function readBackupLog() {
    const row = await db.appSettings.get(BACKUP_LOG_KEY);
    return Array.isArray(row?.value) ? row.value : [];
}

export { BACKUP_LOG_KEY };