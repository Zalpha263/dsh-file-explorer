window.__ModuleLoader__.load({
	id: "dsh-file-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		/* ============================================================
		   dsh-file-explorer v2.3.0 —— 官方预览的「编辑」补充件
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
		const IconPlusOutlineRegular = pickComponent("IconPlusOutlineRegular");
		const IconEditOutlineRegular = pickComponent("IconEditOutlineRegular");
		const IconTrashOutlineRegular = pickComponent("IconTrashOutlineRegular");
		const IconFolderOpenRegular = pickComponent("IconFolderOpenRegular");
		const ModalComponent = pickComponent("Modal");
		const writeClipboard = PRIMITIVES && typeof PRIMITIVES.writeClipboard === "function" ? PRIMITIVES.writeClipboard : null;

		const EDIT_KIND = "file-editor";
		/** 从右侧栏拖进输入框的轻量引用 MIME（与官方附件的 Files/x-dsh-file 不冲突）。 */
		const REFERENCE_MIME = "application/x-dsh-file-ref";
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
			nopath: "这个标签没有指向任何文件。请从官方预览头部的「编辑」按钮进入。",
			deleted: "这个文件已被删除。未保存的文字仍可复制出来，然后关闭这个标签。",
			renamed: "这个文件已改名或移动。可以到新位置重新打开，再关闭这个标签。"
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
				descriptor("fsWrite", ["path", "content", "expectedVersion", { name: "sessionId", optional: true }]),
				descriptor("fsEnvironment", [{ name: "sessionId", optional: true }]),
				descriptor("fsDescribe", ["path", { name: "sessionId", optional: true }]),
				descriptor("fsCreateFile", ["directory", "name", { name: "sessionId", optional: true }]),
				descriptor("fsCreateFolder", ["directory", "name", { name: "sessionId", optional: true }]),
				descriptor("fsRename", ["path", "newName", { name: "sessionId", optional: true }]),
				descriptor("fsDelete", ["path", "expectedVersion", { name: "sessionId", optional: true }])
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
				: call("fsWrite", path, content, expectedVersion, sessionId),
			fsEnvironment: (sessionId) => sessionId === undefined ? call("fsEnvironment") : call("fsEnvironment", sessionId),
			fsDescribe: (path, sessionId) => sessionId === undefined ? call("fsDescribe", path) : call("fsDescribe", path, sessionId),
			fsCreateFile: (directory, name, sessionId) => sessionId === undefined
				? call("fsCreateFile", directory, name)
				: call("fsCreateFile", directory, name, sessionId),
			fsCreateFolder: (directory, name, sessionId) => sessionId === undefined
				? call("fsCreateFolder", directory, name)
				: call("fsCreateFolder", directory, name, sessionId),
			fsRename: (path, newName, sessionId) => sessionId === undefined
				? call("fsRename", path, newName)
				: call("fsRename", path, newName, sessionId),
			fsDelete: (path, expectedVersion, sessionId) => sessionId === undefined
				? call("fsDelete", path, expectedVersion)
				: call("fsDelete", path, expectedVersion, sessionId)
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
	   4. 文件管理：环境缓存、事件、对话框 store、路径/名称纯函数
	   ------------------------------------------------------------------ */

	let environmentPromise = null;
	let cachedEnvironment = null;
	function loadEnvironment(sessionId) {
		if (cachedEnvironment !== null) return Promise.resolve(cachedEnvironment);
		if (environmentPromise !== null) return environmentPromise;
		environmentPromise = remote.fsEnvironment(sessionId).then((value) => {
			cachedEnvironment = value;
			return value;
		}).catch((err) => {
			environmentPromise = null;
			throw err;
		});
		return environmentPromise;
	}
	function currentPlatform() {
		return cachedEnvironment !== null && typeof cachedEnvironment.platform === "string" ? cachedEnvironment.platform : "linux";
	}
	function detectPlatformFromPath(value) {
		const text = String(value || "");
		if (/^[A-Za-z]:[\\/]/.test(text) || text.indexOf("\\\\") === 0) return "win32";
		if (text.startsWith("/")) return cachedEnvironment === null ? "linux" : currentPlatform();
		return currentPlatform();
	}
	function normalizeSlashes(value, platform) {
		const text = String(value || "");
		return platform === "win32" ? text.replace(/\\/g, "/") : text;
	}
	/** 工作区相对路径（/ 分隔），越界返回 null；根自身为 '.'。 */
	function relativePathFor(root, target, platform) {
		if (typeof root !== "string" || root === "") return null;
		const stripped = normalizeSlashes(root, platform).replace(/\/+$/, "");
		const r = stripped === "" ? "/" : stripped;
		const t = normalizeSlashes(target, platform);
		const fold = platform === "win32" || platform === "darwin";
		const rr = fold ? r.toLowerCase() : r;
		const tt = fold ? t.toLowerCase() : t;
		if (tt === rr) return ".";
		if (r === "/") return t.startsWith("/") ? t.slice(1) : null;
		if (!tt.startsWith(rr + "/")) return null;
		return t.slice(r.length + 1);
	}
	/** 目录/文件路径的包含性比较（Win/macOS 折叠大小写）。 */
	function sameOrInsidePath(parent, child, platform) {
		if (typeof parent !== "string" || parent === "" || typeof child !== "string" || child === "") return false;
		const p = normalizeSlashes(parent, platform).replace(/\/+$/, "");
		const c = normalizeSlashes(child, platform).replace(/\/+$/, "");
		const fold = platform === "win32" || platform === "darwin";
		const pp = fold ? p.toLowerCase() : p;
		const cc = fold ? c.toLowerCase() : c;
		return cc === pp || cc.startsWith(pp + "/");
	}
	/** 官方 @file 语法能安全表示的 mention；无法表示时返回 null。 */
	function formatReferenceMention(path, cwd, platform) {
		const target = normalizeSlashes(path, platform);
		if (target === "") return null;
		if (/[\u0000-\u001f\u007f"]/.test(target)) return null;
		const relative = relativePathFor(cwd, target, platform);
		const text = relative === null ? target : relative;
		return /\s/.test(text) ? '@"' + text + '"' : "@" + text;
	}
	/** dragstart 写入 DataTransfer 的轻量引用载荷。 */
	function referenceDragPayload(path, root, platform) {
		if (typeof path !== "string" || path === "") return null;
		const mention = formatReferenceMention(path, root, platform);
		if (mention === null) return null;
		return { path: path, root: root || "", name: baseName(path), mention: mention };
	}
	/** 客户端名称预检表（Host 仍权威）；与 lib/paths.js 的规则保持一致。 */
	function validateEntryNameClient(name, platform) {
		const dialect = platform === "win32" || platform === "darwin" || platform === "linux" ? platform : "linux";
		if (typeof name !== "string") return { ok: false, name: "", message: "文件名必须是字符串" };
		const trimmed = name.trim();
		if (trimmed === "") return { ok: false, name: "", message: "文件名不能为空" };
		if (trimmed === "." || trimmed === "..") return { ok: false, name: "", message: "文件名不能是 . 或 .." };
		if (/[\\/]/.test(trimmed)) return { ok: false, name: "", message: "文件名不能包含路径分隔符" };
		if (/[\u0000-\u001f\u007f]/.test(trimmed)) return { ok: false, name: "", message: "文件名不能包含控制字符" };
		if (dialect === "win32") {
			if (/[<>:"|?*]/.test(trimmed)) return { ok: false, name: "", message: "文件名包含 Windows 不允许的字符：< > : \" | ? *" };
			if (/[ .]$/.test(trimmed)) return { ok: false, name: "", message: "文件名不能以空格或点结尾" };
			const reserved = trimmed.split(".")[0];
			if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(reserved)) return { ok: false, name: "", message: "文件名是 Windows 保留设备名：" + reserved };
			if (trimmed.length > 255) return { ok: false, name: "", message: "文件名超过 255 个字符" };
		} else if (dialect === "darwin") {
			if (trimmed.indexOf(":") >= 0) return { ok: false, name: "", message: "macOS 文件名不能包含冒号" };
			if (trimmed.length > 255) return { ok: false, name: "", message: "文件名超过 255 个字符" };
		} else {
			const bytes = typeof TextEncoder === "function" ? new TextEncoder().encode(trimmed).length : trimmed.length;
			if (bytes > 255) return { ok: false, name: "", message: "文件名超过 255 字节" };
		}
		return { ok: true, name: trimmed, message: "" };
	}
	function notify(text, success) {
		if (applyCtx === null) return;
		const menus = applyCtx.get("contextMenus");
		if (menus !== undefined && menus !== null && typeof menus.notify === "function") {
			try { menus.notify(String(text), success === true); } catch (err) { /* containment */ }
		}
	}
	const fileEventListeners = new Set();
	function emitFileEvent(event) {
		for (const listener of Array.from(fileEventListeners)) {
			try { listener(event); } catch (err) { /* containment */ }
		}
	}
	function subscribeFileEvents(listener) {
		fileEventListeners.add(listener);
		return () => { fileEventListeners.delete(listener); };
	}
	/** 打开中的编辑页：用于删除/重命名确认框提示未保存修改。 */
	const openEditors = new Map();
	const fileOpsListeners = new Set();
	let fileOpsDialog = null;
	function publishFileOps(next) {
		fileOpsDialog = next;
		for (const listener of Array.from(fileOpsListeners)) {
			try { listener(); } catch (err) { /* containment */ }
		}
	}
	let fileOpsHosted = false;
	/** 老宿主没有 shell.overlay 时的降级：prompt/confirm 直接调 Host。 */
	function openFileOpsFallback(dialog) {
		if (typeof window === "undefined") return false;
		const prompt = window.prompt;
		const confirm = window.confirm;
		if (typeof prompt !== "function" || typeof confirm !== "function") return false;
		if (dialog.kind === "create-file" || dialog.kind === "create-folder") {
			const name = prompt(dialog.kind === "create-file" ? "新建文件名" : "新建文件夹名", "");
			if (name === null) return true;
			const checked = validateEntryNameClient(name, currentPlatform());
			if (!checked.ok) { notify(checked.message, false); return true; }
			const promise = dialog.kind === "create-file"
				? remote.fsCreateFile(dialog.directory, checked.name, dialog.sessionId)
				: remote.fsCreateFolder(dialog.directory, checked.name, dialog.sessionId);
			promise.then(function (result) {
				notify((dialog.kind === "create-file" ? "已创建 " : "已创建文件夹 ") + result.name, true);
				if (dialog.kind === "create-file") openEditorFor(dialog.sessionId, result.path);
			}).catch(function (err) { notify(String((err && err.message) || err), false); });
			return true;
		}
		if (dialog.kind === "rename") {
			const name = prompt("重命名", baseName(dialog.path));
			if (name === null) return true;
			const checked = validateEntryNameClient(name, currentPlatform());
			if (!checked.ok) { notify(checked.message, false); return true; }
			if (checked.name === baseName(dialog.path)) return true;
			remote.fsRename(dialog.path, checked.name, dialog.sessionId).then(function (result) {
				notify("已重命名", true);
				emitFileEvent({ kind: "renamed", from: dialog.path, to: result.path });
			}).catch(function (err) { notify(String((err && err.message) || err), false); });
			return true;
		}
		if (dialog.kind === "delete") {
			remote.fsDescribe(dialog.path, dialog.sessionId).then(function (info) {
				if (!confirm("永久删除 " + (info.native || dialog.path) + "？此操作无法恢复。")) return;
				return remote.fsDelete(dialog.path, info.link === true ? "" : (info.version || ""), dialog.sessionId).then(function () {
					notify("已删除 " + baseName(dialog.path), true);
					emitFileEvent({ kind: "deleted", path: dialog.path });
				});
			}).catch(function (err) { notify(String((err && err.message) || err), false); });
			return true;
		}
		return false;
	}
	function openFileOps(dialog) {
		if (!fileOpsHosted && openFileOpsFallback(dialog)) return;
		publishFileOps(dialog);
	}
	function getFileOpsDialog() { return fileOpsDialog; }
	function closeFileOps() { publishFileOps(null); }
	function useFileOps() {
		const [value, setValue] = React.useState(fileOpsDialog);
		React.useEffect(() => {
			const listener = () => { setValue(fileOpsDialog); };
			fileOpsListeners.add(listener);
			listener();
			return () => { fileOpsListeners.delete(listener); };
		}, []);
		return value;
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
	/* 文件管理：文件页头按钮 */
	".dfe-files-actions{display:inline-flex;align-items:center;gap:2px;flex:none}",
	".dfe-files-tool{width:24px;height:24px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:4px;line-height:1;color:var(--dsw-alias-label-secondary);background:transparent;border:none;border-radius:var(--dsw-radius-sm);cursor:pointer;font:inherit}",
	".dfe-files-tool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
	".dfe-files-tool svg{width:15px;height:15px}",
	".dfe-files-label{font-size:12px;white-space:nowrap}",
	".dfe-doc-actions{display:inline-flex;align-items:center;gap:6px}",
	".dfe-modal-backdrop{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.28)}",
	".dfe-modal-panel{box-sizing:border-box;width:min(440px,calc(100vw - 48px));max-height:calc(100vh - 96px);overflow:auto;padding:18px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.28)}",
	".dfe-modal-title{font-size:15px;font-weight:600;line-height:1.4}",
	".dfe-modal-desc{margin-top:4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5;word-break:break-all}",
	".dfe-modal-body{margin-top:14px}",
	".dfe-dialog-form{display:flex;flex-direction:column;gap:6px}",
	".dfe-label{font-size:12px;color:var(--dsw-alias-label-secondary)}",
	".dfe-field-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);outline:none}",
	".dfe-field-input:focus{border-color:var(--dsw-alias-brand-primary,#5a8cff)}",
	".dfe-dialog-body{display:flex;flex-direction:column;gap:8px;font-size:12px;line-height:1.6}",
	".dfe-dialog-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}",
	".dfe-error{color:var(--dsw-alias-state-danger-primary,#d93025);font-size:12px;line-height:1.5;word-break:break-all}",
	".dfe-warn{color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.6}",
	".dfe-primary{height:30px;padding:0 14px;border:1px solid var(--dsw-alias-brand-primary,#5a8cff);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-brand-primary,#5a8cff);color:#fff;font:inherit;font-size:12px;cursor:pointer}",
	".dfe-primary:hover:not(:disabled){filter:brightness(1.06)}",
	".dfe-primary:disabled,.dfe-danger:disabled,.dfe-action:disabled{opacity:.45;cursor:default}",
	".dfe-danger{height:30px;padding:0 14px;border:1px solid var(--dsw-alias-state-danger-primary,#d93025);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-state-danger-primary,#d93025);color:#fff;font:inherit;font-size:12px;cursor:pointer}",
	".dfe-danger:hover:not(:disabled){filter:brightness(1.06)}",
	".dfe-lifecycle{display:flex;flex-direction:column;gap:8px}",
	".dfe-lifecycle-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}",
	"[data-dfe-drop]{outline:2px solid var(--dsw-alias-brand-primary,#5a8cff);outline-offset:2px}",
	"[data-dfe-dragging]{opacity:.55}",
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
			return React.createElement("span", { className: "dfe-doc-actions" }, [
				React.createElement("button", {
					key: "edit",
					type: "button",
					className: "dfe-btn",
					title: "在本插件的编辑页里打开这个文件（官方预览是只读的）",
					onClick: onOpen
				}, "编辑")
			]);
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
	   5.2 文件管理 UI：对话框、文件页头、右键菜单、拖拽引用
	   ------------------------------------------------------------------ */

	function dialogButton(key, label, className, onClick, disabled) {
		return React.createElement("button", {
			key: key,
			type: "button",
			className: className,
			onClick: onClick,
			disabled: disabled === true
		}, label);
	}
	function dialogFooter(cancelLabel, confirmLabel, onCancel, onConfirm, busy, danger) {
		return React.createElement("div", { key: "footer", className: "dfe-dialog-footer" }, [
			dialogButton("cancel", cancelLabel, "dfe-action", onCancel, busy),
			dialogButton("confirm", confirmLabel, danger === true ? "dfe-danger" : "dfe-primary", onConfirm, busy)
		]);
	}
	function DialogShell(props) {
		const close = typeof props.onClose === "function" ? props.onClose : function () {};
		if (ModalComponent !== null) {
			return React.createElement(ModalComponent, {
				open: true,
				onClose: close,
				title: props.title,
				description: props.description,
				closeLabel: "关闭",
				className: "dfe-modal",
				contentClassName: "dfe-modal-content"
			}, props.children);
		}
		return React.createElement("div", { key: "backdrop", className: "dfe-modal-backdrop", onClick: close },
			React.createElement("div", { key: "panel", className: "dfe-modal-panel", onClick: function (event) { if (event && typeof event.stopPropagation === "function") event.stopPropagation(); } }, [
				React.createElement("div", { key: "title", className: "dfe-modal-title" }, props.title),
				props.description ? React.createElement("div", { key: "desc", className: "dfe-modal-desc" }, props.description) : null,
				React.createElement("div", { key: "body", className: "dfe-modal-body" }, props.children)
			]));
	}
	function useDescribe(dialog) {
		const [value, setValue] = React.useState({ detail: null, error: "" });
		React.useEffect(function () {
			if (dialog === null) return undefined;
			let cancelled = false;
			const target = dialog.kind === "create-file" || dialog.kind === "create-folder" ? dialog.directory : dialog.path;
			setValue({ detail: null, error: "" });
			remote.fsDescribe(target, dialog.sessionId).then(function (detail) {
				if (!cancelled) setValue({ detail: detail, error: "" });
			}).catch(function (err) {
				if (!cancelled) setValue({ detail: null, error: String((err && err.message) || err) });
			});
			return function () { cancelled = true; };
		}, [dialog]);
		return value;
	}
	function openEditorFor(sessionId, path) {
		const sidebar = applyCtx && applyCtx.get("sidebarRight");
		if (!sidebar || typeof sidebar.openResource !== "function") return;
		if (typeof sessionId !== "string" || sessionId === "") return;
		sidebar.openResource(sessionFileAddress(sessionId, path), {
			kind: EDIT_KIND,
			params: { absolutePath: path }
		});
	}
	function CreateEntryDialog(props) {
		const dialog = props.dialog;
		const described = useDescribe(dialog);
		const [env, setEnv] = React.useState(cachedEnvironment);
		const [name, setName] = React.useState("");
		const [error, setError] = React.useState("");
		const [busy, setBusy] = React.useState(false);
		const inputRef = React.useRef(null);
		React.useEffect(function () {
			let cancelled = false;
			loadEnvironment(dialog.sessionId).then(function (value) { if (!cancelled) setEnv(value); }).catch(function () {});
			return function () { cancelled = true; };
		}, [dialog.sessionId]);
		React.useEffect(function () {
			const el = inputRef.current;
			if (el && typeof el.focus === "function") { try { el.focus(); } catch (err) { /* containment */ } }
		}, []);
		const platform = env !== null && typeof env.platform === "string" ? env.platform : currentPlatform();
		const validation = name === "" ? { ok: true, name: "" } : validateEntryNameClient(name, platform);
		const directory = described.detail !== null && typeof described.detail.native === "string" ? described.detail.native : (dialog.directory || "");
		const displayError = error || (validation.ok ? "" : validation.message) || described.error;
		const kindLabel = dialog.kind === "create-file" ? "文件" : "文件夹";
		const submit = function () {
			if (busy) return;
			const checked = validateEntryNameClient(name, platform);
			if (!checked.ok) { setError(checked.message); return; }
			setBusy(true);
			setError("");
			const promise = dialog.kind === "create-file"
				? remote.fsCreateFile(dialog.directory, checked.name, dialog.sessionId)
				: remote.fsCreateFolder(dialog.directory, checked.name, dialog.sessionId);
			promise.then(function (result) {
				closeFileOps();
				notify((dialog.kind === "create-file" ? "已创建 " : "已创建文件夹 ") + result.name, true);
				if (dialog.kind === "create-file") openEditorFor(dialog.sessionId, result.path);
			}).catch(function (err) {
				setBusy(false);
				setError(String((err && err.message) || err));
			});
		};
		const onKeyDown = function (event) {
			if (event.key === "Enter") { event.preventDefault(); submit(); }
			if (event.key === "Escape") { event.preventDefault(); closeFileOps(); }
		};
		return React.createElement(DialogShell, {
			open: true,
			title: "新建" + kindLabel,
			description: directory,
			onClose: busy ? function () {} : closeFileOps
		}, [
			React.createElement("div", { key: "form", className: "dfe-dialog-form" }, [
				React.createElement("label", { key: "label", className: "dfe-label" }, kindLabel + "名"),
				React.createElement("input", {
					key: "input",
					ref: inputRef,
					className: "dfe-field-input",
					value: name,
					placeholder: dialog.kind === "create-file" ? "例如 notes.md" : "例如 src",
					onChange: function (event) { setName(event.target.value); setError(""); },
					onKeyDown: onKeyDown
				}),
				displayError ? React.createElement("div", { key: "error", className: "dfe-error" }, displayError) : null
			]),
			dialogFooter("取消", "创建", closeFileOps, submit, busy, false)
		]);
	}
	function RenameDialog(props) {
		const dialog = props.dialog;
		const described = useDescribe(dialog);
		const [env, setEnv] = React.useState(cachedEnvironment);
		const [name, setName] = React.useState(baseName(dialog.path));
		const [error, setError] = React.useState("");
		const [busy, setBusy] = React.useState(false);
		const inputRef = React.useRef(null);
		React.useEffect(function () {
			let cancelled = false;
			loadEnvironment(dialog.sessionId).then(function (value) { if (!cancelled) setEnv(value); }).catch(function () {});
			return function () { cancelled = true; };
		}, [dialog.sessionId]);
		React.useEffect(function () {
			const el = inputRef.current;
			if (el && typeof el.focus === "function") { try { el.select && el.select(); el.focus(); } catch (err) { /* containment */ } }
		}, []);
		const platform = env !== null && typeof env.platform === "string" ? env.platform : currentPlatform();
		const validation = validateEntryNameClient(name, platform);
		const detail = described.detail;
		const nativePath = detail !== null && typeof detail.native === "string" ? detail.native : dialog.path;
		const displayError = error || (validation.ok ? "" : validation.message) || described.error;
		const submit = function () {
			if (busy) return;
			const checked = validateEntryNameClient(name, platform);
			if (!checked.ok) { setError(checked.message); return; }
			if (checked.name === baseName(dialog.path)) { closeFileOps(); return; }
			setBusy(true);
			setError("");
			remote.fsRename(dialog.path, checked.name, dialog.sessionId).then(function (result) {
				closeFileOps();
				notify("已重命名", true);
				emitFileEvent({ kind: "renamed", from: dialog.path, to: result.path });
			}).catch(function (err) {
				setBusy(false);
				setError(String((err && err.message) || err));
			});
		};
		return React.createElement(DialogShell, {
			open: true,
			title: "重命名",
			description: nativePath,
			onClose: busy ? function () {} : closeFileOps
		}, [
			React.createElement("div", { key: "form", className: "dfe-dialog-form" }, [
				React.createElement("label", { key: "label", className: "dfe-label" }, "新名称"),
				React.createElement("input", {
					key: "input",
					ref: inputRef,
					className: "dfe-field-input",
					value: name,
					onChange: function (event) { setName(event.target.value); setError(""); },
					onKeyDown: function (event) {
						if (event.key === "Enter") { event.preventDefault(); submit(); }
						if (event.key === "Escape") { event.preventDefault(); closeFileOps(); }
					}
				}),
				displayError ? React.createElement("div", { key: "error", className: "dfe-error" }, displayError) : null
			]),
			dialogFooter("取消", "重命名", closeFileOps, submit, busy, false)
		]);
	}
	function DeleteDialog(props) {
		const dialog = props.dialog;
		const described = useDescribe(dialog);
		const [error, setError] = React.useState("");
		const [busy, setBusy] = React.useState(false);
		const platform = currentPlatform();
		const detail = described.detail;
		const nativePath = detail !== null && typeof detail.native === "string" ? detail.native : dialog.path;
		const dirty = Array.from(openEditors.keys()).some(function (key) {
			const entry = openEditors.get(key);
			return entry && entry.dirty === true && sameOrInsidePath(dialog.path, key, platform);
		});
		const isLink = detail !== null && detail.link === true;
		const isFile = detail !== null && detail.kind === "file";
		const canDelete = detail !== null && detail.exists === true && (isLink || isFile) && detail.insideWorkspace !== false;
		const displayError = error || described.error || (detail !== null && !detail.exists ? "文件已不存在" : "")
			|| (detail !== null && !isLink && !isFile ? "只支持删除文件，文件夹暂不支持删除" : "");
		const submit = function () {
			if (busy || !canDelete) return;
			setBusy(true);
			setError("");
			remote.fsDelete(dialog.path, isLink ? "" : (detail.version || ""), dialog.sessionId).then(function () {
				closeFileOps();
				notify("已删除 " + baseName(dialog.path), true);
				emitFileEvent({ kind: "deleted", path: dialog.path });
			}).catch(function (err) {
				setBusy(false);
				setError(String((err && err.message) || err));
			});
		};
		return React.createElement(DialogShell, {
			open: true,
			title: "删除文件",
			description: nativePath,
			onClose: busy ? function () {} : closeFileOps
		}, [
			React.createElement("div", { key: "body", className: "dfe-dialog-body" }, [
				React.createElement("div", { key: "warn", className: "dfe-warn" }, "此操作会永久删除该文件，无法恢复。"),
				detail !== null && detail.size !== null ? React.createElement("div", { key: "size", className: "dfe-dim" }, "大小：" + formatSize(detail.size)) : null,
				isLink ? React.createElement("div", { key: "link", className: "dfe-dim" }, "这是符号链接：只会删除链接本身，不会删除链接指向的文件。") : null,
				dirty ? React.createElement("div", { key: "dirty", className: "dfe-warn" }, "该文件正在编辑页打开且有未保存修改，删除后这些修改会丢失。") : null,
				displayError ? React.createElement("div", { key: "error", className: "dfe-error" }, displayError) : null
			]),
			dialogFooter("取消", "永久删除", closeFileOps, submit, busy || !canDelete, true)
		]);
	}
	function FileOpsDialogHost() {
		React.useEffect(function () {
			fileOpsHosted = true;
			return function () { fileOpsHosted = false; };
		}, []);
		const dialog = useFileOps();
		if (dialog === null) return null;
		if (dialog.kind === "create-file" || dialog.kind === "create-folder") return React.createElement(CreateEntryDialog, { dialog: dialog });
		if (dialog.kind === "rename") return React.createElement(RenameDialog, { dialog: dialog });
		if (dialog.kind === "delete") return React.createElement(DeleteDialog, { dialog: dialog });
		return null;
	}
	function filesActionButton(key, title, label, onClick, icon) {
		const Icon = icon !== null && icon !== undefined ? icon : IconPlusOutlineRegular;
		const children = Icon !== null
			? [React.createElement(Icon, { key: "i", size: 15 })]
			: [React.createElement("span", { key: "t", className: "dfe-files-label" }, label)];
		return React.createElement("button", {
			key: key,
			type: "button",
			className: "dfe-files-tool",
			title: title,
			"aria-label": title,
			onClick: onClick
		}, children);
	}
	function FilesActions(props) {
		const standard = props || {};
		const absolutePath = typeof standard.absolutePath === "string" ? standard.absolutePath : null;
		const sessionId = typeof standard.sessionId === "string" ? standard.sessionId : undefined;
		const [env, setEnv] = React.useState(cachedEnvironment);
		React.useEffect(function () {
			let cancelled = false;
			loadEnvironment(sessionId).then(function (value) { if (!cancelled) setEnv(value); }).catch(function () {});
			return function () { cancelled = true; };
		}, [sessionId]);
		if (absolutePath === null) return null;
		const buttons = [filesActionButton("file", "新建文件", "新建文件", function () {
			openFileOps({ kind: "create-file", sessionId: sessionId, directory: absolutePath });
		}, IconPlusOutlineRegular)];
		if (env !== null && env.localBackend === true) {
			buttons.push(filesActionButton("folder", "新建文件夹", "新建文件夹", function () {
				openFileOps({ kind: "create-folder", sessionId: sessionId, directory: absolutePath });
			}, IconFolderOpenRegular));
		}
		return React.createElement("span", { className: "dfe-files-actions" }, buttons);
	}

	function copyRelativePath(sessionId, path) {
		remote.fsDescribe(path, sessionId).then(function (info) {
			if (info.relative === null) {
				notify("该路径不在当前会话工作区内，无法复制相对路径", false);
				return;
			}
			const copy = function (value) {
				if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
					return navigator.clipboard.writeText(value);
				}
				if (writeClipboard !== null) return Promise.resolve(writeClipboard(value));
				return Promise.reject(new Error("浏览器不支持剪贴板 API"));
			};
			return copy(info.relative).then(function () { notify("已复制相对路径", true); });
		}).catch(function (err) {
			notify("复制失败：" + String((err && err.message) || err), false);
		});
	}
	function openRenameDialog(sessionId, path) {
		openFileOps({ kind: "rename", sessionId: sessionId, path: path });
	}
	function openDeleteDialog(sessionId, path) {
		openFileOps({ kind: "delete", sessionId: sessionId, path: path });
	}
	function registerFileMenus(menus) {
		const disposers = [];
		const directoryProvider = {
			id: "file-explorer.directory",
			target: "directory",
			order: 50,
			resolve: function (value) {
				const sessionId = value && value.sessionId;
				const path = value && value.path;
				if (typeof path !== "string" || path === "") return [];
				const actions = [
					{ id: "createFile", label: "新建文件…", icon: { key: "file-explorer.create" }, run: function () { openFileOps({ kind: "create-file", sessionId: sessionId, directory: path }); } },
					{ id: "createFolder", label: "新建文件夹…", icon: { key: "file-explorer.create" }, run: function () { openFileOps({ kind: "create-folder", sessionId: sessionId, directory: path }); } }
				];
				actions.push({ id: "rename", label: "重命名…", icon: { key: "file-explorer.rename" }, run: function () { openRenameDialog(sessionId, path); } });
				actions.push({ id: "copyRelative", label: "复制相对路径", icon: { key: "file-explorer.copy" }, run: function () { copyRelativePath(sessionId, path); } });
				return actions;
			}
		};
		const fileProvider = {
			id: "file-explorer.file",
			target: "file",
			order: 50,
			resolve: function (value) {
				const sessionId = value && value.sessionId;
				const path = value && value.path;
				if (typeof path !== "string" || path === "") return [];
				return [
					{ id: "rename", label: "重命名…", icon: { key: "file-explorer.rename" }, run: function () { openRenameDialog(sessionId, path); } },
					{ id: "delete", label: "删除文件…", icon: { key: "file-explorer.delete" }, danger: true, run: function () { openDeleteDialog(sessionId, path); } },
					{ id: "copyRelative", label: "复制相对路径", icon: { key: "file-explorer.copy" }, run: function () { copyRelativePath(sessionId, path); } }
				];
			}
		};
		try { disposers.push(menus.register(directoryProvider)); } catch (err) { console.error("[dsh-file-explorer] directory menu registration failed:", err); }
		try { disposers.push(menus.register(fileProvider)); } catch (err) { console.error("[dsh-file-explorer] file menu registration failed:", err); }
		return disposers;
	}
	function registerFileMenusWhenReady(ctx) {
		let disposed = false;
		let timer = null;
		let index = 0;
		let disposers = [];
		const attempt = function () {
			timer = null;
			if (disposed) return;
			const menus = ctx.get("contextMenus");
			if (menus !== undefined && menus !== null && typeof menus.register === "function") {
				disposers = registerFileMenus(menus);
				return;
			}
			if (index >= TAB_RETRY_MS.length) {
				console.error("[dsh-file-explorer] contextMenus 在等待窗口内未出现，文件菜单未注册");
				return;
			}
			timer = window.setTimeout(attempt, TAB_RETRY_MS[index]);
			index += 1;
		};
		attempt();
		return function () {
			disposed = true;
			if (timer !== null) { window.clearTimeout(timer); timer = null; }
			for (const dispose of disposers) { try { dispose(); } catch (err) { /* containment */ } }
			disposers = [];
		};
	}
	function registerMenuIcons(ctx) {
		const entries = [
			["file-explorer.create", IconPlusOutlineRegular],
			["file-explorer.rename", IconEditOutlineRegular],
			["file-explorer.delete", IconTrashOutlineRegular],
			["file-explorer.copy", IconCopyOutlineRegular]
		];
		const disposers = [];
		for (const entry of entries) {
			if (entry[1] === null) continue;
			const key = entry[0];
			const Icon = entry[1];
			disposers.push(ctx.slots.inject("contextMenu.icon", function () {
				return ctx.slots.register({ name: "contextMenu.icon", key: key }, Icon);
			}));
		}
		return function () {
			for (const dispose of disposers) { try { dispose(); } catch (err) { /* containment */ } }
		};
	}
	function needsLeadingSpace(card) {
		try {
			const selection = typeof window !== "undefined" && typeof window.getSelection === "function" ? window.getSelection() : null;
			if (selection === null || selection === undefined || selection.rangeCount === 0 || selection.anchorNode === null) return false;
			const text = selection.anchorNode.textContent || "";
			const before = text.slice(0, selection.anchorOffset);
			return before.length > 0 && !/\s$/.test(before);
		} catch (err) {
			return false;
		}
	}
	function InputDropBridge(props) {
		const standard = props || {};
		const sessionId = typeof standard.sessionId === "string" ? standard.sessionId : undefined;
		const inputActions = standard.inputActions;
		const sessionsHook = typeof standard.useSessions === "function" ? standard.useSessions : null;
		const cwd = sessionsHook !== null ? sessionsHook(function (state) {
			const row = state && state.byId ? state.byId[sessionId] : undefined;
			return row ? row.cwd : undefined;
		}) : undefined;
		const ref = React.useRef(null);
		React.useEffect(function () {
			if (inputActions === undefined || inputActions === null || typeof inputActions.insertText !== "function") return undefined;
			const node = ref.current;
			if (node === null || typeof node.closest !== "function") return undefined;
			const card = node.closest("[data-composer-card]");
			if (card === null || typeof card.addEventListener !== "function") return undefined;
			const accepts = function (event) {
				if (!event || !event.dataTransfer || !event.dataTransfer.types) return false;
				return Array.prototype.indexOf.call(event.dataTransfer.types, REFERENCE_MIME) >= 0;
			};
			const onDragOver = function (event) {
				if (!accepts(event)) return;
				event.preventDefault();
				event.stopPropagation();
				try { event.dataTransfer.dropEffect = "copy"; } catch (err) { /* containment */ }
				if (typeof card.setAttribute === "function") card.setAttribute("data-dfe-drop", "true");
			};
			const onDragLeave = function (event) {
				if (!accepts(event)) return;
				if (typeof card.removeAttribute === "function") card.removeAttribute("data-dfe-drop");
			};
			const onDrop = function (event) {
				if (!accepts(event)) return;
				event.preventDefault();
				event.stopPropagation();
				if (typeof card.removeAttribute === "function") card.removeAttribute("data-dfe-drop");
				let payload = null;
				try { payload = JSON.parse(event.dataTransfer.getData(REFERENCE_MIME) || "null"); } catch (err) { payload = null; }
				if (payload === null || typeof payload.path !== "string" || payload.path === "") return;
				const platform = cachedEnvironment !== null && typeof cachedEnvironment.platform === "string" ? cachedEnvironment.platform : detectPlatformFromPath(payload.path);
				const targetCwd = typeof cwd === "string" && cwd !== "" ? cwd : "";
				const mention = formatReferenceMention(payload.path, targetCwd, platform);
				if (mention === null) { notify("该文件路径无法表示为 @ 引用", false); return; }
				const prefix = needsLeadingSpace(card) ? " " : "";
				const inserted = inputActions.insertText(prefix + mention + " ", inputActions.captureInsertion());
				if (inserted === false) { notify("输入框当前不可编辑（可能在发送中）", false); return; }
				const editor = typeof card.querySelector === "function" ? card.querySelector("[data-composer-input]") : null;
				if (editor !== null && editor !== undefined && typeof editor.focus === "function") { try { editor.focus(); } catch (err) { /* containment */ } }
			};
			card.addEventListener("dragover", onDragOver, true);
			card.addEventListener("dragleave", onDragLeave, true);
			card.addEventListener("drop", onDrop, true);
			return function () {
				card.removeEventListener("dragover", onDragOver, true);
				card.removeEventListener("dragleave", onDragLeave, true);
				card.removeEventListener("drop", onDrop, true);
			};
		}, [inputActions, sessionId, cwd]);
		if (inputActions === undefined || inputActions === null) return null;
		return React.createElement("span", { ref: ref, hidden: true, "aria-hidden": "true", "data-dfe-drop-bridge": true });
	}
	function installFileDragSource(ctx) {
		const doc = typeof document !== "undefined" ? document : null;
		if (doc === null || typeof doc.addEventListener !== "function") return undefined;
		const ROW = 'li[data-files-entry="file"][data-files-path]';
		const mark = function (node) {
			if (node === null || node === undefined || node.nodeType !== 1 || typeof node.matches !== "function") return;
			if (!node.matches(ROW)) return;
			try { node.setAttribute("draggable", "true"); } catch (err) { /* containment */ }
			/* 行内是官方按钮：一并标记，保证从文字/图标上起拖也能命中祖先行。 */
			if (typeof node.querySelectorAll === "function") {
				const buttons = node.querySelectorAll("button");
				for (let i = 0; i < buttons.length; i += 1) {
					try { buttons[i].setAttribute("draggable", "true"); } catch (err) { /* containment */ }
				}
			}
		};
		const scan = function (node) {
			if (node === null || node === undefined || node.nodeType !== 1) return;
			mark(node);
			if (typeof node.querySelectorAll === "function") {
				const rows = node.querySelectorAll(ROW);
				for (let i = 0; i < rows.length; i += 1) mark(rows[i]);
			}
		};
		let observer = null;
		if (typeof MutationObserver === "function") {
			observer = new MutationObserver(function (records) {
				for (const record of records) {
					const added = record.addedNodes || [];
					for (let i = 0; i < added.length; i += 1) scan(added[i]);
				}
			});
			try { observer.observe(doc.body, { childList: true, subtree: true }); } catch (err) { observer = null; }
		}
		scan(doc.body);
		const onPointerDown = function (event) {
			const target = event && event.target;
			if (!target || typeof target.closest !== "function") return;
			const row = target.closest(ROW);
			if (row !== null && row !== undefined) mark(row);
		};
		const onDragStart = function (event) {
			const target = event && event.target;
			const row = target && typeof target.closest === "function" ? target.closest(ROW) : null;
			if (row === null || row === undefined) return;
			const path = row.getAttribute("data-files-path");
			const rootEl = typeof row.closest === "function" ? row.closest("[data-files-root]") : null;
			const root = rootEl !== null && rootEl !== undefined ? rootEl.getAttribute("data-files-root") || "" : "";
			const platform = cachedEnvironment !== null && typeof cachedEnvironment.platform === "string" ? cachedEnvironment.platform : detectPlatformFromPath(path);
			const payload = referenceDragPayload(path, root, platform);
			if (payload === null) {
				event.preventDefault();
				notify("这个文件名无法表示为 @ 引用", false);
				return;
			}
			const transfer = event.dataTransfer;
			if (transfer === null || transfer === undefined) return;
			try {
				transfer.effectAllowed = "copy";
				transfer.setData(REFERENCE_MIME, JSON.stringify(payload));
				transfer.setData("text/plain", payload.mention + " ");
			} catch (err) { /* containment */ }
			try { row.setAttribute("data-dfe-dragging", "true"); } catch (err) { /* containment */ }
		};
		const onDragEnd = function (event) {
			const target = event && event.target;
			const row = target && typeof target.closest === "function" ? target.closest(ROW) : null;
			if (row !== null && row !== undefined && typeof row.removeAttribute === "function") row.removeAttribute("data-dfe-dragging");
		};
		doc.addEventListener("pointerdown", onPointerDown, true);
		doc.addEventListener("dragstart", onDragStart, true);
		doc.addEventListener("dragend", onDragEnd, true);
		return function () {
			if (observer !== null) { try { observer.disconnect(); } catch (err) { /* containment */ } }
			doc.removeEventListener("pointerdown", onPointerDown, true);
			doc.removeEventListener("dragstart", onDragStart, true);
			doc.removeEventListener("dragend", onDragEnd, true);
		};
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

	React.useEffect(() => {
		if (targetPath === null) return undefined;
		openEditors.set(targetPath, { dirty: dirty });
		return () => { openEditors.delete(targetPath); };
	}, [targetPath, dirty]);

	/* 删除/重命名事件：让这个编辑页进入不可编辑的生命周期状态。 */
	React.useEffect(() => {
		if (targetPath === null) return undefined;
		return subscribeFileEvents((event) => {
			const platform = currentPlatform();
			if (event.kind === "deleted" && typeof event.path === "string" && sameOrInsidePath(event.path, targetPath, platform)) {
				setState((prev) => ({ phase: "deleted", size: prev.size }));
				setExternalChange(false);
				return;
			}
			if (event.kind === "renamed" && typeof event.from === "string" && sameOrInsidePath(event.from, targetPath, platform)) {
				const suffix = targetPath.slice(event.from.length).replace(/^[\\/]+/, "");
				const next = suffix === "" ? event.to : event.to.replace(/[\\/]+$/, "") + "/" + suffix;
				setState({ phase: "renamed", from: targetPath, to: next });
				setExternalChange(false);
			}
		});
	}, [targetPath]);

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
					}).catch((err) => {
						const message = String((err && err.message) || err);
						if (message.indexOf("not found") >= 0) {
							setState((prev) => ({ phase: "deleted", size: prev.size }));
						}
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
					if (message.indexOf("file no longer exists") >= 0 || message.indexOf("not found") >= 0) {
						setState((prev) => ({ phase: "deleted", size: prev.size }));
						return;
					}
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
			const closeTab = () => {
				try {
					if (tab !== null && tab.actions && typeof tab.actions.close === "function") tab.actions.close();
				} catch (err) { /* containment */ }
			};
			const openRenamed = () => {
				if (state.phase !== "renamed") return;
				const sidebar = applyCtx && applyCtx.get("sidebarRight");
				if (sidebar !== null && sidebar !== undefined && typeof sidebar.openResource === "function" && typeof sessionId === "string" && sessionId !== "") {
					sidebar.openResource(sessionFileAddress(sessionId, state.to), {
						kind: EDIT_KIND,
						params: { absolutePath: state.to }
					});
				}
				closeTab();
			};
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
			} else if (state.phase === "deleted" || state.phase === "renamed") {
				const actions = [];
				if (state.phase === "deleted") {
					actions.push(React.createElement("button", { key: "copy", type: "button", className: "dfe-action", onClick: () => copyBuffer("已复制编辑页中的内容") }, "复制我的内容"));
				} else {
					actions.push(React.createElement("button", { key: "open", type: "button", className: "dfe-action", onClick: openRenamed }, "在新位置打开"));
				}
				actions.push(React.createElement("button", { key: "close", type: "button", className: "dfe-action", onClick: closeTab }, "关闭标签"));
				children.push(React.createElement("div", { key: "m", className: "dfe-empty dfe-lifecycle" }, [
					React.createElement("div", { key: "t" }, STATE_NOTICE[state.phase]),
					React.createElement("div", { key: "p", className: "dfe-dim" }, state.phase === "renamed" ? state.from + " → " + state.to : targetPath),
					React.createElement("div", { key: "a", className: "dfe-lifecycle-actions" }, actions)
				]));
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

			/* ③ 官方文件页头：新建文件/文件夹。 */
			ctx.effect(() => ctx.slots.inject("sidebar.right.tab.files.actions", () => ctx.slots.register({
				name: "sidebar.right.tab.files.actions",
				id: PKG,
				order: -20
			}, FilesActions)));

			/* ④ 全局对话框宿主（新建/重命名/删除确认）。 */
			ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: PKG + ".dialog"
			}, FileOpsDialogHost)));

			/* ⑤ 会话输入框的轻量引用拖放桥。 */
			ctx.effect(() => ctx.slots.inject("conversation.input.overlay", () => ctx.slots.register({
				name: "conversation.input.overlay",
				id: PKG + ".drop"
			}, InputDropBridge)));

			/* ⑥ 官方共享右键菜单 + 图标。 */
			ctx.effect(() => registerFileMenusWhenReady(ctx));
			ctx.effect(() => registerMenuIcons(ctx));

			/* ⑦ 目录树行的拖动源（只依赖官方 data-files-* 属性）。 */
			ctx.effect(() => installFileDragSource(ctx));

			/* 预热平台/本地后端信息；失败不阻塞界面。 */
			loadEnvironment(undefined).catch(() => {});
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
			lineNumberWidth,
			validateEntryNameClient,
			formatReferenceMention,
			referenceDragPayload,
			sameOrInsidePath,
			relativePathFor,
			getFileOpsDialog,
			emitFileEvent,
			subscribeFileEvents,
			FileOpsDialogHost,
			CreateEntryDialog,
			RenameDialog,
			DeleteDialog,
			FilesActions,
			InputDropBridge
		};
		return module.exports;
	}
});
