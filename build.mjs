import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = import.meta.dirname;
const packageRoot = path.join(root, "node_modules/@docviewkit/viewer");
const lockPath = path.join(root, "viewer/lock.json");
const targets = ["chrome", "firefox", "safari"];

async function filesUnder(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function viewerLock() {
  const packageJson = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
  const npmLock = JSON.parse(await readFile(path.join(root, "package-lock.json"), "utf8"));
  const installed = npmLock.packages?.["node_modules/@docviewkit/viewer"];
  if (packageJson.version !== "0.2.63" || installed?.version !== packageJson.version || !installed.integrity) {
    throw new Error("@docviewkit/viewer must be installed from the exact locked 0.2.63 package");
  }

  const typeSource = await readFile(path.join(packageRoot, "types.d.ts"), "utf8");
  const formatMatch = typeSource.match(/export type DocumentFormat = ([^;]+);/u);
  if (!formatMatch) throw new Error("Viewer DocumentFormat contract is missing");
  const formats = [...formatMatch[1].matchAll(/"([a-z0-9]+)"/gu)].map((match) => match[1]);
  const extensions = Object.fromEntries(formats.map((format) => [format, [format]]));
  const files = Object.fromEntries(await Promise.all((await filesUnder(packageRoot)).map(async (file) => [
    file,
    await sha256(path.join(packageRoot, file)),
  ])));

  return {
    package: packageJson.name,
    version: packageJson.version,
    integrity: installed.integrity,
    apiMajor: 1,
    formats: extensions,
    files,
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const expected = await viewerLock();
await import("./src/formats.js");
const SUPPORTED_EXTENSIONS = globalThis.DocViewKitOmniFormats;
const viewerExtensions = Object.values(expected.formats).flat().sort();
if (JSON.stringify([...SUPPORTED_EXTENSIONS].sort()) !== JSON.stringify(viewerExtensions)) {
  throw new Error("src/formats.js differs from the published Viewer DocumentFormat contract");
}
if (process.argv.includes("--write-viewer-lock")) {
  await writeFile(lockPath, stableJson(expected));
} else {
  const locked = JSON.parse(await readFile(lockPath, "utf8"));
  if (stableJson(locked) !== stableJson(expected)) {
    throw new Error("Viewer artifact differs from viewer/lock.json; run npm run lock:viewer only for an intentional upgrade");
  }
}

await rm(path.join(root, "dist"), { recursive: true, force: true });
for (const target of targets) {
  const output = path.join(root, "dist", target);
  await mkdir(output, { recursive: true });
  await cp(path.join(root, "src"), output, { recursive: true });
  await rm(path.join(output, "README.md"), { force: true });
  await cp(packageRoot, path.join(output, "viewer"), { recursive: true });
  await cp(lockPath, path.join(output, "viewer-lock.json"));
  await cp(path.join(root, "targets", target, "manifest.json"), path.join(output, "manifest.json"));
}

const built = await stat(path.join(root, "dist/chrome/viewer/viewer.js"));
if (!built.isFile()) throw new Error("Viewer entrypoint was not packaged");
console.log(`Built ${targets.join(", ")} with @docviewkit/viewer@${expected.version}`);
