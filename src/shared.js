const PROTOCOL_VERSION = 1;
const MAX_REMOTE_BYTES = 256 * 1024 * 1024;

function parseRemoteUrl(value) {
  const url = new URL(value);
  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
    throw Object.assign(new Error("Only credential-free HTTP(S) document URLs are allowed"), { code: "REMOTE_URL_BLOCKED" });
  }
  return url;
}

function originPattern(value) {
  return `${parseRemoteUrl(value).origin}/*`;
}

function safeDiagnostic(error) {
  const rawCode = typeof error?.code === "string" ? error.code : "PREVIEW_FAILED";
  const code = /^[A-Z0-9_]{1,80}$/u.test(rawCode) ? rawCode : "PREVIEW_FAILED";
  const category = code.includes("PASSWORD") || code.includes("ENCRYPT")
    ? "encrypted"
    : code.includes("UNSUPPORTED") || code.includes("FORMAT")
      ? "unsupported"
      : code.includes("PERMISSION") || code.includes("BLOCKED")
        ? "permission"
        : code.includes("HTTP") || code.includes("NETWORK") || code.includes("REDIRECT")
          ? "network"
          : code.includes("LIMIT") || code.includes("TOO_LARGE")
            ? "resource-limit"
            : "damaged-or-unknown";
  return Object.freeze({ v: PROTOCOL_VERSION, code, category });
}

globalThis.DocViewKitOmni = Object.freeze({
  PROTOCOL_VERSION,
  MAX_REMOTE_BYTES,
  parseRemoteUrl,
  originPattern,
  safeDiagnostic,
});
