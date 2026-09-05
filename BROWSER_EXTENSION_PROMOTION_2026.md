# DocViewKit Omni 浏览器扩展推广建议（2026）

> 核对日期：2026-09-04。仅引用 Chrome、Mozilla、Apple 官方资料；商店规则和后台字段会变化，正式提交前应再次核对链接页面。

## 结论

先把三家商店商品页做成同一条清晰承诺，再推广，不要先买量：**“在浏览器本地预览真实 Office/PDF 等文档；不上传文件；按需授权远程来源。”** 这正好对应本产品的核心差异，也便于在截图、权限说明、隐私声明和落地页中保持一致。

第一阶段只做三个获客入口：

1. **商店搜索**：围绕用户任务写标题、摘要和首屏，如“browser document viewer”“preview Office files locally”“本地预览 Office/PDF”，不堆砌关键词。
2. **自有内容**：官网放三个明确的“安装 Chrome / Firefox / Safari 扩展”按钮，分别链接官方商品页；制作几篇可长期被搜索的具体用例页，例如“无需上传在线预览 DOCX”“浏览器本地打开 PPTX”。
3. **真实演示**：用 30–60 秒视频展示选择文件、文档链接右键预览、三种交互模式和本地处理边界；同一素材复用于商店、官网和开发者社区。

不要把早期预算投入泛流量广告。先用商店漏斗证明商品页能转化，并确认新用户不会快速卸载；否则付费只会放大错误流量。

## 三家商店的具体做法

### Chrome Web Store

