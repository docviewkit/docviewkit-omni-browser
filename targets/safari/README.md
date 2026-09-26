# Safari target

本目录只保留 Safari 清单差异和包装参数。Safari Web Extension 包装必须从共享构建目录生成；生成的 Xcode/打包目录写入 `generated/`，不得手工维护共享业务代码副本。

## Safari / Mac App Store 简介

DocViewKit Omni 支持在浏览器本地只读预览 Office、PDF、OFD 等文档。选择或拖入 .ofd 文件，即可查看文档内容与版式，无需上传文件。也可主动从文档链接发起预览，远程文件仅在获得对应来源授权后读取。

DocViewKit Omni provides local, read-only previews of Office, PDF, OFD, and other documents. Select or drop an .ofd file to view its content and page layout without uploading it. You can also start a preview from a document link; remote files are fetched only after you grant access to their origin.
