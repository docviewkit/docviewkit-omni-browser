# DocViewKit Omni for Browser

DocViewKit Omni for Browser 是面向 Chrome、Firefox 与 Safari 桌面版的本地只读文档预览扩展。三个目标浏览器共享同一套 WebExtension 源码和同一版本、同一校验和的 DocViewKit Viewer 构建产物。

核心固定为 `@docviewkit/viewer@0.2.63`。扩展提供本地文件选择/拖放、工具栏预览页、文档链接上下文菜单、逐来源按需 HTTP(S) 权限、重定向复核、取消与脱敏诊断；不包含 content script、全站安装权限、远程运行时代码或文档上传。

```text
docviewkitOmniForBrowser/
├── AGENTS.md
├── PRODUCT_SPEC.md
├── README.md
├── src/                 # 三端共享的 WebExtension 行为
├── targets/
│   ├── chrome/          # Chrome 清单与商店差异
│   ├── firefox/         # Firefox 清单与 AMO 差异
│   └── safari/          # Safari 清单差异与生成包装配置
├── viewer/              # 固定 Viewer 版本、接口与校验信息
└── test/                # 共享契约、真实浏览器与打包验收
```

产品范围、架构、安全边界和验收门槛见 [PRODUCT_SPEC.md](PRODUCT_SPEC.md)。

## 构建与验证

```sh
npm install
npm run verify
```

产物位于 `dist/chrome`、`dist/firefox` 和 `dist/safari`。三个目录复用同一份 `src/`，并包含由 `viewer/lock.json` 固定、逐文件 SHA-256 校验的同一份 Viewer 产物。

- Chrome：在 `chrome://extensions` 开启开发者模式并加载 `dist/chrome`。
- Firefox：在 `about:debugging` 临时加载 `dist/firefox/manifest.json`。
- Safari：用 `safari-web-extension-converter dist/safari` 生成 macOS 包装；正式 bundle identifier 和签名由发布账户提供。

## 商店自动发布

推送与 `package.json` 版本一致的 `v*` tag 后，`.github/workflows/publish.yml` 会验证、打包并将同一 Chromium 产物提交至 Chrome Web Store 与 Microsoft Edge Add-ons，同时将 Firefox 产物提交至 AMO。Safari 暂不自动发布。

首次发布需要先在 Chrome 和 Edge 后台手工创建商品，并在 GitHub 仓库配置以下 Actions secrets 与 variables：

- Secrets：`CHROME_CLIENT_ID`、`CHROME_CLIENT_SECRET`、`CHROME_REFRESH_TOKEN`、`EDGE_CLIENT_ID`、`EDGE_API_KEY`、`AMO_JWT_ISSUER`、`AMO_JWT_SECRET`
- Variables：`CHROME_PUBLISHER_ID`、`CHROME_EXTENSION_ID`、`EDGE_PRODUCT_ID`

商店审核通过后才会对用户生效；tag 触发代表自动提交审核，并不绕过各商店审核。

只有有意升级 Viewer 时才运行 `npm run lock:viewer`，并提交新的 npm lockfile 与 `viewer/lock.json` 一起评审。