- 商品页至少准备 128×128 图标、1–5 张 1280×800 或 640×400 截图、440×280 小型宣传图；1400×560 大型宣传图可选，视频使用 YouTube 链接。描述开头先用一句话讲清价值，截图和视频可按语言本地化。[商品页字段与素材要求](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)、[图片规范](https://developer.chrome.com/docs/webstore/images)
- 搜索会参考商品页元数据；整体排名还会参考评分和“下载相对卸载”等使用数据，设计、明确用途、引导和易用性也会影响质量判断。因此推广 KPI 不能只看安装量，应同时看卸载和留存。[Chrome Web Store 发现机制](https://developer.chrome.com/docs/webstore/discovery/)
- 完成发布者身份和官网验证，长期保持无违规记录；符合条件后可在 One Stop Support 试点入口提名 Featured badge。精选集合不能付费购买，也不接受直接索取收录。[徽章与精选机制](https://developer.chrome.com/docs/webstore/discovery/)
- 官网和内容页应链接 Chrome Web Store 商品页。普通用户只有商店托管并签名的扩展可直接安装；Windows/macOS 的自托管安装仅适用于企业策略，不能把侧载当大众推广路径。[Chrome 分发方式](https://developer.chrome.com/docs/extensions/how-to/distribute)
- 发布节奏预留审核缓冲：多数扩展在数日内完成，但可能数周；新开发者、新扩展、危险权限和大改动可能触发更细审核。[审核流程与时间](https://developer.chrome.com/docs/webstore/review-process)
- 后台每周看 `impressions → installs → uninstalls → users`，可按国家、语言、系统和版本筛选并导出 CSV；需要更细商品页行为时可启用官方提供的 GA4 集成，并在商店链接使用 `utm_source`、`utm_medium`、`utm_campaign` 做渠道归因。[商品页指标](https://developer.chrome.com/docs/webstore/metrics)、[GA4 与 UTM](https://developer.chrome.com/docs/webstore/google-analytics)

### Firefox Add-ons（AMO）

- 使用描述性且独特的名称；摘要不超过 250 字符；关键词自然出现在 tags、摘要、描述和版本说明中。截图建议 1280×800 或 1.6:1，每张只证明一个核心场景，并按使用流程排序。[AMO 商品页指南](https://extensionworkshop.com/documentation/develop/create-an-appealing-listing/)
- 商品页及 WebExtension 可以本地化；只选择真实适用的平台与分类，提供主页、支持邮箱和支持页。产品是桌面扩展，不应把 Android 标为支持平台。[AMO 商品页指南](https://extensionworkshop.com/documentation/develop/create-an-appealing-listing/)
- 面向公众优先使用 AMO 上架：它集成在 Firefox 扩展管理器中并自动更新。自分发也可以，但仍须经 AMO 签名；所有提交先自动验证，签名/发布可能最多 24 小时，被选中人工审核则更久。[签名、审核与分发](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)
- 官网使用 Mozilla 官方 “Get the add-on” 按钮并链接 AMO 商品页；可用演示视频、社交内容、已有用户、支持社区和垂直媒体扩散。Mozilla 明确建议在买量前先保证产品、引导和性能成熟。[Mozilla 推广指南](https://extensionworkshop.com/documentation/publish/promoting-your-extension/)
- 稳定运行、有国际受众、维护响应及时后，再提名 Recommended Extensions；该计划重视安全、功能质量、体验和持续维护，并接受开发者自荐。[Recommended Extensions 计划](https://extensionworkshop.com/documentation/publish/recommended-extensions/)
- 所有外链都加 `utm_source`、`utm_medium`、`utm_content`、`utm_campaign`。AMO 私有统计后台可按这些参数拆分从商品页产生的下载，但官网直接下载 XPI 不计入该面板。[AMO 使用统计与 UTM](https://extensionworkshop.com/documentation/manage/monitoring-extension-usage-statistics/)

### Safari Extensions / App Store

- Safari Web Extension 以包含扩展的 macOS/iOS 等 App 交付。正式 App Store 分发需要签名并提交审核；macOS 也可使用 Developer ID 签名并公证后在 Mac App Store 外分发，但大众推广仍应优先导向 App Store 商品页。[Safari Web Extension 分发](https://developer.apple.com/documentation/safariservices/distributing-your-safari-web-extension)
- macOS 商品页准备 1–10 张无透明通道的 16:10 真实界面截图；可按设备尺寸和语言上传，App Preview 每个设备尺寸、每种语言最多 3 个。描述最多 4000 字符、关键词最多 100 bytes，均可本地化；宣传文字最多 170 字符。[商品页字段](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)、[截图规格](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)、[截图和预览视频](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots)
- 搜索参考标题、关键词、主分类等文本相关性，也参考下载量以及评分/评论的数量与质量；主分类还决定浏览和筛选位置。Mac App Store 的 Discover、Work 等栏目由编辑策划。[App Store 发现机制](https://developer.apple.com/app-store/discoverability/)
- 有独特产品故事、首发或重大更新时，可提前 6–8 周向 Apple 编辑团队提报，不应把编辑推荐当作可购买的固定渠道。[App Store 发现与推荐](https://developer.apple.com/app-store/discoverability/)
- 官网、邮件和内容推广使用 App Store Connect 生成的 campaign link，分别标记渠道和内容；后台可关联曝光、商品页浏览、下载、使用和删除等后续表现。单项 campaign 指标达到至少 5 才显示。[Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)
- 在落地页和首次打开 App 的引导中明确说明“安装后还需在 Safari 设置中启用扩展”，避免把 App 下载误当成扩展已启用。[Safari Web Extension 分发](https://developer.apple.com/documentation/safariservices/distributing-your-safari-web-extension)
- 核心漏斗看 `impressions → product page views → first-time downloads → installations/sessions → deletions`；App Store 指标通常在至少 5 个首次下载或预购后可用。[App Store Connect 指标定义](https://developer.apple.com/help/app-store-connect-analytics/reference/metrics-definitions/)

## 30 天最小执行方案

### 发布前

- 准备中英文两套文案，三端保持同一产品承诺；Firefox 明确桌面平台，Chrome/Safari 选择准确分类和地区。
- 只做 5 张可复用截图：本地文件、远程文档按需授权、真实文档渲染、三种预览模式、隐私/不上传说明；再做一支无解说也能看懂的短视频。
- 官网做一个轻量落地页，按浏览器跳转对应官方商品页；Chrome 和 Firefox 使用 UTM，Safari 使用 App Store campaign link。

### 上线后每周

- 按浏览器记录曝光、商品页访问、安装/下载、卸载/删除和评分；比较中英文及渠道，而不是把三家不同口径硬合成一个数。
- 若**曝光低**，改标题、摘要、关键词、分类和内容分发；若**访问高但安装低**，改首屏承诺、第一张截图和权限解释；若**安装高但卸载高**，先修首次使用体验或格式兼容，不继续放量。
- 回复评论和支持邮件，把高频真实问题转为下一轮商品页截图、FAQ 或用例文章。

### 达到稳定口碑后

- 再尝试 Chrome Featured badge、Firefox Recommended Extensions 和 Apple 编辑提报。
- 只有自然渠道已经证明留存后，才用小额广告验证一个明确用例；每次只改变渠道或素材中的一个变量。

## 合规底线

- 所有广告、落地页、商品页和扩展实际行为必须一致，不暗示系统警告、不伪装下载按钮、不诱导或奖励安装/评分。Chrome 会把第三方代理的误导推广也归责于发布者。[Chrome 欺骗性安装政策](https://developer.chrome.com/docs/webstore/program-policies/deceptive-installation-tactics)
- “本地处理、不上传”必须与真实行为和隐私字段一致；若将来增加任何数据传输，应先更新产品内提示、商店声明和隐私政策，再推广。
- 不用侧载包作为普通用户主渠道；它会损失商店信任、自动更新和可归因数据，并在 Chrome macOS/Windows 上受官方分发限制。
