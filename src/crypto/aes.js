/* ----------------------------------------------------------------
   AES-GCM primitives on top of Web Crypto.

   Always uses a 96-bit IV (the GCM default and strongest choice).
   Key must be 16, 24, or 32 bytes.
   ---------------------------------------------------------------- */

export async function encryptBytes(bytes, rawKey, iv) {
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
    const key = await crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"],
    );
    // Throws on tag mismatch (wrong key or tampered ciphertext)
    const buf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext,
    );
    return new Uint8Array(buf);
}

export function randomBytes(n) {
    return crypto.getRandomValues(new Uint8Array(n));
}