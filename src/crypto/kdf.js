import { requireCrypto } from "../lib/webcrypto";

export const DEFAULT_ITERATIONS = 600_000;

export async function deriveMasterKey(
    pin,
    salt,
    iterations = DEFAULT_ITERATIONS,
) {
    const crypto = requireCrypto();

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
        256,
    );

    return new Uint8Array(bits);
}