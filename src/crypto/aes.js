import { requireCrypto } from "../lib/webcrypto";

export async function encryptBytes(bytes, rawKey, iv) {
    const crypto = requireCrypto();
    const key = await crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        false,
        ["encrypt"],
    );
    const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
    return new Uint8Array(buf);
}

export async function decryptBytes(ciphertext, rawKey, iv) {
    const crypto = requireCrypto();
    const key = await crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"],
    );
    const buf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext,
    );
    return new Uint8Array(buf);
}

export function randomBytes(n) {
    const crypto = requireCrypto();
    return crypto.getRandomValues(new Uint8Array(n));
}