if (!globalThis.DocViewKitOmni) globalThis.importScripts?.("shared.js");
const shared = globalThis.DocViewKitOmni;

const api = globalThis.browser ?? globalThis.chrome;
const requestPrefix = "open-remote:";

async function previewTab(url = api.runtime.getURL("preview.html")) {
  const previewUrl = api.runtime.getURL("preview.html");
  const existing = (await api.tabs.query({})).filter((tab) => tab.url?.startsWith(previewUrl));
  if (existing[0]?.id !== undefined) {
    await api.tabs.update(existing[0].id, { active: true, url });
    if (existing[0].windowId !== undefined) await api.windows.update(existing[0].windowId, { focused: true });
    return existing[0];
  }
  return api.tabs.create({ url });
}

async function openRemote(linkUrl, pageUrl) {
  const url = shared.parseRemoteUrl(linkUrl);
  let referrer;
  try {
    referrer = `${shared.parseRemoteUrl(pageUrl).origin}/`;
  } catch {
    // Some browser-owned pages do not expose an HTTP(S) page URL.
  }
  const id = crypto.randomUUID();
  const key = `${requestPrefix}${id}`;
  let granted = false;
  try {
    granted = await api.permissions.request({ origins: [shared.originPattern(url.href)] });
  } catch {
    // The preview page keeps a user-gesture retry path when a browser declines this prompt here.
  }
  await api.storage.session.set({ [key]: { v: shared.PROTOCOL_VERSION, url: url.href, referrer, granted } });
  await previewTab(`${api.runtime.getURL("preview.html")}#request=${encodeURIComponent(id)}`);
}

async function installMenu() {
  try {
    await api.contextMenus.remove("preview-document");
  } catch {
    // The menu does not exist on first install.
  }
  api.contextMenus.create({
    id: "preview-document",
    title: api.i18n.getMessage("previewLink"),
    contexts: ["link"],
    targetUrlPatterns: ["http://*/*", "https://*/*"],
  });
}

if (api) {
  api.runtime.onInstalled.addListener(() => void installMenu());
  api.action.onClicked.addListener(() => void previewTab());
  api.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "preview-document" && info.linkUrl) {
      void openRemote(info.linkUrl, info.pageUrl).catch(() => previewTab());
    }
  });
}
