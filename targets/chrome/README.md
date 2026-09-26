# Chrome target

本目录只保留 Chrome Manifest V3、打包和 Chrome Web Store 元数据差异。运行时行为来自 `src/`，Viewer 产物来自 `viewer/` 的统一锁定信息。

## Chrome Web Store / Microsoft Edge Add-ons 简介

DocViewKit Omni 支持在浏览器本地只读预览 Office、PDF、OFD 等文档。选择或拖入 .ofd 文件，即可查看文档内容与版式，无需上传文件。也可主动从文档链接发起预览，远程文件仅在获得对应来源授权后读取。

DocViewKit Omni provides local, read-only previews of Office, PDF, OFD, and other documents. Select or drop an .ofd file to view its content and page layout without uploading it. You can also start a preview from a document link; remote files are fetched only after you grant access to their origin.
