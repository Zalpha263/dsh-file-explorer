window.__ModuleLoader__.load({
	id: "dsh-file-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		/** Package-owned <style> host — the persistent client has no `styles` builtin. */
		let styleEl = null;
		function insertCss(css) {
			if (styleEl === null || !document.contains(styleEl)) {
				styleEl = document.createElement("style");
				styleEl.setAttribute("data-plugin-css", "dsh-file-explorer");
				document.head.appendChild(styleEl);
			}
			const node = document.createTextNode(css);
			styleEl.appendChild(node);
			return function dispose() {
				if (node.parentNode === styleEl) styleEl.removeChild(node);
			};
		}

		const CSS = `
.fexp-host { display: contents; }
.fexp-toggle { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 8px; border: none; background: transparent; border-radius: 6px; color: inherit; cursor: pointer; font-size: 14px; line-height: 1; flex-shrink: 1; }
.fexp-toggle:hover { background: rgba(127,127,127,.16); }
.fexp-toggle.fexp-active { background: rgba(90,140,255,.28); }
.fexp-toggle-wide { min-width: 64px; padding: 0 10px; }
.fexp-float { position: fixed; left: 296px; top: 200px; width: 44px; height: 44px; border-radius: 12px; border: 1px solid rgba(127,127,127,.35); background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); box-shadow: 0 4px 16px rgba(0,0,0,.22); cursor: pointer; font-size: 20px; line-height: 1; z-index: 2147482900; pointer-events: auto; display: inline-flex; align-items: center; justify-content: center; }
.fexp-float:hover { background: rgba(127,127,127,.16); }
.fexp-float.fexp-active { background: rgba(90,140,255,.28); }
.fexp-panel { position: fixed; width: 400px; max-width: calc(100vw - 24px); height: min(640px, 78vh); display: flex; flex-direction: column; background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid rgba(127,127,127,.35); border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,.28); overflow: hidden; pointer-events: auto; z-index: 2147483000; font-size: 14px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; cursor: move; user-select: none; font-weight: 600; border-bottom: 1px solid rgba(127,127,127,.22); }
.fexp-header-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-x { border: none; background: transparent; cursor: pointer; font-size: 14px; padding: 2px 6px; border-radius: 4px; color: inherit; }
.fexp-x:hover { background: rgba(127,127,127,.2); }
.fexp-dockbtn { border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; border-radius: 5px; padding: 1px 6px; font-size: 12px; cursor: pointer; }
.fexp-dockbtn:hover { background: rgba(127,127,127,.14); }
.fexp-dockbtn.fexp-on { background: rgba(90,140,255,.25); }
.fexp-toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; border-bottom: 1px solid rgba(127,127,127,.22); }
.fexp-tbtn { border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; border-radius: 5px; padding: 2px 8px; font-size: 12px; cursor: pointer; }
.fexp-tbtn:hover { background: rgba(127,127,127,.14); }
.fexp-tbtn.fexp-on { background: rgba(90,140,255,.25); }
.fexp-tree { flex: 1; overflow: auto; padding: 4px 0; min-height: 0; }
.fexp-row { display: flex; align-items: center; gap: 4px; padding: 2px 8px; cursor: pointer; white-space: nowrap; border-radius: 4px; }
.fexp-row:hover { background: rgba(127,127,127,.14); }
.fexp-caret { width: 14px; flex: none; font-size: 11px; opacity: .7; }
.fexp-ic { flex: none; font-size: 14px; }
.fexp-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.fexp-size { flex: none; opacity: .6; font-size: 12px; margin-left: 6px; }
.fexp-err { color: #d33; cursor: default; }
.fexp-dim { opacity: .55; }
.fexp-splitter { height: 6px; flex: none; cursor: row-resize; z-index: 5; }
.fexp-splitter:hover, .fexp-splitter.fexp-splitter-active { background: rgba(90,140,255,.35); }
.fexp-preview { flex: none; height: 260px; min-height: 60px; display: flex; flex-direction: column; border-top: 1px solid rgba(127,127,127,.22); }
.fexp-phead { display: flex; align-items: center; gap: 6px; padding: 6px 10px; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(127,127,127,.15); }
.fexp-pname { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-pre { flex: 1; overflow: auto; margin: 0; padding: 8px 10px; font-family: Consolas, 'Cascadia Code', monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; tab-size: 4; }
.fexp-pbody { flex: 1; overflow: auto; padding: 8px 10px; }
.fexp-row.fexp-active { background: rgba(90,140,255,.18); }
.fexp-grip { position: absolute; z-index: 6; }
.fexp-grip-n { top: 0; left: 10px; right: 10px; height: 6px; cursor: n-resize; }
.fexp-grip-s { bottom: 0; left: 10px; right: 10px; height: 6px; cursor: s-resize; }
.fexp-grip-e { right: 0; top: 10px; bottom: 10px; width: 6px; cursor: e-resize; }
.fexp-grip-w { left: 0; top: 10px; bottom: 10px; width: 6px; cursor: w-resize; }
.fexp-grip-nw { top: 0; left: 0; width: 12px; height: 12px; cursor: nwse-resize; }
.fexp-grip-ne { top: 0; right: 0; width: 12px; height: 12px; cursor: nesw-resize; }
.fexp-grip-sw { bottom: 0; left: 0; width: 12px; height: 12px; cursor: nesw-resize; }
.fexp-grip-se { bottom: 0; right: 0; width: 12px; height: 12px; cursor: nwse-resize; }
.fexp-grip:hover, .fexp-grip.fexp-grip-active { background: rgba(90,140,255,.35); }
.fexp-panel.fexp-narrow .fexp-size { display: none; }
/* --- v1.3: editing + context menu --- */
.fexp-editbtn { border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; border-radius: 5px; padding: 1px 6px; font-size: 12px; cursor: pointer; }
.fexp-editbtn:hover { background: rgba(127,127,127,.14); }
.fexp-editbtn.fexp-on { background: rgba(90,140,255,.25); }
.fexp-editor { flex: 1; display: flex; flex-direction: column; min-height: 0; border-top: 1px solid rgba(127,127,127,.22); }
.fexp-editor-bar { display: flex; align-items: center; gap: 6px; padding: 5px 10px; font-size: 12px; border-bottom: 1px solid rgba(127,127,127,.15); }
.fexp-editor-bar .fexp-dim { flex: 1; }
.fexp-editor textarea { flex: 1; min-height: 0; margin: 0; padding: 8px 10px; border: none; outline: none; resize: none; background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-label-primary, #1f2328); font-family: Consolas, 'Cascadia Code', monospace; font-size: 12px; line-height: 1.5; white-space: pre; overflow: auto; tab-size: 4; }
.fexp-menu { position: fixed; min-width: 168px; max-width: 280px; background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid rgba(127,127,127,.35); border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,.28); padding: 4px; z-index: 2147483100; pointer-events: auto; font-size: 13px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-menu-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 5px; cursor: pointer; white-space: nowrap; }
.fexp-menu-item:hover { background: rgba(90,140,255,.22); }
.fexp-menu-item.fexp-disabled { opacity: .45; cursor: default; }
.fexp-menu-item.fexp-disabled:hover { background: transparent; }
.fexp-menu-sep { height: 1px; margin: 4px 6px; background: rgba(127,127,127,.22); }
.fexp-menu-ic { width: 16px; text-align: center; flex: none; }
.fexp-menu-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.fexp-menu-sub { position: fixed; min-width: 120px; background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid rgba(127,127,127,.35); border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,.28); padding: 4px; z-index: 2147483101; pointer-events: auto; font-size: 13px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-input-host { position: fixed; z-index: 2147483102; pointer-events: auto; }
.fexp-input { box-sizing: border-box; width: 100%; padding: 4px 8px; border: 1px solid rgba(90,140,255,.8); border-radius: 5px; outline: none; background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-label-primary, #1f2328); font-size: 13px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); max-width: 70vw; padding: 8px 16px; border-radius: 8px; background: rgba(30,30,34,.92); color: #f2f2f2; font-size: 13px; z-index: 2147483200; pointer-events: none; box-shadow: 0 4px 16px rgba(0,0,0,.3); }
.fexp-editing-row { background: rgba(90,140,255,.14); }
.fexp-row.fexp-clipboard-src { outline: 1px dashed rgba(90,140,255,.6); outline-offset: -1px; }
`;

		// --- Remote namespace contribution --------------------------------------
		// The `remote.fileExplorer` namespace is mounted by THIS entry (the shipped
		// namespaces are mounted by @deepseek-ai/dsh-api-remotes). It must therefore
		// never appear in `inject` — that would deadlock the entry. Codecs are
		// "strict" with passthrough schemas: the client-side Gateway only calls
		// `codec.schema.parse(value)`; the Host Gateway validates via SRC markers.
		function passthroughSchema() {
			return { parse: (value) => value };
		}
		function strictCodec(typeSymbol) {
			return { mode: "strict", typeSymbol: typeSymbol, schema: passthroughSchema() };
		}
		const CONTRIBUTION = {
			package: "dsh-file-explorer",
			descriptors: [
				{
					id: "dsh-file-explorer#fileExplorer/fsList",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsList",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsList:path") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsList:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsRead",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsRead",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRead:path") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsRead:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/wsRoot",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "wsRoot",
					invocation: { kind: "direct" },
					parameters: [],
					result: strictCodec("dsh-file-explorer#fileExplorer/wsRoot:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/wsList",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "wsList",
					invocation: { kind: "direct" },
					parameters: [],
					result: strictCodec("dsh-file-explorer#fileExplorer/wsList:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsWrite",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsWrite",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:path") },
						{ name: "content", wire: "content", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:content") },
						{ name: "expectedVersion", wire: "expectedVersion", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:expectedVersion") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsCreate",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsCreate",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:path") },
						{ name: "type", wire: "type", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:type") },
						{ name: "content", wire: "content", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:content") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsRename",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsRename",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "from", wire: "from", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRename:from") },
						{ name: "to", wire: "to", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRename:to") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsRename:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsCopy",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsCopy",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "from", wire: "from", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCopy:from") },
						{ name: "toDir", wire: "toDir", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCopy:toDir") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsCopy:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				}
			]
		};

		async function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === undefined) return;

			ctx.effect(function installCss() {
				return insertCss(CSS);
			});

			try {
				const disposeMount = await ctx.remote.$mount(CONTRIBUTION);
				ctx.effect(function ownMount() {
					return () => {
						try { disposeMount(); } catch (err) {}
					};
				});
			} catch (err) {
				console.error("[dsh-file-explorer] remote namespace mount failed:", err);
				return;
			}

			// Remote call helpers: namespace methods resolve to { ok, value } envelopes.
			// IMPORTANT: never access `ctx.remote.fileExplorer` as a property — that
			// path resolves through the caller fiber's ancestry and THROWS for a
			// namespace mounted by this very entry (the namespace fiber is a sibling,
			// not an ancestor; only injected namespaces resolve that way). `ctx.get()`
			// reads the shared store directly and always sees it. Everything here is
			// wrapped so a missing namespace rejects instead of throwing synchronously
			// (a sync throw inside buildPanel would abdicate the panel entry).
			function unwrap(result) {
				if (result && result.ok === true) return result.value;
				const error = result && result.error;
				throw new Error((error && error.message) || "fileExplorer remote call failed");
			}
			function call(method) {
				const args = Array.prototype.slice.call(arguments, 1);
				return Promise.resolve().then(() => {
					const ns = ctx.get("remote.fileExplorer");
					if (ns === undefined) throw new Error("fileExplorer namespace unavailable");
					return ns[method].apply(ns, args);
				}).then(unwrap);
			}
			function remote() {
				return {
					fsList: (path) => call("fsList", path),
					fsRead: (path) => call("fsRead", path),
					fsWrite: (path, content, expectedVersion) => call("fsWrite", path, content, expectedVersion),
					fsCreate: (path, type, content) => call("fsCreate", path, type, content),
					fsRename: (from, to) => call("fsRename", from, to),
					fsCopy: (from, toDir) => call("fsCopy", from, toDir),
					wsRoot: () => call("wsRoot"),
					wsList: () => call("wsList")
				};
			}

			const SKIP_DIRS = new Set(["node_modules", "venv", "__pycache__", "dist", "build", ".next", "coverage", ".cache"]);
			function isHiddenName(name) {
				return name.charAt(0) === "." || SKIP_DIRS.has(name);
			}
			function formatSize(bytes) {
				if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return "";
				if (bytes < 1024) return bytes + " B";
				const units = ["KB", "MB", "GB", "TB"];
				let value = bytes / 1024;
				let i = 0;
				while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
				return value.toFixed(1) + " " + units[i];
			}
			function baseName(p) {
				const parts = p.split(/[\\/]/).filter(Boolean);
				return parts.length > 0 ? parts[parts.length - 1] : p;
			}
			const POS_KEY = "dsh-file-explorer:pos";
			const FLOAT_KEY = "dsh-file-explorer:float";
			const DOCK_KEY = "dsh-file-explorer:dock";
			const DWIDTH_KEY = "dsh-file-explorer:dwidth";
			const FWIDTH_KEY = "dsh-file-explorer:fwidth";
			const FHEIGHT_KEY = "dsh-file-explorer:fheight";
			const PSPLIT_KEY = "dsh-file-explorer:psplit";
			const FLOAT_SHOW_KEY = "dsh-file-explorer:float-show";
			function readJson(key) {
				try {
					const raw = window.localStorage.getItem(key);
					if (!raw) return null;
					const parsed = JSON.parse(raw);
					if (parsed && typeof parsed.left === "number" && typeof parsed.top === "number") return parsed;
					return null;
				} catch (err) { return null; }
			}
			function writeJson(key, value) {
				try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
			}
			function readDock() {
				try {
					const v = window.localStorage.getItem(DOCK_KEY);
					return v === "right" || v === "middle" ? v : "float";
				} catch (err) { return "float"; }
			}
			function writeDock(d) {
				try { window.localStorage.setItem(DOCK_KEY, d); } catch (err) {}
			}
			function readWidth(key, fallback) {
				try {
					const v = parseInt(window.localStorage.getItem(key), 10);
					return Number.isFinite(v) && v >= 40 && v <= 2000 ? v : fallback;
				} catch (err) { return fallback; }
			}
			function writeWidth(key, w) {
				try { window.localStorage.setItem(key, String(w)); } catch (err) {}
			}
			function readFloatShow() {
				try {
					const v = window.localStorage.getItem(FLOAT_SHOW_KEY);
					return v === null ? true : v === "1";
				} catch (err) { return true; }
			}
			function writeFloatShow(v) {
				try { window.localStorage.setItem(FLOAT_SHOW_KEY, v ? "1" : "0"); } catch (err) {}
			}
			const CLIPBOARD_KEY = "dsh-file-explorer:clipboard";
			function readClipboard() {
				try {
					const raw = window.localStorage.getItem(CLIPBOARD_KEY);
					if (!raw) return null;
					const parsed = JSON.parse(raw);
					if (parsed && typeof parsed.path === "string" && (parsed.type === "file" || parsed.type === "dir")) return parsed;
					return null;
				} catch (err) { return null; }
			}
			function writeClipboard() {
				try {
					window.localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(state.clipboard || { path: "", type: "file" }));
				} catch (err) {}
			}
			function joinPath(parent, name) {
				if (!parent) return name;
				if (parent.endsWith("/") || parent.endsWith("\\")) return parent + name;
				return parent + "\\" + name;
			}
			function parentDir(p) {
				const parts = p.split(/[\\/]/).filter(Boolean);
				parts.pop();
				return parts.length > 0 ? parts.join("\\") : null;
			}
			function relativeToRoot(p) {
				if (!state.root || typeof p !== "string") return p;
				const rootNorm = state.root.replace(/[\\/]+$/, "");
				const pNorm = p.replace(/[\\/]+$/, "");
				if (pNorm.toLowerCase() === rootNorm.toLowerCase()) return ".";
				if (pNorm.toLowerCase().startsWith(rootNorm.toLowerCase() + "\\")) return pNorm.slice(rootNorm.length + 1);
				return pNorm;
			}
			function showToast(message) {
				if (toastEl) toastEl.remove();
				toastEl = document.createElement("div");
				toastEl.className = "fexp-toast";
				toastEl.textContent = message;
				document.body.appendChild(toastEl);
				if (toastTimer) clearTimeout(toastTimer);
				toastTimer = setTimeout(() => {
					if (toastEl) { toastEl.remove(); toastEl = null; }
				}, 2600);
			}
			function copyText(text) {
				if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
					return navigator.clipboard.writeText(text).then(
						function () { showToast("已复制到剪贴板"); },
						function () { showToast("复制失败：剪贴板不可用"); }
					);
				}
				showToast("复制失败：浏览器不支持剪贴板 API");
				return Promise.resolve();
			}
			function sidebarWidth() {
				try {
					const frame = document.querySelector("[data-dragging]") || document.querySelector("[data-sidebar-collapsed]") || document.querySelector(".pI_x6G_frame");
					if (frame) {
						const cols = window.getComputedStyle(frame).gridTemplateColumns;
						const m = cols.match(/(\d+(?:\.\d+)?)px/);
						if (m) return parseFloat(m[1]);
					}
				} catch (err) {}
				return 280;
			}

			const state = {
				open: false,
				root: null,
				dock: readDock(),
				showFloat: readFloatShow(),
				workspaces: [],
				cache: new Map(),
				expanded: new Set(),
				showHidden: false,
				preview: null,
				pos: readJson(POS_KEY),
				editing: null,       // { path, name, version, original, text } while the preview editor is open
				clipboard: readClipboard(),
				menu: null,          // { x, y, target } context menu anchor
				input: null          // { x, y, width, value, placeholder, kind, onCommit } inline rename/create input
			};
			const inflight = new Set();
			const btnEls = new Map();
			const dockBtnEls = new Map();
			const grips = [];
			let hostEl = null;
			let panelEl = null;
			let floatEl = null;
			let treeEl = null;
			let previewEl = null;
			let headerTitleEl = null;
			let hiddenBtn = null;
			let floatBtn = null;
			let drag = null;
			let gripDrag = null;
			let splitDrag = null;
			let wsListLoaded = false;
			let menuEl = null;
			let submenuEl = null;
			let inputHostEl = null;
			let toastEl = null;
			let toastTimer = null;
			let lastMenuPos = null;

			function updateHeader() {
				if (headerTitleEl) headerTitleEl.textContent = state.root ? baseName(state.root) : "文件浏览器";
			}
			function updateDockButtons() {
				for (const [mode, el] of dockBtnEls) el.classList.toggle("fexp-on", state.dock === mode);
			}
			function updateGrips() {
				for (const g of grips) {
					if (state.dock === "right") g.style.display = g.dataset.grip === "w" ? "block" : "none";
					else if (state.dock === "middle") g.style.display = g.dataset.grip === "e" ? "block" : "none";
					else g.style.display = "block";
				}
			}
			function applyNarrow(w) {
				if (panelEl) panelEl.classList.toggle("fexp-narrow", w < 280);
			}
			function applyFloat() {
				if (floatEl) floatEl.style.display = state.showFloat ? "inline-flex" : "none";
				if (floatBtn) floatBtn.classList.toggle("fexp-on", state.showFloat);
			}
			function toggleFloat() {
				state.showFloat = !state.showFloat;
				writeFloatShow(state.showFloat);
				applyFloat();
			}
			function applyDock() {
				if (!panelEl) return;
				if (state.dock === "right") {
					const w = readWidth(DWIDTH_KEY, 400);
					panelEl.style.left = "";
					panelEl.style.right = "0px";
					panelEl.style.top = "0px";
					panelEl.style.bottom = "0px";
					panelEl.style.height = "auto";
					panelEl.style.width = w + "px";
					panelEl.style.maxWidth = "";
					applyNarrow(w);
				} else if (state.dock === "middle") {
					const w = readWidth(DWIDTH_KEY, 340);
					const sw = sidebarWidth();
					panelEl.style.left = sw + "px";
					panelEl.style.right = "";
					panelEl.style.top = "0px";
					panelEl.style.bottom = "0px";
					panelEl.style.height = "auto";
					panelEl.style.width = w + "px";
					panelEl.style.maxWidth = "";
					applyNarrow(w);
				} else {
					const fw = readWidth(FWIDTH_KEY, 400);
					const fh = readWidth(FHEIGHT_KEY, 0);
					panelEl.style.width = fw + "px";
					panelEl.style.maxWidth = "";
					panelEl.style.height = fh > 0 ? fh + "px" : "";
					panelEl.style.bottom = "";
					if (state.pos) {
						panelEl.style.left = state.pos.left + "px";
						panelEl.style.top = state.pos.top + "px";
						panelEl.style.right = "";
					} else {
						panelEl.style.right = "24px";
						panelEl.style.top = "96px";
						panelEl.style.left = "";
					}
					applyNarrow(fw);
				}
				updateDockButtons();
				updateGrips();
			}
			function setDock(d) {
				state.dock = d;
				writeDock(d);
				applyDock();
			}
			function switchRoot(path) {
				if (state.root === path) {
					if (state.cache.get(path) === undefined) fetchDir(path);
					return;
				}
				state.root = path;
				state.cache = new Map();
				state.expanded = new Set();
				state.preview = null;
				updateHeader();
				renderPreview();
				fetchDir(path);
			}
			function ensureWsList() {
				if (wsListLoaded) return Promise.resolve();
				return remote().wsList().then((res) => {
					wsListLoaded = true;
					if (res && Array.isArray(res.workspaces)) {
						state.workspaces = res.workspaces;
					}
				}).catch(() => {});
			}
			function fetchDir(path) {
				if (inflight.has(path)) return;
				inflight.add(path);
				state.cache.set(path, { loading: true, entries: null, error: null });
				renderTree();
				remote().fsList(path).then((res) => {
					state.cache.set(path, { loading: false, entries: res.entries, error: null });
					renderTree();
				}).catch((err) => {
					state.cache.set(path, { loading: false, entries: null, error: String((err && err.message) || err) });
					renderTree();
				}).finally(() => { inflight.delete(path); });
			}
			function rowEl(text, depth, cls) {
				const row = document.createElement("div");
				row.className = "fexp-row" + (cls ? " " + cls : "");
				row.style.paddingLeft = (8 + depth * 14) + "px";
				row.textContent = text;
				return row;
			}
			function walkTree(container, path, depth) {
				const dir = state.cache.get(path);
				if (!dir) {
					container.appendChild(rowEl("加载中…", depth, "fexp-dim"));
					fetchDir(path);
					return;
				}
				if (dir.loading) {
					container.appendChild(rowEl("加载中…", depth, "fexp-dim"));
					return;
				}
				if (dir.error) {
					container.appendChild(rowEl("⚠ " + dir.error, depth, "fexp-err"));
					return;
				}
				const visible = dir.entries.filter((e) => state.showHidden || !isHiddenName(e.name));
				const dirs = visible.filter((e) => e.type === "directory");
				const files = visible.filter((e) => e.type !== "directory");
				for (const e of dirs) {
					const isOpen = state.expanded.has(e.path);
					const row = document.createElement("div");
					row.className = "fexp-row fexp-dir" + (isOpen ? " fexp-open" : "") + (state.clipboard && state.clipboard.path === e.path ? " fexp-clipboard-src" : "");
					row.style.paddingLeft = (8 + depth * 14) + "px";
					row.title = e.path;
					row.dataset.path = e.path;
					row.dataset.type = "dir";
					const caret = document.createElement("span");
					caret.className = "fexp-caret";
					caret.textContent = isOpen ? "▾" : "▸";
					const ic = document.createElement("span");
					ic.className = "fexp-ic";
					ic.textContent = "📁";
					const name = document.createElement("span");
					name.className = "fexp-name";
					name.textContent = e.name;
					const size = document.createElement("span");
					size.className = "fexp-size";
					size.textContent = "/";
					row.appendChild(caret);
					row.appendChild(ic);
					row.appendChild(name);
					row.appendChild(size);
					row.addEventListener("click", () => toggleDir(e.path));
					row.addEventListener("contextmenu", (ev) => onContextMenu(ev, e.path, "dir", e.name));
					container.appendChild(row);
					if (isOpen) walkTree(container, e.path, depth + 1);
				}
				for (const e of files) {
					const row = document.createElement("div");
					row.className = "fexp-row fexp-file" + (state.preview && state.preview.path === e.path ? " fexp-active" : "") + (state.clipboard && state.clipboard.path === e.path ? " fexp-clipboard-src" : "");
					row.style.paddingLeft = (8 + depth * 14) + "px";
					row.title = e.path;
					row.dataset.path = e.path;
					row.dataset.type = "file";
					const caret = document.createElement("span");
					caret.className = "fexp-caret";
					caret.textContent = " ";
					const ic = document.createElement("span");
					ic.className = "fexp-ic";
					ic.textContent = "📄";
					const name = document.createElement("span");
					name.className = "fexp-name";
					name.textContent = e.name;
					const size = document.createElement("span");
					size.className = "fexp-size";
					size.textContent = formatSize(e.size);
					row.appendChild(caret);
					row.appendChild(ic);
					row.appendChild(name);
					row.appendChild(size);
					row.addEventListener("click", () => openFile(e));
					row.addEventListener("contextmenu", (ev) => onContextMenu(ev, e.path, "file", e.name));
					container.appendChild(row);
				}
			}
			function renderTree() {
				if (!treeEl) return;
				treeEl.textContent = "";
				if (state.root === null) {
					treeEl.appendChild(rowEl("正在定位当前工作区…", 0, "fexp-dim"));
				} else {
					walkTree(treeEl, state.root, 0);
				}
			}
			function toggleDir(path) {
				if (state.expanded.has(path)) {
					state.expanded.delete(path);
				} else {
					state.expanded.add(path);
					if (!state.cache.has(path)) fetchDir(path);
				}
				renderTree();
			}

			function renderPreview() {
				if (!previewEl) return;
				previewEl.textContent = "";
				const p = state.preview;
				if (!p) {
					previewEl.style.display = "none";
					return;
				}
				previewEl.style.display = "flex";
				const head = document.createElement("div");
				head.className = "fexp-phead";
				const ic = document.createElement("span");
				ic.className = "fexp-ic";
				ic.textContent = "📄";
				const name = document.createElement("span");
				name.className = "fexp-pname";
				name.textContent = p.name + (p.size !== null && p.size !== undefined ? "  (" + formatSize(p.size) + ")" : "");
				head.appendChild(ic);
				head.appendChild(name);
				if (p.truncated) {
					const tag = document.createElement("span");
					tag.className = "fexp-dim";
					tag.style.fontSize = "11px";
					tag.textContent = "已截断";
					head.appendChild(tag);
				}
				if (p.status === "done" && !p.binary && !p.truncated && state.editing && state.editing.path === p.path) {
					const editBtn = document.createElement("button");
					editBtn.className = "fexp-editbtn fexp-on";
					editBtn.textContent = "编辑中";
					editBtn.addEventListener("click", () => { closeEditor(); renderPreview(); });
					head.appendChild(editBtn);
				} else if (p.status === "done" && !p.binary && !p.truncated) {
					const editBtn = document.createElement("button");
					editBtn.className = "fexp-editbtn";
					editBtn.textContent = "编辑";
					editBtn.title = "编辑此文件（Ctrl+S 保存）";
					editBtn.addEventListener("click", () => {
						state.editing = { path: p.path, name: p.name, version: p.version || null, original: p.text, text: p.text };
						renderPreview();
					});
					head.appendChild(editBtn);
				}
				const x = document.createElement("button");
				x.className = "fexp-x";
				x.textContent = "✕";
				x.title = "关闭预览";
				x.addEventListener("click", () => {
					closeEditor();
					state.preview = null;
					renderPreview();
					renderTree();
				});
				head.appendChild(x);
				previewEl.appendChild(head);
				if (p.status === "done" && state.editing && state.editing.path === p.path && !p.binary && !p.truncated) {
					previewEl.appendChild(buildEditor());
					return;
				}
				let body;
				if (p.status === "loading") {
					body = document.createElement("div");
					body.className = "fexp-pbody fexp-dim";
					body.textContent = "加载中…";
				} else if (p.status === "error") {
					body = document.createElement("div");
					body.className = "fexp-pbody fexp-err";
					body.textContent = "读取失败: " + p.error;
				} else if (p.binary) {
					body = document.createElement("div");
					body.className = "fexp-pbody fexp-dim";
					body.textContent = "二进制文件，无法预览" + (p.size !== null && p.size !== undefined ? "（" + formatSize(p.size) + "）" : "");
				} else {
					body = document.createElement("pre");
					body.className = "fexp-pre";
					body.textContent = p.text;
				}
				previewEl.appendChild(body);
			}
			function buildEditor() {
				const p = state.preview;
				const ed = state.editing;
				const wrap = document.createElement("div");
				wrap.className = "fexp-editor";
				const bar = document.createElement("div");
				bar.className = "fexp-editor-bar";
				const hint = document.createElement("span");
				hint.className = "fexp-dim";
				hint.textContent = "Ctrl+S 保存 · 编辑不自动写盘";
				const saveBtn = document.createElement("button");
				saveBtn.className = "fexp-editbtn";
				saveBtn.textContent = "💾 保存";
				saveBtn.addEventListener("click", () => saveEdit());
				saveBtnEl = saveBtn;
				const cancelBtn = document.createElement("button");
				cancelBtn.className = "fexp-editbtn";
				cancelBtn.textContent = "取消";
				cancelBtn.addEventListener("click", () => { closeEditor(); renderPreview(); });
				bar.appendChild(hint);
				bar.appendChild(saveBtn);
				bar.appendChild(cancelBtn);
				const ta = document.createElement("textarea");
				ta.value = ed.text;
				ta.spellcheck = false;
				ta.addEventListener("input", () => { ed.text = ta.value; });
				ta.addEventListener("keydown", (ev) => {
					if (ev.key === "s" && (ev.ctrlKey || ev.metaKey)) {
						ev.preventDefault();
						saveEdit();
					}
					if (ev.key === "Escape") {
						ev.preventDefault();
						closeEditor();
						renderPreview();
					}
				});
				wrap.appendChild(bar);
				wrap.appendChild(ta);
				requestAnimationFrame(() => { try { ta.focus(); } catch (err) {} });
				return wrap;
			}
			let saveBtnEl = null;
			function saveBtnDisabled(disabled) {
				if (saveBtnEl) saveBtnEl.disabled = !!disabled;
			}
			function saveEdit() {
				const p = state.preview;
				const ed = state.editing;
				if (!p || !ed) return;
				saveBtnDisabled(true);
				remote().fsWrite(p.path, ed.text, ed.version).then((res) => {
					const next = Object.assign({}, p, { text: ed.text, size: p.size, version: res && res.version ? res.version : p.version });
					state.preview = next;
					closeEditor();
					renderPreview();
					refreshDirOf(p.path);
					showToast("已保存 " + p.name);
				}).catch((err) => {
					saveBtnDisabled(false);
					showToast("保存失败：" + ((err && err.message) || err));
				});
			}
			function closeEditor() {
				if (state.editing) state.editing = null;
				saveBtnEl = null;
			}
			function refreshDirOf(filePath) {
				const dir = parentDir(filePath);
				if (dir !== null && state.cache.has(dir)) fetchDir(dir);
				if (dir !== null && state.root !== null && dir.toLowerCase() === state.root.toLowerCase()) fetchDir(state.root);
			}
			function openFile(entry) {
				closeEditor();
				state.preview = { path: entry.path, name: entry.name, size: entry.size, status: "loading", error: null };
				renderPreview();
				renderTree();
				remote().fsRead(entry.path).then((res) => {
					if (!state.preview || state.preview.path !== entry.path) return;
					state.preview = { path: entry.path, name: entry.name, size: entry.size, status: "done", text: res.text, truncated: !!res.truncated, binary: !!res.binary, version: res.version || null, error: null };
					renderPreview();
				}).catch((err) => {
					if (!state.preview || state.preview.path !== entry.path) return;
					state.preview = { path: entry.path, name: entry.name, size: entry.size, status: "error", text: "", truncated: false, binary: false, error: String((err && err.message) || err) };
					renderPreview();
				});
			}

			function makeToolbarBtn(label, title, onClick) {
				const b = document.createElement("button");
				b.className = "fexp-tbtn";
				b.textContent = label;
				b.title = title;
				b.addEventListener("click", onClick);
				return b;
			}
			function makeDockBtn(label, mode) {
				const b = document.createElement("button");
				b.className = "fexp-dockbtn";
				b.textContent = label;
				b.title = "停靠模式：" + label;
				b.addEventListener("click", () => setDock(mode));
				dockBtnEls.set(mode, b);
				return b;
			}
			function makeGrip(mode, cls, cursor) {
				const g = document.createElement("div");
				g.className = "fexp-grip " + cls;
				g.style.cursor = cursor;
				g.dataset.grip = mode;
				g.addEventListener("pointerdown", onGripDown);
				g.addEventListener("pointermove", onGripMove);
				g.addEventListener("pointerup", onGripUp);
				g.addEventListener("pointercancel", onGripUp);
				grips.push(g);
				return g;
			}
			function onGripDown(e) {
				if (e.button !== 0 || !panelEl) return;
				e.preventDefault();
				e.stopPropagation();
				const rect = panelEl.getBoundingClientRect();
				gripDrag = {
					mode: e.currentTarget.dataset.grip,
					startX: e.clientX,
					startY: e.clientY,
					startLeft: rect.left,
					startTop: rect.top,
					startW: rect.width,
					startH: rect.height
				};
				if (state.dock === "float") panelEl.style.right = "";
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onGripMove(e) {
				if (!gripDrag || !panelEl) return;
				const dx = e.clientX - gripDrag.startX;
				const dy = e.clientY - gripDrag.startY;
				const MINW = 200;
				const MINH = 180;
				if (state.dock === "right") {
					const nw = Math.min(Math.max(gripDrag.startW - dx, MINW), window.innerWidth * 0.7);
					panelEl.style.width = nw + "px";
					applyNarrow(nw);
					return;
				}
				if (state.dock === "middle") {
					const nw = Math.min(Math.max(gripDrag.startW + dx, MINW), window.innerWidth * 0.7);
					panelEl.style.width = nw + "px";
					applyNarrow(nw);
					return;
				}
				const mode = gripDrag.mode;
				let left = gripDrag.startLeft;
				let top = gripDrag.startTop;
				let w = gripDrag.startW;
				let h = gripDrag.startH;
				if (mode === "e" || mode === "ne" || mode === "se") {
					w = Math.min(Math.max(gripDrag.startW + dx, MINW), window.innerWidth * 0.75);
				} else if (mode === "w" || mode === "nw" || mode === "sw") {
					const nw = Math.min(Math.max(gripDrag.startW - dx, MINW), window.innerWidth * 0.75);
					left = gripDrag.startLeft + (gripDrag.startW - nw);
					w = nw;
				}
				if (mode === "s" || mode === "se" || mode === "sw") {
					h = Math.min(Math.max(gripDrag.startH + dy, MINH), window.innerHeight * 0.85);
				} else if (mode === "n" || mode === "ne" || mode === "nw") {
					const nh = Math.min(Math.max(gripDrag.startH - dy, MINH), window.innerHeight * 0.85);
					top = gripDrag.startTop + (gripDrag.startH - nh);
					h = nh;
				}
				panelEl.style.left = left + "px";
				panelEl.style.top = top + "px";
				panelEl.style.width = w + "px";
				panelEl.style.height = h + "px";
				applyNarrow(w);
			}
			function onGripUp() {
				if (!gripDrag || !panelEl) return;
				const rect = panelEl.getBoundingClientRect();
				if (state.dock === "float") {
					state.pos = { left: rect.left, top: rect.top };
					writeJson(POS_KEY, state.pos);
					writeWidth(FWIDTH_KEY, Math.round(rect.width));
					writeWidth(FHEIGHT_KEY, Math.round(rect.height));
					applyNarrow(rect.width);
				} else {
					writeWidth(DWIDTH_KEY, Math.round(rect.width));
					applyNarrow(rect.width);
				}
				gripDrag = null;
			}
			function onSplitterDown(e) {
				if (e.button !== 0 || !previewEl) return;
				e.preventDefault();
				e.stopPropagation();
				const cur = previewEl.style.height ? parseInt(previewEl.style.height, 10) : readWidth(PSPLIT_KEY, 260);
				splitDrag = { startY: e.clientY, startH: cur };
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onSplitterMove(e) {
				if (!splitDrag || !previewEl || !panelEl) return;
				const dy = e.clientY - splitDrag.startY;
				const maxH = Math.max(80, panelEl.clientHeight - 150);
				const h = Math.min(Math.max(splitDrag.startH - dy, 60), maxH);
				previewEl.style.height = h + "px";
			}
			function onSplitterUp() {
				if (!splitDrag) return;
				if (previewEl) {
					const h = previewEl.offsetHeight > 0 ? previewEl.offsetHeight : splitDrag.startH;
					writeWidth(PSPLIT_KEY, h);
				}
				splitDrag = null;
			}
			function buildPanel() {
				if (!hostEl) return;
				hostEl.textContent = "";
				const panel = document.createElement("div");
				panel.className = "fexp-panel";
				panel.style.display = state.open ? "flex" : "none";
				panelEl = panel;
				const header = document.createElement("div");
				header.className = "fexp-header";
				const hic = document.createElement("span");
				hic.className = "fexp-ic";
				hic.textContent = "📁";
				const title = document.createElement("span");
				title.className = "fexp-header-title";
				headerTitleEl = title;
				const x = document.createElement("button");
				x.className = "fexp-x";
				x.textContent = "✕";
				x.title = "关闭";
				x.addEventListener("click", () => {
					state.open = false;
					applyOpen();
				});
				header.appendChild(hic);
				header.appendChild(title);
				header.appendChild(makeDockBtn("右侧", "right"));
				header.appendChild(makeDockBtn("中间", "middle"));
				header.appendChild(makeDockBtn("浮动", "float"));
				header.appendChild(x);
				header.addEventListener("pointerdown", onHeaderDown);
				header.addEventListener("pointermove", onHeaderMove);
				header.addEventListener("pointerup", onHeaderUp);
				header.addEventListener("pointercancel", onHeaderUp);
				const toolbar = document.createElement("div");
				toolbar.className = "fexp-toolbar";
				toolbar.appendChild(makeToolbarBtn("↻ 刷新", "重新加载目录", () => {
					state.cache = new Map();
					state.expanded = new Set();
					if (state.root !== null) fetchDir(state.root);
				}));
				hiddenBtn = makeToolbarBtn("👁 隐藏", "显示/隐藏 node_modules、.git 等", () => {
					state.showHidden = !state.showHidden;
					if (hiddenBtn) hiddenBtn.classList.toggle("fexp-on", state.showHidden);
					renderTree();
				});
				toolbar.appendChild(hiddenBtn);
				floatBtn = makeToolbarBtn("🪁 悬浮球", "显示/隐藏侧边悬浮球按钮", () => toggleFloat());
				toolbar.appendChild(floatBtn);
				const tree = document.createElement("div");
				tree.className = "fexp-tree";
				treeEl = tree;
				tree.addEventListener("contextmenu", (ev) => {
					if (ev.target !== tree) return; // only blank area, not rows
					if (state.root === null) return;
					ev.preventDefault();
					ev.stopPropagation();
					onContextMenu(ev, state.root, "dir", baseName(state.root));
				});
				const splitter = document.createElement("div");
				splitter.className = "fexp-splitter";
				splitter.title = "拖动调整预览区高度";
				splitter.addEventListener("pointerdown", onSplitterDown);
				splitter.addEventListener("pointermove", onSplitterMove);
				splitter.addEventListener("pointerup", onSplitterUp);
				splitter.addEventListener("pointercancel", onSplitterUp);
				const preview = document.createElement("div");
				preview.className = "fexp-preview";
				preview.style.display = "none";
				preview.style.height = readWidth(PSPLIT_KEY, 260) + "px";
				previewEl = preview;
				panel.appendChild(header);
				panel.appendChild(toolbar);
				panel.appendChild(tree);
				panel.appendChild(splitter);
				panel.appendChild(preview);
				panel.appendChild(makeGrip("nw", "fexp-grip-nw", "nwse-resize"));
				panel.appendChild(makeGrip("n", "fexp-grip-n", "n-resize"));
				panel.appendChild(makeGrip("ne", "fexp-grip-ne", "nesw-resize"));
				panel.appendChild(makeGrip("e", "fexp-grip-e", "e-resize"));
				panel.appendChild(makeGrip("w", "fexp-grip-w", "w-resize"));
				panel.appendChild(makeGrip("se", "fexp-grip-se", "nwse-resize"));
				panel.appendChild(makeGrip("s", "fexp-grip-s", "s-resize"));
				panel.appendChild(makeGrip("sw", "fexp-grip-sw", "nesw-resize"));
				hostEl.appendChild(panel);
				applyDock();
				applyFloat();
				updateHeader();
				renderTree();
				renderPreview();
				ensureRoot();
				ensureWsList();
			}
			function ensureRoot() {
				if (state.root !== null) {
					fetchDir(state.root);
					return;
				}
				remote().wsRoot().then((res) => {
					const candidate = res && typeof res.root === "string" && res.root !== "" ? res.root : null;
					if (candidate) {
						switchRoot(candidate);
					} else {
						renderTree();
					}
				}).catch(() => renderTree());
			}
			function probeActiveWorkspacePath() {
				try {
					const list = document.querySelector("[data-slot=\"sidebar.workspaces\"]");
					if (!list) return null;
					const rows = list.querySelectorAll("[role=\"treeitem\"]");
					let wsRow = null;
					let found = false;
					for (const row of rows) {
						if (row.getAttribute("aria-expanded") !== null) {
							wsRow = row;
						} else if (row.getAttribute("aria-selected") === "true") {
							found = true;
							break;
						}
					}
					if (!found || !wsRow) return null;
					const children = wsRow.children;
					for (let i = 0; i < children.length; i++) {
						const text = (children[i].textContent || "").trim();
						if (text === "") continue;
						for (const w of state.workspaces) {
							if (w.title && w.title.trim() === text) return w.path;
						}
						return null;
					}
					return null;
				} catch (err) {
					return null;
				}
			}
			function onHeaderDown(e) {
				if (state.dock !== "float") return;
				if (e.button !== 0) return;
				const t = e.target;
				if (t && t.closest && t.closest("button")) return;
				e.preventDefault();
				const cur = state.pos || { left: window.innerWidth - 424, top: 96 };
				drag = { startX: e.clientX, startY: e.clientY, originLeft: cur.left, originTop: cur.top };
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onHeaderMove(e) {
				if (!drag) return;
				const left = Math.min(Math.max(drag.originLeft + e.clientX - drag.startX, 8), window.innerWidth - 408);
				const top = Math.min(Math.max(drag.originTop + e.clientY - drag.startY, 8), window.innerHeight - 48);
				state.pos = { left: left, top: top };
				if (panelEl) {
					panelEl.style.left = left + "px";
					panelEl.style.top = top + "px";
				}
			}
			function onHeaderUp(e) {
				if (!drag) return;
				const left = Math.min(Math.max(drag.originLeft + e.clientX - drag.startX, 8), window.innerWidth - 408);
				const top = Math.min(Math.max(drag.originTop + e.clientY - drag.startY, 8), window.innerHeight - 48);
				state.pos = { left: left, top: top };
				writeJson(POS_KEY, { left: left, top: top });
				drag = null;
			}
			function applyOpen() {
				for (const el of btnEls.values()) el.classList.toggle("fexp-active", state.open);
				if (panelEl) panelEl.style.display = state.open ? "flex" : "none";
			}
			function mountButton(id) {
				return (el) => {
					if (el) btnEls.set(id, el);
					else btnEls.delete(id);
					applyOpen();
				};
			}
			function mountHost(el) {
				hostEl = el;
				if (el) {
					try {
						buildPanel();
					} catch (err) {
						console.error("[dsh-file-explorer] buildPanel failed:", err);
					}
				}
			}
			function mountFloat(el) {
				if (!el) return;
				floatEl = el;
				const saved = readJson(FLOAT_KEY);
				if (saved) {
					el.style.left = saved.left + "px";
					el.style.top = saved.top + "px";
				}
				let d = null;
				let moved = false;
				el.addEventListener("pointerdown", (e) => {
					if (e.button !== 0) return;
					e.preventDefault();
					moved = false;
					const cur = { left: parseFloat(el.style.left) || 296, top: parseFloat(el.style.top) || 200 };
					d = { startX: e.clientX, startY: e.clientY, originLeft: cur.left, originTop: cur.top };
					try { el.setPointerCapture(e.pointerId); } catch (err) {}
				});
				el.addEventListener("pointermove", (e) => {
					if (!d) return;
					const dx = e.clientX - d.startX;
					const dy = e.clientY - d.startY;
					if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
					const left = Math.min(Math.max(d.originLeft + dx, 0), window.innerWidth - 52);
					const top = Math.min(Math.max(d.originTop + dy, 0), window.innerHeight - 52);
					el.style.left = left + "px";
					el.style.top = top + "px";
				});
				el.addEventListener("pointerup", (e) => {
					if (!d) return;
					const left = Math.min(Math.max(d.originLeft + e.clientX - d.startX, 0), window.innerWidth - 52);
					const top = Math.min(Math.max(d.originTop + e.clientY - d.startY, 0), window.innerHeight - 52);
					writeJson(FLOAT_KEY, { left: left, top: top });
					const wasDrag = moved;
					d = null;
					if (!wasDrag) toggleOpen();
				});
				el.addEventListener("pointercancel", () => { d = null; });
				btnEls.set("float", el);
				applyFloat();
				applyOpen();
			}
			function toggleOpen() {
				state.open = !state.open;
				applyOpen();
			}

			// --- v1.3: context menu, inline input, clipboard actions ---
			const NEW_FILE_TEMPLATES = {
				txt: "",
				md: "# 标题\n\n正文…\n",
				py: "#!/usr/bin/env python3\n# -*- coding: utf-8 -*-\n\ndef main():\n    pass\n\n\nif __name__ == \"__main__\":\n    main()\n",
				js: "// JavaScript\n",
				json: "{}\n",
				ts: "// TypeScript\n",
				html: "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>页面</title>\n</head>\n<body>\n\n</body>\n</html>\n",
				css: "/* CSS */\n"
			};
			function menuItem(label, icon, onClick, disabled) {
				const item = document.createElement("div");
				item.className = "fexp-menu-item" + (disabled ? " fexp-disabled" : "");
				if (disabled) return item;
				const ic = document.createElement("span");
				ic.className = "fexp-menu-ic";
				ic.textContent = icon || "";
				const lab = document.createElement("span");
				lab.className = "fexp-menu-label";
				lab.textContent = label;
				item.appendChild(ic);
				item.appendChild(lab);
				item.addEventListener("click", () => {
					closeMenu();
					onClick();
				});
				return item;
			}
			function menuSep() {
				const sep = document.createElement("div");
				sep.className = "fexp-menu-sep";
				return sep;
			}
			function closeMenu() {
				if (menuEl) { menuEl.remove(); menuEl = null; }
				if (submenuEl) { submenuEl.remove(); submenuEl = null; }
				state.menu = null;
			}
			function closeSubmenu() {
				if (submenuEl) { submenuEl.remove(); submenuEl = null; }
			}
			function openSubmenu(parentItem, x, y, items) {
				closeSubmenu();
				const el = document.createElement("div");
				el.className = "fexp-menu-sub";
				for (const it of items) el.appendChild(it);
				el.style.left = x + "px";
				el.style.top = y + "px";
				document.body.appendChild(el);
				submenuEl = el;
				const rect = el.getBoundingClientRect();
				if (rect.right > window.innerWidth - 4) el.style.left = Math.max(4, x - rect.width) + "px";
				if (rect.bottom > window.innerHeight - 4) el.style.top = Math.max(4, y - rect.height) + "px";
			}
			function onContextMenu(ev, path, type, name) {
				ev.preventDefault();
				ev.stopPropagation();
				closeMenu();
				closeEditor();
				lastMenuPos = { x: ev.clientX, y: ev.clientY };
				state.menu = { x: ev.clientX, y: ev.clientY, path: path, type: type, name: name };
				const el = document.createElement("div");
				el.className = "fexp-menu";
				el.style.left = ev.clientX + "px";
				el.style.top = ev.clientY + "px";
				const items = [];
				if (type === "dir") {
					items.push(menuItem("新建文件…", "📄", () => startCreateInput(path, "file")));
					items.push(menuItem("新建文件夹…", "📁", () => startCreateInput(path, "dir")));
					items.push(menuSep());
					items.push(menuItem("粘贴", "📋", () => pasteInto(path), state.clipboard === null));
					items.push(menuSep());
					items.push(menuItem("重命名…", "✏️", () => startRenameInput(path, type, name)));
					items.push(menuItem("复制", "⧉", () => setClipboard(path, type)));
					items.push(menuItem("复制绝对路径", "🔗", () => copyText(path)));
					items.push(menuItem("复制相对路径", "↗️", () => copyText(relativeToRoot(path))));
				} else {
					items.push(menuItem("粘贴到此处", "📋", () => pasteInto(parentDir(path) || state.root || path), state.clipboard === null));
					items.push(menuItem("重命名…", "✏️", () => startRenameInput(path, type, name)));
					items.push(menuItem("复制", "⧉", () => setClipboard(path, type)));
					items.push(menuItem("复制绝对路径", "🔗", () => copyText(path)));
					items.push(menuItem("复制相对路径", "↗️", () => copyText(relativeToRoot(path))));
				}
				for (const it of items) if (it) el.appendChild(it);
				document.body.appendChild(el);
				menuEl = el;
				const rect = el.getBoundingClientRect();
				if (rect.right > window.innerWidth - 4) el.style.left = Math.max(4, ev.clientX - rect.width) + "px";
				if (rect.bottom > window.innerHeight - 4) el.style.top = Math.max(4, ev.clientY - rect.height) + "px";
			}
			function setClipboard(path, type) {
				state.clipboard = { path: path, type: type };
				writeClipboard();
				renderTree();
				showToast("已复制" + (type === "dir" ? "文件夹" : "文件") + "：可在目标目录右键粘贴");
			}
			function pasteInto(dirPath) {
				const clip = state.clipboard;
				if (!clip || !clip.path) return;
				if (clip.path.toLowerCase() === dirPath.toLowerCase()) {
					showToast("不能粘贴到自身所在目录");
					return;
				}
				remote().fsCopy(clip.path, dirPath).then((res) => {
					state.clipboard = null;
					writeClipboard();
					renderTree();
					refreshDirOf(dirPath);
					showToast("已粘贴到 " + dirPath);
				}).catch((err) => {
					showToast("粘贴失败：" + ((err && err.message) || err));
				});
			}
			function startRenameInput(path, type, name) {
				openInlineInput({
					x: 0, y: 0,
					value: name,
					placeholder: "新名称",
					kind: "rename",
					onCommit: (value) => {
						const v = value.trim();
						if (!v) return;
						const parent = parentDir(path);
						const target = parent ? joinPath(parent, v) : v;
						if (target.toLowerCase() === path.toLowerCase()) return;
						remote().fsRename(path, target).then(() => {
							renderTree();
							refreshDirOf(path);
							showToast("已重命名");
						}).catch((err) => {
							showToast("重命名失败：" + ((err && err.message) || err));
						});
					}
				});
			}
			function startCreateInput(dirPath, type) {
				const ext = type === "dir" ? "" : ".txt";
				openInlineInput({
					x: 0, y: 0,
					value: type === "dir" ? "" : "新建文件" + ext,
					placeholder: type === "dir" ? "文件夹名称" : "文件名（如 a.txt、b.py）",
					kind: "create:" + type,
					onCommit: (value) => {
						const v = value.trim();
						if (!v) return;
						const target = joinPath(dirPath, v);
						const content = type === "dir" ? "" : templateFor(v);
						remote().fsCreate(target, type, content).then(() => {
							if (type === "file" && state.root && target.toLowerCase().startsWith(state.root.toLowerCase())) {
								state.expanded.add(dirPath);
							}
							renderTree();
							refreshDirOf(dirPath);
							showToast((type === "dir" ? "已创建文件夹 " : "已创建文件 ") + v);
						}).catch((err) => {
							showToast("创建失败：" + ((err && err.message) || err));
						});
					}
				});
			}
			function templateFor(name) {
				const dot = name.lastIndexOf(".");
				if (dot < 0) return "";
				const ext = name.slice(dot + 1).toLowerCase();
				return NEW_FILE_TEMPLATES[ext] !== undefined ? NEW_FILE_TEMPLATES[ext] : "";
			}
			function openInlineInput(opts) {
				const anchor = lastMenuPos;
				closeMenu();
				closeInputHost();
				const host = document.createElement("div");
				host.className = "fexp-input-host";
				const input = document.createElement("input");
				input.className = "fexp-input";
				input.value = opts.value || "";
				input.placeholder = opts.placeholder || "";
				input.spellcheck = false;
				host.appendChild(input);
				document.body.appendChild(host);
				inputHostEl = host;
				host.style.left = Math.max(8, Math.min(anchor ? anchor.x : window.innerWidth / 2 - 80, window.innerWidth - 220)) + "px";
				host.style.top = Math.max(8, Math.min(anchor ? anchor.y + 8 : 120, window.innerHeight - 56)) + "px";
				host.style.width = "200px";
				const commit = () => {
					const v = input.value;
					closeInputHost();
					if (opts.onCommit) opts.onCommit(v);
				};
				const cancel = () => closeInputHost();
				input.addEventListener("keydown", (ev) => {
					if (ev.key === "Enter") { ev.preventDefault(); commit(); }
					else if (ev.key === "Escape") { ev.preventDefault(); cancel(); }
				});
				input.addEventListener("blur", () => {
					setTimeout(() => { closeInputHost(); }, 120);
				});
				input.addEventListener("contextmenu", (ev) => ev.stopPropagation());
				requestAnimationFrame(() => { try { input.focus(); input.select(); } catch (err) {} });
			}
			function closeInputHost() {
				if (inputHostEl) { inputHostEl.remove(); inputHostEl = null; }
			}
			function closeAllOverlays() {
				closeMenu();
				closeInputHost();
				closeSubmenu();
			}

			ctx.effect(function globalOverlayHandlers() {
				const onDocClick = (ev) => {
					if (menuEl && !menuEl.contains(ev.target) && (!submenuEl || !submenuEl.contains(ev.target)) && (!inputHostEl || !inputHostEl.contains(ev.target))) {
						closeAllOverlays();
					}
				};
				const onDocKey = (ev) => {
					if (ev.key === "Escape") {
						if (menuEl || inputHostEl) { closeAllOverlays(); ev.preventDefault(); return; }
						if (state.editing) { closeEditor(); renderPreview(); }
					}
					if (ev.key === "s" && (ev.ctrlKey || ev.metaKey) && state.editing) {
						// handled by textarea keydown; nothing extra needed
					}
				};
				document.addEventListener("click", onDocClick, true);
				document.addEventListener("keydown", onDocKey, true);
				return () => {
					document.removeEventListener("click", onDocClick, true);
					document.removeEventListener("keydown", onDocKey, true);
				};
			});

			ctx.effect(function followLoop() {
				const id = window.setInterval(() => {
					if (state.dock === "middle" && panelEl) {
						const w = sidebarWidth();
						panelEl.style.left = w + "px";
					}
					ensureWsList().then(() => {
						const domPath = probeActiveWorkspacePath();
						if (domPath !== null) {
							switchRoot(domPath);
							return;
						}
						remote().wsRoot().then((res) => {
							const candidate = res && typeof res.root === "string" && res.root !== "" ? res.root : null;
							if (candidate && candidate !== state.root) {
								switchRoot(candidate);
							}
						}).catch(() => {});
					});
				}, 800);
				return () => window.clearInterval(id);
			});

			ctx.effect(function registerSlots() {
				const slotsService = slots;
				return slotsService.inject("conversation.session.header.utilities", () => slotsService.register(
					{ name: "conversation.session.header.utilities", id: "file-explorer-main", order: 10, label: "文件浏览器" },
					() => React.createElement("button", {
						ref: mountButton("header"),
						onClick: toggleOpen,
						className: "fexp-toggle fexp-toggle-wide",
						title: "文件浏览器"
					}, "📁 文件")
				));
			});
			ctx.effect(function registerOverlay() {
				const slotsService = slots;
				return slotsService.inject("shell.overlay", () => slotsService.register(
					{ name: "shell.overlay", id: "file-explorer-panel", order: 0 },
					() => React.createElement("div", { ref: mountHost, className: "fexp-host" })
				));
			});
			ctx.effect(function registerFloat() {
				const slotsService = slots;
				return slotsService.inject("shell.overlay", () => slotsService.register(
					{ name: "shell.overlay", id: "file-explorer-float", order: 1 },
					() => React.createElement("button", {
						ref: mountFloat,
						className: "fexp-float",
						title: "文件浏览器（可拖动）"
					}, "📁")
				));
			});
		}

		const inject = ["slots", "remote"];

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
