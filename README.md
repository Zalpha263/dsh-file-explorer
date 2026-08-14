# dsh-file-explorer

DeepSeek Harness Web UI 侧边文件浏览器（持久插件）。

## 功能

- **目录树**：懒加载展开工作区目录，目录在前、文件带大小；默认隐藏 `node_modules`、`.git` 等（可切换）
- **文件预览**：点击文件在面板内预览；超大文件截断、二进制识别、智能换行；预览区高度可拖动调整（树区自动压缩出滚动条）
- **工作区自动跟随**：切换会话/工作区后约 1 秒内自动切换到对应目录树（DOM 探测 + Host 信号双保险）
- **停靠模式**：浮动（四边四角自由调整大小）/ 右侧（挤压对话栏，不遮挡）/ 中间，宽度记忆
- **悬浮球**：侧边可拖动入口按钮，可随时开关
- **记忆**：面板位置/尺寸/停靠模式/预览高度/悬浮球开关全部本地记忆（localStorage）

## 入口

- 会话标题栏右侧「📁 文件」按钮
- 侧边悬浮球「📁」（可拖动，工具栏「🪁 悬浮球」可开关）

## 架构（v2：Typert Remote 源模式）

持久版 Client 没有动态插件的 `harness`/`host.call` 内置，通信走官方 Typert Remote 桥：

- **Host 半区**（`lib/index.js`）：`FileExplorerService extends TypertRemoteService`，
  `super(ctx, 'fileExplorer')` 自动完成两件事——`ctx.reflect.provide` 注册服务、
  `typertRemote` 绑定（Gateway 源模式发现：遍历 `ctx.reflect.props` → 读 `typertRemote`
  → 匹配 `remoteMethods()` 标记）。方法签名必须是**简单标识符参数**（Gateway 从函数
  源码解析参数名作为 wire 名）。`agent/status` + `session/event` 维护最近活跃工作区。
- **Client 半区**（`lib/client.js`）：`__ModuleLoader__.load` 加载；`inject` 只声明
  `["slots", "remote"]`（**绝不能**声明 `remote.fileExplorer`——命名空间由本入口自己挂载，
  静态注入会自锁）。apply 中先 `await ctx.remote.$mount(贡献)` 挂载 `fileExplorer`
  命名空间（strict codec 使用透传 schema，Host 侧由 SRC 标记兜底校验），随后**必须用
  `ctx.get("remote.fileExplorer")` 取命名空间**（属性访问 `ctx.remote.fileExplorer` 走
  fiber 祖先链解析，对自挂载命名空间会抛错并导致面板条目崩溃退役；`ctx.get` 直读共享
  store 始终可见），调用返回 `{ok, value}` 信封统一解包。
  零 React hooks（原生 DOM 渲染）；无 `timer` 服务 → 原生 `setInterval` + 清理。

### 上次失败的根因（已修复）

`cordis.patch.yml` 的 `file-explorer` 行被意外清空 → Host 半区未加载 → `fileExplorer`
服务不存在 → Client 等 `remote.fileExplorer` 永久 pending → `web boot: 1 entry did not
activate`。本次同时修复了补丁行与 Client 挂载方式，双保险。

## 安装（手动）

dsh 的持久插件需要**两份同步副本**（宿主行从 profile 目录解析，client 模块扫描从 dsh 安装目录解析）：

```powershell
# 1. profile 副本（宿主行导入锚点）
$profile = "$env:USERPROFILE\.dsh\profiles\web\node_modules"
New-Item -ItemType Directory -Force -Path "$profile\dsh-file-explorer" | Out-Null
Copy-Item -Recurse -Force ".\dsh-file-explorer\*" "$profile\dsh-file-explorer\"

# 2. 依赖锚点（Host 半区 import @deepseek-ai/dsh-typert-protocol）
$dshNodeModules = "C:\Users\ASUS\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\node_modules"
New-Item -ItemType Junction -Path "$profile\@deepseek-ai" -Target "$dshNodeModules\@deepseek-ai"

# 3. dsh 安装目录副本（client-modules 扫描锚点）
Copy-Item -Recurse -Force ".\dsh-file-explorer" "$dshNodeModules\dsh-file-explorer"

# 4. 注册行
# 在 $env:USERPROFILE\.dsh\profiles\web\cordis.patch.yml 的 insert 列表追加：
#   - id: file-explorer
#     name: dsh-file-explorer
```

然后重启 `dsh web`。

## 升级注意事项

- **任何 `lib/` 改动都必须同步两份副本**（profile 与 dsh 安装目录）
- **`dsh` 升级会清空 dsh 安装目录**：需重新复制 dsh 副本；若 junction 目标失效（`@deepseek-ai` 目录被清），需重建 junction
- **dsh 版本升级后**：CSS 中 `.pI_x6G_frame` 等混淆类名可能变化（侧边栏宽度探测的兜底路径），行为通常不受影响
- Remote 标记采用"手动装饰器上下文"方式（`lib/index.js` 中 `markRemote`），不依赖 Node 装饰器语法——**升级 dsh 时若 `dsh-typert-protocol` 的 `Remote`/`bindTypertRemote` 导出变化，需同步适配**
- **`cordis.patch.yml` 曾被意外清空**（机制未定位）：重启前请确认 `file-explorer` 行仍在
- **临时动态版（fexp-1）与持久版会注册同名 Slot**：持久版生效后应停止/移除临时版（重启后临时版自然消失）

## 版本历史

- **v1.1.0**：v2 架构重写，修复 v1 的加载失败——
  - Client 半区 `$mount` 自挂载 `fileExplorer` 命名空间（v1 因 `inject: ["remote.fileExplorer"]` 等待一个无人挂载的服务而永远 pending）；
  - 命名空间改用 `ctx.get("remote.fileExplorer")` 访问（属性访问在自挂载场景会抛错并导致面板条目崩溃退役）；
  - Host 半区改用 `TypertRemoteService` 自动注册（服务 + `typertRemote` 绑定一步完成）；
  - 补丁注册行重写（此前曾被意外清空导致 Host 半区未加载）。
- **v1.0.0**：v1 初版（TypertRemote 桥实现）——存在 Client 等待不存在的 `remote.fileExplorer` 而加载失败的问题，已被 v1.1.0 取代。

## License

MIT
