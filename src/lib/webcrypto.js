/* ----------------------------------------------------------------
   Web Crypto availability.

   Two related but distinct checks:

   - isSecureContext(): browser-only. True if the page is on
     HTTPS or localhost. Used only by the WelcomePin UI to show
     a specific "secure connection required" page.

   - hasWebCrypto(): runtime check. True if crypto.subtle exists.
     Works in browsers AND in Node (where it's polyfilled from
     node:crypto). This is what the crypto modules must use.

   The two are equivalent in a browser (spec couples them), but
   NOT in Node — hence the split. Crypto layer must not depend on
   window.isSecureContext or every test in Node fails.
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

/** Runtime check — works in browsers AND Node. */
export function hasWebCrypto() {
    return typeof globalThis.crypto?.subtle !== "undefined";
}

/** Browser-only — kept for a more specific UI message. */
export function isSecureContext() {
    return (
        typeof window !== "undefined" && window.isSecureContext === true
    );
}

/** Throws InsecureContextError if crypto.subtle is unavailable. */
export function requireCrypto() {
    if (!hasWebCrypto()) {
        throw new InsecureContextError();
    }
    return globalThis.crypto;
}