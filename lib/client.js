window.__ModuleLoader__.load({
	id: "dsh-file-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		/* ============================================================
		   dsh-file-explorer v2.0.1 —— 官方预览的「编辑」补充件
		   ------------------------------------------------------------
		   官方把"看"做到了闭环：dsh-client-ui-sidebar-files 负责浏览，
		   dsh-client-ui-sidebar-documentpreview 负责渲染（Office/PDF/Excel/
		   图片/HTML/Markdown/代码），而且它的预览是**只读**的
		   （@deepseek-ai/dsh-api-workspace-files 的 README 原文：
		    "The service exposes no mutation operation."）。

		   本插件只补这一件事：**让文本文件能改**。
		     · 官方预览头部注入一个「编辑」按钮（官方预留的
		       `sidebar.right.tab.document.actions` 槽位，参数是文件的绝对路径）；
		     · 点它用 `ctx.sidebarRight.openResource(address, { kind: 'file-editor' })`
		       打开我们自己的标签页 —— 与官方预览是同一个磁盘文件、不同的资源
		       地址（kind 不同），所以两个标签并存，不抢默认打开（本类型不声明
		       patterns）；
		     · 编辑页的高亮用官方同一套内核（ui-primitives 的
		       `useCodeHighlighter`，shiki + CSS 变量主题 + 懒加载语法），
		       行号是我们自己的 gutter，颜色与官方代码视图完全一致。
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

		const EDIT_KIND = "file-editor";
		/** 读取与编辑共用的文本上限：与宿主 MAX_TEXT_BYTES 是同一件事，合并为一份。 */
		const MAX_TEXT_BYTES = 2 * 1024 * 1024;
		/** 磁盘变更轮询间隔；标签不可见时暂停（见 EditorBody 的轮询 effect）。 */
		const POLL_MS = 2500;
		/** 高亮的输入合并窗口：连续敲键时最多每 ~120ms 重新分词一次。 */
		const HIGHLIGHT_DELAY_MS = 120;
		/** 标签类型注册的有界重试：槽位已声明但 sidebarRightTabs 服务还没到时使用。 */
		const TAB_RETRY_MS = [25, 50, 100, 200, 400];

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
		 * sessionId 未解析到时只发原参数个数，保证旧宿主/旧调用路径完全不变。
		 */
		const remote = () => ({
			fsStat: (path, sessionId) => sessionId === undefined ? call("fsStat", path) : call("fsStat", path, sessionId),
			fsRead: (path, maxBytes, sessionId) => sessionId === undefined ? call("fsRead", path, maxBytes) : call("fsRead", path, maxBytes, sessionId),
			fsWrite: (path, content, expectedVersion, sessionId) => sessionId === undefined
				? call("fsWrite", path, content, expectedVersion)
				: call("fsWrite", path, content, expectedVersion, sessionId)
		});

		/* ------------------------------------------------------------------
		   3. 资源地址编解码（内联自 @deepseek-ai/dsh-util-workspace-path）
		      dsh-resource://file/session/<encodeSegment(sid)>/<encodePath(path)>
		      规则与官方逐条对齐：
		        · encodeSegment 保留 `:` 字面量（Windows 盘符写 `D:` 而不是 `D%3A`）；
		        · 路径先反斜杠转 `/`、去掉开头的 `./`，再逐段 encodeURIComponent；
		        · `.` 与 `..` 原样保留（官方 parser 也不解析，由宿主按文件系统语义处理）。
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
		function isAbsoluteWorkspacePath(value) {
			const text = String(value);
			return text.startsWith("/") || /^[A-Za-z]:[/\\]/.test(text) || text.startsWith("\\\\");
		}
		/** 与官方 fileAddressFor 同义：会话根未知时保留绝对路径，不做假相对化。 */
		function fileAddressFor(sessionId, cwd, filePath) {
			const normalized = String(filePath).replace(/\\/g, "/");
			if (!isAbsoluteWorkspacePath(normalized)) return sessionFileAddress(sessionId, normalized);
			const root = String(cwd || "").replace(/\\/g, "/").replace(/\/+$/, "");
			if (root !== "" && normalized === root) return sessionFileAddress(sessionId, "");
			if (root !== "" && normalized.startsWith(root + "/")) return sessionFileAddress(sessionId, normalized.slice(root.length + 1));
			return sessionFileAddress(sessionId, normalized);
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
		/**
		 * 滚动同步的纯函数（坐标系只有两套，写死在这里）：
		 *
		 *   · .dfe-body 是唯一滚动容器，scrollTop/scrollLeft 属于它。
		 *   · .dfe-hl（高亮 pre）与 .dfe-gutter（行号）是 **in-flow 内容层**：
		 *     浏览器已经随滚动量移动了它们，再 translate 会叠加成约 2× 位移，
		 *     所以 content 语义必须给 (0,0)——绝不能设置 transform。
		 *   · .dfe-input（透明 textarea）是 .dfe-stack 内的 absolute 覆盖层，但
		 *     它的包含块 .dfe-stack 同样是内容坐标（高度=内容高度、随滚动移动），
		 *     与 in-flow 一致，也必须给 (0,0)。
		 *   · 只有相对 **滚动视口** 固定的 absolute 层才需要反向平移
		 *     (-scrollLeft, -scrollTop) 抵消原生滚动；本组件当前没有这种层，
		 *     保留该语义是为了未来新增视口层时不再写反，并让单测能锁住两套坐标。
		 *
		 * @param {"content"|"viewport"} layer 层相对哪套坐标定位
		 * @returns {{x:number,y:number}} 需要额外施加的平移；{0,0} 表示不设置 transform
		 */
		function scrollOffsets(layer, scrollTop, scrollLeft) {
			if (layer !== "viewport") return { x: 0, y: 0 };
			const top = Number.isFinite(scrollTop) ? scrollTop : 0;
			const left = Number.isFinite(scrollLeft) ? scrollLeft : 0;
			/* `-0` 与 `0` 在 CSS 里等价，但会让单测的严格比较失败；统一归零。 */
			return { x: left === 0 ? 0 : -left, y: top === 0 ? 0 : -top };
		}

		/* ------------------------------------------------------------------
		   4. 样式（官方 widget 变量，浅深主题自动适配）
		   ------------------------------------------------------------------ */
		function ensureCss() {
			const id = PKG + ":editor.css";
			if (document.querySelector('style[data-plugin-css="' + id + '"]') !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = PKG;
			tag.dataset.pluginCss = id;
			tag.textContent = [
				".dfe-root{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,13px)}",
				".dfe-bar{display:flex;align-items:center;gap:8px;flex:none;padding:8px 12px;border-bottom:.5px solid var(--dsw-alias-border-l3)}",
				".dfe-path{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px}",
				".dfe-dim{color:var(--dsw-alias-label-tertiary);font-size:11.5px;flex:none}",
				".dfe-btn{font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:4px 10px;cursor:pointer;flex:none}",
				".dfe-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
				".dfe-btn:disabled{opacity:.5;cursor:default}",
				".dfe-btn-primary{background:var(--dsw-alias-brand-primary,#5a8cff);border-color:var(--dsw-alias-brand-primary,#5a8cff);color:#fff}",
				".dfe-note{flex:none;padding:8px 12px;color:var(--dsw-alias-label-secondary);line-height:1.7;font-size:12px}",
				".dfe-warn{flex:none;display:flex;align-items:center;gap:8px;padding:8px 12px;background:color-mix(in srgb,var(--dsw-alias-label-danger,#e5534b) 12%,transparent);color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.6}",
				".dfe-body{position:relative;flex:1 1 auto;min-height:0;overflow:auto;background:var(--dsw-alias-bg-layer-1)}",
				".dfe-grid{display:flex;min-height:100%;align-items:flex-start;font-family:ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,'Cascadia Code',monospace;font-size:12.5px;line-height:20px}",
				".dfe-gutter{position:sticky;left:0;z-index:2;flex:none;min-width:44px;padding:8px 8px 8px 12px;text-align:right;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-1);user-select:none;white-space:pre}",
				".dfe-stack{position:relative;flex:1 1 auto;min-width:0;padding:8px 12px 8px 8px}",
				".dfe-hl{margin:0;white-space:pre;tab-size:2;pointer-events:none}",
				".dfe-input{position:absolute;inset:8px 12px 8px 8px;width:calc(100% - 20px);height:calc(100% - 16px);margin:0;border:0;outline:0;resize:none;overflow:hidden;background:transparent;color:transparent;caret-color:var(--dsw-alias-label-primary);white-space:pre;tab-size:2;font:inherit;padding:0}",
				".dfe-input::selection{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#5a8cff) 30%,transparent);color:transparent}",
				".dfe-empty{padding:16px 14px;color:var(--dsw-alias-label-tertiary);line-height:1.8;font-size:12.5px}"
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
				const address = fileAddressFor(sessionId, "", absolutePath);
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
			/* 高亮用的文本比输入滞后 ~120ms：连续敲键只分词最后一次。 */
			const [highlightText, setHighlightText] = React.useState("");
			const [version, setVersion] = React.useState(null);
			const [dirty, setDirty] = React.useState(false);
			const [status, setStatus] = React.useState("");
			const [externalChange, setExternalChange] = React.useState(false);
			const textRef = React.useRef("");
			const versionRef = React.useRef(null);
			const dirtyRef = React.useRef(false);
			const inputRef = React.useRef(null);
			/* 轮询 effect 只建一次 interval，不能依赖 phase/visible（否则每次状态
			   变化都会重建定时器）；这两个 ref 让 interval 读到最新值。 */
			const tabRef = React.useRef(null);
			tabRef.current = tab;
			const phaseRef = React.useRef("loading");
			React.useEffect(() => { phaseRef.current = state.phase; }, [state.phase]);

			const applyLoaded = React.useCallback((res) => {
				if (res.binary === true) { setState({ phase: "binary", size: res.size }); return; }
				if (res.truncated === true) { setState({ phase: "toolarge", size: res.size }); return; }
				if (res.decodeValid === false) { setState({ phase: "notUtf8", size: res.size }); return; }
				textRef.current = res.text;
				versionRef.current = res.version;
				dirtyRef.current = false;
				setText(res.text);
				setHighlightText(res.text);
				setVersion(res.version);
				setDirty(false);
				setExternalChange(false);
				setStatus("");
				setState({ phase: "ready", size: res.size, path: res.path });
			}, []);

			const load = React.useCallback(() => {
				if (targetPath === null) { setState({ phase: "nopath" }); return; }
				setState({ phase: "loading" });
				remote().fsRead(targetPath, MAX_TEXT_BYTES, sessionId).then(applyLoaded).catch((err) => {
					setState({ phase: "error", message: String((err && err.message) || err) });
				});
			}, [targetPath, sessionId, applyLoaded]);

			React.useEffect(() => { load(); }, [load]);

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
					remote().fsStat(targetPath, sessionId).then((res) => {
						if (res.version === versionRef.current) return undefined;
						if (dirtyRef.current) {
							setState((prev) => (prev.phase === "ready" ? { phase: "conflict", size: prev.size, path: prev.path } : prev));
							setExternalChange(true);
							return undefined;
						}
						return remote().fsRead(targetPath, MAX_TEXT_BYTES, sessionId).then((fresh) => {
							applyLoaded(fresh);
							setStatus("文件已在磁盘上更新，已自动重新载入");
						});
					}).catch(() => {
						/* 文件被删/暂时读不到：保持现状，下次再试 */
					}).then(() => { inFlight = false; }, () => { inFlight = false; });
				}, POLL_MS);
				return () => { window.clearInterval(timer); };
			}, [targetPath, sessionId, applyLoaded]);

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
				remote().fsWrite(targetPath, snapshot, versionRef.current, sessionId).then((res) => {
					versionRef.current = res.version;
					dirtyRef.current = false;
					setVersion(res.version);
					setDirty(false);
					setExternalChange(false);
					setStatus("已保存 · " + new Date().toLocaleTimeString("zh-CN", { hour12: false }));
				}).catch((err) => {
					const message = String((err && err.message) || err);
					if (message.indexOf("stale:") === 0) {
						setExternalChange(true);
						setState((prev) => ({ phase: "conflict", size: prev.size, path: prev.path }));
						setStatus("文件已被外部修改，未写入");
						return;
					}
					setStatus("保存失败：" + message);
				});
			}, [targetPath, sessionId, state.phase]);

			const copyMine = React.useCallback(() => {
				const value = textRef.current;
				const clip = navigator && navigator.clipboard;
				if (!clip || typeof clip.writeText !== "function") { setStatus("浏览器不支持剪贴板 API"); return; }
				clip.writeText(value).then(() => setStatus("已把我的内容复制到剪贴板（" + value.length + " 字符）"))
					.catch((err) => setStatus("复制失败：" + String((err && err.message) || err)));
			}, []);

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
			React.useEffect(() => {
				const input = inputRef.current;
				if (input === null) return;
				input.style.height = "auto";
				input.style.height = input.scrollHeight + "px";
			}, [text, state.phase]);

			/* 渲染时用纯函数确认当前层的坐标语义。高亮/行号/透明输入层都在内容
			   坐标系：浏览器负责随滚动移动，额外 transform 必须是 (0,0)，所以这里
			   通常得到 undefined（不写 style）。绝不再对 in-flow 层做 translate。 */
			const contentScroll = scrollOffsets("content", 0, 0);
			const contentTransform = contentScroll.x === 0 && contentScroll.y === 0
				? undefined
				: { transform: "translate(" + contentScroll.x + "px," + contentScroll.y + "px)" };

			/* ---- 渲染 ---- */
			const children = [];
			const headerBits = [];
			headerBits.push(React.createElement("span", { key: "p", className: "dfe-path", title: targetPath || "" }, baseName(targetPath || "（未知文件）")));
			if (state.size !== null && state.size !== undefined) headerBits.push(React.createElement("span", { key: "s", className: "dfe-dim" }, formatSize(state.size)));
			if (dirty) headerBits.push(React.createElement("span", { key: "d", className: "dfe-dim" }, "● 未保存"));
			if (language) headerBits.push(React.createElement("span", { key: "l", className: "dfe-dim" }, language));
			if (status !== "") headerBits.push(React.createElement("span", { key: "t", className: "dfe-dim" }, status));
			if (state.phase === "ready") {
				headerBits.push(React.createElement("button", { key: "save", type: "button", className: "dfe-btn dfe-btn-primary", onClick: save, disabled: !dirty && !externalChange }, "保存"));
				headerBits.push(React.createElement("button", { key: "reload", type: "button", className: "dfe-btn", onClick: load, title: "从磁盘重新读取（丢弃我的修改）" }, "重载"));
			}
			children.push(React.createElement("div", { key: "bar", className: "dfe-bar" }, headerBits));

			if (state.phase === "conflict" || externalChange) {
				const bits = [React.createElement("span", { key: "m" }, "⚠ 这个文件在磁盘上已被外部修改（可能是 agent 写的）。直接保存会被拒绝，请选择：")];
				bits.push(React.createElement("button", { key: "r", type: "button", className: "dfe-btn", onClick: load }, "重载（丢弃我的修改）"));
				bits.push(React.createElement("button", { key: "c", type: "button", className: "dfe-btn", onClick: copyMine }, "复制我的内容"));
				children.push(React.createElement("div", { key: "warn", className: "dfe-warn" }, bits));
			}

			if (state.phase === "ready" || state.phase === "conflict") {
				const lines = text.split("\n");
				const runs = highlight(highlightText);
				const highlighted = [];
				for (let i = 0; i < lines.length; i += 1) {
					const spans = runs !== undefined && runs[i] !== undefined ? runs[i] : [{ text: lines[i], style: undefined }];
					const spansEl = spans.map((span, j) => React.createElement("span", { key: j, style: span.style }, span.text));
					highlighted.push(React.createElement("div", { key: i }, spansEl.length > 0 ? spansEl : "\u200b"));
				}
				const gutter = [];
				for (let i = 0; i < lines.length; i += 1) gutter.push(String(i + 1));
				children.push(React.createElement("div", { key: "body", className: "dfe-body" },
					React.createElement("div", { className: "dfe-grid" },
						React.createElement("div", { className: "dfe-gutter", style: contentTransform }, gutter.join("\n")),
						React.createElement("div", { className: "dfe-stack" },
							React.createElement("pre", { className: "dfe-hl", style: contentTransform }, highlighted),
							React.createElement("textarea", {
								className: "dfe-input",
								ref: inputRef,
								value: text,
								spellCheck: false,
								wrap: "off",
								onChange: onChange,
								onKeyDown: onKeyDown,
								"aria-label": "文件内容编辑区"
							})
						)
					)
				));
			} else if (state.phase === "loading") {
				children.push(React.createElement("div", { key: "m", className: "dfe-empty" }, "正在读取…"));
			} else if (state.phase === "error") {
				children.push(React.createElement("div", { key: "m", className: "dfe-empty" }, "读取失败：" + state.message));
			} else if (state.phase === "binary") {
				children.push(React.createElement("div", { key: "m", className: "dfe-empty" }, "这是二进制文件（图片/压缩包/可执行文件/Office 文档等），本插件只编辑文本。官方预览能渲染它。"));
			} else if (state.phase === "toolarge") {
				children.push(React.createElement("div", { key: "m", className: "dfe-empty" }, "文件超过 2MB，本插件不提供编辑（截断后保存会把内容截掉）。官方预览可以分页查看。"));
			} else if (state.phase === "notUtf8") {
				children.push(React.createElement("div", { key: "m", className: "dfe-empty" }, "这个文件不是 UTF-8 文本（可能是 GBK / UTF-16 等旧编码）。在这里编辑会在保存时把编码写坏，所以本插件拒绝编辑。"));
			} else if (state.phase === "nopath") {
				children.push(React.createElement("div", { key: "m", className: "dfe-empty" }, "这个标签没有指向任何文件。请从官方预览头部的「编辑」按钮进入。"));
			}
			return React.createElement("div", { className: "dfe-root" }, children);
		}

		/* ------------------------------------------------------------------
		   7. 注册
		   ------------------------------------------------------------------ */
		/** 标签类型的静态声明；`title(address)` 由官方在打开时捕获（不再有 title 槽位覆盖它）。 */
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
		 * 注册标签类型。正常路径下 `sidebar.right.pane.tab` 槽位出现时侧栏
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
			fileAddressFor,
			parseFileAddress,
			scrollOffsets,
			MAX_TEXT_BYTES,
			HIGHLIGHT_DELAY_MS,
			POLL_MS
		};
		return module.exports;
	}
});
