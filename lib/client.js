window.__ModuleLoader__.load({
	id: "dsh-file-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		/* ============================================================
		   dsh-file-explorer v2.0.0 —— 官方预览的「编辑」补充件
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
		       在同一个资源地址上开我们自己的标签页 —— 地址相同、kind 不同，所以
		       与官方预览标签并存，不再抢默认打开（本类型不声明 patterns）；
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
		const EDIT_MAX_BYTES = 2 * 1024 * 1024;   // 与宿主 EDIT_MAX_BYTES 对齐
		const POLL_MS = 2500;                      // 磁盘变更轮询（仅在标签可见时）

		/* ------------------------------------------------------------------
		   1. Remote contribution（strict codec 必须带 create() 工厂）
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
			const d = {
				id: seg(method),
				service: NS,
				namespace: NS,
				method: method,
				invocation: { kind: "direct" },
				parameters: (params || []).map((p) => ({ name: p, wire: p, source: "json", codec: strictCodec(seg(method) + ":" + p) })),
				result: strictCodec(seg(method) + ":result"),
				sourceLocation: { file: "dsh-file-explorer/lib/client.js", line: 1, column: 1 }
			};
			return d;
		}
		const CONTRIBUTION = {
			package: PKG,
			descriptors: [
				descriptor("fsStat", ["path"]),
				descriptor("fsRead", ["path", "maxBytes"]),
				descriptor("fsWrite", ["path", "content", "expectedVersion"])
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
		/** 与 CONTRIBUTION.descriptors 一一对应：少一个方法，调用点就是 not a function。 */
		const remote = () => ({
			fsStat: (path) => call("fsStat", path),
			fsRead: (path, maxBytes) => call("fsRead", path, maxBytes),
			fsWrite: (path, content, expectedVersion) => call("fsWrite", path, content, expectedVersion)
		});

		/* ------------------------------------------------------------------
		   3. 资源地址（内联自 @deepseek-ai/dsh-util-workspace-path）
		      dsh-resource://file/session/<encodeURIComponent(sid)>/<逐段编码路径>
		   ------------------------------------------------------------------ */
		const ADDRESS_PREFIX = "dsh-resource://file/";
		function encodeSeg(value) { return encodeURIComponent(String(value)); }
		function encodePath(value) { return String(value).split("/").map(encodeSeg).join("/"); }
		function fileAddressFor(sessionId, root, targetPath) {
			const normalized = String(targetPath).replace(/\\/g, "/");
			const rootNorm = String(root || "").replace(/\\/g, "/").replace(/\/+$/, "");
			let rel = normalized;
			if (rootNorm !== "" && normalized === rootNorm) rel = "";
			else if (rootNorm !== "" && normalized.startsWith(rootNorm + "/")) rel = normalized.slice(rootNorm.length + 1);
			rel = rel.replace(/^(?:\.\/)+/, "");
			return ADDRESS_PREFIX + "session/" + encodeSeg(sessionId) + "/" + encodePath(rel);
		}
		/** 从地址里取回会话与路径（我们对官方 preview 打开的文件用同一地址打开编辑器）。 */
		function parseFileAddress(address) {
			const text = String(address || "");
			if (!text.startsWith(ADDRESS_PREFIX)) return null;
			const parts = text.slice(ADDRESS_PREFIX.length).split("/");
			if (parts[0] !== "session") return null;
			const sessionId = decodeURIComponent(parts[1] || "");
			const rest = parts.slice(2).map((p) => decodeURIComponent(p)).join("/");
			return { sessionId, path: rest };
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
		      槽位 sidebar.right.tab.document.actions：owner prop 是 absolutePath。
		   ------------------------------------------------------------------ */
		function EditAction(props) {
			const standard = props || {};
			const absolutePath = typeof standard.absolutePath === "string" ? standard.absolutePath : null;
			const sessionId = typeof standard.sessionId === "string" ? standard.sessionId : null;
			if (absolutePath === null) return null;
			const onOpen = () => {
				const sidebar = applyCtx && applyCtx.get("sidebarRight");
				if (!sidebar || typeof sidebar.openResource !== "function") return;
				const address = fileAddressFor(sessionId || "", currentWorkspaceRoot(), absolutePath);
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

		/** 工作区根：优先用会话事件里记下的 cwd —— 地址只要能定位到文件即可。 */
		let knownRoot = "";
		function currentWorkspaceRoot() { return knownRoot; }

		/* ------------------------------------------------------------------
		   6. 编辑页正文
		   ------------------------------------------------------------------ */
		function EditorBody(props) {
			const standard = props || {};
			const info = typeof standard.useTabInfo === "function" ? standard.useTabInfo() : null;
			const tab = info && info.tab ? info.tab : null;
			/* 打开时通过 navigation.params 带过来的绝对路径（首选）；
			   退化路径是从资源地址解出的相对路径，交给宿主按会话 cwd 解析。 */
			const navParams = tab && tab.navigation && tab.navigation.params ? tab.navigation.params : null;
			const absolutePath = navParams && typeof navParams.absolutePath === "string" ? navParams.absolutePath : null;
			const parsed = tab && typeof tab.contentId === "string" ? parseFileAddress(tab.contentId) : null;
			const targetPath = absolutePath !== null ? absolutePath : (parsed !== null ? parsed.path : null);
			const sessionId = parsed !== null ? parsed.sessionId : (typeof standard.sessionId === "string" ? standard.sessionId : null);

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
			const [version, setVersion] = React.useState(null);
			const [dirty, setDirty] = React.useState(false);
			const [status, setStatus] = React.useState("");
			const [externalChange, setExternalChange] = React.useState(false);
			const textRef = React.useRef("");
			const versionRef = React.useRef(null);
			const dirtyRef = React.useRef(false);
			const inputRef = React.useRef(null);
			const highlightRef = React.useRef(null);
			const gutterRef = React.useRef(null);

			const applyLoaded = React.useCallback((res) => {
				if (res.binary === true) { setState({ phase: "binary", size: res.size }); return; }
				if (res.truncated === true || (res.size !== null && res.size > EDIT_MAX_BYTES)) {
					setState({ phase: "toolarge", size: res.size });
					return;
				}
				if (res.decodeValid === false) { setState({ phase: "notUtf8", size: res.size }); return; }
				textRef.current = res.text;
				versionRef.current = res.version;
				dirtyRef.current = false;
				setText(res.text);
				setVersion(res.version);
				setDirty(false);
				setExternalChange(false);
				setStatus("");
				setState({ phase: "ready", size: res.size, path: res.path });
			}, []);

			const load = React.useCallback(() => {
				if (targetPath === null) { setState({ phase: "nopath" }); return; }
				setState({ phase: "loading" });
				remote().fsRead(targetPath, EDIT_MAX_BYTES).then(applyLoaded).catch((err) => {
					setState({ phase: "error", message: String((err && err.message) || err) });
				});
			}, [targetPath, applyLoaded]);

			React.useEffect(() => { load(); }, [load]);

			/* 磁盘变更轮询：干净时自动跟随，脏时只提示冲突（绝不悄悄重载丢掉输入）。 */
			React.useEffect(() => {
				if (targetPath === null) return undefined;
				const timer = window.setInterval(() => {
					if (state.phase !== "ready" && state.phase !== "conflict") return;
					remote().fsStat(targetPath).then((res) => {
						if (res.version === versionRef.current) return;
						if (dirtyRef.current) {
							setState((prev) => (prev.phase === "ready" ? { phase: "conflict", size: prev.size, path: prev.path } : prev));
							setExternalChange(true);
							return;
						}
						remote().fsRead(targetPath, EDIT_MAX_BYTES).then((fresh) => {
							applyLoaded(fresh);
							setStatus("文件已在磁盘上更新，已自动重新载入");
						}).catch(() => {});
					}).catch(() => { /* 文件被删/暂时读不到：保持现状，下次再试 */ });
				}, POLL_MS);
				return () => { window.clearInterval(timer); };
			}, [targetPath, state.phase, applyLoaded]);

			const save = React.useCallback(() => {
				if (targetPath === null || state.phase !== "ready") return;
				const snapshot = textRef.current;
				setStatus("保存中…");
				remote().fsWrite(targetPath, snapshot, versionRef.current).then((res) => {
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
			}, [targetPath, state.phase]);

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
			const onScroll = (ev) => {
				const body = ev.target;
				if (highlightRef.current !== null) { highlightRef.current.style.transform = "translate(" + (-body.scrollLeft) + "px," + (-body.scrollTop) + "px)"; }
				if (gutterRef.current !== null) { gutterRef.current.style.transform = "translateY(" + (-body.scrollTop) + "px)"; }
			};
			React.useEffect(() => {
				const input = inputRef.current;
				if (input === null) return;
				input.style.height = "auto";
				input.style.height = input.scrollHeight + "px";
			}, [text, state.phase]);

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
				const runs = highlight(text);
				const highlighted = [];
				for (let i = 0; i < lines.length; i += 1) {
					const spans = runs !== undefined && runs[i] !== undefined ? runs[i] : [{ text: lines[i], style: undefined }];
					const spansEl = spans.map((span, j) => React.createElement("span", { key: j, style: span.style }, span.text));
					highlighted.push(React.createElement("div", { key: i }, spansEl.length > 0 ? spansEl : "\u200b"));
				}
				const gutter = [];
				for (let i = 0; i < lines.length; i += 1) gutter.push(String(i + 1));
				children.push(React.createElement("div", { key: "body", className: "dfe-body", onScroll: onScroll },
					React.createElement("div", { className: "dfe-grid" },
						React.createElement("div", { className: "dfe-gutter", ref: gutterRef }, gutter.join("\n")),
						React.createElement("div", { className: "dfe-stack" },
							React.createElement("pre", { className: "dfe-hl", ref: highlightRef }, highlighted),
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
		async function apply(ctx) {
			applyCtx = ctx;
			ensureCss();

			/* 会话工作区根：只为把绝对路径折成官方资源地址（相对地址同样可用）。 */
			try {
				const agents = ctx.get("agents");
				if (agents && typeof agents.roots === "function") {
					const roots = agents.roots();
					for (let i = roots.length - 1; i >= 0; i--) {
						const session = roots[i] && roots[i].session;
						const cwd = session && session.header && session.header.cwd;
						if (typeof cwd === "string" && cwd !== "") { knownRoot = cwd; break; }
					}
				}
			} catch (err) { /* 拿不到就退回相对地址 */ }

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

			/* ② 编辑页标签类型。**不声明 patterns**：绝不抢默认打开——
			      点官方目录树里的文件仍然由官方预览接管，只有「编辑」按钮会开它。 */
			ctx.effect(() => {
				const tabs = ctx.get("sidebarRightTabs");
				if (!tabs || typeof tabs.register !== "function") return undefined;
				return tabs.register({
					id: EDIT_KIND,
					kind: EDIT_KIND,
					canOpen: (address) => String(address).startsWith(ADDRESS_PREFIX),
					title: (address) => {
						const parsedAddress = parseFileAddress(address);
						const name = parsedAddress !== null && parsedAddress.path !== "" ? baseName(parsedAddress.path) : "编辑";
						return "编辑 · " + name;
					}
				});
			});

			/* ③ 编辑页正文 + 标签标题。 */
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: EDIT_KIND
			}, EditorBody)));
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
				name: "sidebar.right.pane.tab.title",
				key: EDIT_KIND
			}, function EditorTitle() { return "编辑"; })));
		}

		exports.apply = apply;
		exports.inject = ["slots", "remote"];
		return module.exports;
	}
});
