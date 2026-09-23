# dsh-file-explorer

DSH Web 界面里的文件浏览器：不离开聊天页就能浏览工作区文件、预览和编辑内容，面板可以停靠也可以拖成浮动窗口。

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
| 右侧 / 中间 / 浮动 | 切换停靠方式；「右侧 / 中间」模式下拖边缘调整宽度 |
| 标题栏拖动 | 浮动模式下移动面板 |
| 面板四边 / 四角 | 浮动模式下自由调整大小 |
| ↻ 刷新 | 重新加载当前目录 |
| 👁 隐藏 | 显示 / 隐藏 `node_modules`、`.git` 等条目 |
| 点目录 / 点文件 / ✕ | 展开目录 / 打开文件预览 / 关闭预览 |

几个容易忽略的细节：保存带版本检测，文件在编辑期间被改动会拒绝保存并提示重新载入；粘贴到某个「文件」上等于粘贴到它所在的目录；删除目录会把里面的内容一起移入回收站。

## 安装

要求：DSH `0.1.5-rc.2`（或兼容的 `0.1.x` 系列）与 [pnpm](https://pnpm.io/zh/)（`npm install -g pnpm`）。Windows / macOS / Linux 都支持，路径分隔符、大小写敏感与回收站策略按平台自适应。

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

装完**重启 DSH**。入口有两种：只装本插件时，会话标题栏右侧会出现「📁 文件」按钮；同时装了 ui-beautify 时，入口统一收进 **DSH 官方右侧栏**的标签页（右侧栏「开始」页的入口胶囊，或标签条的 `+`），本插件不再占用标题栏位置。Host 改动重启 DSH，Client 改动刷新页面。

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
- **Client 半区**（`lib/client.js`）：`__ModuleLoader__.load` 加载，用 `ctx.remote.$mount` 自挂载 `fileExplorer` 命名空间，界面全部用原生 DOM 渲染（零 React hooks）；检测到 ui-beautify 提供的 `sidebarPanel` 服务时注册成官方右侧栏标签页，否则退回自带浮动面板。面板接入规范见 [dsh-ui-beautify/docs/plugin-panel-integration.md](https://github.com/Zalpha263/dsh-ui-beautify/blob/main/docs/plugin-panel-integration.md)。
- 依赖 dsh 自带的 `@deepseek-ai/dsh-typert-protocol`（peer），**不要**单独安装该包的副本，否则 Remote 桥会失效。改代码后：Client 刷新页面，Host 重启 DSH，全程无需构建。

## 更新日志

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
