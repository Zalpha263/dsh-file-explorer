# dsh-file-explorer

DSH Web 界面里的文件浏览器：不离开聊天页就能浏览工作区文件、预览和编辑内容。面板是 **DSH 官方右侧栏**的一个标签页——停靠、浮出成独立窗口、分屏都由官方标签条负责。

## 能做什么

**浏览与搜索**

- 目录树按需展开（目录在前、文件带大小），默认隐藏 `node_modules`、`.git` 这类条目，需要时用工具栏「👁 隐藏」开关显示。
- 按 `Ctrl+F` 在树内呼出搜索条，实时过滤已加载的节点并保留目录层级，命中内容高亮；`↑` / `↓` 导航、`Enter` 打开、`→` / `←` 展开或收起，搜索条会显示匹配数量与空状态。

**预览与编辑**

- 点开文件即预览：Markdown 默认富文本渲染（GFM 表格 / 任务列表 / 删除线、代码块高亮并可一键复制、可折叠标题目录）；代码和文本文件直接进入带语法高亮的编辑视图，输入即所见。
- 编辑器行号随输入同步、滚动精确对齐，长行横向滚动不软换行；`Ctrl+S` 保存、`Esc` 退出、`Ctrl+[` / `Ctrl+]` 在 Markdown 的「渲染 / 编辑」之间切换，并按文件类型记住上次用的模式。
- 超过 4MB 的文件分段加载，点「继续加载」逐段读取。
- 预览显示在独立浮动卡片里：可拖动、四边四角缩放、双击最大化 / 还原，`Esc` 或 × 关闭。

**文件操作**

- 文件与目录行支持拖放移动；右键菜单提供新建文件（内置 `txt` / `md` / `py` / `js` / `json` / `ts` / `html` / `css` 模板）、新建文件夹、重命名、复制、粘贴（同名自动加后缀）、复制路径，以及删除到回收站。
- 删除按平台走系统回收站（Windows PowerShell / macOS Finder / Linux `gio trash`）；系统回收站不可用时落到内置回收站 `~/.dsh-file-explorer-trash/`（保留 30 天、最多 200 条，自动清理）。
- 工作区自动跟随当前会话切换。

**外观**

- 按 Apple HIG 规范统一：系统字体栈、8pt 圆角与间距、深浅色材质、SF Symbols 风格图标、150–200ms 动效；预览卡片与面板跟随深浅主题自动换色。

## 快捷键

按 `?` 可以随时查看这张表。

| 键 | 动作 |
| --- | --- |
| `Ctrl+F` / `⌘F` | 搜索 / 过滤文件名 |
| `Esc` | 关闭搜索 · 退出编辑 · 关闭浮层 |
| `↑` / `↓` | 在搜索结果中导航 |
| `Enter` | 打开选中文件（目录则展开） |
| `→` / `←` | 展开 / 收起目录 |
| `Ctrl+[` / `Ctrl+]` | 切换渲染 / 编辑视图（仅 Markdown） |
| `Tab`（编辑中） | 插入 2 空格缩进 |
| `Ctrl+S`（编辑中） | 保存 |
| `?` | 快捷键帮助 |

## 面板操作

| 控件 / 操作 | 作用 |
| --- | --- |
| 官方标签条 | 面板即官方右侧栏标签页：拖动标签可分屏、可浮出成独立窗口（官方能力） |
| 标签 chip 与标签菜单 | 关闭面板（标签正文里不再有面板自带的 × 按钮） |
| ↻ 刷新 | 重新加载当前目录 |
| 👁 隐藏 | 显示 / 隐藏 `node_modules`、`.git` 等条目 |
| 点目录 / 点文件 / ✕ | 展开目录 / 打开文件预览 / 关闭预览 |

几个容易忽略的细节：保存带版本检测，文件在编辑期间被改动会拒绝保存并提示重新载入；粘贴到某个「文件」上等于粘贴到它所在的目录；删除目录会把里面的内容一起移入回收站。

## 安装

