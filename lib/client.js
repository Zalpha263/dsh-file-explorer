window.__ModuleLoader__.load({
	id: "dsh-file-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		/* ============================================================
		   dsh-file-explorer v2.1.0 —— 官方预览的「编辑」补充件
		   ------------------------------------------------------------
		   官方把"看"做到了闭环：dsh-client-ui-sidebar-files 负责浏览，
		   dsh-client-ui-sidebar-documentpreview 负责渲染，而且它的预览是
		   **只读**的（@deepseek-ai/dsh-api-workspace-files 的 README 原文：
		   "The service exposes no mutation operation."）。

		   本插件只补这一件事：**让文本文件能改**。
		     · 官方预览头部注入一个「编辑」按钮（官方预留的
		       sidebar.right.tab.document.actions 槽位，参数是文件的绝对路径）；
		     · 点它用 ctx.sidebarRight.openResource(address, { kind: 'file-editor' })
		       打开我们自己的标签页 —— 与官方预览是同一个磁盘文件、不同的资源
		       地址（kind 不同），所以两个标签并存，不抢默认打开（本类型不声明
		       patterns）；
		     · 编辑页正文按官方 documentpreview 的代码块几何渲染：
		       CodeBody(TextPreview) → primitives.CodeBlock 的字体 token
		       （--dsw-font-markdown-code-block）、行内 CSS counter 行号、
		       pre-wrap + overflow-wrap:anywhere 的自动换行、16px pre padding、
		       行号宽 max(2,位数)ch 与 12px 间距。编辑能力是叠加在官方渲染层上的
		       一层 transparent textarea：两层必须共享同一字体、同一坐标系，
		       否则光标会与字形错位（v2.0.1 的实测问题）。
		   ============================================================ */

		/* 官方共享件：语法高亮与语言推断都从这里来（同一套 shiki 内核与主题）。
		   取不到时降级为纯文本编辑而不是整体报错——编辑能力本身不依赖高亮。 */
		let PRIMITIVES = null;
		try {
			PRIMITIVES = require("@deepseek-ai/dsh-client-ui-primitives");
		} catch (err) {
			PRIMITIVES = null;
		}
		const useCodeHighlighter = PRIMITIVES && typeof PRIMITIVES.useCodeHighlighter === "function" ? PRIMITIVES.useCodeHighlighter : null;
		const languageForPath = PRIMITIVES && typeof PRIMITIVES.languageForPath === "function" ? PRIMITIVES.languageForPath : null;
		/* 官方基础件（老宿主可能没有）：路径标签与工具图标。取不到就降级文字。
		   memo()/forwardRef() 组件是对象而不是函数，所以按 React 组件形状探测。 */
		function pickComponent(name) {
			if (PRIMITIVES === null) return null;
			const value = PRIMITIVES[name];
			if (typeof value === "function") return value;
			if (value !== null && typeof value === "object" && (value.$$typeof !== undefined || typeof value.render === "function")) return value;
			return null;
		}
		const PathLabel = pickComponent("PathLabel");
		const IconWrapFillRegular = pickComponent("IconWrapFillRegular");
		const IconNowrapFillRegular = pickComponent("IconNowrapFillRegular");
		const IconCopyOutlineRegular = pickComponent("IconCopyOutlineRegular");
		const IconCheckOutlineRegular = pickComponent("IconCheckOutlineRegular");
		const IconRefreshOutlineRegular = pickComponent("IconRefreshOutlineRegular");

		const EDIT_KIND = "file-editor";
		/** 读取请求上限（2 MiB）：必须与 Host 的 MAX_TEXT_BYTES 保持一致。 */
		const MAX_TEXT_BYTES = 2 * 1024 * 1024;
		/** 磁盘变更轮询间隔；标签不可见时暂停（见 EditorBody 的轮询 effect）。 */
		const POLL_MS = 2500;
		/** 高亮的输入合并窗口：连续敲键时最多每 ~120ms 重新分词一次。 */
		const HIGHLIGHT_DELAY_MS = 120;
		/** 标签类型注册的有界重试：槽位已声明但 sidebarRightTabs 服务还没到时使用。 */
		const TAB_RETRY_MS = [25, 50, 100, 200, 400];
		/** 非编辑状态的一行提示；正文只负责可编辑状态，其余统一走这张表。 */
		const STATE_NOTICE = {
			loading: "正在读取…",
			binary: "这是二进制文件（图片/压缩包/可执行文件/Office 文档等），本插件只编辑文本。官方预览能渲染它。",
			toolarge: "文件超过 2MB，本插件不提供编辑（截断后保存会把内容截掉）。官方预览可以分页查看。",
			notUtf8: "这个文件不是 UTF-8 文本（可能是 GBK / UTF-16 等旧编码）。在这里编辑会在保存时把编码写坏，所以本插件拒绝编辑。",
			nopath: "这个标签没有指向任何文件。请从官方预览头部的「编辑」按钮进入。"
		};

		/* ------------------------------------------------------------------
		   1. Remote contribution（strict codec 必须带 create() 工厂）
		      sessionId 是三个方法的可选尾参：客户端从 tab.contentId 解析会话后
		      传入，Host 据此选工作区根与沙箱策略；旧调用不传时 Host 保持原行为。
		   ------------------------------------------------------------------ */
		function passthroughSchema() {
			return { parse: (value) => value };
		}
		function strictCodec(typeSymbol) {
			return { mode: "strict", typeSymbol, create: () => passthroughSchema() };
		}
		const PKG = "dsh-file-explorer";
		const NS = "fileExplorer";
		const seg = (m) => PKG + "#" + NS + "/" + m;
		function descriptor(method, params) {
			return {
				id: seg(method),
				service: NS,
				namespace: NS,
				method: method,
				invocation: { kind: "direct" },
				parameters: (params || []).map((p) => {
					const name = typeof p === "string" ? p : p.name;
					/* 可选尾参必须在 descriptor 上声明 acceptsUndefined：网关的
					   assertExactArguments 只放行"缺字段且声明可缺省"的 JSON 参数，
					   否则旧客户端少传 sessionId 会得到 gateway/arguments-invalid。 */
					const parameter = { name: name, wire: name, source: "json", codec: strictCodec(seg(method) + ":" + name) };
					if (typeof p === "object" && p.optional === true) parameter.acceptsUndefined = true;
					return parameter;
				}),
				result: strictCodec(seg(method) + ":result")
			};
		}
		const CONTRIBUTION = {
			package: PKG,
			descriptors: [
				descriptor("fsStat", ["path", { name: "sessionId", optional: true }]),
				descriptor("fsRead", ["path", "maxBytes", { name: "sessionId", optional: true }]),
				descriptor("fsWrite", ["path", "content", "expectedVersion", { name: "sessionId", optional: true }])
			]
		};

		/* ------------------------------------------------------------------
		   2. apply
		   ------------------------------------------------------------------ */
		let applyCtx = null;

		function unwrap(result) {
			if (result && result.ok === true) return result.value;
			const error = result && result.error;
			const detail = error && error.message ? error.message : "fileExplorer remote call failed";
			throw new Error(error && error.code ? detail + " (" + error.code + ")" : detail);
		}
		function call(method) {
			const args = Array.prototype.slice.call(arguments, 1);
			return Promise.resolve().then(() => {
				const ns = applyCtx === null ? undefined : applyCtx.get("remote." + NS);
				if (ns === undefined) throw new Error(NS + " namespace unavailable");
				return ns[method].apply(ns, args);
			}).then(unwrap);
		}
		/**
		 * 与 CONTRIBUTION.descriptors 一一对应：少一个方法，调用点就是 not a function。
		 * sessionId 为 undefined 时少传尾参：这是给“浏览器缓存的旧客户端 + 新 Host”
		 * 短暂错配留的兼容 shim，不是死代码，不要删。
		 */
		const remote = {
			fsStat: (path, sessionId) => sessionId === undefined ? call("fsStat", path) : call("fsStat", path, sessionId),
			fsRead: (path, maxBytes, sessionId) => sessionId === undefined ? call("fsRead", path, maxBytes) : call("fsRead", path, maxBytes, sessionId),
			fsWrite: (path, content, expectedVersion, sessionId) => sessionId === undefined
				? call("fsWrite", path, content, expectedVersion)
				: call("fsWrite", path, content, expectedVersion, sessionId)
		};

		/* ------------------------------------------------------------------
		   3. 资源地址编解码（内联自 @deepseek-ai/dsh-util-workspace-path）
		      dsh-resource://file/session/<encodeSegment(sid)>/<encodePath(path)>
		      规则与官方逐条对齐：
		        · encodeSegment 保留冒号字面量（Windows 盘符写 D: 而不是 D%3A）；
		        · 路径先反斜杠转 /、去掉开头的 ./，再逐段 encodeURIComponent；
		        · . 与 .. 原样保留（官方 parser 也不解析，由宿主按文件系统语义处理）。
		   ------------------------------------------------------------------ */
		const ADDRESS_PREFIX = "dsh-resource://file/";
		function encodeSegment(segment) {
			return encodeURIComponent(String(segment)).replace(/%3A/gi, ":");
		}
		function encodePath(path) {
			return String(path).split("/").map(encodeSegment).join("/");
		}
		function sessionFileAddress(sessionId, filePath) {
			const normalized = String(filePath).replace(/\\/g, "/").replace(/^(?:\.\/)+/, "");
			return ADDRESS_PREFIX + "session/" + encodeSegment(sessionId) + "/" + encodePath(normalized);
		}
		/** 官方 parseFileAddress 的会话作用域部分（本插件只生成/消费这种地址）。 */
		function parseFileAddress(address) {
			try {
				const text = String(address || "");
				if (!text.startsWith(ADDRESS_PREFIX)) return null;
				const end = text.search(/[?#]/);
				const parts = text.slice(ADDRESS_PREFIX.length, end === -1 ? undefined : end).split("/");
				if (parts[0] !== "session") return null;
				const id = parts[1];
				const segments = parts.slice(2);
				if (id === undefined || id === "" || segments.length === 0) return null;
				return { sessionId: decodeURIComponent(id), path: segments.map((segment) => decodeURIComponent(segment)).join("/") };
			} catch (err) {
				return null;
			}
		}
		function baseName(p) {
			const parts = String(p).split(/[\\/]/).filter(Boolean);
			return parts.length === 0 ? String(p) : parts[parts.length - 1];
		}
		function formatSize(bytes) {
			if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return "";
			if (bytes < 1024) return bytes + " B";
			const units = ["KB", "MB", "GB", "TB"];
			let v = bytes / 1024;
			let i = 0;
			while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
			return (v >= 100 ? Math.round(v) : v.toFixed(1)) + " " + units[i];
		}

		/* ------------------------------------------------------------------
		   3.5 行号/换行渲染模型（纯函数，便于测试与注释几何）
		   ------------------------------------------------------------------ */

		/**
		 * 把编辑缓冲拆成可渲染的行。
		 *
		 * 官方只读预览会去掉末尾换行再渲染；编辑器不能这么做：textarea 里
		 * 末尾换行会真实占一行，若渲染层少一行，EOF 处光标就会让 textarea
		 * 内部滚动，与高亮层错位。所以这里保留末尾空行，但把它标成
		 * eofBlank（渲染时隐藏行号、不参与行号宽度计算），有效行行号与
		 * 官方一致。
		 */
		function editorLines(text) {
			const value = String(text);
			const lines = value.split("\n");
			const eofBlank = value.endsWith("\n");
			const numberedCount = eofBlank ? Math.max(1, lines.length - 1) : lines.length;
			return { lines: lines, eofBlank: eofBlank, numberedCount: numberedCount };
		}

		/** 官方 CodeBlock 的行号宽度：Math.max(2, 行数位数)ch。 */
		function lineNumberWidth(lineCount) {
			const digits = String(Math.max(1, lineCount)).length;
			return Math.max(2, digits) + "ch";
		}

		/* ------------------------------------------------------------------
		   4. 样式（官方文档预览的代码块几何 + 主题 token）
		   ------------------------------------------------------------------ */

		/**
		 * 几何只有一套坐标系（全部相对 .dfe-content 滚动视口内的 .dfe-layer）：
		 *
		 *   · .dfe-hl（高亮层）与 .dfe-input（透明 textarea）共享完全相同的
		 *     font token、padding、white-space 与换行规则：
		 *       pre 左/右/上 padding = 16px（官方 CodeBody 覆盖值）；
		 *       行号占位 = max(2, 位数)ch + 12px（官方 numbered line 规则）；
		 *       文本左边界 = 16px + 行号宽 + 12px，右边界 = 16px；
		 *     textarea 用 left/right/top/bottom 精确铺在文本区上，因此光标与
		 *     字形始终在同一坐标里（旧的独立 gutter 列 + 两套字体正是错位根因）。
		 *
		 *   · 行号不占独立 DOM：官方用 <pre><code> 内每个逻辑行 span.line 的
		 *     CSS counter + ::before 生成行号，续行自然没有行号且与首行缩进一致。
		 *
		 *   · wrap 开（默认，官方 TextPreview.fresh() 也是 true）：
		 *     pre white-space:pre-wrap + overflow-wrap:anywhere，textarea 同规则，
		 *     宽度由父容器决定；wrap 关：layer/pre 变成 max-content，textarea 用
		 *     left/right/bottom 跟随，横向滚动交给 .dfe-content。
		 *
		 *   · 字体必须显式写在 .dfe-hl 上：浏览器 UA 的 pre{font-family:monospace}
		 *     声明会压过继承，不再让高亮层与 textarea 用两种度量。
		 */
		function ensureCss() {
			const id = PKG + ":editor.css";
			if (document.querySelector('style[data-plugin-css="' + id + '"]') !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = PKG;
			tag.dataset.pluginCss = id;
			tag.textContent = [
				/* 根容器 */
				".dfe-root{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dsw-alias-label-primary)}",
				/* 官方预览头部动作槽里的「编辑」按钮（保持 v2.0.x 的观感） */
				".dfe-btn{font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:4px 10px;cursor:pointer;flex:none}",
				".dfe-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
				/* 页头：官方 TextPreview.header 的 38px 工具栏 */
				".dfe-bar{box-sizing:border-box;display:flex;align-items:center;gap:4px;flex:none;height:38px;padding:0 6px 0 16px;border-bottom:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);font-size:12px}",
				".dfe-path{margin-right:12px;min-width:0;max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:12px}",
				".dfe-dim{flex:none;color:var(--dsw-alias-label-secondary);font-size:12px;white-space:nowrap}",
				".dfe-status{min-width:0;flex:0 1 auto;padding:0 6px;color:var(--dsw-alias-label-secondary);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dfe-spacer{flex:1 1 auto;min-width:0}",
				/* 工具按钮（官方 TextPreview.tool：28×28，svg 15px） */
				".dfe-tool{width:28px;height:28px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:6px;line-height:1;color:var(--dsw-alias-label-secondary);background:transparent;border:none;border-radius:var(--dsw-radius-sm);cursor:pointer;font:inherit}",
				".dfe-tool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
				".dfe-tool[aria-pressed=true]{color:var(--dsw-alias-label-primary)}",
				".dfe-tool svg{width:15px;height:15px}",
				".dfe-tool-textbtn{width:auto;min-width:28px;padding:0 8px}",
				".dfe-tool-text{font-size:12px;white-space:nowrap}",
				/* 保存按钮（保留编辑器功能，但沿用官方圆角与字号） */
				".dfe-save{flex:none;height:28px;padding:0 14px;margin-left:4px;border:1px solid var(--dsw-alias-brand-primary,#5a8cff);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-brand-primary,#5a8cff);color:#fff;font:inherit;font-size:12px;cursor:pointer}",
				".dfe-save:hover:not(:disabled){filter:brightness(1.06)}",
				".dfe-save:disabled{opacity:.45;cursor:default}",
				/* 外部变更提示条（官方 TextPreview.changed） */
				".dfe-changed{flex:none;display:flex;align-items:center;gap:10px;padding:6px 10px;background:var(--dsw-alias-bg-layer-2);border-bottom:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}",
				".dfe-changed>span{flex:1 1 auto;min-width:0}",
				".dfe-action{flex:none;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);padding:4px 10px;cursor:pointer}",
				".dfe-action:hover{background:var(--dsw-alias-bg-layer-3)}",
				/* 代码块横幅（官方 CodeBlock banner：语言标签 + 复制） */
				".dfe-banner{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px 8px 22px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:11px/18px var(--dsw-font-family, sans-serif)}",
				".dfe-banner-heading{display:flex;align-items:baseline;gap:12px;min-width:0}",
				".dfe-lang{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code)}",
				/* 滚动容器与坐标层 */
				".dfe-content{position:relative;flex:1 1 auto;min-height:0;overflow:auto;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}",
				".dfe-layer{position:relative;min-height:100%}",
				".dfe-wrap .dfe-layer{min-width:100%}",
				".dfe-nowrap .dfe-layer{width:max-content}",
				/* 高亮层：官方 CodeBlock pre 的字体与内边距；font 必须显式声明 */
				".dfe-hl{box-sizing:border-box;margin:0;padding:16px;background:transparent;color:var(--dsw-alias-label-primary);font:var(--dsw-font-markdown-code-block, 11px/19px var(--ds-font-family-code, ui-monospace, monospace));tab-size:8}",
				".dfe-wrap .dfe-hl{white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal}",
				".dfe-nowrap .dfe-hl{width:max-content;white-space:pre;overflow-wrap:normal;word-break:normal}",
				/* 行号：官方 CodeBlock numbered 模式（行内 counter + ::before） */
				".dfe-code-inner{display:block;font:inherit;background:none;padding:0;counter-reset:source-line;white-space:normal}",
				".dfe-line{position:relative;display:block;min-height:1lh;min-height:calc(19px + var(--dsh-code-font-delta,0px));padding-inline-start:calc(var(--dfe-line-number-width) + 12px);counter-increment:source-line}",
				".dfe-wrap .dfe-line{white-space:pre-wrap}",
				".dfe-nowrap .dfe-line{white-space:pre}",
				".dfe-line::before{position:absolute;inset-inline-start:0;width:var(--dfe-line-number-width);color:var(--dsw-alias-label-tertiary);text-align:end;content:counter(source-line);user-select:none}",
				".dfe-line-eof::before{content:none}",
				/* 透明输入层：与官方 .line 的文本区严格同宽、同起点、同一字体 */
				".dfe-input{position:absolute;top:16px;bottom:16px;left:calc(16px + var(--dfe-line-number-width) + 12px);right:16px;margin:0;padding:0;border:0;outline:0;resize:none;overflow:hidden;background:transparent;color:transparent;caret-color:var(--dsw-alias-label-primary);font:var(--dsw-font-markdown-code-block, 11px/19px var(--ds-font-family-code, ui-monospace, monospace));tab-size:8;white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal}",
				".dfe-nowrap .dfe-input{white-space:pre;overflow-wrap:normal}",
				".dfe-input::selection{background:var(--dsw-alias-bg-document-selection, color-mix(in srgb, var(--dsw-alias-brand-primary,#5a8cff) 40%, transparent));color:transparent}",
				/* 空/错误状态：与官方文档预览的状态行排版一致 */
				".dfe-empty{flex:none;padding:12px 14px;color:var(--dsw-alias-label-secondary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:1.6;white-space:normal}"
			].join("");
			document.head.appendChild(tag);
		}

		/* ------------------------------------------------------------------
		   5. 官方预览头部的「编辑」按钮
		      槽位 sidebar.right.tab.document.actions：owner prop 是 absolutePath，
		      标准 props 里还带 sessionId（session 作用域槽位）。
		   ------------------------------------------------------------------ */
		function EditAction(props) {
			const standard = props || {};
			const absolutePath = typeof standard.absolutePath === "string" ? standard.absolutePath : null;
			const sessionId = typeof standard.sessionId === "string" ? standard.sessionId : "";
			if (absolutePath === null) return null;
			const onOpen = () => {
				const sidebar = applyCtx && applyCtx.get("sidebarRight");
				if (!sidebar || typeof sidebar.openResource !== "function") return;
				/* 客户端拿不到会话 cwd（没有 agents 服务），因此地址保留绝对路径
				   形式（与官方文件树的相对地址不同）；Host 用地址里的 sessionId
				   解析相对路径与工作区，两边最终读写同一个磁盘文件。 */
				const address = sessionFileAddress(sessionId, absolutePath);
				sidebar.openResource(address, {
					kind: EDIT_KIND,
					params: { absolutePath: absolutePath }
				});
			};
			return React.createElement("button", {
				type: "button",
				className: "dfe-btn",
				title: "在本插件的编辑页里打开这个文件（官方预览是只读的）",
				onClick: onOpen
			}, "编辑");
		}

		/* ------------------------------------------------------------------
		   5.5 页头/代码块横幅共用的小工具
		   ------------------------------------------------------------------ */
		/** 官方图标可用就用图标，否则降级为文字（老宿主与测试桩都能跑）。 */
		function toolButton(key, spec) {
			const props = {
				key: key,
				type: "button",
				className: "dfe-tool" + (spec.icon === null || spec.icon === undefined ? " dfe-tool-textbtn" : ""),
				title: spec.title,
				"aria-label": spec.title
			};
			if (spec.data !== undefined) props["data-dfe-tool"] = spec.data;
			if (spec.pressed !== undefined) props["aria-pressed"] = spec.pressed ? "true" : "false";
			if (typeof spec.onClick === "function") props.onClick = spec.onClick;
			if (typeof spec.disabled === "boolean") props.disabled = spec.disabled;
			const children = spec.icon !== null && spec.icon !== undefined
				? [React.createElement(spec.icon, { key: "i", size: 15 })]
				: [React.createElement("span", { key: "t", className: "dfe-tool-text" }, spec.text || "")];
			return React.createElement("button", props, children);
		}

		/* ------------------------------------------------------------------
		   6. 编辑页正文
		   ------------------------------------------------------------------ */
		function EditorBody(props) {
			const standard = props || {};
			const info = typeof standard.useTabInfo === "function" ? standard.useTabInfo() : null;
			const tab = info && info.tab ? info.tab : null;
			/* 打开时通过 navigation.params 带过来的绝对路径（首选）；
			   退化路径是从资源地址解出的路径，交给宿主按会话 cwd 解析。 */
			const navParams = tab && tab.navigation && tab.navigation.params ? tab.navigation.params : null;
			const absolutePath = navParams && typeof navParams.absolutePath === "string" ? navParams.absolutePath : null;
			const parsed = tab && typeof tab.contentId === "string" ? parseFileAddress(tab.contentId) : null;
			const targetPath = absolutePath !== null ? absolutePath : (parsed !== null ? parsed.path : null);
			/* 会话身份只从标签自己的 contentId 来（session 作用域标签）；
			   退化到标准 props 的 sessionId，绝不猜"最近会话"。 */
			const sessionId = parsed !== null ? parsed.sessionId : (typeof standard.sessionId === "string" ? standard.sessionId : undefined);

			const language = React.useMemo(() => {
				if (languageForPath === null || targetPath === null) return undefined;
				try { return languageForPath(targetPath) || undefined; } catch (err) { return undefined; }
			}, [targetPath]);
			/* 官方同一套高亮内核；未知语言或语法尚未加载完时它返回 undefined，
			   调用方按纯文本渲染即可（这正是官方的降级语义）。 */
			const highlightNullable = useCodeHighlighter === null ? null : useCodeHighlighter(language);
			const highlight = React.useCallback((code) => {
				if (highlightNullable === null) return undefined;
				try { return highlightNullable(code) || undefined; } catch (err) { return undefined; }
			}, [highlightNullable]);

			const [state, setState] = React.useState({ phase: "loading" });
			const [text, setText] = React.useState("");
			/* 高亮/行号用的文本比输入滞后 ~120ms：连续敲键只分词最后一次。 */
			const [highlightText, setHighlightText] = React.useState("");
			const [dirty, setDirty] = React.useState(false);
			const [status, setStatus] = React.useState("");
			const [externalChange, setExternalChange] = React.useState(false);
			/* 自动换行默认开启（与官方 TextPreview 的 wrap: true 一致）。 */
			const [wrap, setWrap] = React.useState(true);
			const [copied, setCopied] = React.useState(false);
			const textRef = React.useRef("");
			const versionRef = React.useRef(null);
			const dirtyRef = React.useRef(false);
			const copiedTimerRef = React.useRef(null);
			/* 轮询 effect 只建一次 interval，不能依赖 phase/visible（否则每次状态
			   变化都会重建定时器）；这两个 ref 让 interval 读到最新值。 */
			const tabRef = React.useRef(null);
			tabRef.current = tab;
			const phaseRef = React.useRef("loading");
			React.useEffect(() => { phaseRef.current = state.phase; }, [state.phase]);
			React.useEffect(() => () => {
				if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
			}, []);

			const applyLoaded = React.useCallback((res) => {
				if (res.binary === true) { setState({ phase: "binary", size: res.size }); return; }
				if (res.truncated === true) { setState({ phase: "toolarge", size: res.size }); return; }
				if (res.decodeValid === false) { setState({ phase: "notUtf8", size: res.size }); return; }
				textRef.current = res.text;
				versionRef.current = res.version;
				dirtyRef.current = false;
				setText(res.text);
				setHighlightText(res.text);
				setDirty(false);
				setExternalChange(false);
				setStatus("");
				setState({ phase: "ready", size: res.size });
			}, []);

			const readAndApply = React.useCallback(() => {
				if (targetPath === null) return Promise.reject(new Error("path is required"));
				return remote.fsRead(targetPath, MAX_TEXT_BYTES, sessionId).then(applyLoaded);
			}, [targetPath, sessionId, applyLoaded]);

			const load = React.useCallback(() => {
				if (targetPath === null) { setState({ phase: "nopath" }); return; }
				setState({ phase: "loading" });
				readAndApply().catch((err) => {
					setState({ phase: "error", message: String((err && err.message) || err) });
				});
			}, [targetPath, readAndApply]);

			React.useEffect(() => { load(); }, [load]);

			/** 把编辑页切到冲突态；保存 stale 与轮询发现外部修改共用。 */
			const markConflict = React.useCallback(() => {
				setExternalChange(true);
				setState((prev) => (prev.phase === "ready" ? { phase: "conflict", size: prev.size } : prev));
			}, []);

			/* 磁盘变更轮询：干净时自动跟随，脏时只提示冲突（绝不悄悄重载丢掉输入）。
			   每个标签只有一个 interval；标签不可见（tab.visible === false）时本轮
			   直接跳过，不产生 fsStat 流量；in-flight 锁避免慢请求堆积。 */
			React.useEffect(() => {
				if (targetPath === null) return undefined;
				let inFlight = false;
				const timer = window.setInterval(() => {
					const currentTab = tabRef.current;
					if (currentTab !== null && currentTab.visible === false) return;
					const phase = phaseRef.current;
					if (phase !== "ready" && phase !== "conflict") return;
					if (inFlight) return;
					inFlight = true;
					remote.fsStat(targetPath, sessionId).then((res) => {
						if (res.version === versionRef.current) return undefined;
						if (dirtyRef.current) {
							markConflict();
							return undefined;
						}
						return readAndApply().then(() => setStatus("文件已在磁盘上更新，已自动重新载入"));
					}).catch(() => {
						/* 文件被删/暂时读不到：保持现状，下次再试 */
					}).finally(() => { inFlight = false; });
				}, POLL_MS);
				return () => { window.clearInterval(timer); };
			}, [targetPath, sessionId, readAndApply, markConflict]);

			/* 高亮合并：text 每次变化都重置 120ms 窗口，只有停顿后才全量分词。
			   大文件（上限 2MB）下避免每个按键都跑一遍 shiki。 */
			React.useEffect(() => {
				if (state.phase !== "ready" && state.phase !== "conflict") return undefined;
				const timer = window.setTimeout(() => { setHighlightText(textRef.current); }, HIGHLIGHT_DELAY_MS);
				return () => { window.clearTimeout(timer); };
			}, [text, state.phase]);

			const save = React.useCallback(() => {
				if (targetPath === null || state.phase !== "ready") return;
				const snapshot = textRef.current;
				setStatus("保存中…");
				remote.fsWrite(targetPath, snapshot, versionRef.current, sessionId).then((res) => {
					versionRef.current = res.version;
					dirtyRef.current = false;
					setDirty(false);
					setExternalChange(false);
					setStatus("已保存 · " + new Date().toLocaleTimeString("zh-CN", { hour12: false }));
				}).catch((err) => {
					const message = String((err && err.message) || err);
					if (message.indexOf("stale:") === 0) {
						markConflict();
						setStatus("文件已被外部修改，未写入");
						return;
					}
					setStatus("保存失败：" + message);
				});
			}, [targetPath, sessionId, state.phase, markConflict]);

			/** 复制当前编辑缓冲（未保存内容也算）；doneMessage 用于“复制我的内容”出口。 */
			const copyBuffer = React.useCallback((doneMessage) => {
				const clip = navigator && navigator.clipboard;
				if (!clip || typeof clip.writeText !== "function") { setStatus("浏览器不支持剪贴板 API"); return; }
				clip.writeText(textRef.current).then(() => {
					if (doneMessage) setStatus(doneMessage);
					setCopied(true);
					if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
					copiedTimerRef.current = window.setTimeout(() => {
						copiedTimerRef.current = null;
						setCopied(false);
					}, 1000);
				}).catch((err) => setStatus("复制失败：" + String((err && err.message) || err)));
			}, []);

			const toggleWrap = React.useCallback(() => { setWrap((prev) => !prev); }, []);

			const onChange = (ev) => {
				const value = ev.target.value;
				textRef.current = value;
				dirtyRef.current = true;
				setText(value);
				setDirty(true);
			};
			const onKeyDown = (ev) => {
				if ((ev.ctrlKey || ev.metaKey) && (ev.key === "s" || ev.key === "S")) {
					ev.preventDefault();
					save();
					return;
				}
				if (ev.key === "Tab") {
					ev.preventDefault();
					const el = ev.target;
					const start = el.selectionStart;
					const end = el.selectionEnd;
					const next = textRef.current.slice(0, start) + "  " + textRef.current.slice(end);
					textRef.current = next;
					dirtyRef.current = true;
					setText(next);
					setDirty(true);
					window.requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
				}
			};

			/* 渲染模型：行号由 CSS counter 生成，textarea 与高亮层共用同一套
			   字体/行高/换行几何（见 ensureCss 顶部的几何注释）。用 useMemo 把
			   行节点缓存起来，避免每次按键都重排整棵树。 */
			const view = React.useMemo(() => {
				const model = editorLines(highlightText);
				const runs = highlight(highlightText);
				const lastIndex = model.lines.length - 1;
				const nodes = model.lines.map((lineText, index) => {
					const lineRuns = runs !== undefined && runs[index] !== undefined ? runs[index] : null;
					let lineContent = null;
					if (lineRuns === null) {
						lineContent = lineText === "" ? null : lineText;
					} else {
						lineContent = lineRuns.map((span, spanIndex) => React.createElement("span", { key: spanIndex, style: span.style }, span.text));
					}
					const isEof = model.eofBlank && index === lastIndex;
					return React.createElement("span", {
						key: index,
						className: isEof ? "dfe-line dfe-line-eof" : "dfe-line"
					}, lineContent);
				});
				return { nodes: nodes, width: lineNumberWidth(model.numberedCount) };
			}, [highlightText, highlight]);

			/* ---- 渲染 ---- */
			const children = [];
			const headerBits = [];
			/* 路径标签：官方 PathLabel 优先；没有路径或老宿主缺组件时降级为文件名。 */
			const pathText = targetPath || "";
			const pathNode = PathLabel !== null && pathText !== ""
				? React.createElement(PathLabel, { key: "p", path: pathText, className: "dfe-path", title: pathText })
				: React.createElement("span", { key: "p", className: "dfe-path", title: pathText }, baseName(pathText || "（未知文件）"));
			headerBits.push(pathNode);
			if (state.size !== null && state.size !== undefined) {
				headerBits.push(React.createElement("span", { key: "s", className: "dfe-dim" }, formatSize(state.size)));
			}
			if (dirty) headerBits.push(React.createElement("span", { key: "d", className: "dfe-dim", title: "当前修改尚未保存" }, "● 未保存"));
			if (status !== "") headerBits.push(React.createElement("span", { key: "t", className: "dfe-status", title: status }, status));
			headerBits.push(React.createElement("span", { key: "sp", className: "dfe-spacer" }));

			const editable = state.phase === "ready" || state.phase === "conflict";
			if (editable) {
				headerBits.push(toolButton("wrap", {
					title: wrap ? "取消自动换行" : "开启自动换行",
					data: "wrap",
					pressed: wrap,
					onClick: toggleWrap,
					icon: wrap ? IconNowrapFillRegular : IconWrapFillRegular,
					text: wrap ? "不换行" : "换行"
				}));
				headerBits.push(toolButton("reload", {
					title: "从磁盘重新读取（丢弃我的修改）",
					data: "reload",
					onClick: load,
					icon: IconRefreshOutlineRegular,
					text: "重载"
				}));
				headerBits.push(React.createElement("button", {
					key: "save",
					type: "button",
					className: "dfe-save",
					onClick: save,
					disabled: state.phase !== "ready" || (!dirty && !externalChange)
				}, "保存"));
			}
			children.push(React.createElement("div", { key: "bar", className: "dfe-bar" }, headerBits));

			if (state.phase === "conflict" || externalChange) {
				children.push(React.createElement("div", { key: "warn", className: "dfe-changed" }, [
					React.createElement("span", { key: "m" }, "⚠ 这个文件在磁盘上已被外部修改（可能是 agent 写的）。直接保存会被拒绝，请选择："),
					React.createElement("button", { key: "r", type: "button", className: "dfe-action", onClick: load }, "重载（丢弃我的修改）"),
					React.createElement("button", { key: "c", type: "button", className: "dfe-action", onClick: () => copyBuffer("已把我的内容复制到剪贴板（" + textRef.current.length + " 字符）") }, "复制我的内容")
				]));
			}

			if (editable) {
				/* 官方 CodeBlock 的横幅：语言标签（左）+ 复制（右）。 */
				children.push(React.createElement("div", { key: "banner", className: "dfe-banner" }, [
					React.createElement("div", { key: "h", className: "dfe-banner-heading" },
						React.createElement("span", { key: "l", className: "dfe-lang" }, language || "代码")),
					toolButton("copy", {
						title: copied ? "已复制当前编辑内容" : "复制当前编辑内容",
						data: "copy",
						onClick: () => copyBuffer(),
						icon: copied ? IconCheckOutlineRegular : IconCopyOutlineRegular,
						text: copied ? "已复制" : "复制"
					})
				]));
				/* 官方 CodeBody：横幅下面才是滚动容器；行号、高亮、textarea 都在
				   同一个 .dfe-layer 坐标系里，随 .dfe-content 一起滚动。 */
				children.push(React.createElement("div", {
					key: "content",
					className: "dfe-content " + (wrap ? "dfe-wrap" : "dfe-nowrap")
				},
					React.createElement("div", {
						className: "dfe-layer",
						style: { "--dfe-line-number-width": view.width }
					},
						React.createElement("pre", { key: "hl", className: "dfe-hl", "aria-hidden": "true" },
							React.createElement("code", { className: "dfe-code-inner" }, view.nodes)),
						React.createElement("textarea", {
							key: "input",
							className: "dfe-input",
							value: text,
							spellCheck: false,
							wrap: wrap ? "soft" : "off",
							onChange: onChange,
							onKeyDown: onKeyDown,
							"aria-label": "文件内容编辑区"
						})
					)));
			} else if (!editable) {
				const notice = state.phase === "error" ? "读取失败：" + state.message : (STATE_NOTICE[state.phase] || "");
				children.push(React.createElement("div", { key: "m", className: "dfe-empty" }, notice));
			}
			return React.createElement("div", { className: "dfe-root" }, children);
		}

		/* ------------------------------------------------------------------
		   7. 注册
		   ------------------------------------------------------------------ */
		/** 标签类型的静态声明；title(address) 由官方在打开时捕获（不再有 title 槽位覆盖它）。 */
		const TAB_TYPE = {
			id: EDIT_KIND,
			kind: EDIT_KIND,
			/* 不声明 patterns：绝不抢默认打开——官方目录树仍由官方预览接管。 */
			canOpen: (address) => String(address).startsWith(ADDRESS_PREFIX),
			title: (address) => {
				const parsedAddress = parseFileAddress(address);
				const name = parsedAddress !== null && parsedAddress.path !== "" ? baseName(parsedAddress.path) : "编辑";
				return "编辑 · " + name;
			},
			/* 切标签/折叠侧栏/切会话都保留正文：未保存文本不再随卸载静默消失。 */
			keepMounted: true
		};

		/**
		 * 注册标签类型。正常路径下 sidebar.right.pane.tab 槽位出现时侧栏
		 * （dsh-client-ui-sidebar-right）已激活、服务必定存在；但客户端各 entry
		 * 的 apply 顺序不保证，服务仍可能晚一拍，所以用有界重试兜底，而不是
		 * "拿不到就永久放弃"。返回同步 disposer，连同槽位生命周期一起回收。
		 */
		function registerTabType(ctx) {
			let disposeType = null;
			let timer = null;
			let index = 0;
			let stopped = false;
			const attempt = () => {
				timer = null;
				if (stopped || disposeType !== null) return;
				const tabs = ctx.get("sidebarRightTabs");
				if (tabs !== undefined && tabs !== null && typeof tabs.register === "function") {
					try {
						disposeType = tabs.register(TAB_TYPE);
					} catch (err) {
						console.error("[dsh-file-explorer] sidebarRightTabs.register failed:", err);
					}
					return;
				}
				if (index >= TAB_RETRY_MS.length) {
					console.error("[dsh-file-explorer] sidebarRightTabs 在等待窗口内未出现，编辑页类型未注册；请确认 @deepseek-ai/dsh-client-ui-sidebar-right 已加载");
					return;
				}
				timer = window.setTimeout(attempt, TAB_RETRY_MS[index]);
				index += 1;
			};
			attempt();
			return () => {
				stopped = true;
				if (timer !== null) { window.clearTimeout(timer); timer = null; }
				if (typeof disposeType === "function") {
					try { disposeType(); } catch (err) { /* 卸载期吞掉：不能阻断其它 disposer */ }
					disposeType = null;
				}
			};
		}

		async function apply(ctx) {
			applyCtx = ctx;
			ensureCss();

			/* 远程命名空间：失败不致命——编辑页会显示读取失败，预览按钮仍可用。 */
			try {
				const disposeMount = await ctx.remote.$mount(CONTRIBUTION);
				ctx.effect(() => () => { try { disposeMount(); } catch (err) {} });
			} catch (err) {
				console.error("[dsh-file-explorer] remote namespace mount failed:", err);
			}

			/* ① 官方预览头部的「编辑」按钮（官方预留的扩展点）。 */
			ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document.actions", () => ctx.slots.register({
				name: "sidebar.right.tab.document.actions",
				id: PKG
			}, EditAction)));

			/* ② 官方两阶段注册（见 dsh-client-ui-sidebar-right README 的
			      "Extension seats"）：第一阶段是槽位声明出现，第二阶段在它
			      的回调里注册正文与标签类型；回调返回的 disposer 随槽位声明
			      消失/插件卸载一起回收。这样不再有 "apply 时一次性 ctx.get，
			      拿不到就永久放弃" 的时序假设。 */
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => {
				const disposers = [];
				disposers.push(ctx.slots.register({
					name: "sidebar.right.pane.tab",
					key: EDIT_KIND
				}, EditorBody));
				disposers.push(registerTabType(ctx));
				return disposers;
			}));
		}

		exports.apply = apply;
		exports.inject = ["slots", "remote"];
		/* 只供 test/client-smoke.test.mjs 直接断言纯函数；宿主不读取该字段。 */
		exports.__test = {
			encodeSegment,
			encodePath,
			sessionFileAddress,
			parseFileAddress,
			editorLines,
			lineNumberWidth
		};
		return module.exports;
	}
});
