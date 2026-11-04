/* ----------------------------------------------------------------
   Web Crypto is only available on secure origins. This helper
   gives every crypto call a single, clear failure mode instead of
   "Cannot read properties of undefined".
   ---------------------------------------------------------------- */

export class InsecureContextError extends Error {
    constructor() {
        super(
            "Web Crypto requires a secure context (HTTPS or localhost). " +
            "If you're testing on a phone, use a tunnel or HTTPS.",
        );
        this.name = "InsecureContextError";
    }
}

export function isSecureContext() {
    return (
        typeof window !== "undefined" &&
        window.isSecureContext === true &&
        typeof globalThis.crypto?.subtle !== "undefined"
    );
}

export function requireCrypto() {
    if (!isSecureContext()) {
        throw new InsecureContextError();
    }
    return globalThis.crypto;
}