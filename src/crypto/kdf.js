/* ----------------------------------------------------------------
   PBKDF2 key derivation.

   Uses PBKDF2-HMAC-SHA256 for compatibility — Web Crypto doesn't
   expose Argon2, and pulling in a WASM implementation adds ~100KB
   for a marginal gain on a local-first PWA.

   600,000 iterations is the current OWASP recommendation for
   SHA-256. Tests can pass a lower count for speed; the algorithm
   is identical.
   ---------------------------------------------------------------- */

export const DEFAULT_ITERATIONS = 600_000;

export async function deriveMasterKey(
    pin,
    salt,
    iterations = DEFAULT_ITERATIONS,
) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(pin),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations,
            hash: "SHA-256",
        },
        keyMaterial,
        256, // 32-byte master key
    );

    return new Uint8Array(bits);
}