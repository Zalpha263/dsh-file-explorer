# dsh-file-explorer

> DeepSeek Harness（DSH）Web UI 的文件浏览器：不离开聊天界面就能浏览工作区文件、预览与编辑内容，面板可停靠、可浮动。

## ✨ 功能特性

- **懒加载目录树**：按需展开工作区目录，目录在前、文件带大小；默认隐藏 `node_modules`、`.git` 等（可切换显示）
- **预览 + 内联编辑**：点击文件即预览（512KB 内自动截断、二进制自动识别）；文本文件可编辑（Ctrl+S 保存、磁盘冲突检测）
- **IDE 式右键菜单**：新建文件 / 文件夹、重命名、复制粘贴（同名自动加后缀）、复制绝对 / 相对路径、删除到回收站
- **拖放移动**：拖到目标目录行或树空白区即移动；跨设备自动「复制 + 删除」回退
- **实时刷新**：新建 / 重命名 / 粘贴 / 保存 / 删除 / 移动后树即时更新
- **跨平台回收站**：Windows / macOS / Linux 系统回收站，带内置兜底（`~/.dsh-file-explorer-trash/`）
- **工作区自动跟随**：切换会话 / 工作区后约 1 秒内自动切换目录
- **停靠与浮动**：右侧 / 中间 / 浮动三种形态（可拖宽、四边四角缩放）——仅独立模式；装有 ui-beautify 时由插件面板统一管理
- **ui-beautify 插件面板适配**：检测到 ui-beautify 时自动加入「插件面板」（卡片 / 经典模式统一管理，名称「文件浏览器」）；未安装时回退自带按钮 + 面板
- **偏好记忆**：位置 / 尺寸 / 停靠模式 / 预览高度本地记忆

## 安装

### 前置要求

