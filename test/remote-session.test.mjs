import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createContext, runInContext } from "node:vm";
import test from "node:test";

// Execute the shipped preview entry point; only the DOM, Viewer and browser APIs
// are substituted. This is a session contract test, not a browser cookie-jar test.
async function preview(target, { allowed = true, response } = {}) {
  const elements = new Map();
  const requests = [];
  const opened = [];
  const permissions = [];
  const api = {
    permissions: {
      contains: async ({ origins }) => { permissions.push(...origins); return allowed; },
      request: async () => false,
    },
    storage: { session: {
      get: async (key) => ({ [key]: { v: 1, url: "https://documents.example/private.pdf" } }),
      remove: async () => {},
    } },
    runtime: { sendMessage: async () => {} },
  };
  const context = createContext({
    URL, URLSearchParams, AbortController, DOMException,
    [target === "firefox" ? "browser" : "chrome"]: api,
    navigator: { language: "en" },
    location: { hash: "#request=session-test", pathname: "/preview.html" },
    history: { replaceState() {} }, window: { addEventListener() {} },
    extendedFormatPack: {},
    document: {
      documentElement: {}, body: { classList: { add() {}, contains() { return false; } } },
      querySelector(id) {
        if (!elements.has(id)) elements.set(id, {
          addEventListener(event, callback) {
            if (id === "#grant" && event === "click") queueMicrotask(callback);
          },
          close: async () => {}, open: async (blob) => { opened.push(await blob.text()); },
        });
        return elements.get(id);
      },
    },
    fetch: async (url, options) => {
      requests.push({ url: url.href, ...options });
      // Model a signed-in source: browser-managed credentials are required.
      return response ?? new Response(options.credentials === "include" ? "%PDF-session-fixture" : "Sign in", {
        status: options.credentials === "include" ? 200 : 401,
      });
    },
  });
  const base = new URL(`../dist/${target}/`, import.meta.url);
  runInContext(`(() => {${await readFile(new URL("shared.js", base), "utf8")}\n})();`, context);
  const source = (await readFile(new URL("preview.js", base), "utf8"))
    .replace(/^import .*;\n/gmu, "")
    .replace("void consumeRemoteRequest();", "globalThis.completed = consumeRemoteRequest();");
  runInContext(source, context);
  await context.completed;
  return { requests, opened, permissions, diagnostic: runInContext("diagnostic", context) };
}

for (const target of ["chrome", "firefox", "safari"]) {
  test(`${target}: selected source uses the existing browser session`, async () => {
    const result = await preview(target);
    assert.deepEqual(result.opened, ["%PDF-session-fixture"]);
    assert.deepEqual(result.permissions, ["https://documents.example/*"]);
    assert.equal(result.requests.length, 1);
    assert.equal(result.requests[0].credentials, "include");
    assert.equal(result.requests[0].redirect, "manual");
    assert.equal(result.requests[0].headers, undefined); // No extracted Cookie or Authorization.
  });

  test(`${target}: denied source sends no credentialed request`, async () => {
    const result = await preview(target, { allowed: false });
    assert.equal(result.requests.length, 0);
    assert.equal(result.opened.length, 0);
    assert.equal(result.diagnostic.code, "PERMISSION_DENIED");
  });

  test(`${target}: opaque redirects do not silently forward credentials`, async () => {
    const result = await preview(target, { response: { type: "opaqueredirect" } });
    assert.equal(result.requests.length, 1);
    assert.equal(result.opened.length, 0);
    assert.equal(result.diagnostic.code, "REDIRECT_UNREADABLE");
  });
}
