import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import "../src/shared.js";

const { originPattern, parseRemoteUrl, safeDiagnostic } = globalThis.DocViewKitOmni;

const root = path.resolve(import.meta.dirname, "..");
const targets = ["chrome", "firefox", "safari"];
const json = async (file) => JSON.parse(await readFile(file, "utf8"));

async function filesUnder(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

test("remote URLs are reduced to credential-free HTTP(S) origins", () => {
  assert.equal(originPattern("https://example.com:8443/a/report.docx?token=secret"), "https://example.com:8443/*");
  assert.equal(originPattern("http://example.com/a/report.docx"), "http://example.com/*");
  assert.throws(() => parseRemoteUrl("ftp://example.com/a.pdf"));
  assert.throws(() => parseRemoteUrl("https://user:secret@example.com/a.pdf"));
});

test("diagnostics never copy raw messages, paths, or URLs", () => {
  const result = safeDiagnostic({ code: "PDF_FORMAT_UNSUPPORTED", message: "secret /Users/a/file.pdf https://example.com" });
  assert.deepEqual(result, { v: 1, code: "PDF_FORMAT_UNSUPPORTED", category: "unsupported" });
});

test("all manifests are least-privilege MV3 targets", async () => {
  const packageVersion = (await json(path.join(root, "package.json"))).version;
  for (const target of targets) {
    const manifest = await json(path.join(root, "dist", target, "manifest.json"));
    assert.equal(manifest.manifest_version, 3);
    assert.equal(manifest.version, packageVersion);
    assert.deepEqual(manifest.optional_host_permissions, ["http://*/*", "https://*/*"]);
    assert.ok(manifest.permissions.includes("declarativeNetRequestWithHostAccess"));
    assert.ok(!manifest.permissions.includes("tabs"));
    assert.ok(!JSON.stringify(manifest).includes("<all_urls>"));
    assert.ok(!JSON.stringify(manifest).includes("content_scripts"));
    assert.match(manifest.content_security_policy.extension_pages, /^script-src 'self' 'wasm-unsafe-eval'; object-src 'self'$/u);
  }
  assert.deepEqual((await json(path.join(root, "dist/chrome/manifest.json"))).background, { service_worker: "background.js" });
  assert.deepEqual((await json(path.join(root, "dist/firefox/manifest.json"))).background, { scripts: ["shared.js", "background.js"] });
  assert.deepEqual((await json(path.join(root, "dist/safari/manifest.json"))).background, { service_worker: "background.js" });
});

test("three targets contain the same shared source and verified Viewer artifact", async () => {
  const lock = await json(path.join(root, "viewer/lock.json"));
  const shared = (await filesUnder(path.join(root, "src"))).filter((file) => file !== "README.md");
  for (const file of shared) {
    const expected = await readFile(path.join(root, "src", file));
    for (const target of targets) assert.deepEqual(await readFile(path.join(root, "dist", target, file)), expected);
  }
  for (const target of targets) {
    const viewerRoot = path.join(root, "dist", target, "viewer");
    assert.deepEqual(await filesUnder(viewerRoot), Object.keys(lock.files));
    for (const [file, expected] of Object.entries(lock.files)) {
      const actual = createHash("sha256").update(await readFile(path.join(viewerRoot, file))).digest("hex");
      assert.equal(actual, expected, `${target}/${file}`);
    }
  }
});

test("runtime code has no remote scripts, eval, document upload, or fallback preview", async () => {
  const source = await Promise.all((await filesUnder(path.join(root, "src")))
    .filter((file) => /\.(?:html|js)$/u.test(file))
    .map((file) => readFile(path.join(root, "src", file), "utf8")));
  const joined = source.join("\n");
  assert.doesNotMatch(joined, /<script[^>]+https?:|\beval\s*\(|new Function|FormData|thumbnail|canvas\.toDataURL/iu);
  assert.doesNotMatch(await readFile(path.join(root, "src/background.js"), "utf8"), /const\s*\{[^}]+\}\s*=\s*globalThis\.DocViewKitOmni/u);
});

test("the link menu covers HTTP and HTTPS documents", async () => {
  const background = await readFile(path.join(root, "src/background.js"), "utf8");
  const preview = await readFile(path.join(root, "src/preview.js"), "utf8");
  assert.ok(background.includes('targetUrlPatterns: ["http://*/*", "https://*/*"]'));
  assert.doesNotMatch(background, /extensionOf|supportedExtensions/u);
  assert.match(background, /openRemote\(info\.linkUrl, info\.pageUrl\)/u);
  assert.match(preview, /header: "Referer", operation: "set", value: referrer/u);
});

test("the extension shell disappears when the Viewer opens", async () => {
  const html = await readFile(path.join(root, "src/preview.html"), "utf8");
  const css = await readFile(path.join(root, "src/preview.css"), "utf8");
  assert.doesNotMatch(html, /<header/u);
  assert.match(css, /body\.open #welcome \{ display: none; \}/u);
  assert.match(css, /docviewkit-viewer \{ display: none; width: 100%; height: 100%; \}/u);
  assert.match(css, /body\.open #choose \{ display: block; \}/u);
});