要求：DSH `>=0.1.7-rc.1 <0.3.0`（已在 `0.1.7-rc.2`（web 宿主）与 `0.2.0-rc.1`（桌面应用）上实测：兼容检查通过、组成解析通过、Host 激活、客户端产物注册成功）与 [pnpm](https://pnpm.io/zh/)（`npm install -g pnpm`）。Windows / macOS / Linux 都支持，路径分隔符、大小写敏感与回收站策略按平台自适应。

```bash
# 发布态：钉死提交，最稳定
dsh plugin --profile web add github:Zalpha263/dsh-file-explorer#<40位commit>

# 开发态：裸目录路径 = link:（源码即部署，改完不用重装）
dsh plugin --profile web add D:/path/to/dsh-file-explorer

# 升级：把 profile 里钉住的提交号改成新提交后重装
dsh plugin --profile web install

# 卸载
dsh plugin --profile web remove dsh-file-explorer
```

装完**重启 DSH**。入口统一在 **DSH 官方右侧栏**：右侧栏「开始」页的入口胶囊（order 20），或标签条的 `+`。**不再有会话标题栏按钮**，也不需要 ui-beautify —— v1.12.0 起本插件直接调官方 `sidebarRightTabs` / `slots` 注册标签页。Host 改动重启 DSH，Client 改动刷新页面。

**桌面版（DeepSeek Harness 桌面应用）**：`desktop` profile 由桌面应用独占，`dsh plugin --profile desktop ...` 会被 CLI 直接拒绝（`profile "desktop" is managed exclusively by the Electron application`）。请在桌面应用侧边栏的**插件**页里用**绝对路径**添加本插件目录（或 GitHub 仓库地址），装完重启应用生效。桌面应用自带 Node / pnpm 运行时并走应用内更新（不依赖 npm 全局安装），它的 DSH 版本可能与全局 CLI 不同（实测桌面 `0.2.0-rc.1`、全局 CLI `0.1.7-rc.2`），本插件对两者都通过兼容检查。

## 安全边界（重要）

- 所有写操作都**限制在当前工作区根目录内**：工作区之外的写、删、改名、移动都会被拒绝（只读的浏览与预览不受限制），工作区根目录本身也禁止删除、重命名和移动。这是刻意的设计。
- 两条写入路径的约束不同：**保存文件与新建文件**走宿主 `ctx.fs`，因此同时受 DSH 会话沙箱策略（read-only / workspace-write / danger-full-access）约束，并会记录 `fs/observed`；**重命名、复制、移动、删除、新建目录**走 Host 的 `node:fs`，只受本插件的工作区包含性检查约束。

## 常见问题

| 问题 | 原因与解决 |
| --- | --- |
| 点「📁 文件」没有出现面板 | 先硬刷新（Ctrl+F5），仍不行则重启 DSH |
| 树里显示红色错误行 | 该路径当前不可读（权限或已删除）；点「↻ 刷新」重试 |
| 保存提示「文件已改变」 | 文件在编辑期间被其它程序改动；重新载入后再保存 |
| 删除的文件去哪了 | 系统回收站；不可用时落到内置回收站 `~/.dsh-file-explorer-trash/` |
| 复制到剪贴板失败 | 浏览器在非安全上下文禁用剪贴板 API；可改用右键菜单里的内部剪贴板 |
| 面板位置跑到屏幕外 | 清掉该站点的 `dsh-file-explorer:*` localStorage 键后重开 |
| 大目录复制 / 跨设备移动很慢 | 正常现象（`node_modules` 这类目录尤其明显） |

## 开发者

- **Host 半区**（`lib/index.js`）：`FileExplorerService` 注册 `fileExplorer` 远程服务（`fsList` / `fsRead` / `fsWrite` / `fsCreate` / `fsRename` / `fsCopy` / `fsDelete` / `fsMove` / `wsRoot` / `wsList`）。读、保存、新建文件走 DSH 的 `fs` 服务；重命名 / 复制 / 移动 / 删除 / 建目录直连 `node:fs/promises`；删除按平台调用系统回收站并在失败时落到内置回收站；`fsMove` 处理跨设备（EXDEV）的复制加删除回退。渲染管线（`marked` + `highlight.js`）在首次预览时才动态加载，避免拖慢 DSH 启动。
- **Client 半区**（`lib/client.js`）：`__ModuleLoader__.load` 加载，用 `ctx.remote.$mount` 自挂载 `fileExplorer` 命名空间，界面全部用原生 DOM 渲染（零 React hooks）；用官方 `ctx.sidebarRightTabs.register({ id, kind, priority: 'extension', title, guide })` + `ctx.slots.register({ name: 'sidebar.right.pane.tab', key: 'file-explorer' }, Body)` 注册成官方右侧栏标签页，Body 里挂载既有的纯 DOM 面板（接入规范见 `@deepseek-ai/dsh-client-ui-sidebar-right` 的 README「扩展席位」）。
- 依赖 dsh 自带的 `@deepseek-ai/dsh-typert-protocol`（peer），**不要**单独安装该包的副本，否则 Remote 桥会失效。改代码后：Client 刷新页面，Host 重启 DSH，全程无需构建。

## 更新日志

### v1.12.1
- **修复（桌面端右侧栏没有任何入口）**：v1.12.0 在 `apply` 时**一次性** `ctx.get("sidebarRightTabs")`，拿不到就直接放弃，注释里还写明「不需要 ctx.inject —— 服务始终存在」。但客户端各 entry 的 `apply` 顺序/并发**并不保证**：服务本身，以及 `sidebar.right.pane.tab` 槽位（由 `ui-sidebar-right` 自己 `slots.inject` 声明），都可能比本插件的 entry 晚一拍出现 —— 于是注册被静默丢弃，右侧栏「开始」页再也不出现「文件浏览器」胶囊，只在 console 留一行 warn。实测桌面端 `0.2.0-rc.2` 就是这样（`0.2.0-rc.1` 的加载实测通过，说明这是时序敏感的偶发路径，不是 API 变更：我逐行比对过 rc.1 与 rc.2 的 `dsh-client-ui-sidebar-right`，`register()` 的校验完全相同）。
- 现在：`ctx.inject(["sidebarRightTabs"], …)` **依赖驱动**（服务出现即回调、消失即 dispose，宿主自己的插件也是这个写法）+ **有界重试**（0/50/120/300/700/1200/2000/3000/5000/8000 ms，槽位可能比服务更晚）+ **失败时打印一次可诊断的原因**（`attachHost` 内部改为记录 `lastAttachError`，不再每次尝试都刷 console，也不再把失败伪装成"服务不可用"）。经典面板与 `Ctrl+P` 入口不受影响。
- 验证：`node --check`；逻辑与 billing 侧的同一处修复对称（同一个 `register` 契约、同一串重试）。

### v1.12.0
- **改造：只走官方右侧栏链路，删除 ui-beautify 依赖与标题栏入口**。此前面板经 ui-beautify 的 `sidebarPanel` 服务注册，**关掉 / 卸载 ui-beautify 后右侧栏没有入口**，只剩会话标题栏的「📁 文件」按钮与自带独立面板。现在直接调官方服务：`ctx.sidebarRightTabs.register({ id: 'file-explorer', kind: 'file-explorer', priority: 'extension', title, guide })` + `ctx.slots.register({ name: 'sidebar.right.pane.tab', key: 'file-explorer' }, Body)`，Body 内挂载既有的纯 DOM 面板（`mountDockHost`）。服务由 `@deepseek-ai/dsh-web-app` 的 `ui-sidebar-right` 行提供，与 ui-beautify 无关。
- 删除：`ctx.inject(['sidebarPanel'])` 可选依赖、`internal/service` 事件 + 1s 兜底轮询的幂等绑定器、会话标题栏「📁 文件」入口（`HeaderEntry` + `entryListeners`）、`toggleOpen`（其唯一调用者就是那个按钮）。
- 标签正文里不再渲染面板自带的「×」（关闭交给官方标签条）。
- 已知遗留（下一轮清理）：经典独立面板机制（`shell.overlay` 宿主、停靠切换、缩放 chrome、标题栏拖拽）现已不可达，但保留为标签卸载后的 refs 回指目标。
- 验证：官方服务桩契约 harness（注册形状 / 失败路径 / 拆卸）+ 真实 `0.2.0-rc.1` 宿主**移除 ui-beautify 后**的加载实测。

### v1.11.4
- **适配桌面版**：peer 由 `^0.1.7-rc.1` 放宽为 **`>=0.1.7-rc.1 <0.3.0`**。桌面应用跑 DSH `0.2.0-rc.1`，旧范围上界 `<0.2.0-0` 不含它，而应用自有 profile 对 peer 不兼容的 bundle **静默跳过、不报错**。放宽后同时覆盖 web 宿主 `0.1.7-rc.2` 与桌面 `0.2.0-rc.1`。
- 走廊核对（`0.1.7-rc.1 → 0.1.7-rc.2 → 0.2.0-rc.1`）：本插件用到的 `fs`（`stat` / `lstat` / `readText` / `writeText`）、`agents`、`sandboxPolicy`、`workspaceRegistry`、`slots.inject` / `slots.register`、`ctx.remote.$mount` 的 CONTRIBUTION 校验**全部未变**，无需改代码。走廊里 `client-ui-primitives` 的破坏性改动（移除 `OnboardingSurface`）本插件未引用。
- 桌面版安装方式：`desktop` profile 由桌面应用独占，`dsh plugin --profile desktop ...` 会被 CLI 拒绝；请在桌面应用的**插件**页用**绝对路径**添加本插件目录。

### v1.11.3
- 迁移：对齐 DSH `0.1.7-rc.1`（自 `0.1.7-alpha.2`）。本插件用到的 host 服务 `fs` / `agents` / `sandboxPolicy` / `workspaceRegistry`、slot 注入（`slots.inject` / `slots.register`）与 `ctx.remote.$mount` 的 CONTRIBUTION 校验在 `alpha.2 → rc.1` 之间**逐字节未变**；rc.1 的 `@deepseek-ai/dsh-client-ui-primitives` 只有加法（+3 导出、5 个新文件、4 个**可选** props），旧调用点不受影响，本插件不采用。无需改代码，peer 对齐 `^0.1.7-rc.1`。
- 验证：隔离 `DSH_HOME` 冷启动 rc.1 → 模块已注册、564KB 客户端产物 HTTP 200 且含 `__ModuleLoader__.load`；`node --check` 通过。

### v1.11.2
- 修复：DSH 0.1.7 起 strict codec 必须带 `create()` 工厂（运行时改为 `codec.create().parse(value)`，旧的 `codec.schema` 字段已无人读取）。原写法会让 `ctx.remote.$mount()` 抛 `strict codec has no create() factory`，整个 Remote namespace 挂不上，面板与设置节随之消失。`strictCodec()` 改为提供 `create`。peer 对齐 `^0.1.7-alpha.2`。

### v1.11.1
- 性能：渲染管线（`marked` + 完整 `highlight.js`，约 3.3MB）改为首次使用时按需加载，DSH 冷启动少付约 200ms。
- 修复：宿主 `fs` 写入改用当前会话的沙箱策略（原来会退回部署默认策略，与工作区边界检查不一致），并把 `FS_SANDBOX_DENIED` 转成可读提示；peer 对齐 `^0.1.5-rc.2`。

### v1.11.0
- 集成契约从 ui-beautify 的 `dock`（v2）改为 `sidebarPanel`（v1）：注册成 DSH 官方右侧栏的标签页，面板按自身宽度响应式；未装 ui-beautify 时仍退回独立浮动面板。

### v1.10.x 及更早
- **v1.10.1**：保存改为原子写入（外部改动不再被静默覆盖）；工作区包含性检查升级为词法 + 真实路径双层校验，封堵符号链接 / junction 逃逸；修复「继续加载」边界误判、剪贴板与重命名后的路径迁移等十余项。
- **v1.10.0**：适配 DSH 0.1.2-rc.1；封堵目录穿越、统一版本令牌族、修正工作区字段漂移。
- **v1.9.x**：Markdown 预览、IDE 式实时高亮编辑、预览浮动卡片、树内搜索、快捷键帮助、VS Code 配色、编辑器撤销 / 重做、中文 / 全角 / emoji 光标几何修复。
- **v1.8.x**：破坏性写操作限制在工作区根目录内；颜色值 token 化。
- **v1.7.x**：接入 ui-beautify 的统一插件面板；移除悬浮球。
- **v1.6.x**：适配 ui-beautify 卡片模式（停靠卡、浮动、双向状态同步、经典模式回退）。
- **v1.5.x**：跨平台回收站、拖放移动；修复大文件预览与二进制识别。
- **v1.4.x**：删除到回收站与实时刷新。
- **v1.3.x**：文件内联编辑与右键菜单（新建 / 重命名 / 复制 / 粘贴 / 复制路径）。
- **v1.2.x**：支持 dsh 官方 bundle 安装；`typert-protocol` 改为 peerDependency。
- **v1.1.x**：v2 架构重写（Client `$mount` 自挂载、Host `TypertRemoteService` 自动注册）。
- **v1.0.x**：初版，已被 v1.1 取代。

## License

MIT
