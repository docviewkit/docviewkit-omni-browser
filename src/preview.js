import "./viewer/viewer.js";
import { extendedFormatPack } from "./viewer/extended-formats.js";
import "./shared.js";

const api = globalThis.browser ?? globalThis.chrome;
const { MAX_REMOTE_BYTES, originPattern, parseRemoteUrl, safeDiagnostic } = globalThis.DocViewKitOmni;
const viewer = document.querySelector("#viewer");
const fileInput = document.querySelector("#file");
const drop = document.querySelector("#drop");
const notice = document.querySelector("#notice");
const status = document.querySelector("#status");
const grant = document.querySelector("#grant");
const copy = document.querySelector("#copy");
const referrerRuleId = 1;
let controller;
let diagnostic;
let revision = 0;

const zh = navigator.language.toLowerCase().startsWith("zh");
const text = zh ? {
  choose: "选择文件", headline: "选择或拖入文档", privacy: "文件仅在本机处理，不会上传。",
  select: "选择文件", loading: "正在读取并解析文档…", permission: "需要你的许可才能读取这个文档来源。",
  grant: "允许并继续", failed: "无法预览此文档。", copy: "复制诊断", copied: "诊断已复制。",
} : {
  choose: "Choose file", headline: "Choose or drop a document", privacy: "Files stay on this device and are not uploaded.",
  select: "Choose file", loading: "Reading and parsing the document…", permission: "Permission is required to read this document source.",
  grant: "Allow and continue", failed: "This document could not be previewed.", copy: "Copy diagnostic", copied: "Diagnostic copied.",
};

for (const [id, value] of [["choose-label", text.choose], ["select", text.select], ["grant", text.grant], ["copy", text.copy]]) {
  document.querySelector(`#${id}`).textContent = value;
}
document.querySelector("#choose").title = text.choose;
document.documentElement.lang = zh ? "zh-CN" : "en";
viewer.config = {
  theme: "auto",
  locale: navigator.language,
  messages: { [navigator.language]: { empty: text.headline, emptyHint: text.privacy } },
  engine: { formatPack: () => Promise.resolve(extendedFormatPack) },
  features: { hyperlinks: false, interactionModeSwitcher: true },
};

function showStatus(message, { permission = false, failed = false } = {}) {
  notice.hidden = false;
  status.textContent = message;
  grant.hidden = !permission;
  copy.hidden = !failed;
}

function beginTask() {
  controller?.abort();
  controller = new AbortController();
  return ++revision;
}

async function open(source, task = beginTask()) {
  diagnostic = undefined;
  copy.hidden = true;
  document.body.classList.add("open");
  showStatus(text.loading);
  await viewer.close();
  if (task !== revision) return;
  try {
    await viewer.open(source);
    if (task !== revision) return;
    notice.hidden = true;
    await api.runtime.sendMessage({ v: 1, type: "document-ready" }).catch(() => {});
  } catch (error) {
    if (task !== revision) return;
    diagnostic = safeDiagnostic(error);
    showStatus(text.failed, { failed: true });
    await api.runtime.sendMessage({ v: 1, type: "fatal-error", diagnostic }).catch(() => {});
  }
}

async function permissionFor(url) {
  const origins = [originPattern(url.href)];
  if (await api.permissions.contains({ origins })) return true;
  showStatus(text.permission, { permission: true });
  return new Promise((resolve) => grant.addEventListener("click", async () => {
    const allowed = await api.permissions.request({ origins });
    grant.hidden = true;
    resolve(allowed);
  }, { once: true }));
}

async function fetchRemote(value, task, referrer) {
  let url = parseRemoteUrl(value);
  for (let redirects = 0; redirects <= 10; redirects += 1) {
    if (!(await permissionFor(url))) throw Object.assign(new Error("Permission denied"), { code: "PERMISSION_DENIED" });
    if (task !== revision) throw new DOMException("Superseded", "AbortError");
    showStatus(text.loading);
    let ruleAdded = false;
    let response;
    try {
      if (referrer && api.declarativeNetRequest?.updateSessionRules) {
        await api.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [referrerRuleId],
          addRules: [{
            id: referrerRuleId,
            priority: 1,
            action: { type: "modifyHeaders", requestHeaders: [{ header: "Referer", operation: "set", value: referrer }] },
            condition: { urlFilter: `|${url.href}|`, resourceTypes: ["xmlhttprequest"] },
          }],
        });
        ruleAdded = true;
      }
      response = await fetch(url, { cache: "no-store", credentials: "omit", redirect: "manual", signal: controller.signal });
    } finally {
      if (ruleAdded) await api.declarativeNetRequest.updateSessionRules({ removeRuleIds: [referrerRuleId] });
    }
    if (response.type === "opaqueredirect") throw Object.assign(new Error("Redirect cannot be inspected"), { code: "REDIRECT_UNREADABLE" });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw Object.assign(new Error("Redirect location is unavailable"), { code: "REDIRECT_UNREADABLE" });
      url = parseRemoteUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) throw Object.assign(new Error("Remote request failed"), { code: `HTTP_${response.status}` });
    const length = Number(response.headers.get("content-length"));
    if (Number.isFinite(length) && length > MAX_REMOTE_BYTES) throw Object.assign(new Error("Remote document is too large"), { code: "REMOTE_TOO_LARGE" });
    const blob = await response.blob();
    if (blob.size > MAX_REMOTE_BYTES) throw Object.assign(new Error("Remote document is too large"), { code: "REMOTE_TOO_LARGE" });
    return blob;
  }
  throw Object.assign(new Error("Too many redirects"), { code: "REDIRECT_LIMIT" });
}

async function consumeRemoteRequest() {
  const id = new URLSearchParams(location.hash.slice(1)).get("request");
  if (!id) return;
  history.replaceState(null, "", location.pathname);
  const key = `open-remote:${id}`;
  const result = await api.storage.session.get(key);
  await api.storage.session.remove(key);
  if (result[key]?.v !== 1 || typeof result[key]?.url !== "string") return;
  const task = beginTask();
  try {
    const referrer = typeof result[key].referrer === "string" ? `${parseRemoteUrl(result[key].referrer).origin}/` : undefined;
    await open(await fetchRemote(result[key].url, task, referrer), task);
  } catch (error) {
    if (task !== revision) return;
    diagnostic = safeDiagnostic(error);
    document.body.classList.add("open");
    showStatus(text.failed, { failed: true });
  }
}

function choose() { fileInput.click(); }
document.querySelector("#choose").addEventListener("click", choose);
document.querySelector("#select").addEventListener("click", choose);
fileInput.addEventListener("change", () => fileInput.files?.[0] && void open(fileInput.files[0]));
drop.addEventListener("keydown", (event) => { if (!document.body.classList.contains("open") && event.target === drop && (event.key === "Enter" || event.key === " ")) choose(); });
drop.addEventListener("dragover", (event) => { event.preventDefault(); drop.classList.add("dragging"); });
drop.addEventListener("dragleave", () => drop.classList.remove("dragging"));
drop.addEventListener("drop", (event) => {
  event.preventDefault();
  drop.classList.remove("dragging");
  if (event.dataTransfer?.files[0]) void open(event.dataTransfer.files[0]);
});
copy.addEventListener("click", async () => {
  if (!diagnostic) return;
  await navigator.clipboard.writeText(JSON.stringify(diagnostic));
  status.textContent = text.copied;
});
window.addEventListener("pagehide", () => { revision += 1; controller?.abort(); viewer.destroy(); });
void consumeRemoteRequest();
