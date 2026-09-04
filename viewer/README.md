# Viewer artifact contract

`lock.json` 固定 `@docviewkit/viewer@0.2.63` 的 npm integrity、Web Component 宿主接口主版本、格式清单和逐文件 SHA-256。普通构建只校验该锁定；有意升级时运行 `npm run lock:viewer`。

三个浏览器包必须消费同一产物集合；本目录不接收 Viewer 源码、远程运行时地址或浏览器专用副本。
