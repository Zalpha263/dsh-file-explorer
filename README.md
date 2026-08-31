# dsh-file-explorer

> DeepSeek Harness（DSH）Web UI 的文件浏览器：不离开聊天界面就能浏览工作区文件、预览与编辑内容，面板可停靠、可浮动。

## ✨ 功能特性

- **懒加载目录树**：按需展开工作区目录，目录在前、文件带大小；默认隐藏 `node_modules`、`.git` 等（可切换）
- **树内搜索过滤**：`Ctrl+F` 呼出搜索条，即时过滤已加载节点（保留目录层级）；命中子串高亮、`↑↓` 导航、`Enter` 打开、匹配计数与空状态；跟随「显示隐藏」开关
- **Markdown 渲染预览**：`.md` 文件默认富文本渲染（GFM 表格 / 任务列表 / 删除线、代码块语法高亮 + 一键复制、可折叠标题目录、限宽居中）；`渲染 / 编辑` 切换（`Ctrl+[` / `Ctrl+]`），按文件类型记忆上次模式
- **IDE 式实时高亮编辑**：打开代码/文本文件直接进入高亮可编辑视图（无需切编辑模式）——透明输入层叠在语法高亮层上，输入即所见高亮；`pre-wrap` 自动换行（行号锚定逻辑行首、与预览一致）；`Tab` 缩进、`Ctrl+S` 保存、`Esc` 退出；单行超长截断；>4MB 分段「继续加载」；深浅主题自动切换配色
- **预览独立卡片**：预览在独立浮动卡片中打开（面板内预览区退役、树区占满）；卡片可拖动、四边四角缩放、双击最大化/还原、`Esc` 或 × 关闭；单卡片复用
- **导航与工具**：拖放移动、IDE 式右键菜单（新建/重命名/复制/粘贴/复制路径/删除到回收站）、跨平台回收站、工作区自动跟随、停靠与浮动、ui-beautify 插件面板适配、偏好记忆
- **HIG 风格界面**：Apple HIG 规范统一（系统字体栈、8pt 圆角间距、深浅色材质、SF Symbols 风格图标、150–200ms 动效）

### ⌨️ 快捷键（按 `?` 查看）

| 键 | 动作 |
|---|---|
| `Ctrl+F` / `⌘F` | 搜索 / 过滤文件名 |
| `Esc` | 关闭搜索 · 退出编辑 · 关闭浮层 |
| `↑` / `↓` | 搜索结果中导航 |
| `Enter` | 打开选中文件（目录则展开） |
| `→` / `←` | 展开 / 收起目录 |
| `Ctrl+[` / `Ctrl+]` | 切换渲染 / 编辑视图（仅 Markdown） |
| `Tab`（编辑中） | 插入 2 空格缩进 |
| `Ctrl+S`（编辑中） | 保存 |
| `?` | 快捷键帮助（也可点工具栏「帮助」按钮） |

## 安装

### 前置要求

