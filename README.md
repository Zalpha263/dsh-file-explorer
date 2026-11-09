# dsh-file-explorer
[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/Zalpha263/badge.svg)](https://hub.xerj.org/contributors/Zalpha263)

DSH Web 界面右侧栏「文件」页的**文件管理与编辑器**（v2.4.0）：给官方只读的文件浏览/预览补上新建、重命名、删除文件/文件夹、相对路径复制，以及把文件拖进会话框的 @路径引用；同时保留 v2.1 的编辑页。官方文件 API 明确不提供变更操作（@deepseek-ai/dsh-api-workspace-files："The service exposes no mutation operation."），所以所有写操作由本插件 Host 承担，并仍受会话工作区与沙箱约束。

## 能做什么

- **新建文件 / 新建文件夹**：文件页头按钮，或在目录行右键；新建文件成功后默认用插件编辑页打开。
- **重命名**：文件与文件夹，同一目录内改名；在目录/文件行右键。
- **删除文件 / 文件夹**：二次确认；文件带版本守卫，文件夹递归删除（仅本地后端），符号链接只删链接本身。
- **复制相对路径**：复制相对于会话工作区的路径（统一 `/`）；绝对路径复制仍由官方右键菜单提供，不重复。
- **拖文件进会话框**：从右侧栏目录树把文件拖到输入框，插入官方 `@相对路径` 引用（带空格自动加引号；目标会话 cwd 不包含该文件时为绝对路径）。**不是上传附件**，不复制字节；官方 ui-reference 会渲染成引用胶囊。
- **编辑文本**：官方只读预览头部的「编辑」按钮打开编辑页；Ctrl+S 保存、Tab 两空格缩进、官方同款高亮与行高，保存带乐观并发校验。
- **跟随外部改动**：编辑页每 2.5 秒检查版本；文件被删除/改名时进入 deleted/renamed 状态，可复制未保存内容、到新位置打开或关闭标签。

## 界面

| 位置 | 内容 |
| --- | --- |
| 官方文件页头 | 「新建文件」；本地文件系统后端还会显示「新建文件夹」 |
| 文件/文件夹行右键 | 新建文件… / 新建文件夹… / 重命名… / 删除文件…（仅文件）/ 删除文件夹…（仅文件夹）/ 复制相对路径 |
| 官方预览页头 | 「编辑」（进入本插件编辑页） |
| 编辑页头 | 路径 · 大小 · 未保存标记 · 状态 · 自动换行 · 重载 · 保存 |
| 全局对话框 | 新建文件/文件夹、重命名、删除确认；官方 primitives Modal，缺失时自带遮罩 |
| 编辑器主体 | 官方样式代码块：语言标签 + 复制、行号、透明输入区；默认换行 |

## 跨平台规则

名称校验与路径格式化由 Host 的 `lib/paths.js` 统一负责，客户端只做输入期预检：

| 规则 | Windows | macOS | Linux |
| --- | --- | --- | --- |
| 非法字符 | `< > : " / \ | ? *` + 控制字符 | `/ \ :` + 控制字符 | `/ \` + 控制字符 |
| 保留名 | `CON/PRN/AUX/NUL/COM1-9/LPT1-9`（含扩展名） | 无 | 无 |
| 尾随空格/点 | 拒绝 | 允许 | 允许 |
| 最大组件 | 255 字符 | 255 字符 | 255 UTF-8 字节 |
| 大小写 | 不敏感 | 默认不敏感 | 敏感 |

- 新建只填**名字**，不能包含路径分隔符；要建嵌套目录先建文件夹。
- 不做 Unicode NFC/NFD 归一化；同名交给 `createIfAbsent`（文件）或 `dev+ino`（重命名）判定。
- 绝对路径按宿主平台输出（Windows 反斜杠、POSIX 斜杠，UNC 保留）；相对路径统一 `/`。
- 远程浏览器访问另一台宿主时，路径/分隔符/大小写以 Host 为准，不按浏览器平台猜测。

## 边界与限制

- **只操作会话工作区内**：所有写操作都按标签/会话的 cwd 做词法 + 父目录 realpath 复核；`read-only` 会话直接拒绝。
- **文件夹能力仅本地后端**：新建文件夹、重命名、删除文件夹使用宿主 Node fs，需要 `processPathFromHostPath()` 可用；远程/SSH 文件系统会明确提示“仅本地文件系统可用”。新建/删除文件仍走官方 `ctx.fs`，各后端一致。
- **文件夹删除是递归且永久的**：会删除该文件夹及其中所有内容（子文件夹与文件），没有回收站；对话框会明确提示，工作区根目录拒绝删除。
- **删除是永久删除**：对话框写明不可恢复；不做系统回收站。
- **符号链接**：删除本地链接时只删链接本身；非本地后端拒绝；重命名会移动链接。
- **不做**：复制副本/粘贴、文件搜索、多选、拖拽移动；绝对路径复制（官方已有）。
- **不做空白右键菜单**：Files 页/导航树空白处保留官方行为（官方不提供，本插件也不再合成）。
- **不做页头文件操作菜单**：重命名/删除/复制相对路径统一走目录/文件行右键，预览页头与编辑页头不再重复放按钮。
- **拖入是引用**：不读取文件内容、不复制字节；官方从系统拖入的附件上传行为不变。

## 安装

要求 DSH `>=0.2.0-rc.1 <0.3.0-0` 与 pnpm；已核对宿主：Web 0.2.2-rc.1（app.asar）。装完重启 DSH 生效。

```
# 发布态
dsh plugin --profile web add github:Zalpha263/dsh-file-explorer#<40位commit>
# 开发态（link:，源码即部署）
dsh plugin --profile web add D:/path/to/dsh-file-explorer
# 卸载
dsh plugin --profile web remove dsh-file-explorer
```

桌面版在侧边栏「插件」页用绝对路径添加插件目录后重启应用。

## 开发者

### Host（`lib/index.js`）

暴露 10 个 Remote 方法，`sessionId` 都是可选尾参：

| 方法 | 行为 |
| --- | --- |
| `fsStat(path, sessionId?)` | 类型、大小与版本令牌（编辑页轮询用） |
| `fsRead(path, maxBytes, sessionId?)` | 文本、大小、版本、`truncated`/`binary`/`decodeValid` |
| `fsWrite(path, content, expectedVersion, sessionId?)` | 版本校验后写回 |
| `fsEnvironment(sessionId?)` | 平台、分隔符、大小写、本地后端、cwd/工作区根 |
| `fsDescribe(path, sessionId?)` | absolute/native/relative/name/directory/kind/exists/link/insideWorkspace/version/size |
| `fsCreateFile(directory, name, sessionId?)` | 名称校验 + 父目录校验 + `createIfAbsent` + 沙箱策略 |
| `fsCreateFolder(directory, name, sessionId?)` | 仅本地后端，Node `mkdir` |
| `fsRename(path, newName, sessionId?)` | 仅本地后端，同目录内改名，文件+文件夹 |
| `fsDelete(path, expectedVersion, sessionId?)` | 只删文件；链接只删链接本身 |
| `fsDeleteFolder(path, sessionId?)` | 仅本地后端，递归删除文件夹；链接只删链接本身，拒绝工作区根 |

带 `sessionId` 时按该会话 `header.cwd` 解析路径、限制边界并使用该会话沙箱策略；不传时依次用实时最近根会话、工作区注册表、部署默认根兜底。未知 `sessionId` 显式报错。

### Client（`lib/client.js`）

手写 `__ModuleLoader__` bundle。用到的官方接口：

- `sidebar.right.tab.files.actions`：文件页头动作（owner `absolutePath`）。
- `ctx.contextMenus.register/notify`：目录/文件行右键菜单与操作结果提示。
- `shell.overlay` + primitives `Modal`：全局新建/重命名/删除对话框。
- `conversation.input.overlay` + session 作用域 `inputActions.insertText`：拖入引用桥。
- 官方目录树行自带 `data-files-entry` / `data-files-path` / `data-files-root`：拖动源只读这些属性，找不到就自然禁用拖拽。
- `@file` mention 语法与 `ui-reference`：插入文本由官方识别为引用胶囊。

拖拽设置自定义 MIME `application/x-dsh-file-ref` 与 `text/plain`，不碰 `Files` / `application/x-dsh-file`，因此与官方附件上传互不干扰。

测试：

```
node test/paths.test.mjs        # 6 例：三平台路径/名称向量
node test/host.test.mjs         # 19 例：读/写/新建/删除/重命名/边界
node test/client-smoke.test.mjs # 27 例：bundle、菜单、对话框、拖拽引用、编辑页
```

## 更新日志

### v2.4.0
- 新增「删除文件夹…」：目录行右键 → 确认后递归删除该文件夹及全部内容，仅本地后端；符号链接只删链接本身，工作区根目录拒绝删除。
- Host 新增 `fsDeleteFolder(path, sessionId?)`；客户端贡献、对话框与 `deleted` 事件同步（文件夹内已打开的编辑页会进入 deleted 状态）。
- 测试：Host 19 例、客户端 27 例、路径 6 例。

### v2.3.0
- 移除 Files 页/导航树空白处右键：空白区域恢复官方行为（官方本就不提供菜单），不再由插件合成目录根菜单。
- 移除官方预览页头与编辑页头的「⋮ 文件操作」按钮：重命名/删除/复制相对路径统一走目录/文件行右键，减少页头按钮、避免与官方动作槽位挤在一起。
- 保留文件页头「新建文件/新建文件夹」、行右键菜单、拖拽 @ 引用与编辑页；Host 与路径规则未变。
- 客户端测试 26 例（移除 3 例空白右键用例）。

### v2.2.1
- 加固 Files 页/导航树空白处右键：document 捕获阶段监听、右栏面板按命中点几何兜底、session→cwd 兜底；树行/路径标签/标签 chip/文档正文/输入控件保留官方行为。
- 重新构建客户端 bundle 后需要**重启宿主进程**（桌面版请从托盘彻底退出再启动）；仅刷新页面会继续使用宿主启动时缓存的旧 bundle。

### v2.2.0
- 新增文件页头「新建文件/新建文件夹」、目录/文件右键菜单、预览/编辑页头「⋮ 文件操作」，以及 Files 页/导航树空白处的目录根右键菜单。
- 新增 Host 6 个方法：environment/describe/createFile/createFolder/rename/delete；所有写操作仍限定会话工作区，删除带版本守卫。
- 新增跨平台路径/名称模块 `lib/paths.js`：Windows 保留名/非法字符、macOS 冒号、Linux 字节长度等。
- 新增从右侧栏目录树拖文件到会话框：插入 `@相对路径` 引用（官方 inputActions），不上传附件。
- 编辑页跟随删除/重命名进入 deleted/renamed 状态，可复制未保存内容或关闭标签。
- 文档与测试同步；Host 18 例、客户端 29 例、路径 6 例。

### 历史版本
- v2.1.0：渲染对齐官方文档预览；官方字体 token、16px padding、CSS counter 行号、默认自动换行。
- v2.0.1：两阶段注册、按会话取根与策略、keepMounted、120ms 高亮合并、轮询可见性。
- v2.0.0：定位为官方只读预览的编辑补充件，Host 收窄为三个方法。
- v1.13.0：适配 DSH 0.2.0-rc 线，新增 locale 展示元数据。
- v1.4.0：删除到系统回收站（仅 Windows）与目录树实时刷新。
- v1.3.0：编辑与 IDE 风格右键菜单（新建文件/文件夹、重命名、复制、粘贴、绝对/相对路径复制）。
