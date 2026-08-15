# dsh-file-explorer

> DeepSeek Harness（DSH）Web UI 的侧边文件浏览器：不离开聊天界面就能浏览工作区文件、预览内容，面板可停靠、可浮动。

## ✨ 功能特性

- **懒加载目录树**：按需展开工作区目录，目录在前、文件带大小；默认隐藏 `node_modules`、`.git` 等（可切换显示）
- **文件预览 + 内联编辑**：点击文件在面板内预览；文本文件可进入编辑模式（Ctrl+S 保存，带磁盘冲突检测）；超大文件自动截断、二进制文件自动识别；预览区高度可拖动
- **IDE 式右键菜单**：树中右键即可——新建文件（txt / py / md / json / js / ts / html / css 等模板）、新建文件夹、重命名、复制、粘贴（同名自动加 ` (1)` 后缀）、复制绝对路径 / 相对路径、删除（移入系统回收站）
- **拖放移动**：直接把文件 / 文件夹拖到其它目录行（或树空白区）即可移动，跨设备自动复制+删除回退；目标行高亮提示
- **实时刷新**：新建 / 重命名 / 粘贴 / 保存 / 删除 / 移动后树即时更新，无需手动刷新
- **跨平台回收站**：Windows 系统回收站 / macOS 废纸篓 / Linux XDG 回收站，均带内置回收站兜底（`~/.dsh-file-explorer-trash/`）
- **工作区自动跟随**：切换会话/工作区后约 1 秒内自动切换到对应目录
- **三种停靠模式**：右侧（挤压对话栏，不遮挡）/ 中间 / 浮动（自由拖动 + 四边四角缩放）
- **悬浮球**：侧边可拖动入口，可随时开关
- **偏好记忆**：面板位置/尺寸/停靠模式/预览高度/悬浮球开关全部本地记忆

## 安装

### 前置要求