- DSH `0.1.1-rc.2`（或兼容的 `0.1.x` 系列）；Windows / macOS / Linux 均支持（路径处理按平台自适应）
- 官方安装方式需要 [pnpm](https://pnpm.io/zh/)（`npm install -g pnpm`）

### 官方方式（推荐）

```bash
dsh plugin --profile web add github:Zalpha263/dsh-file-explorer
```

- 装完**重启 DSH**，会话标题栏右侧会出现「📁 文件」按钮（安装 ui-beautify 后由「🧩 插件面板」统一管理）
- 升级 / 卸载：`dsh plugin --profile web update/remove dsh-file-explorer`

<details>
<summary>旧版手动安装（仅 v1.2 之前使用，已不推荐）</summary>

DSH 旧版本没有 `dsh plugin` 流程，需要把本包复制到两处并手工注册：

1. 复制包到 profile 目录：`$DSH_HOME/profiles/<profile>/node_modules/dsh-file-explorer`
2. 复制包到 dsh 安装目录：`<npmRoot>/@deepseek-ai/dsh/node_modules/dsh-file-explorer`
3. 在 `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 追加注册行：

```yaml
- insert:
    - id: file-explorer
      name: dsh-file-explorer
```

4. 重启 DSH。
</details>

## 使用说明

### 打开方式

- 会话标题栏右侧「📁 文件」按钮（ui-beautify 安装时入口为「🧩 插件面板」）

### 面板操作

| 控件 / 操作 | 作用 |
|-------------|------|
| 右侧 / 中间 / 浮动 | 停靠模式切换；「右侧/中间」模式拖边缘调整宽度 |
| 标题栏拖动 | 浮动模式下拖动面板位置 |
| 面板四边 / 四角 | 浮动模式下自由调整大小 |
| ↻ 刷新 | 重新加载当前目录 |
| 👁 隐藏 | 显示 / 隐藏 `node_modules`、`.git` 等条目 |
| 预览区上方分隔条 | 拖动调整预览区高度 |
| 点目录 / 点文件 / ✕ | 展开目录 / 打开文件预览 / 关闭预览 |

### 操作速览

- **打开与编辑**：点文件即打开预览——代码/文本文件直接进入**高亮可编辑**视图（输入即所见）；`.md` 默认富文本渲染，可切「编辑」；`Ctrl+S` 保存、`Esc` 退出；保存带版本检测，编辑期间被外部改动会拒绝保存
- **拖放移动**：按住文件 / 文件夹行拖到目标目录行（或树空白区）松开即移动；拖到自身 / 子目录被拒绝
- **右键菜单**：新建文件（内置 `txt` / `md` / `py` / `js` / `json` / `ts` / `html` / `css` 模板）、新建文件夹、重命名、复制、粘贴（同名自动加后缀）、复制绝对 / 相对路径、删除（确认后移入回收站）
- 提示：粘贴到「文件」= 粘贴到其所在目录；删除目录会连同全部内容移入回收站

## 卸载

```bash
dsh plugin --profile web remove dsh-file-explorer
```

重启 DSH 后插件不再加载，面板消失，无残留。

## 常见问题（FAQ）

| 问题 | 原因与解决 |
|------|-----------|
| 点「📁 文件」没有出现面板 | 多为页面缓存或渲染异常：先硬刷新（Ctrl+F5）；仍不行则重启 DSH |
| 树里显示红色错误行 | 该路径当前不可读（权限 / 已删除）；点「↻ 刷新」重试 |
| 保存文件提示「文件已改变」 | 该文件在编辑期间被其它程序修改；重新载入后再保存 |
| 删除的文件去哪了 | 系统回收站；不可用时落内置回收站 `~/.dsh-file-explorer-trash/`（自动清理：保留 30 天、最多 200 条） |
| 复制到剪贴板失败 | 浏览器在非安全上下文禁用剪贴板 API（本机 localhost 通常可用）；可改用右键「复制」内部剪贴板 |
| 面板位置跑出屏幕 | 清除浏览器该站点的 `dsh-file-explorer:*` localStorage 键后重新打开 |
| 与旧版 / 临时版插件冲突 | v1.2.0 起通过官方 bundle 只安装一个实例即可，移除其它副本 |

## 兼容性

- 目标版本：DSH `0.1.0-rc.7`；Windows / macOS / Linux（路径分隔符、大小写敏感、回收站策略均按平台自适应）
- 部分 CSS 选择器（侧边栏宽度探测 `.pI_x6G_frame` 等）针对该版本的客户端产物编写，**DSH 大版本升级后可能需要复核**
- Host 半区依赖 dsh 自带的 `@deepseek-ai/dsh-typert-protocol`（peer 依赖）——**不要**单独安装该包的独立副本，否则 Remote 桥会失效
- **写操作边界（v1.8.1）**：编辑保存 / 新建 / 重命名 / 复制 / 移动 / 删除由 Host 半区直接通过 Node `fs/promises` 执行，并**限制在当前工作区根目录内**——工作区外的写 / 删 / 改名 / 移动会被拒绝（只读的浏览与预览不受限）。这是刻意设计（用户手动操作的文件管理器），但仍**不受 DSH 的 read-only / workspace-write 策略约束**，请勿在不可信环境下使用
- 大目录（如 `node_modules`）整目录复制 / 跨设备移动会较慢，属正常现象

## 开发者

- **Host 半区**（`lib/index.js`）：`FileExplorerService` 注册 `fileExplorer` 远程服务（`fsList` / `fsRead` / `fsWrite` / `fsCreate` / `fsRename` / `fsCopy` / `fsDelete` / `fsMove` / `wsRoot` / `wsList`）；读操作走 DSH `fs` 服务，写操作 `node:fs/promises` 直连；删除按平台走 PowerShell / osascript / gio trash，失败落内置回收站（30 天 / 200 条自动清理）；`fsMove` 处理跨设备（EXDEV）复制 + 删除回退；`agent/status` + `session/event` 维护最近活跃工作区
- **Client 半区**（`lib/client.js`）：`__ModuleLoader__.load` 加载；`ctx.remote.$mount` 自挂载 `fileExplorer` 命名空间；零 React hooks（原生 DOM 渲染）；路径拼接 / 相对路径 / 大小写比较按 `platform` 自适应；检测到 ui-beautify 的 `dock` 服务时注册为插件面板
- 改代码后：Client 改动刷新页面即可生效，Host 改动需重启 DSH；无需构建
- 已安装用户升级：`dsh plugin --profile web update dsh-file-explorer`

## 版本历史

- **v1.9.x**：大版本——Markdown 渲染预览 + IDE 式实时高亮编辑（text-overlay 输入即高亮、`pre-wrap` 自动换行、行号与预览一致）、预览独立浮动卡片（拖动 / 四边四角缩放 / 双击最大化）、树内搜索（Ctrl+F）、快捷键帮助浮层（右上角、可拖动）、HIG 风格界面；服务端引入 `marked` + `highlight.js`（`lib/render.js`）。期间迭代：行视图改 table 布局消除换行重叠、卡片缩放 grip 修复、毛玻璃移除后恢复、移除「在资源管理器中显示」与「源码/纯文本」只读视图、编辑器整合取代独立编辑模式。
- **v1.8.x**：安全加固（破坏性写操作限制在工作区根目录内）+ 颜色值 token 化重构。
- **v1.7.x**：接入 ui-beautify 统一插件面板（卡片 / 经典模式统一管理）、移除悬浮球、健壮性优化（目录缓存上限、blur 竞态、面板重建清理、拖动跟随）。
- **v1.6.x**：适配 ui-beautify 卡片模式（停靠卡标签面板、⧉ 浮动、双向状态同步、经典模式回退）。
- **v1.5.x**：跨平台健壮性 + 拖放移动 + 系统回收站（Win PowerShell / macOS Finder / Linux gio，带内置回收站兜底并自动清理）；修复大文件预览、二进制识别、浮动面板打不开、拖放落下/高亮等。
- **v1.4.x**：删除到回收站 + 实时刷新。
- **v1.3.x**：文件内联编辑与 IDE 式右键菜单（新建/重命名/复制/粘贴/复制路径 + 磁盘冲突检测）。
- **v1.2.x**：支持 dsh 官方 bundle 安装（`dsh.bundle.patch` + 自带 `cordis.patch.yml`）；typert-protocol 改 peerDependency 保证与 gateway 共享模块实例。
- **v1.1.x**：v2 架构重写（Client `$mount` 自挂载命名空间、Host 用 `TypertRemoteService` 自动注册），修复 v1 加载失败。
- **v1.0.x**：v1 初版，已被 v1.1 取代。

## License

MIT
