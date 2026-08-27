# Shared extension source

本目录只放 Chrome、Firefox 与 Safari 共用的 WebExtension 行为：预览页、后台事件、文件读取、按需权限、Viewer 宿主桥接和诊断。

浏览器清单、签名与商店差异放在 `targets/`；不得在本目录按浏览器复制业务实现。