- DSH `0.1.0-rc.6`，Windows（路径处理按 Windows 习惯）
- 官方安装方式需要 [pnpm](https://pnpm.io/zh/)（`npm install -g pnpm`）

### 官方方式（推荐）

```bash
dsh plugin --profile web add github:Zalpha263/dsh-file-explorer
```

- 发布到 npm 后可直接：`dsh plugin --profile web add dsh-file-explorer`
- 装完**重启 DSH**，会话标题栏右侧会出现「📁 文件」按钮
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

- 会话标题栏右侧「📁 文件」按钮
- 侧边悬浮球「📁」（点击开关面板；拖动改变位置）

### 面板操作

| 控件 / 操作 | 作用 |
|-------------|------|
| 右侧 / 中间 / 浮动 | 停靠模式切换；「右侧/中间」模式拖边缘调整宽度 |
| 标题栏拖动 | 浮动模式下拖动面板位置 |
| 面板四边 / 四角 | 浮动模式下自由调整大小 |
| ↻ 刷新 | 重新加载当前目录 |
| 👁 隐藏 | 显示 / 隐藏 `node_modules`、`.git` 等条目 |
| 🪁 悬浮球 | 显示 / 隐藏侧边悬浮球 |
| 预览区上方分隔条 | 拖动调整预览区高度 |
| 点目录 / 点文件 / ✕ | 展开目录 / 打开文件预览 / 关闭预览 |

### 预览与编辑

- 点文件 → 预览；预览头部点「编辑」进入编辑模式（仅限文本文件；二进制 / 已截断文件不可编辑）
- 编辑时 `Ctrl+S`（或「💾 保存」）写盘；「取消」丢弃改动；`Esc` 退出编辑
- 保存带版本检测：文件在打开期间被外部改动会拒绝保存并提示（避免覆盖他人修改）

### 拖放移动

- 按住任意文件 / 文件夹行，拖动到目标**目录行**（或树空白区）松开即移动
- 目标目录高亮提示；拖到自身或子目录会被拒绝；拖回原目录无操作
- 跨设备（不同盘 / 挂载点）移动自动转「复制 + 删除」完成

### 右键菜单

| 菜单项 | 适用 | 作用 |
|--------|------|------|
| 新建文件… | 目录 / 空白区 | 输入文件名（可带扩展名），自动套用模板：`txt`(空) / `md` / `py` / `js` / `json` / `ts` / `html` / `css`，其它扩展名为空文件 |
| 新建文件夹… | 目录 / 空白区 | 输入名称创建文件夹 |
| 重命名… | 文件 / 目录 | 行内输入新名称，`Enter` 确认 / `Esc` 取消 |
| 复制 | 文件 / 目录 | 记录到内部剪贴板（刷新页面不丢失）；目标行有虚线框提示 |
| 粘贴 | 目录 / 文件 / 空白区 | 把剪贴板中的文件/目录复制到目标目录；同名自动加 ` (2)` 后缀（点文件如 `.env` 也正确保留前缀） |
| 复制绝对路径 | 文件 / 目录 | 完整路径写入系统剪贴板 |
| 复制相对路径 | 文件 / 目录 | 相对当前工作区根目录的路径写入系统剪贴板 |
| 删除 | 文件 / 目录 | 确认后移入系统回收站（Windows）/ 废纸篓（macOS）/ XDG 回收站（Linux），失败时落内置回收站 |

> 提示：粘贴到「文件」上 = 粘贴到该文件所在目录；粘贴到目录 / 树空白区 = 粘贴到该目录。
> 删除后文件可在系统回收站中恢复；删除目录会连同其全部内容一起移入回收站。

## 卸载

```bash
dsh plugin --profile web remove dsh-file-explorer
```

重启 DSH 后插件不再加载，面板与悬浮球消失，无残留。

## 常见问题（FAQ）

| 问题 | 原因与解决 |
|------|-----------|
| 点「📁 文件」没有出现面板 | 多为页面缓存或渲染异常：先硬刷新（Ctrl+F5）；仍不行则重启 DSH |
| 树里显示红色错误行 | 该路径当前不可读（权限 / 已删除）；点「↻ 刷新」重试 |
| 切换工作区后目录没跟上 | 约 1 秒内自动跟随；也可点「↻ 刷新」手动重载 |
| 保存文件提示「文件已改变」 | 该文件在编辑期间被其它程序修改；点「编辑」重新载入后再保存 |
| 粘贴报错「不能粘贴到自身所在目录」 | 目标目录就是源文件所在目录；先进入其它目录再粘贴 |
| 拖放时提示「不能移动到自身或子目录中」 | 目标目录是源目录本身或其内部；拖到其它目录即可 |
| 删除的文件去哪了 | Windows 系统回收站 / macOS 废纸篓 / Linux XDG 回收站；系统回收站不可用时移入插件内置回收站 `~/.dsh-file-explorer-trash/`。内置回收站**自动清理**：条目保留 30 天、最多 200 条，超出自动删除最旧的（启动时与每次放入后触发）；也可手动删除该目录立即清空 |
| 删除报错「recycle bin failed」等 | 文件被占用或无回收站支持；关闭占用程序后重试 |
| 复制到剪贴板失败 | 浏览器在非安全上下文禁用剪贴板 API（本机 localhost 通常可用）；可改用右键「复制」内部剪贴板 |
| 面板 / 悬浮球位置跑出屏幕 | 清除浏览器该站点的 `dsh-file-explorer:*` localStorage 键后重新打开 |
| 与旧版 / 临时版插件冲突 | v1.2.0 起通过官方 bundle 只安装一个实例即可，移除其它副本 |

## 兼容性

- 目标版本：DSH `0.1.0-rc.6`；Windows / macOS / Linux（路径分隔符、大小写敏感、回收站策略均按平台自适应）
- 部分 CSS 选择器（侧边栏宽度探测 `.pI_x6G_frame` 等）针对该版本的客户端产物编写，**DSH 大版本升级后可能需要复核**
- Host 半区依赖 dsh 自带的 `@deepseek-ai/dsh-typert-protocol`（peer 依赖，由 dsh 提供）——**不要**单独安装该包的独立副本，否则 Remote 桥会失效
- **写操作说明**：编辑保存 / 新建 / 重命名 / 复制 / 移动 / 删除由 Host 半区直接通过 Node `fs/promises` 执行。这是刻意设计——本插件是**用户手动操作的文件管理器**，与读任意路径的行为对称；但请注意它不受 DSH 的 read-only / workspace-write 策略约束，请勿在不可信环境下使用
- **删除的回收站策略**：Windows 用系统回收站（PowerShell）；macOS 用系统废纸篓（Finder / osascript）；Linux 用 `gio trash`（XDG）；以上不可用时统一回退到插件内置回收站 `~/.dsh-file-explorer-trash/`（时间戳命名，防同名覆盖）
- 大目录（如 `node_modules`）整目录复制 / 跨设备移动会较慢，属正常现象

## 开发者

- **Host 半区**（`lib/index.js`）：`FileExplorerService extends TypertRemoteService` 注册 `fileExplorer` 远程服务（`fsList` / `fsRead` / `fsWrite` / `fsCreate` / `fsRename` / `fsCopy` / `fsDelete` / `fsMove` / `wsRoot` / `wsList`）；Remote 标记通过 `markRemote` 手动应用（不依赖 Node 装饰器语法）；写操作直接使用 `node:fs/promises`；删除按平台走 PowerShell / osascript / gio trash，失败落内置回收站；`fsMove` 处理跨设备（EXDEV）复制+删除回退；`assertNoSelfNesting` 防目录复制/移动进自身；`agent/status` + `session/event` 维护最近活跃工作区
- **Client 半区**（`lib/client.js`）：`__ModuleLoader__.load` 加载；`ctx.remote.$mount` 自挂载 `fileExplorer` 命名空间，用 `ctx.get("remote.fileExplorer")` 调用（返回 `{ok, value}` 信封统一解包）；零 React hooks（原生 DOM 渲染）；路径拼接 / 相对路径 / 大小写比较按 `wsRoot` 返回的 `platform` 自适应
- 改代码后：Client 改动刷新页面即可生效，Host 改动需重启 DSH；无需构建
- 已安装用户升级：`dsh plugin --profile web update dsh-file-explorer`

## 版本历史

- **v1.5.2**：修复拖放高亮判定——高亮改由持续触发的 `dragover` 维护（不再因行内子元素 enter/leave 抖动而闪烁或难触发），`dragleave` 只在真正离开行时取消；拖到自身 / 子目录 / 原目录时保持系统禁止光标且不高亮——**高亮 = 可以放下**，识别一目了然。
- **v1.5.1**：内置回收站自动清理——条目保留 30 天、最多 200 条（启动时与每次放入后触发），防止垃圾文件长期堆积。
- **v1.5.0**：跨平台健壮性修复 + 拖放移动——
  - 新增拖放移动：文件/文件夹直接拖入其它目录（含树空白区），目标行高亮；跨设备自动「复制+删除」回退；防拖入自身/子目录；
  - 删除跨平台化：macOS 走系统废纸篓（Finder）、Linux 走 `gio trash`（XDG），均带内置回收站兜底 `~/.dsh-file-explorer-trash/`；
  - 修复 Linux/macOS 路径 bug：客户端路径拼接/相对路径/大小写比较按平台自适应（原硬编码 `\` 导致非 Windows 新建、重命名、粘贴、删除全部失效）；
  - 修复 `fsCopy` 目录复制进自身会无限递归、点文件（`.env`）复制后丢点前缀；`fsRename` 增加自嵌套防护；
  - fetchDir 加请求序号防乱序覆盖；删除清理缓存加分隔符边界；菜单禁用项正常渲染文字。
- **v1.4.0**：删除到回收站 + 实时刷新——
  - 右键菜单新增「删除」（文件 / 目录，确认后 Windows 移入系统回收站，可恢复）；
  - 修复新建 / 重命名 / 粘贴 / 保存后树不实时更新的问题（目录刷新语义修正 + 强制绕过 in-flight 防重入；新建文件夹自动展开）。
- **v1.3.0**：文件编辑与 IDE 式右键菜单——
  - 预览支持内联编辑（Ctrl+S 保存、磁盘冲突检测、二进制/截断文件不可编辑）；
  - 右键菜单：新建文件（txt/py/md/json/js/ts/html/css 模板）/ 新建文件夹 / 重命名 / 复制 / 粘贴（同名自动加 ` (1)` 后缀）/ 复制绝对与相对路径；
  - Host 新增 `fsWrite` / `fsCreate` / `fsRename` / `fsCopy`（`node:fs/promises` 直连，不走沙箱围栏——见「兼容性」）。
- **v1.2.0**：支持 dsh 官方 bundle 安装（`dsh.bundle.patch` + 自带 `cordis.patch.yml`）；`@deepseek-ai/dsh-typert-protocol` 改为 peerDependency——与 gateway 共享同一模块实例（Remote 标记的 WeakMap 按模块实例隔离，独立副本会导致桥接失效）。
- **v1.1.0**：v2 架构重写，修复 v1 的加载失败——
  - Client 半区 `$mount` 自挂载 `fileExplorer` 命名空间（v1 因 `inject: ["remote.fileExplorer"]` 等待一个无人挂载的服务而永远 pending）；
  - 命名空间改用 `ctx.get("remote.fileExplorer")` 访问（属性访问在自挂载场景会抛错并导致面板条目崩溃退役）；
  - Host 半区改用 `TypertRemoteService` 自动注册（服务 + `typertRemote` 绑定一步完成）；
  - 补丁注册行重写（此前曾被意外清空导致 Host 半区未加载）。
- **v1.0.0**：v1 初版（TypertRemote 桥实现）——存在 Client 等待不存在的 `remote.fileExplorer` 而加载失败的问题，已被 v1.1.0 取代。

## License

MIT
