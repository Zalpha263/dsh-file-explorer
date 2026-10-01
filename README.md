# dsh-file-explorer

DSH Web 界面里的**文件编辑器**（v2.0.0 起）：官方文件浏览器的补充件，只补一件事——**让文本文件能改**。

## 为什么是这个定位

官方把"看"做到了闭环：`dsh-client-ui-sidebar-files` 负责浏览，`dsh-client-ui-sidebar-documentpreview` 负责渲染（Office / PDF / Excel / 图片 / HTML / Markdown / 代码）。但**官方预览是只读的**——`@deepseek-ai/dsh-api-workspace-files` 的 README 原文写着：

> The service exposes no mutation operation.

所以本插件不做任何重复劳动：不画目录树、不渲染内容、不抢默认打开。它只做官方明确不做的两件事：

1. **在官方预览头部加一个「编辑」按钮** —— 挂在官方预留的扩展槽位 `sidebar.right.tab.document.actions` 上（`ui-open-in-app` 是它的现有占用者）。
2. **点它用一个编辑页打开同一个文件** —— 走官方导航 `ctx.sidebarRight.openResource(address, { kind: 'file-editor' })`：**地址与官方预览完全相同、只是 kind 不同**，所以两个标签并存互不干扰，而"默认打开"仍然归官方。

因为编辑页与官方预览指向同一个资源地址，**同步问题是官方机制自己解决的**：编辑页保存后文件版本变化，官方预览的自动刷新会跟上；反过来，文件被 agent 改动时编辑页会看到版本变化。

## 能做什么

- **编辑纯文本**：Markdown、代码、配置、JSON/YAML、脚本等。行号栏 + 输入区，`Ctrl+S` 保存、`Tab` 插入两空格缩进。
- **官方同一套高亮**：用 `@deepseek-ai/dsh-client-ui-primitives` 的 `useCodeHighlighter`（shiki 内核 + CSS 变量主题 + 语法懒加载），配 `languageForPath` 从文件名推断语言。**插件自己不带任何高亮库**，配色与官方代码视图完全一致。
- **保存带乐观并发校验**：保存时带上打开时的版本令牌，文件在编辑期间被外部（比如 agent）改动会被拒绝，并在顶部给出两个出口——**重载（丢弃我的修改）** 或 **复制我的内容**。不会静默覆盖别人的改动。
- **自动跟随外部改动**：编辑页每 2.5 秒查一次版本。**未修改时**自动重新载入并提示；**已修改时绝不自动重载**（那等于悄悄丢掉你敲的字），只提示冲突。
- **拒绝不该编辑的东西**：二进制文件（图片/压缩包/可执行文件/Office 文档）、超过 2MB 的文件、以及**非 UTF-8 文本**（GBK / UTF-16 / CP1252 等旧编码——在乱码上编辑后保存会把原文件写坏），都会给出原因而不是硬着头皮打开。

## 界面

| 位置 | 内容 |
| --- | --- |
| 官方预览头部 | 「编辑」按钮（与其他官方动作并排） |
| 编辑页顶栏 | 文件名 · 大小 · 未保存标记 · 语言 · 状态提示 · 保存 · 重载 |
| 编辑页主体 | 行号栏 + 高亮层 + 输入区（三者滚动同步） |
| 冲突横幅 | 仅在"文件被外部修改"时出现：重载（丢弃我的修改）/ 复制我的内容 |

编辑页是**官方右侧栏里的一个标签**，所以官方的标签能力它全都有：可以拖出成独立窗口、拖回、与官方预览并排、跟随主题。

## 边界与限制

- **只编辑文本**：二进制、>2MB、非 UTF-8 一律拒绝并说明原因。
- **不做文件管理**：新建 / 改名 / 移动 / 复制 / 删除 / 回收站都不在职责内——官方在 API 层面没有变更操作，而"在官方树的行上右键/拖拽"也没有可挂载的钩子，所以本插件不做半套文件管理。
- **冲突出口只给两个**：重载与复制我的内容。刻意不提供"强制覆盖"，避免把 agent 刚写的东西覆盖掉。
- **不做自己的浮动面板**：面板形态完全交给官方标签条（v1.12 已经删掉过一次自研 dock 代码）。

## 安装

