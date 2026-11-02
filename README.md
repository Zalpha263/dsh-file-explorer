# dsh-file-explorer
[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/Zalpha263/badge.svg)](https://hub.xerj.org/contributors/Zalpha263)
DSH Web 界面里的**文件编辑器**（v2.1.0 起）：只给官方只读的文件预览补上"编辑"这一件事，不重复官方已有的浏览、预览、标签与主题能力。官方文件浏览与文档预览负责"看"，且预览是只读的（@deepseek-ai/dsh-api-workspace-files 原文："The service exposes no mutation operation."）；本插件在官方预览头部注入「编辑」按钮，用独立标签打开同一文件（会话作用域地址 + kind=file-editor，不抢默认打开），保存带版本校验。

## 能做什么

- **编辑纯文本**：Markdown、代码、配置、JSON/YAML、脚本等；Ctrl+S 保存、Tab 两空格缩进。
- **官方同款渲染**：复刻官方 documentpreview 代码块（字体 token、16px padding、CSS counter 行号、官方高亮），并跟随设置里的代码字号。
- **默认自动换行**：与官方一致；页头可切换为不换行 + 横向滚动，两层共享同一字体/行高/换行规则，光标不偏移。
- **保存与冲突**：版本令牌乐观并发；外部修改时保存被拒，只提供「重载（丢弃我的修改）」与「复制我的内容」，绝不静默覆盖。
- **跟随外部改动**：每 2.5 秒检查版本，仅在标签可见时轮询；未修改自动重载，已修改只提示冲突。
- **按会话读写**：从标签 contentId 解析 sessionId，写边界与沙箱策略都取该会话的 cwd；会话不存在时显式报错，不借用其它会话。
- **拒绝不该编辑的**：二进制、超过 2MB、非 UTF-8（GBK/UTF-16 等）会说明原因并拒绝。

## 界面

| 位置 | 内容 |
| --- | --- |
| 官方预览头部 | 「编辑」按钮，与其他官方动作并排 |
| 编辑页顶栏 | 路径 · 大小 · 未保存标记 · 状态 · 换行开关 · 重载 · 保存（官方 38px 工具栏） |
| 编辑页主体 | 官方样式代码块：语言标签 + 复制、行号、透明输入区；默认换行 |
| 冲突提示条 | 文件被外部修改时出现：重载 / 复制我的内容 |

编辑页是官方右侧栏里的标签，标题由官方使用 `title(address)` 生成（`编辑 · 文件名`），并继承官方标签能力（拖出、并排、跟随主题）。

## 边界与限制

- **只编辑文本**：二进制、>2MB、非 UTF-8 一律拒绝并说明原因。
- **写入受工作区约束**：写路径必须在该标签所属会话的 cwd 内（词法归一化 + realpath 复核），沙箱策略同会话；读接口不校验工作区。
- **不做文件管理**：新建/改名/移动/复制/删除/回收站与目录树都不在职责内，官方 API 没有变更操作。
- **不做浮动面板、不抢默认打开**：面板形态交给官方标签条，"默认打开"仍归官方。

## 安装

要求 DSH `>=0.2.0-rc.1 <0.3.0-0` 与 pnpm；已核对宿主：Web 0.2.0-rc.2、桌面 0.2.1-rc.3（当前安装），安装后仍需在目标宿主冒烟。

```
# 发布态
dsh plugin --profile web add github:Zalpha263/dsh-file-explorer#<40位commit>
# 开发态（link:，源码即部署）
dsh plugin --profile web add D:/path/to/dsh-file-explorer
# 卸载
dsh plugin --profile web remove dsh-file-explorer
```

装完重启 DSH 生效；桌面版在侧边栏「插件」页用绝对路径添加插件目录后重启应用。

## 开发者

Host（`lib/index.js`）暴露三个 Remote 方法，`sessionId` 都是可选尾参：

| 方法 | 行为 |
| --- | --- |
| `fsStat(path, sessionId?)` | 返回类型、大小与版本令牌（轮询用） |
| `fsRead(path, maxBytes, sessionId?)` | 返回文本、大小、版本，以及 `truncated` / `binary` / `decodeValid` |
| `fsWrite(path, content, expectedVersion, sessionId?)` | 以 `replaceIfVersion` 做同临界区的版本校验后写回，返回新版本 |

带 `sessionId` 时按该会话 `header.cwd` 解析路径、限制写入边界并使用该会话沙箱策略；不传时依次用实时最近根会话（`agents.roots()`）、工作区注册表、部署默认根兜底。

Client（`lib/client.js`）是手写 `__ModuleLoader__` bundle：注册官方预览头部动作与 `file-editor` 标签类型（不声明 `patterns`、`keepMounted: true`），两阶段在 `sidebar.right.pane.tab` 槽位回调里注册（服务晚到有界重试）。渲染几何、字体与行号由官方 token 驱动；地址只生成会话作用域绝对路径，不做 cwd 相对化。`@deepseek-ai/dsh-client-ui-primitives` 是客户端基线库，可直接 require，不要写进 `dsh.client.external`。测试：`node test/host.test.mjs`（12 例）、`node test/client-smoke.test.mjs`（16 例）；改客户端 bundle 后必须跑冒烟。

## 更新日志

### v2.1.0
- 渲染对齐官方文档预览：官方字体 token、16px padding、CSS counter 行号、默认自动换行与开关、38px 页头与代码块横幅。
- 修复 UA `pre` / `code` 字体规则导致的字体不一致、行号偏移与光标错位。
- 代码清理：删除死状态/ref/辅助函数与响应字段、合并重复读写/复制/空状态逻辑、Host 去全局监听、精简测试桩与 README。
- 测试：Host 12 例 + 客户端冒烟 16 例。

### 历史版本
- v2.0.1：两阶段注册、按会话取根与策略、keepMounted、120ms 高亮合并、轮询可见性、地址编码对齐官方。
- v2.0.0：定位重塑为"官方预览的编辑补充件"，Host 收窄为三个方法，增加非 UTF-8 保护。
- v1.13.0：适配 DSH 0.2.0-rc 线，新增 locale 展示元数据。
