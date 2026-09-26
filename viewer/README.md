# Viewer artifact contract

`lock.json` 固定 `@docviewkit/viewer@0.2.74` 的 npm integrity、Web Component 宿主接口主版本、格式清单和逐文件 SHA-256。普通构建只校验该锁定；有意升级时运行 `npm run lock:viewer`。

三个浏览器包必须消费同一产物集合；本目录不接收 Viewer 源码、远程运行时地址或浏览器专用副本。

固定产物的格式清单包含 OFD（.ofd）；三端直接复用同一 Viewer 的 OFD 解析与渲染能力，不维护单独的格式实现。