- DSH `0.1.0-rc.7`，Windows（路径处理按 Windows 习惯）
- 官方安装方式需要 [pnpm](https://pnpm.io/zh/)（`npm install -g pnpm`）

### 官方方式（推荐）

```bash
dsh plugin --profile web add github:Zalpha263/dsh-file-explorer
```

- 发布到 npm 后可直接：`dsh plugin --profile web add dsh-file-explorer`
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

- **预览与编辑**：点文件预览；「编辑」进入编辑模式（仅文本文件，二进制 / 已截断不可编辑）；`Ctrl+S` 保存、`Esc` 退出；保存带版本检测，编辑期间被外部改动会拒绝保存
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
- **写操作说明**：编辑保存 / 新建 / 重命名 / 复制 / 移动 / 删除由 Host 半区直接通过 Node `fs/promises` 执行——这是刻意设计（用户手动操作的文件管理器），但**不受 DSH 的 read-only / workspace-write 策略约束**，请勿在不可信环境下使用
- 大目录（如 `node_modules`）整目录复制 / 跨设备移动会较慢，属正常现象

## 开发者

- **Host 半区**（`lib/index.js`）：`FileExplorerService` 注册 `fileExplorer` 远程服务（`fsList` / `fsRead` / `fsWrite` / `fsCreate` / `fsRename` / `fsCopy` / `fsDelete` / `fsMove` / `wsRoot` / `wsList`）；读操作走 DSH `fs` 服务，写操作 `node:fs/promises` 直连；删除按平台走 PowerShell / osascript / gio trash，失败落内置回收站（30 天 / 200 条自动清理）；`fsMove` 处理跨设备（EXDEV）复制 + 删除回退；`agent/status` + `session/event` 维护最近活跃工作区
- **Client 半区**（`lib/client.js`）：`__ModuleLoader__.load` 加载；`ctx.remote.$mount` 自挂载 `fileExplorer` 命名空间；零 React hooks（原生 DOM 渲染）；路径拼接 / 相对路径 / 大小写比较按 `platform` 自适应；检测到 ui-beautify 的 `dock` 服务时注册为插件面板
- 改代码后：Client 改动刷新页面即可生效，Host 改动需重启 DSH；无需构建
- 已安装用户升级：`dsh plugin --profile web update dsh-file-explorer`

## 版本历史

- **v1.7.3**：移除悬浮球功能（侧边可拖动入口、工具栏开关按钮及相关偏好记忆全部删除；旧 localStorage 残留数据不再读取，无影响）。装有 ui-beautify 时本由插件面板浮动替代，现独立模式也不再提供。
- **v1.7.2**：健壮性与内存优化（行为不变）——
  - 目录缓存加上限（300 条 FIFO 淘汰，同步清理请求序号表；被淘汰目录再次展开时重新加载，短暂"加载中"；文件内容从不缓存不受影响）；
  - 修复行内输入框 blur 定时器竞态（不会误关新打开的输入框）；卸载时关闭残留的右键菜单/输入浮层；
  - 面板重建时清理 grip/停靠按钮注册表（overlay 槽重挂载不再累积陈旧引用）；工作区跟随探测加防叠加标志。
- **v1.7.1**：拖动跟手性——ui-beautify 拖动中（frame 带 `data-vsc-dragging`）暂停工作区跟随与目录树重建，避免拖动面板/停靠卡时树重渲染造成偶发卡顿。
- **v1.7.0**：接入 ui-beautify 统一插件面板——
  - 面板名称改为「文件浏览器」（列表项 / 标签页显示名，带 📁 图标）；
  - ui-beautify 的 `dock` 存在时，标题栏不再注册「📁 文件」按钮（入口统一为「🧩 插件面板」，会话日志按钮旁），面板在两种模式下都由插件面板宿主渲染（卡片模式停靠卡 / 经典模式右侧停靠与浮动）；自带的经典三档面板退役（仅 ui-beautify 缺失时启用）；
  - 悬浮球在宿主模式下隐藏；无 ui-beautify 时行为与 v1.6.0 完全一致。
- **v1.6.0**：适配 ui-beautify 卡片模式——
  - 检测到 ui-beautify 的 `dock` 面板宿主（卡片模式生效时）自动注册为停靠卡标签面板：点「📁 文件」在停靠卡中打开，支持 ⧉ 浮动 / 回停靠 / × 关闭，按钮高亮与面板开关实时同步；
  - 宿主面板内隐藏与卡片体系冲突的自带元素（右侧/中间/浮动停靠按钮、四边缩放 grip、悬浮球开关），样式由卡片宿主统一（毛玻璃 / border-l2 / 12px 圆角）；
  - 经典（webUI）模式保持原三档停靠面板，外观按卡片语言微调（12px 圆角、token 边框）；
  - 经典 ↔ 卡片切换时开关状态双向同步；ui-beautify 未安装 / 引擎未生效时自动回退经典面板，行为与旧版一致。
- **v1.5.6**：修复浮动面板"打不开"——
  - 根因：浮动模式打开时直接使用保存的位置坐标，未按当前视口夹紧；若保存的位置超出当前窗口（换过窗口尺寸/显示器），面板会在屏幕外打开，表现为"点击无反应"；
  - 修复：`applyDock` 打开时对保存坐标做视口夹紧（复用拖拽时的 `clampFloatPos`），窗口 resize 时也自动重新夹紧；
  - 应急恢复（旧数据）：控制台执行 `localStorage.removeItem('dsh-file-explorer:pos')` 后刷新。
- **v1.5.5**：面板布局修复——
  - 浮动模式可拖到屏幕最右侧：边界按面板实际宽度计算（原写死 400px，面板拖窄/拖宽后右侧留白或超出屏幕）；
  - 「右侧 / 中间」吸附模式顶部下移（约 76px，避开会话标题栏的「对话 / 轨迹」按钮），不再遮挡顶部 UI。
- **v1.5.4**：源码复查修复——
  - **修复大文件预览必败**：`fsRead` 改用流式读取（`streamText`），按字符数截断，>512KB 文件正确显示「已截断」；
  - **修复二进制识别失效**：二进制检测统一为底层 `FS_NOT_TEXT` 信号（原 `includes('\0')` 是死代码），二进制文件显示「无法预览」而非报错；
  - 切换工作区时若有未保存编辑先弹确认（避免跟随循环静默丢弃编辑）；
  - 复制副本名从 ` (1)` 开始（与文档一致）；重命名/缓存清理大小写比较按平台自适应；`toAbsolute` 支持 UNC 网络路径；保存后预览 size 即时更新；拖拽增加 document 级兜底清理；移除子菜单死代码，回收站命令统一 `runShell` 执行器。
- **v1.5.3**：修复拖放无法落下——`onDrop` 中先清空了 `dragSrcPath` 再调用依赖它的合法性校验，导致 drop 永远被拒绝；校验改为接收显式源路径参数。
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