要求：DSH `>=0.2.0-rc.1 <0.3.0` 与 [pnpm](https://pnpm.io/zh/)。

```bash
# 发布态：钉死提交，最稳定
dsh plugin --profile web add github:Zalpha263/dsh-file-explorer#<40位commit>

# 开发态：裸目录路径 = link:（源码即部署，改完不用重装）
dsh plugin --profile web add D:/path/to/dsh-file-explorer

# 卸载
dsh plugin --profile web remove dsh-file-explorer
```

装完**重启 DSH**（Host 半区需要重新加载），然后在官方右侧栏打开任意文本文件的预览，点头部的「编辑」。

**桌面版**请在应用侧边栏的**插件**页里用绝对路径添加本插件目录，装完重启应用生效。

## 开发者

- `lib/index.js` —— Host 半区：`fileExplorer` 服务只暴露三个方法
  - `fsStat(path)` 元数据 + 版本令牌（变更轮询）
  - `fsRead(path, maxBytes)` 文本 + 版本 + `truncated` / `binary` / `decodeValid` 三个判定
  - `fsWrite(path, content, expectedVersion)` 把期望版本作为 `replaceIfVersion` 意图交给宿主 fs，校验与写入在同一临界区，没有 check-then-write 的竞态窗口
  - 写入边界：工作区包含性检查（词法归一化 + `realpath` 复核，挡 `..` 穿越与链接逃逸）+ 会话沙箱策略
- `lib/client.js` —— Client 半区：手写 `__ModuleLoader__` bundle（React 组件）。注册三样东西：官方预览头部的动作、`file-editor` 标签类型（**不声明 `patterns`**，不抢默认打开）、编辑页正文与标题。
- **关于模块共享**：`@deepseek-ai/dsh-client-ui-primitives` 属于客户端模块表里的**基线静态库**（官方 `dsh-client-ui-sidebar-files` / `documentpreview` / `chat` 都直接 `require` 它且不声明 external），所以本插件直接 `require` 即可，**不要**写进 `dsh.client.external`——那个字段只加"非基线"请求，写错会让组成解析拒绝加载。取不到该包时客户端降级为纯文本编辑，不会整体失败。
- `test/host.test.mjs` —— 宿主集成测试（真实 cordis + 真实文件系统 + 最小 `ctx.fs` 桩）：读/写/版本守卫/边界/沙箱/非 UTF-8 判定。
- `test/client-smoke.test.mjs` —— 客户端冒烟（最小 DOM + 最小 hooks 运行时驱动真实 bundle）：注册面、编辑按钮发出的导航调用、编辑页读取与 Ctrl+S 写回、非 UTF-8 与「拿不到官方高亮件」的降级。**改 `lib/client.js` 后务必跑它**：`node --check` 只能证明语法，证明不了能挂载。
- `npm test` 串跑两套。

## 更新日志

### v2.0.0
- **定位重塑**：从"文件浏览器"改为**给官方只读预览补上编辑能力**。删除目录树、自研预览渲染、右键文件操作、拖拽、回收站、新建模板、工作区跟随与自研 dock/浮动面板；客户端从 20650 行 / 583KB 降到约 500 行 / 23KB，运行时依赖清零（不再需要 `marked` 与 `highlight.js`）。
- **编辑入口**：官方预览头部的「编辑」按钮（官方槽位 `sidebar.right.tab.document.actions`），用 `ctx.sidebarRight.openResource(address, { kind: 'file-editor' })` 在**同一资源地址**上开编辑标签——不抢官方默认打开，两个标签并存。
- **高亮用官方件**：`useCodeHighlighter` + `languageForPath`（`dsh.client.external` 声明依赖），插件不再内联任何高亮库。
- **宿主收窄为三个方法**：`fsStat` / `fsRead` / `fsWrite`；后端不再有任何文件系统变更接口。
- **非 UTF-8 保护**：文本里出现 U+FFFD 即判定不可编辑，避免在乱码上编辑后把旧编码文件写坏。
- **测试**：宿主集成 10 例 + 客户端冒烟 8 例。

### v1.13.0
- 适配 DSH `0.2.0-rc` 线：peer 改为 `>=0.2.0-rc.1 <0.3.0`；新增 `locale/` 展示元数据。
