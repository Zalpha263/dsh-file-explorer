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
.fexp-toggle:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.16)); }
.fexp-toggle.fexp-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 28%, transparent); }
.fexp-toggle-wide { min-width: 64px; padding: 0 10px; }
.fexp-panel { position: fixed; width: 400px; max-width: calc(100vw - 24px); height: min(640px, 78vh); display: flex; flex-direction: column; background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.35)); border-radius: 12px; box-shadow: var(--dsw-shadow-lv3, 0 10px 40px rgba(0,0,0,.28)); overflow: hidden; pointer-events: auto; z-index: 2147483000; font-size: 14px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; cursor: move; user-select: none; font-weight: 600; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-header-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-x { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; padding: 0; border: none; background: transparent; cursor: pointer; border-radius: 6px; color: inherit; }
.fexp-x:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-dockbtn { border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); background: transparent; color: inherit; border-radius: 5px; padding: 1px 6px; font-size: 12px; cursor: pointer; }
.fexp-dockbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-dockbtn.fexp-on { background: var(--dsw-alias-interactive-bg-hover, rgba(90,140,255,.25)); }
.fexp-toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-tbtn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); background: transparent; color: inherit; border-radius: 8px; padding: 3px 10px; font-size: 13px; line-height: 1.5; cursor: pointer; transition: background var(--ds-transition-duration, .2s) var(--ds-ease-in-out, ease), border-color var(--ds-transition-duration, .2s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration, .2s) var(--ds-ease-in-out, ease); }
.fexp-tbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-tbtn.fexp-on { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-tbtn-ic { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; font-size: 14px; line-height: 1; flex: none; }
.fexp-tree { flex: 1; overflow: auto; padding: 4px 0; min-height: 0; }
.fexp-row { display: flex; align-items: center; gap: 4px; padding: 2px 8px; cursor: pointer; white-space: nowrap; border-radius: 4px; }
.fexp-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-caret { width: 14px; flex: none; font-size: 11px; opacity: .7; }
.fexp-ic { flex: none; font-size: 14px; }
.fexp-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.fexp-size { flex: none; opacity: .6; font-size: 12px; margin-left: 6px; }
.fexp-err { color: var(--dsw-alias-state-error-primary, #d33); cursor: default; }
.fexp-dim { opacity: .55; }
.fexp-splitter { height: 6px; flex: none; cursor: row-resize; z-index: 5; }
.fexp-splitter:hover, .fexp-splitter.fexp-splitter-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 35%, transparent); }
.fexp-preview { flex: none; height: 260px; min-height: 60px; display: flex; flex-direction: column; border-top: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-phead { display: flex; align-items: center; gap: 6px; padding: 6px 10px; font-size: 13px; font-weight: 600; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.15)); }
.fexp-pname { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-pre { flex: 1; overflow: auto; margin: 0; padding: 8px 10px; font-family: Consolas, 'Cascadia Code', monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; tab-size: 4; }
.fexp-pbody { flex: 1; overflow: auto; padding: 8px 10px; }
.fexp-row.fexp-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 18%, transparent); }
.fexp-grip { position: absolute; z-index: 6; }
.fexp-grip-n { top: 0; left: 10px; right: 10px; height: 6px; cursor: n-resize; }
.fexp-grip-s { bottom: 0; left: 10px; right: 10px; height: 6px; cursor: s-resize; }
.fexp-grip-e { right: 0; top: 10px; bottom: 10px; width: 6px; cursor: e-resize; }
.fexp-grip-w { left: 0; top: 10px; bottom: 10px; width: 6px; cursor: w-resize; }
.fexp-grip-nw { top: 0; left: 0; width: 12px; height: 12px; cursor: nwse-resize; }
.fexp-grip-ne { top: 0; right: 0; width: 12px; height: 12px; cursor: nesw-resize; }
.fexp-grip-sw { bottom: 0; left: 0; width: 12px; height: 12px; cursor: nesw-resize; }
.fexp-grip-se { bottom: 0; right: 0; width: 12px; height: 12px; cursor: nwse-resize; }
.fexp-grip:hover, .fexp-grip.fexp-grip-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 35%, transparent); }
.fexp-panel.fexp-narrow .fexp-size { display: none; }
/* --- v1.3: editing + context menu --- */
.fexp-editbtn { border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); background: transparent; color: inherit; border-radius: 5px; padding: 1px 6px; font-size: 12px; cursor: pointer; }
.fexp-editbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-editbtn.fexp-on { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 25%, transparent); }
.fexp-editor { flex: 1; display: flex; flex-direction: column; min-height: 0; border-top: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-editor-bar { display: flex; align-items: center; gap: 6px; padding: 5px 10px; font-size: 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.15)); }
.fexp-editor-bar .fexp-dim { flex: 1; }
.fexp-editor textarea { flex: 1; min-height: 0; margin: 0; padding: 8px 10px; border: none; outline: none; resize: none; background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-label-primary, #1f2328); font-family: Consolas, 'Cascadia Code', monospace; font-size: 12px; line-height: 1.5; white-space: pre; overflow: auto; tab-size: 4; }
.fexp-menu { position: fixed; min-width: 168px; max-width: 280px; background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.35)); border-radius: 8px; box-shadow: var(--dsw-shadow-lv3, 0 6px 24px rgba(0,0,0,.28)); padding: 4px; z-index: 2147483100; pointer-events: auto; font-size: 13px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-menu-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 5px; cursor: pointer; white-space: nowrap; }
.fexp-menu-item:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 22%, transparent); }
.fexp-menu-item.fexp-disabled { opacity: .45; cursor: default; }
.fexp-menu-item.fexp-disabled:hover { background: transparent; }
.fexp-menu-item.fexp-danger { color: var(--dsw-alias-state-error-primary, #e5484d); }
.fexp-menu-item.fexp-danger:hover { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 16%, transparent); }
.fexp-menu-sep { height: 1px; margin: 4px 6px; background: var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-menu-ic { width: 16px; text-align: center; flex: none; }
.fexp-menu-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.fexp-input-host { position: fixed; z-index: 2147483102; pointer-events: auto; }
.fexp-input { box-sizing: border-box; width: 100%; padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 80%, transparent); border-radius: 5px; outline: none; background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-label-primary, #1f2328); font-size: 13px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); max-width: 70vw; padding: 8px 16px; border-radius: 8px; background: rgba(30,30,34,.92); color: #f2f2f2; font-size: 13px; z-index: 2147483200; pointer-events: none; box-shadow: 0 4px 16px rgba(0,0,0,.3); }
.fexp-editing-row { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 14%, transparent); }
.fexp-row.fexp-clipboard-src { outline: 1px dashed color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 60%, transparent); outline-offset: -1px; }
/* --- v1.5: drag & drop --- */
.fexp-row.fexp-dragging { opacity: .45; }
.fexp-row.fexp-drop-target, .fexp-tree.fexp-drop-target { outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 70%, transparent); outline-offset: -1px; background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 12%, transparent); }
.fexp-tree.fexp-drop-target { outline-offset: 0; border-radius: 6px; }
/* --- v1.6: ui-beautify card-mode host integration ---
   Inside the dock host (tabbed card / floating glass window) the panel
   fills its container and inherits the card chrome (background, border,
   radius, shadow) — only the inner explorer layout stays. */
.fexp-panel.fexp-hostpanel { position: static; width: 100%; height: 100%; max-width: none; border: none; border-radius: 0; box-shadow: none; background: transparent; }
.fexp-panel.fexp-hostpanel .fexp-header { cursor: default; }
.fexp-panel.fexp-hostpanel .fexp-grip { display: none; }
/* ============================================================
   v1.9.0：HIG 风格体系（全平台统一）
   字体 / 圆角间距 / 深浅色材质 / 图标 / 动效 —— Apple HIG 语义，
   全部经由 --dsw-alias-* 变量适配当前主题。
   ============================================================ */
.fexp-panel, .fexp-menu, .fexp-input, .fexp-help, .fexp-toast { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Microsoft YaHei", sans-serif; }
.fexp-code-font, .fexp-linenums, .fexp-cline, .fexp-codeview textarea, .fexp-md-code code, .fexp-pre { font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Cascadia Code", monospace; font-size: 13px; line-height: 20px; }
/* --- 搜索条（树顶部，胶囊） --- */
.fexp-searchbar { display: flex; align-items: center; gap: 6px; margin: 6px 10px 2px; padding: 0 10px; height: 30px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); flex: none; transition: border-color 150ms ease-out, box-shadow 150ms ease-out; }
.fexp-searchbar:focus-within { border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent); }
.fexp-searchbar input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.fexp-searchbar input::placeholder { color: var(--dsw-alias-label-tertiary); }
.fexp-search-clear { appearance: none; border: none; background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; display: inline-flex; padding: 2px; border-radius: 6px; flex: none; }
.fexp-search-clear:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.fexp-search-count { font-size: 11px; color: var(--dsw-alias-label-tertiary); flex: none; font-variant-numeric: tabular-nums; }
.fexp-search-ic { color: var(--dsw-alias-label-tertiary); flex: none; display: inline-flex; }
/* 匹配子串高亮 */
.fexp-mark { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 32%, transparent); color: inherit; border-radius: 3px; padding: 0 1px; }
/* 空状态 */
.fexp-empty { padding: 14px 12px; color: var(--dsw-alias-label-tertiary); font-size: 12px; text-align: center; }
/* --- 代码/文本视图：行号列 + 内容列 --- */
.fexp-codeview { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.fexp-code-head { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); flex: none; }
.fexp-code-head .fexp-meta { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-code-scroll { display: flex; flex: 1; min-height: 0; overflow: auto; position: relative; }
.fexp-linenums { flex: none; min-width: 44px; padding: 8px 8px 8px 0; text-align: right; color: var(--dsw-alias-label-tertiary); user-select: none; }
.fexp-codelines { flex: 1; min-width: 0; padding: 8px 12px 8px 0; }
.fexp-cline { white-space: pre-wrap; overflow-wrap: anywhere; min-height: 20px; color: var(--dsw-alias-label-primary); }
.fexp-cline.fexp-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); border-radius: 4px; }
.fexp-overlong { opacity: 1; }
.fexp-overlong-mark { color: var(--dsw-alias-label-tertiary); font-style: italic; font-size: 11px; }
.fexp-more { display: flex; justify-content: center; padding: 6px 0 10px; flex: none; }
/* --- Markdown 富文本视图 --- */
.fexp-mdview { flex: 1; min-height: 0; overflow: auto; display: flex; justify-content: center; }
.fexp-md-body { max-width: 760px; width: 100%; padding: 14px 24px 28px; font-size: 14px; line-height: 1.7; color: var(--dsw-alias-label-primary); }
.fexp-md-body h1 { font-size: 22px; font-weight: 700; line-height: 1.3; margin: 20px 0 10px; }
.fexp-md-body h2 { font-size: 18px; font-weight: 600; line-height: 1.35; margin: 18px 0 8px; }
.fexp-md-body h3 { font-size: 15px; font-weight: 600; line-height: 1.4; margin: 14px 0 6px; }
.fexp-md-body p { margin: 8px 0; }
.fexp-md-body ul, .fexp-md-body ol { margin: 8px 0; padding-left: 22px; }
.fexp-md-body li { margin: 3px 0; }
.fexp-md-body blockquote { margin: 10px 0; padding: 2px 14px; border-left: 3px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); }
.fexp-md-body table { border-collapse: collapse; margin: 10px 0; font-size: 13px; }
.fexp-md-body th, .fexp-md-body td { border: 1px solid var(--dsw-alias-border-l1); padding: 5px 10px; text-align: left; }
.fexp-md-body th { background: var(--dsw-alias-bg-layer-1); font-weight: 600; }
.fexp-md-body code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Cascadia Code", monospace; font-size: 12.5px; background: var(--dsw-alias-bg-layer-1); border-radius: 5px; padding: 1px 4px; }
.fexp-md-body pre { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 12px; overflow: auto; position: relative; margin: 10px 0; }
.fexp-md-body pre code { background: transparent; padding: 0; border-radius: 0; font-size: 13px; line-height: 1.6; display: block; }
.fexp-md-body a { color: var(--dsw-alias-brand-primary); text-decoration: none; }
.fexp-md-body a:hover { text-decoration: underline; }
.fexp-md-body hr { border: none; border-top: 1px solid var(--dsw-alias-border-l1); margin: 16px 0; }
.fexp-md-body input[type="checkbox"] { accent-color: var(--dsw-alias-brand-primary); margin-right: 6px; }
.fexp-md-imgph { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.fexp-md-copy { position: absolute; top: 6px; right: 6px; appearance: none; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); border-radius: 8px; padding: 2px 8px; font-size: 11px; line-height: 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; opacity: 0; transition: opacity 150ms ease-out; }
.fexp-md-body pre:hover .fexp-md-copy { opacity: 1; }
.fexp-md-copy:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-label-dimmed); }
/* TOC */
.fexp-toc { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); margin: 12px 0; font-size: 13px; }
.fexp-toc-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; color: var(--dsw-alias-label-secondary); font-weight: 600; }
.fexp-toc-head:hover { background: var(--dsw-alias-interactive-bg-hover); border-radius: 10px; }
.fexp-toc-list { padding: 2px 12px 10px; display: flex; flex-direction: column; gap: 2px; }
.fexp-toc-item { appearance: none; border: none; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; text-align: left; padding: 3px 8px; border-radius: 6px; cursor: pointer; line-height: 1.5; }
.fexp-toc-item:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fexp-toc-item.l2 { padding-left: 20px; }
.fexp-toc-item.l3 { padding-left: 32px; font-size: 12px; }
/* --- 预览头按钮（HIG 分段控件风格） --- */
.fexp-pbtn { appearance: none; font: inherit; border: none; background: transparent; color: var(--dsw-alias-label-secondary); border-radius: 8px; padding: 3px 10px; font-size: 12px; line-height: 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; min-height: 24px; }
.fexp-pbtn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fexp-pbtn.fexp-on { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent); color: var(--dsw-alias-brand-primary); font-weight: 600; }
.fexp-pbtn-group { display: inline-flex; gap: 2px; padding: 2px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; }
.fexp-pbtn-ic { display: inline-flex; }
/* --- 帮助浮层 --- */
.fexp-help { position: fixed; z-index: 2147483300; width: 360px; max-width: calc(100vw - 24px); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 86%, transparent); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: var(--dsw-shadow-lv3, 0 10px 40px rgba(0,0,0,.28)); color: var(--dsw-alias-label-primary); padding: 14px 16px; font-size: 13px; animation: fexp-pop 180ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fexp-pop { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: none; } }
.fexp-help h3 { margin: 0 0 8px; font-size: 14px; font-weight: 700; }
.fexp-help-head { cursor: move; user-select: none; font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
.fexp-help-head::after { content: "⠿"; color: var(--dsw-alias-label-tertiary); font-size: 12px; cursor: move; }
.fexp-help table { width: 100%; border-collapse: collapse; }
.fexp-help td { padding: 3px 0; vertical-align: top; }
.fexp-help td:first-child { color: var(--dsw-alias-label-secondary); white-space: nowrap; padding-right: 14px; font-variant-numeric: tabular-nums; }
.fexp-help .kbd { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); border-radius: 5px; padding: 1px 5px; }
.fexp-help-close { margin-top: 10px; width: 100%; }
/* --- HIG 按钮统一样式（覆盖旧按钮） --- */
.fexp-btn { appearance: none; font: inherit; cursor: pointer; color: var(--dsw-alias-label-primary); background: transparent; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 3px 12px; font-size: 12px; line-height: 20px; min-height: 28px; transition: background 150ms ease-out, border-color 150ms ease-out; }
.fexp-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.fexp-btn:disabled { opacity: .5; cursor: default; }
.fexp-btn-primary { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
/* 行号/文本视图的编辑区 */
.fexp-editor-bar .fexp-btn { min-height: 24px; padding: 1px 8px; }
/* --- hljs 配色：亮色（github 风格） --- */
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs { color: #24292f; background: transparent; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-keyword, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-selector-tag, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-literal, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-meta .hljs-keyword, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-doctag { color: #cf222e; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-string, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-regexp, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-addition, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-attribute { color: #0a3069; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-number, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-symbol { color: #0550ae; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-comment, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-quote { color: #6e7781; font-style: italic; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-title, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-title.function_, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-section { color: #8250df; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-title.class_, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-type { color: #953800; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-built_in, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-params { color: #953800; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-variable, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-template-variable { color: #24292f; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-attr, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-attribute { color: #0550ae; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-deletion { color: #82071e; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-meta { color: #0550ae; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-emphasis { font-style: italic; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-strong { font-weight: 600; }
/* --- hljs 配色：暗色（github-dark 风格） --- */
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs { color: #c9d1d9; background: transparent; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-keyword, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-selector-tag, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-literal, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-doctag { color: #ff7b72; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-string, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-regexp, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-addition { color: #a5d6ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-number, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-symbol { color: #79c0ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-comment, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-quote { color: #8b949e; font-style: italic; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-title, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-section { color: #d2a8ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-title.class_, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-type { color: #ffa657; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-built_in, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-params { color: #ffa657; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-attr { color: #79c0ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-attribute { color: #ffa657; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-deletion { color: #ffa198; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-meta { color: #79c0ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-emphasis { font-style: italic; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-strong { font-weight: 600; }
/* ============================================================
   v1.9.1：预览独立卡片（浮动窗，面板内预览区退役）
   ============================================================ */
.fexp-preview-card { position: fixed; z-index: 2147483400; display: flex; flex-direction: column; min-width: 480px; min-height: 320px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 88%, transparent); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; box-shadow: var(--dsw-shadow-lv3, 0 12px 48px rgba(0,0,0,.32)); overflow: hidden; animation: fexp-card-in 180ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fexp-card-in { from { opacity: 0; transform: scale(0.97) translateY(6px); } to { opacity: 1; transform: none; } }
.fexp-preview-card.fexp-maximized { border-radius: 0; }
.fexp-preview-card .fexp-phead { cursor: move; flex: none; }
.fexp-preview-card .fexp-card-grip { position: absolute; z-index: 6; }
/* 边条（6px 宽，避开圆角） */
.fexp-card-grip-n { left: 12px; right: 12px; top: 0; height: 6px; cursor: ns-resize; }
.fexp-card-grip-s { left: 12px; right: 12px; bottom: 0; height: 6px; cursor: ns-resize; }
.fexp-card-grip-e { top: 12px; bottom: 12px; right: 0; width: 8px; cursor: ew-resize; }
.fexp-card-grip-w { top: 12px; bottom: 12px; left: 0; width: 8px; cursor: ew-resize; }
/* 角块 */
.fexp-card-grip-se { right: 0; bottom: 0; width: 18px; height: 18px; cursor: nwse-resize; }
.fexp-card-grip-ne { right: 0; top: 0; width: 18px; height: 18px; cursor: nesw-resize; }
.fexp-card-grip-sw { left: 0; bottom: 0; width: 18px; height: 18px; cursor: nesw-resize; }
.fexp-card-grip-nw { left: 0; top: 0; width: 18px; height: 18px; cursor: nwse-resize; }
.fexp-card-grip:hover, .fexp-card-grip.fexp-grip-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent); border-radius: 4px; }
/* ============================================================
   v1.9.6：行视图 —— 原生 table 布局
   tr 高度 = max(td)：行号与内容天然同步；内容 pre-wrap 软换行
   撑高整行，行号锚定逻辑行首、不占新行号、绝无重叠。
   ============================================================ */
.fexp-linetable { border-collapse: collapse; width: 100%; table-layout: fixed; }
.fexp-linetable td { vertical-align: top; }
.fexp-linetable td.fexp-lineno { text-align: right; padding: 0 10px 0 0; color: var(--dsw-alias-label-tertiary); user-select: none; font-size: 12px; line-height: 20px; white-space: nowrap; box-sizing: border-box; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
.fexp-linetable td.fexp-cline { padding: 0 12px 0 8px; min-width: 0; }
`;

		// --- Pure helpers (no apply-scope state) ------------------------------
		// Everything here is side-effect free or touches only browser globals, so
		// it lives at factory level; apply() keeps only stateful helpers.

		// v1.9.0: SF Symbols 风格内联 SVG 图标库（stroke 1.6 圆头，24 视框）。
		// 替代 emoji 图标，保证全平台观感一致（HIG 图标规范）。
		const ICON_PATHS = {
			search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
			folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
			file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
			refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
			eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
			eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.7 3.7"/><path d="M6.6 6.6A16.7 16.7 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.6-1.1"/>',
			close: '<path d="M6 6l12 12M18 6L6 18"/>',
			help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8"/><path d="M12 17h.01"/>',
			copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
			check: '<path d="M4 12.5l5 5L20 6.5"/>',
			chevronRight: '<path d="M9 6l6 6-6 6"/>',
			chevronDown: '<path d="M6 9l6 6 6-6"/>',
			trash: '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/>',
			edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M13.5 6.5l3 3"/>',
			external: '<path d="M14 4h6v6"/><path d="M20 4L11 13"/><path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
			chevronUp: '<path d="M18 15l-6-6-6 6"/>',
			code: '<path d="M8 6L3 12l5 6"/><path d="M16 6l5 6-5 6"/><path d="M13 4l-2 16"/>',
			doc: '<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/>',
			text: '<path d="M4 6h16M4 12h16M4 18h10"/>',
			plus: '<path d="M12 5v14M5 12h14"/>',
		};
		/** 生成 SF Symbols 风格 SVG 字符串（供 innerHTML 使用）。 */
		function makeIcon(name, size) {
			const d = ICON_PATHS[name] || ICON_PATHS.doc;
			const s = size || 14;
			return '<svg class="fexp-ic-svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
		}
		/** 生成带图标的按钮元素（HIG 风格）。 */
		function iconBtn(icon, label, title, onClick, cls) {
			const b = document.createElement("button");
			b.className = "fexp-btn" + (cls ? " " + cls : "");
			b.title = title || label || "";
			b.type = "button";
			const ic = document.createElement("span");
			ic.className = "fexp-pbtn-ic";
			ic.innerHTML = makeIcon(icon, 13);
			b.appendChild(ic);
			if (label) {
				const t = document.createElement("span");
				t.textContent = label;
				b.appendChild(t);
			}
			if (onClick) b.addEventListener("click", onClick);
			return b;
		}

		// Directories hidden from the tree (dotfiles + noisy dependency dirs).
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

		// LocalStorage accessors — every read validates its shape and falls back
		// gracefully (storage can be unavailable or hold stale/corrupt values).
		const POS_KEY = "dsh-file-explorer:pos";
		const DOCK_KEY = "dsh-file-explorer:dock";
		const DWIDTH_KEY = "dsh-file-explorer:dwidth";
		const FWIDTH_KEY = "dsh-file-explorer:fwidth";
		const FHEIGHT_KEY = "dsh-file-explorer:fheight";
		const PSPLIT_KEY = "dsh-file-explorer:psplit";
		const CLIPBOARD_KEY = "dsh-file-explorer:clipboard";
		const PREVIEW_MODE_KEY = "dsh-file-explorer:preview-mode";
		/** v1.9.0: 按文件类型记忆上次预览模式（render/source/edit）。 */
		function readPreviewMode(kind) {
			try {
				const raw = window.localStorage.getItem(PREVIEW_MODE_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				const v = parsed && typeof parsed === "object" ? parsed[kind] : null;
				return v === "render" || v === "source" || v === "edit" ? v : null;
			} catch (err) { return null; }
		}
		function writePreviewMode(kind, mode) {
			try {
				const raw = window.localStorage.getItem(PREVIEW_MODE_KEY);
				const parsed = (() => { try { return raw ? JSON.parse(raw) : {}; } catch (err) { return {}; } })();
				parsed[kind] = mode;
				window.localStorage.setItem(PREVIEW_MODE_KEY, JSON.stringify(parsed));
			} catch (err) {}
		}
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
		function readClipboard() {
			try {
				const raw = window.localStorage.getItem(CLIPBOARD_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.path === "string" && (parsed.type === "file" || parsed.type === "dir")) return parsed;
				return null;
			} catch (err) { return null; }
		}

		// New-file content templates by extension (context-menu "新建文件…").
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
		function templateFor(name) {
			const dot = name.lastIndexOf(".");
			if (dot < 0) return "";
			const ext = name.slice(dot + 1).toLowerCase();
			return NEW_FILE_TEMPLATES[ext] !== undefined ? NEW_FILE_TEMPLATES[ext] : "";
		}

		// Named constants for magic numbers used across apply().
		const MIN_W = 200;            // minimum panel width while dragging grips
		const MIN_H = 180;            // minimum panel height while dragging grips
		const POLL_MS = 800;          // workspace-follow / dock-sync interval
		const TOAST_MS = 2600;        // toast lifetime
		const INPUT_BLUR_MS = 120;    // inline-input blur grace
		const MENU_Z = 2147483100;    // context menu stacking (above the classic panel)
		const INPUT_Z = 2147483102;   // inline input stacking
		const TOAST_Z = 2147483200;   // toast stacking

		/** DOM close icon — a 16-viewBox stroke SVG centers perfectly and
		 * inherits the text color (the ✕ text glyph rendered off-center). */
		function makeCloseIcon(size) {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("width", String(size));
			svg.setAttribute("height", String(size));
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("fill", "none");
			svg.setAttribute("aria-hidden", "true");
			svg.style.display = "block";
			const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", "M4 4 L12 12 M12 4 L4 12");
			p.setAttribute("stroke", "currentColor");
			p.setAttribute("stroke-width", "1.6");
			p.setAttribute("stroke-linecap", "round");
			svg.appendChild(p);
			return svg;
		}
		/** Context-menu separator row. */
		function menuSep() {
			const sep = document.createElement("div");
			sep.className = "fexp-menu-sep";
			return sep;
		}

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
					id: "dsh-file-explorer#fileExplorer/fsRender",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsRender",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRender:path") },
						{ name: "maxBytes", wire: "maxBytes", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRender:maxBytes") },
						{ name: "offsetChars", wire: "offsetChars", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRender:offsetChars") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsRender:result"),
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
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsDelete",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsDelete",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsDelete:path") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsDelete:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsMove",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsMove",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "from", wire: "from", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsMove:from") },
						{ name: "toDir", wire: "toDir", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsMove:toDir") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsMove:result"),
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
					fsRender: (path, maxBytes, offsetChars) => call("fsRender", path, maxBytes, offsetChars),
					fsWrite: (path, content, expectedVersion) => call("fsWrite", path, content, expectedVersion),
					fsCreate: (path, type, content) => call("fsCreate", path, type, content),
					fsRename: (from, to) => call("fsRename", from, to),
					fsCopy: (from, toDir) => call("fsCopy", from, toDir),
					fsDelete: (path) => call("fsDelete", path),
					fsMove: (from, toDir) => call("fsMove", from, toDir),
					wsRoot: () => call("wsRoot"),
					wsList: () => call("wsList")
				};
			}

			function joinPath(parent, name) {
				if (!parent) return name;
				const sep = pathSep();
				if (parent.endsWith("/") || parent.endsWith("\\")) return parent + name;
				return parent + sep + name;
			}
			function parentDir(p) {
				const parts = p.split(/[\\/]/).filter(Boolean);
				parts.pop();
				return parts.length > 0 ? parts.join(pathSep()) : null;
			}
			function relativeToRoot(p) {
				if (!state.root || typeof p !== "string") return p;
				const sep = pathSep();
				const rootNorm = state.root.replace(/[\\/]+$/, "");
				const pNorm = p.replace(/[\\/]+$/, "");
				const comparable = (s) => (state.platform === "win32" ? s.toLowerCase() : s);
				if (comparable(pNorm) === comparable(rootNorm)) return ".";
				if (comparable(pNorm).startsWith(comparable(rootNorm) + sep)) return pNorm.slice(rootNorm.length + 1);
				if (sep !== "\\" && comparable(pNorm).startsWith(comparable(rootNorm) + "\\")) return pNorm.slice(rootNorm.length + 1);
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
				}, TOAST_MS);
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
				platform: "win32",
				dock: readDock(),
				workspaces: [],
				cache: new Map(),
				expanded: new Set(),
				showHidden: false,
				preview: null,
				pos: readJson(POS_KEY),
				editing: null,       // { path, name, version, original, text } while the preview editor is open
				clipboard: readClipboard(),
				input: null,         // { x, y, width, value, placeholder, kind, onCommit } inline rename/create input
				search: { query: "", active: false, index: -1 } // v1.9.0 树内搜索状态
			};
			// --- Stateful helpers (depend on `state`/DOM refs; stay in apply) ---
			function writeClipboard() {
				try {
					window.localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(state.clipboard || { path: "", type: "file" }));
				} catch (err) {}
			}
			function pathSep() {
				return state.platform === "win32" ? "\\" : "/";
			}
			const inflight = new Set();
			const btnEls = new Map();
			const dockBtnEls = new Map();
			const grips = [];
			/* --- v1.6: ui-beautify card-mode host integration --- */
			const PANEL_ID = "file-explorer";
			let hostMode = false;         // dock host (ui-beautify) owns the panel surface
			let hostPanelActive = false;  // refs currently point into a mounted host panel
			let dockApiRef = undefined;   // optional `dock` service (ui-beautify)
			let dockDispose = null;       // registerPanel disposer
			let dockUnsub = null;         // subscribe disposer
			let standaloneRefs = null;    // captured classic-panel node refs for re-pointing
			/* v1.7: the header entry hides itself once the dock host takes over —
			   listeners let the React entry re-render when `dock` appears/unloads. */
			const entryListeners = new Set();
			function bumpEntryListeners() {
				for (const fn of [...entryListeners]) { try { fn(); } catch (err) {} }
			}
			let hostEl = null;
			let panelEl = null;
			let treeEl = null;
			let previewEl = null;
			let headerTitleEl = null;
			let hiddenBtn = null;
			let searchBarEl = null;   // v1.9.0 树内搜索条（buildPanelInto 重建）
			let searchInputEl = null;
			let searchCountEl = null;
			let drag = null;
			let gripDrag = null;
			let splitDrag = null;
			let wsListLoaded = false;
			let wsProbeBusy = false;   // v1.7.2: workspace-follow probe in flight
			let declinedFollowRoot = null; // v1.8.1: workspace the user declined (stop re-prompting)
			let menuEl = null;
			let inputHostEl = null;
			let toastEl = null;
			let toastTimer = null;
			let lastMenuPos = null;
			let dragSrcPath = null;
			let dropTargetEl = null;

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
			const DOCK_TOP_INSET = 76; // header: 12px pad-top + 32px titleRow + 4px margin + 27px tabs — pinned to 0.1.0-rc.6 bundles, verified for 0.1.0-rc.7

			function applyDock() {
				if (!panelEl) return;
				if (state.dock === "right") {
					const w = readWidth(DWIDTH_KEY, 400);
					panelEl.style.left = "";
					panelEl.style.right = "0px";
					panelEl.style.top = DOCK_TOP_INSET + "px";
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
					panelEl.style.top = DOCK_TOP_INSET + "px";
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
						/* v1.5.6: clamp the saved float position into the current viewport —
						 * a position saved under a larger window/display previously left
						 * the panel permanently off-screen (appeared as "cannot open"). */
						const p = clampFloatPos(state.pos.left, state.pos.top);
						panelEl.style.left = p.left + "px";
						panelEl.style.top = p.top + "px";
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
					return true;
				}
				/* Only block on unsaved edits while the editor is actually
				   visible — a closed panel keeps `state.editing` (by design, to
				   preserve the text across tab switches) but must not pop a
				   phantom native confirm on workspace follow. */
				const editorVisible = state.editing && panelEl && panelEl.isConnected && panelEl.offsetParent !== null;
				if (editorVisible) {
					const proceed = window.confirm("当前文件有未保存的编辑，切换工作区将丢失改动。确定继续吗？");
					if (!proceed) {
						/* v1.8.1: user declined — remember the target so the
						   periodic workspace-follow probe stops re-prompting
						   every poll interval until the workspace actually
						   changes. */
						declinedFollowRoot = path;
						return false;
					}
				}
				state.root = path;
				state.cache = new Map();
				state.expanded = new Set();
				state.preview = null;
				closeEditor();
				updateHeader();
				renderPreview();
				fetchDir(path);
				return true;
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
			const dirSeq = new Map();
			/* v1.7.2: cap the in-memory directory cache. Directory listings stay
			   cached per workspace; without a cap a long session browsing many
			   directories grows state.cache and dirSeq without bound. Eviction is
			   FIFO (oldest loaded first); an evicted directory simply re-fetches
			   ("加载中…") the next time it is expanded. File contents (preview /
			   editor) are never cached, so they are unaffected. */
			const CACHE_MAX = 300;
			function pruneCache() {
				while (state.cache.size > CACHE_MAX) {
					/* evict the oldest NON-in-flight entry (an in-flight fetch was
					   just inserted and its response is expected soon) */
					let victim = null;
					for (const key of state.cache.keys()) {
						if (!inflight.has(key)) { victim = key; break; }
					}
					if (victim === null) break;
					state.cache.delete(victim);
					dirSeq.delete(victim);
				}
			}
			function fetchDir(path) {
				if (inflight.has(path)) return;
				inflight.add(path);
				const seq = (dirSeq.get(path) || 0) + 1;
				dirSeq.set(path, seq);
				state.cache.set(path, { loading: true, entries: null, error: null });
				pruneCache();
				renderTree();
				remote().fsList(path).then((res) => {
					if (dirSeq.get(path) !== seq) return; // stale response, a newer fetch is in flight
					state.cache.set(path, { loading: false, entries: res.entries, error: null });
					renderTree();
				}).catch((err) => {
					if (dirSeq.get(path) !== seq) return;
					state.cache.set(path, { loading: false, entries: null, error: String((err && err.message) || err) });
					renderTree();
				}).finally(() => {
					if (dirSeq.get(path) === seq) inflight.delete(path);
				});
			}
			function rowEl(text, depth, cls) {
				const row = document.createElement("div");
				row.className = "fexp-row" + (cls ? " " + cls : "");
				row.style.paddingLeft = (8 + depth * 14) + "px";
				row.textContent = text;
				return row;
			}
			// ================= v1.9.0 树内搜索 =================
			// state.search = { query, active, index }；只过滤已加载节点
			// （目录层级保留：目录自身匹配或其下存在匹配后代才显示）。
			function searchMatches(name) {
				const q = state.search.query;
				return q === "" || name.toLowerCase().indexOf(q) !== -1;
			}
			/** 目录下是否存在匹配项（递归已加载缓存）。 */
			function dirHasMatch(dirPath) {
				const dir = state.cache.get(dirPath);
				if (!dir || !dir.entries) return false;
				return dir.entries.some((e) => {
					if (searchMatches(e.name)) return true;
					if (e.type === "directory" && dirHasMatch(e.path)) return true;
					return false;
				});
			}
			/** 文件名渲染：搜索激活时命中子串加 <mark> 高亮。 */
			function nameSpan(name) {
				const span = document.createElement("span");
				span.className = "fexp-name";
				if (state.search.active && state.search.query !== "") {
					const q = state.search.query;
					const lower = name.toLowerCase();
					const idx = lower.indexOf(q);
					if (idx >= 0) {
						const frag = document.createDocumentFragment();
						frag.appendChild(document.createTextNode(name.slice(0, idx)));
						const m = document.createElement("mark");
						m.className = "fexp-mark";
						m.textContent = name.slice(idx, idx + q.length);
						frag.appendChild(m);
						frag.appendChild(document.createTextNode(name.slice(idx + q.length)));
						span.appendChild(frag);
						return span;
					}
				}
				span.textContent = name;
				return span;
			}
			function updateSearchCount() {
				if (!searchCountEl) return;
				if (!state.search.active) { searchCountEl.textContent = ""; return; }
				const rows = treeEl ? treeEl.querySelectorAll(".fexp-row[data-path]") : [];
				searchCountEl.textContent = rows.length > 0 ? rows.length + " 个匹配" : "";
			}
			function moveSearchIndex(delta) {
				if (!treeEl) return;
				const rows = Array.from(treeEl.querySelectorAll(".fexp-row[data-path]"));
				if (rows.length === 0) return;
				state.search.index = (state.search.index + delta + rows.length) % rows.length;
				rows.forEach((r, i) => r.classList.toggle("fexp-active", i === state.search.index));
				const el = rows[state.search.index];
				if (el) el.scrollIntoView({ block: "nearest" });
			}
			function activateSearchIndex() {
				if (!treeEl) return;
				const rows = Array.from(treeEl.querySelectorAll(".fexp-row[data-path]"));
				const el = state.search.index >= 0 && state.search.index < rows.length ? rows[state.search.index] : rows[0];
				if (!el) return;
				const path = el.dataset.path;
				const type = el.dataset.type;
				if (type === "dir") {
					toggleDir(path);
					return;
				}
				const parent = parentDir(path);
				const list = parent ? state.cache.get(parent) : null;
				let entry = null;
				if (list && Array.isArray(list.entries)) {
					entry = list.entries.find((e) => e.path === path) || null;
				}
				openFile(entry || { path: path, name: baseName(path), size: null });
			}
			/** Ctrl+F 呼出搜索条并聚焦；Esc 关闭恢复全树。 */
			function focusSearch() {
				if (!searchBarEl) return;
				searchBarEl.style.display = "flex";
				const input = searchBarEl.querySelector("input");
				if (input) { input.focus(); if (state.search.query !== "") input.select(); }
			}
			function closeSearch() {
				state.search.query = "";
				state.search.active = false;
				state.search.index = -1;
				if (searchInputEl) searchInputEl.value = "";
				if (searchBarEl) searchBarEl.style.display = "none";
				renderTree();
			}
			/** 构建树顶部 HIG 风格搜索条（buildPanelInto 调用）。 */
			function buildSearchBar() {
				const bar = document.createElement("div");
				bar.className = "fexp-searchbar";
				bar.style.display = state.search.active ? "flex" : "none";
				const ic = document.createElement("span");
				ic.className = "fexp-search-ic";
				ic.innerHTML = makeIcon("search", 13);
				const input = document.createElement("input");
				input.type = "text";
				input.placeholder = "过滤文件名（Ctrl+F / Esc 关闭）";
				input.spellcheck = false;
				input.value = state.search.query;
				const clear = document.createElement("button");
				clear.className = "fexp-search-clear";
				clear.title = "清除";
				clear.innerHTML = makeIcon("close", 12);
				const count = document.createElement("span");
				count.className = "fexp-search-count";
				bar.appendChild(ic);
				bar.appendChild(input);
				bar.appendChild(count);
				bar.appendChild(clear);
				searchInputEl = input;
				searchCountEl = count;
				let timer = null;
				input.addEventListener("input", () => {
					window.clearTimeout(timer);
					timer = window.setTimeout(() => {
						state.search.query = input.value.trim().toLowerCase();
						state.search.active = state.search.query !== "";
						state.search.index = -1;
						renderTree();
						updateSearchCount();
					}, 120);
				});
				input.addEventListener("keydown", (ev) => {
					if (ev.key === "Escape") { ev.preventDefault(); closeSearch(); }
					else if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); moveSearchIndex(ev.key === "ArrowDown" ? 1 : -1); }
					else if (ev.key === "Enter") { ev.preventDefault(); activateSearchIndex(); }
					else if (ev.key === "ArrowRight") { ev.preventDefault(); if (state.root) toggleDir(state.root); }
				});
				clear.addEventListener("click", () => {
					state.search.query = "";
					state.search.active = false;
					state.search.index = -1;
					input.value = "";
					renderTree();
					updateSearchCount();
					input.focus();
				});
				return bar;
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
					if (state.search.active && !searchMatches(e.name) && !dirHasMatch(e.path)) continue;
					const isOpen = state.expanded.has(e.path);
					const row = document.createElement("div");
					row.className = "fexp-row fexp-dir" + (isOpen ? " fexp-open" : "") + (state.clipboard && state.clipboard.path === e.path ? " fexp-clipboard-src" : "");
					row.style.paddingLeft = (8 + depth * 14) + "px";
					row.title = e.path;
					row.dataset.path = e.path;
					row.dataset.type = "dir";
					const caret = document.createElement("span");
					caret.className = "fexp-caret";
					caret.innerHTML = makeIcon(isOpen ? "chevronDown" : "chevronRight", 11);
					const ic = document.createElement("span");
					ic.className = "fexp-ic";
					ic.innerHTML = makeIcon("folder", 13);
					const name = nameSpan(e.name);
					const size = document.createElement("span");
					size.className = "fexp-size";
					size.textContent = "/";
					row.appendChild(caret);
					row.appendChild(ic);
					row.appendChild(name);
					row.appendChild(size);
					row.addEventListener("click", () => toggleDir(e.path));
					row.addEventListener("contextmenu", (ev) => onContextMenu(ev, e.path, "dir", e.name));
					row.draggable = true;
					row.addEventListener("dragstart", (ev) => onDragStart(ev, e.path));
					row.addEventListener("dragend", onDragEnd);
					row.addEventListener("dragover", (ev) => onDragOver(ev, e.path));
					row.addEventListener("dragleave", (ev) => onDragLeave(ev));
					row.addEventListener("drop", (ev) => onDrop(ev, e.path));
					container.appendChild(row);
					if (isOpen) walkTree(container, e.path, depth + 1);
				}
				for (const e of files) {
					if (state.search.active && !searchMatches(e.name)) continue;
					const row = document.createElement("div");
					row.className = "fexp-row fexp-file" + (state.preview && state.preview.path === e.path ? " fexp-active" : "") + (state.clipboard && state.clipboard.path === e.path ? " fexp-clipboard-src" : "");
					row.style.paddingLeft = (8 + depth * 14) + "px";
					row.title = e.path;
					row.dataset.path = e.path;
					row.dataset.type = "file";
					const caret = document.createElement("span");
					caret.className = "fexp-caret";
					caret.innerHTML = makeIcon("file", 11);
					caret.style.opacity = ".55";
					const ic = document.createElement("span");
					ic.className = "fexp-ic";
					ic.innerHTML = makeIcon("file", 13);
					const name = nameSpan(e.name);
					const size = document.createElement("span");
					size.className = "fexp-size";
					size.textContent = formatSize(e.size);
					row.appendChild(caret);
					row.appendChild(ic);
					row.appendChild(name);
					row.appendChild(size);
					row.addEventListener("click", () => openFile(e));
					row.addEventListener("contextmenu", (ev) => onContextMenu(ev, e.path, "file", e.name));
					row.draggable = true;
					row.addEventListener("dragstart", (ev) => onDragStart(ev, e.path));
					row.addEventListener("dragend", onDragEnd);
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
					// 搜索空状态
					if (state.search.active && treeEl.querySelector(".fexp-row[data-path]") === null && !treeEl.querySelector(".fexp-dim")) {
						const empty = document.createElement("div");
						empty.className = "fexp-empty";
						empty.textContent = "无匹配项";
						treeEl.appendChild(empty);
					}
				}
				updateSearchCount();
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

			// ================= v1.9.0 预览视图 =================
			// 数据模型：state.preview = { path, name, size, version, kind,
			//   language, mode('render'|'source'|'edit'), data{ lines?, html?,
			//   toc?, text?, lineCount, totalLines?, truncated, offsetChars },
			//   status, binary, error, loadingMore }
			// 模式语义按 kind 解释：markdown render=富文本 source=源码(行号)；
			// code render=高亮 source=纯文本；text 无 render。edit 一律行号+textarea。
			const PREVIEW_BYTES = 512 * 1024; // 每段读取上限（服务端 cap 4MB）
			const LINE_H = 20; // 行视图固定行高（px），与 .fexp-cline 一致
			const VIRTUALIZE_THRESHOLD = 10000; // 超过则虚拟化渲染（只建可视行 DOM）

			function previewModes(kind) {
				if (kind === "markdown" || kind === "code") return ["render", "source", "edit"];
				return ["source", "edit"];
			}
			function modeLabel(kind, mode) {
				if (kind === "markdown") return mode === "render" ? "渲染" : mode === "source" ? "源码" : "编辑";
				if (kind === "code") return mode === "render" ? "高亮" : mode === "source" ? "纯文本" : "编辑";
				return mode === "source" ? "文本" : "编辑";
			}
			function previewBodyEl(text, isError) {
				const el = document.createElement("div");
				el.className = "fexp-pbody fexp-dim";
				if (isError) el.className = "fexp-pbody fexp-err";
				el.textContent = text;
				return el;
			}
			/** 预览头部：图标 + 名称 + 语言/行数标签 + 模式按钮组 + 关闭。 */
			function buildPreviewHead(p) {
				const head = document.createElement("div");
				head.className = "fexp-phead";
				const ic = document.createElement("span");
				ic.className = "fexp-ic";
				ic.innerHTML = makeIcon(p.kind === "markdown" ? "doc" : "file", 13);
				const name = document.createElement("span");
				name.className = "fexp-pname";
				name.textContent = p.name + (p.size !== null && p.size !== undefined ? "  (" + formatSize(p.size) + ")" : "");
				head.appendChild(ic);
				head.appendChild(name);
				if (p.status === "done" && !p.binary) {
					const meta = document.createElement("span");
					meta.className = "fexp-dim";
					meta.style.cssText = "font-size:11px;flex:none;";
					const parts = [];
					if (p.language) parts.push(p.language);
					if (p.data && p.data.lineCount) parts.push(p.data.lineCount + " 行");
					if (p.data && p.data.truncated) parts.push("已截断");
					meta.textContent = parts.join(" · ");
					head.appendChild(meta);
					// 模式切换按钮组（HIG 分段控件）
					const group = document.createElement("div");
					group.className = "fexp-pbtn-group";
					for (const m of previewModes(p.kind)) {
						const disabled = (m === "edit" && !!(p.data && p.data.truncated)) ||
							(p.kind === "code" && m === "render" && !(p.data && p.data.lines));
						const b = document.createElement("button");
						b.className = "fexp-pbtn" + (p.mode === m ? " fexp-on" : "");
						b.textContent = modeLabel(p.kind, m);
						b.disabled = !!disabled;
						b.title = m === "edit" ? "编辑（Ctrl+S 保存）" : (m === "render" ? "渲染视图（Ctrl+] 切换）" : "源码视图（Ctrl+] 切换）");
						b.addEventListener("click", () => {
							if (p.mode === m) return;
							state.preview = Object.assign({}, state.preview, { mode: m });
							if (p.kind) writePreviewMode(p.kind, m);
							renderPreview();
						});
						group.appendChild(b);
					}
					head.appendChild(group);
				}
				const x = document.createElement("button");
				x.className = "fexp-x";
				x.title = "关闭预览（Esc）";
				x.appendChild(makeCloseIcon(14));
				x.addEventListener("click", closePreview);
				head.appendChild(x);
				return head;
			}
			/** 行号列 + 内容列的只读视图。htmlLines 非空时逐行插入高亮片段，
			 *  否则按 data.text 分行（纯文本）。行数超过阈值走虚拟化。 */
			function buildLineView(p, htmlLines) {
				const text = p.data && typeof p.data.text === "string" ? p.data.text : "";
				const lines = htmlLines || text.split("\n");
				const total = lines.length;
				const wrap = document.createElement("div");
				wrap.className = "fexp-codeview";
				wrap.setAttribute("data-fexp-version", "1.9.6");
				const scroll = document.createElement("div");
				scroll.className = "fexp-code-scroll";
				// v1.9.6：原生 table 布局 —— 表格行高同步是浏览器最成熟的
				// 机制（tr 高度 = max(td)），从机制上排除内容与行号错位/重叠
				const table = document.createElement("table");
				table.className = "fexp-linetable fexp-code-font";
				const tbody = document.createElement("tbody");
				table.appendChild(tbody);
				scroll.appendChild(table);
				wrap.appendChild(scroll);
				// 行号列宽度随总行数位数自适应
				const digits = String(total).length;
				const noW = 14 + digits * 8;
				const renderRange = (first, count) => {
					tbody.textContent = "";
					const frag = document.createDocumentFragment();
					const addSpacer = (heightPx) => {
						if (heightPx <= 0) return;
						const tr = document.createElement("tr");
						const td = document.createElement("td");
						td.colSpan = 2;
						td.style.height = heightPx + "px";
						td.style.padding = "0";
						tr.appendChild(td);
						frag.appendChild(tr);
					};
					addSpacer(first * LINE_H);
					for (let i = 0; i < count; i += 1) {
						const n = first + i;
						const tr = document.createElement("tr");
						tr.style.height = LINE_H + "px";
						const no = document.createElement("td");
						no.className = "fexp-lineno";
						no.style.width = noW + "px";
						no.textContent = String(n + 1);
						const tx = document.createElement("td");
						tx.className = "fexp-cline";
						if (htmlLines) tx.innerHTML = htmlLines[n] !== undefined ? htmlLines[n] : "";
						else tx.textContent = lines[n] !== undefined ? lines[n] : "";
						tr.appendChild(no);
						tr.appendChild(tx);
						frag.appendChild(tr);
					}
					addSpacer((total - (first + count)) * LINE_H);
					tbody.appendChild(frag);
				};
				if (total <= VIRTUALIZE_THRESHOLD) {
					renderRange(0, total);
				} else {
					// 虚拟化：只渲染可视窗口 ± 缓冲行；上下 spacer 行撑出滚动高度
					const onScroll = () => {
						const first = Math.max(0, Math.floor(scroll.scrollTop / LINE_H) - 25);
						const vis = Math.ceil(scroll.clientHeight / LINE_H) + 50;
						renderRange(first, Math.min(vis, total - first));
					};
					scroll.addEventListener("scroll", onScroll, { passive: true });
					requestAnimationFrame(onScroll);
				}
				// 截断续读：底部「继续加载」
				if (p.data && p.data.truncated) {
					const more = document.createElement("div");
					more.className = "fexp-more";
					const b = document.createElement("button");
					b.className = "fexp-btn";
					b.textContent = "继续加载（已显示 " + (p.data.lineCount || 0) + " / " + (p.data.totalLines || "?") + " 行）";
					b.disabled = !!p.loadingMore;
					b.addEventListener("click", () => {
						const next = p.data.offsetChars + (typeof p.data.text === "string" ? p.data.text.length : 0);
						loadPreviewSegment(p.path, next, true);
					});
					more.appendChild(b);
					wrap.appendChild(more);
				}
				return wrap;
			}
			/** Markdown 富文本视图：折叠目录 + 限宽正文 + 代码块复制按钮。 */
			function buildMarkdownView(p) {
				const wrap = document.createElement("div");
				wrap.className = "fexp-mdview";
				const col = document.createElement("div");
				col.className = "fexp-md-body";
				if (p.data && p.data.toc && p.data.toc.length > 0) col.appendChild(buildToc(p.data.toc));
				const article = document.createElement("div");
				article.innerHTML = p.data.html || "";
				// 代码块复制（事件委托，一次性绑定）
				article.addEventListener("click", (ev) => {
					const btn = ev.target.closest(".fexp-md-copy");
					if (!btn || !btn.closest("pre")) return;
					const code = btn.closest("pre").querySelector("code");
					if (!code) return;
					copyText(code.innerText);
					btn.textContent = "已复制 ✓";
					window.setTimeout(() => { btn.textContent = "复制"; }, 1500);
				});
				// 为每个代码块挂复制按钮（服务端已产出 <pre class="fexp-md-code">）
				article.querySelectorAll("pre.fexp-md-code").forEach((pre) => {
					const b = document.createElement("button");
					b.className = "fexp-md-copy";
					b.type = "button";
					b.textContent = "复制";
					pre.appendChild(b);
				});
				col.appendChild(article);
				wrap.appendChild(col);
				return wrap;
			}
			/** 折叠目录（h1-h3，点击平滑滚动到锚点）。 */
			function buildToc(toc) {
				const box = document.createElement("div");
				box.className = "fexp-toc";
				const head = document.createElement("div");
				head.className = "fexp-toc-head";
				const ic = document.createElement("span");
				ic.className = "fexp-pbtn-ic";
				ic.innerHTML = makeIcon("chevronDown", 12);
				const t = document.createElement("span");
				t.textContent = "目录";
				head.appendChild(ic);
				head.appendChild(t);
				const list = document.createElement("div");
				list.className = "fexp-toc-list";
				list.style.display = "none";
				let open = false;
				head.addEventListener("click", () => {
					open = !open;
					list.style.display = open ? "flex" : "none";
					ic.innerHTML = makeIcon(open ? "chevronDown" : "chevronRight", 12);
				});
				for (const item of toc) {
					const b = document.createElement("button");
					b.className = "fexp-toc-item l" + item.level;
					b.textContent = item.text;
					b.addEventListener("click", () => {
						const target = document.getElementById(item.id);
						if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
					});
					list.appendChild(b);
				}
				box.appendChild(head);
				box.appendChild(list);
				return box;
			}
			// ============ v1.9.1 预览独立卡片 ============
			// 预览从面板内底部区迁至独立浮动卡片（可拖动 / 四角缩放 /
			// 双击最大化 / Esc 或 × 关闭；单卡片复用）。
			let previewCardEl = null;
			let previewCardDrag = null;    // {startX,startY,left,top}
			let previewCardResize = null;  // {mode,startX,startY,rect}
			let previewCardRect = null;    // {left,top,width,height} 还原用
			let previewCardMax = false;
			let previewCardDraggedAt = 0;  // 拖动结束时间戳（区分双击）
			const CARD_W = 780;
			const CARD_H = 560;
			const CARD_MIN_W = 480;
			const CARD_MIN_H = 320;

			function ensurePreviewCard() {
				if (previewCardEl) return previewCardEl;
				const card = document.createElement("div");
				card.className = "fexp-preview-card";
				card.style.display = "none";
				document.body.appendChild(card);
				previewCardEl = card;
				// 四边 + 四角缩放 grip（pointer capture 会把 move/up 重定向到 grip 自身）
				for (const mode of ["n", "s", "e", "w", "se", "ne", "sw", "nw"]) {
					const g = document.createElement("div");
					g.className = "fexp-card-grip fexp-card-grip-" + mode;
					g.addEventListener("pointerdown", (ev) => onCardResizeDown(mode, ev));
					g.addEventListener("pointermove", onCardResizeMove);
					g.addEventListener("pointerup", onCardResizeUp);
					g.addEventListener("pointercancel", onCardResizeUp);
					card.appendChild(g);
				}
				return card;
			}
			/** 显示卡片（首次定位：视口右侧居中；此后保持当前几何）。 */
			function showPreviewCard() {
				const card = ensurePreviewCard();
				if (previewCardMax) {
					card.style.display = "flex";
					return;
				}
				if (!previewCardRect) {
					const left = Math.max(8, window.innerWidth - CARD_W - 24);
					const top = Math.max(8, (window.innerHeight - CARD_H) / 2);
					previewCardRect = { left, top, width: CARD_W, height: CARD_H };
					card.style.left = left + "px";
					card.style.top = top + "px";
					card.style.width = CARD_W + "px";
					card.style.height = CARD_H + "px";
				} else {
					card.style.left = previewCardRect.left + "px";
					card.style.top = previewCardRect.top + "px";
					card.style.width = previewCardRect.width + "px";
					card.style.height = previewCardRect.height + "px";
				}
				card.style.display = "flex";
			}
			function onCardHeadDown(e) {
				if (e.button !== 0 || previewCardMax) return;
				const t = e.target;
				if (t && t.closest && t.closest("button")) return;
				const rect = previewCardEl.getBoundingClientRect();
				previewCardDrag = { startX: e.clientX, startY: e.clientY, left: rect.left, top: rect.top };
				e.preventDefault();
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onCardHeadMove(e) {
				if (!previewCardDrag || !previewCardEl) return;
				const w = previewCardEl.offsetWidth;
				const maxLeft = Math.max(8, window.innerWidth - w - 8);
				const maxTop = Math.max(8, window.innerHeight - 48);
				const left = Math.min(Math.max(previewCardDrag.left + e.clientX - previewCardDrag.startX, 8), maxLeft);
				const top = Math.min(Math.max(previewCardDrag.top + e.clientY - previewCardDrag.startY, 8), maxTop);
				previewCardEl.style.left = left + "px";
				previewCardEl.style.top = top + "px";
			}
			function onCardHeadUp() {
				if (!previewCardDrag) return;
				previewCardDrag = null;
				previewCardDraggedAt = Date.now();
				if (previewCardEl) {
					const r = previewCardEl.getBoundingClientRect();
					previewCardRect = { left: r.left, top: r.top, width: r.width, height: r.height };
				}
			}
			function onCardResizeDown(mode, e) {
				if (e.button !== 0 || previewCardMax || !previewCardEl) return;
				const rect = previewCardEl.getBoundingClientRect();
				previewCardResize = { mode, startX: e.clientX, startY: e.clientY, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height } };
				e.preventDefault();
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onCardResizeMove(e) {
				if (!previewCardResize || !previewCardEl) return;
				const { mode, startX, startY, rect } = previewCardResize;
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;
				let { left, top, width, height } = rect;
				const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
				const maxW = window.innerWidth - 16;
				const maxH = window.innerHeight - 16;
				if (mode === "se") { width = clamp(width + dx, CARD_MIN_W, maxW); height = clamp(height + dy, CARD_MIN_H, maxH); }
				else if (mode === "ne") { width = clamp(width + dx, CARD_MIN_W, left + width - 8); height = clamp(height - dy, CARD_MIN_H, maxH); top = rect.top + (rect.height - height); }
				else if (mode === "sw") { width = clamp(width - dx, CARD_MIN_W, rect.left + width - 8); left = rect.left + (rect.width - width); height = clamp(height + dy, CARD_MIN_H, maxH); }
				else if (mode === "nw") { width = clamp(width - dx, CARD_MIN_W, rect.left + width - 8); left = rect.left + (rect.width - width); height = clamp(height - dy, CARD_MIN_H, maxH); top = rect.top + (rect.height - height); }
				else if (mode === "e") { width = clamp(width + dx, CARD_MIN_W, maxW); }
				else if (mode === "w") { width = clamp(width - dx, CARD_MIN_W, rect.left + width - 8); left = rect.left + (rect.width - width); }
				else if (mode === "s") { height = clamp(height + dy, CARD_MIN_H, maxH); }
				else if (mode === "n") { height = clamp(height - dy, CARD_MIN_H, maxH); top = rect.top + (rect.height - height); }
				previewCardEl.style.left = left + "px";
				previewCardEl.style.top = top + "px";
				previewCardEl.style.width = width + "px";
				previewCardEl.style.height = height + "px";
			}
			function onCardResizeUp() {
				if (!previewCardResize) return;
				previewCardResize = null;
				if (previewCardEl) {
					const r = previewCardEl.getBoundingClientRect();
					previewCardRect = { left: r.left, top: r.top, width: r.width, height: r.height };
				}
			}
			/** 双击标题栏最大化 / 还原。 */
			function toggleCardMax() {
				const card = ensurePreviewCard();
				if (previewCardMax) {
					const r = previewCardRect || { left: Math.max(8, window.innerWidth - CARD_W - 24), top: Math.max(8, (window.innerHeight - CARD_H) / 2), width: CARD_W, height: CARD_H };
					card.style.left = r.left + "px";
					card.style.top = r.top + "px";
					card.style.width = r.width + "px";
					card.style.height = r.height + "px";
					card.classList.remove("fexp-maximized");
					previewCardMax = false;
				} else {
					const r = card.getBoundingClientRect();
					previewCardRect = { left: r.left, top: r.top, width: r.width, height: r.height };
					card.style.left = "8px";
					card.style.top = "8px";
					card.style.width = (window.innerWidth - 16) + "px";
					card.style.height = (window.innerHeight - 16) + "px";
					card.classList.add("fexp-maximized");
					previewCardMax = true;
				}
			}
			function onCardHeadDbl(e) {
				if (Date.now() - previewCardDraggedAt < 400) return; // 刚拖过，不算双击
				const t = e.target;
				if (t && t.closest && t.closest("button")) return;
				toggleCardMax();
			}
			/** 关闭预览卡片（清预览状态并隐藏）。 */
			function closePreview() {
				closeEditor();
				state.preview = null;
				renderPreview();
				renderTree();
			}
			/** 预览内容构建：head（标题/模式按钮/关闭）+ body（分派视图）。 */
			function buildPreviewContent(p) {
				const head = buildPreviewHead(p);
				// 卡片标题栏拖动 / 双击最大化（按钮区域除外）
				head.addEventListener("pointerdown", onCardHeadDown);
				head.addEventListener("pointermove", onCardHeadMove);
				head.addEventListener("pointerup", onCardHeadUp);
				head.addEventListener("pointercancel", onCardHeadUp);
				head.addEventListener("dblclick", onCardHeadDbl);
				const body = document.createElement("div");
				body.className = "fexp-pbody";
				body.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;margin:0;padding:0;";
				if (p.status === "loading") {
					body.appendChild(previewBodyEl("加载中…"));
				} else if (p.status === "error") {
					body.appendChild(previewBodyEl("读取失败: " + p.error, true));
				} else if (p.binary) {
					body.appendChild(previewBodyEl("二进制文件，无法预览" + (p.size !== null && p.size !== undefined ? "（" + formatSize(p.size) + "）" : "")));
				} else if (p.mode === "edit" && !(p.data && p.data.truncated)) {
					startEditing(p);
					body.appendChild(buildEditor());
				} else if (p.kind === "markdown" && p.mode === "render") {
					body.appendChild(buildMarkdownView(p));
				} else if (p.kind === "code" && p.mode === "render" && p.data && p.data.lines) {
					body.appendChild(buildLineView(p, p.data.lines));
				} else {
					body.appendChild(buildLineView(p, null));
				}
				return { head, body };
			}
			function renderPreview() {
				const p = state.preview;
				// 面板内预览区退役：恒隐藏（v1.9.1 起内容渲染到独立卡片）
				if (previewEl) previewEl.style.display = "none";
				if (!p) {
					if (previewCardEl) {
						previewCardEl.style.display = "none";
						previewCardEl.textContent = "";
					}
					return;
				}
				const card = ensurePreviewCard();
				// 只替换 head/body，保留四角缩放 grip（textContent 清空会删掉 grips）
				const oldHead = card.querySelector(".fexp-phead");
				const oldBody = card.querySelector(".fexp-pbody");
				if (oldHead) oldHead.remove();
				if (oldBody) oldBody.remove();
				const { head, body } = buildPreviewContent(p);
				card.appendChild(head);
				card.appendChild(body);
				showPreviewCard();
			}
			function buildEditor() {
				const p = state.preview;
				const ed = state.editing;
				const text = (p.data && typeof p.data.text === "string") ? p.data.text : "";
				const lineCount = Math.max(1, text.split("\n").length);
				const wrap = document.createElement("div");
				wrap.className = "fexp-editor";
				const bar = document.createElement("div");
				bar.className = "fexp-editor-bar";
				const hint = document.createElement("span");
				hint.className = "fexp-dim";
				hint.textContent = "Ctrl+S 保存 · Esc 退出 · Tab 缩进";
				const saveBtn = iconBtn("check", "保存", "保存（Ctrl+S）", () => saveEdit(), "fexp-btn-primary");
				saveBtn.classList.add("fexp-editbtn");
				saveBtnEl = saveBtn;
				const cancelBtn = iconBtn("close", "取消", "取消编辑（Esc）", () => { closeEditor(); renderPreview(); });
				bar.appendChild(hint);
				bar.appendChild(saveBtn);
				bar.appendChild(cancelBtn);
				const body = document.createElement("div");
				body.className = "fexp-codeview";
				// 显式行布局：.fexp-codeview 默认 column，必须覆盖为 row，
				// 否则行号列与 textarea 上下堆叠、内容被挤出可视区
				body.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:row;";
				const numCol = document.createElement("div");
				numCol.className = "fexp-linenums fexp-code-font";
				// 逐属性设置：保留 class 的 padding（8px 8px 8px 0）与 min-width 基线
				numCol.style.overflow = "hidden";
				numCol.style.height = "100%";
				numCol.style.boxSizing = "border-box";
				const frag = document.createDocumentFragment();
				for (let i = 0; i < lineCount; i += 1) {
					const nd = document.createElement("div");
					nd.className = "fexp-cline";
					nd.style.minHeight = LINE_H + "px";
					nd.textContent = String(i + 1);
					frag.appendChild(nd);
				}
				numCol.appendChild(frag);
				numCol.style.minWidth = (16 + String(lineCount).length * 8) + "px";
				const ta = document.createElement("textarea");
				ta.className = "fexp-code-font";
				ta.style.cssText = "flex:1;min-width:0;margin:0;padding:8px 12px 8px 0;border:none;outline:none;resize:none;background:transparent;color:var(--dsw-alias-label-primary);white-space:pre;overflow:auto;line-height:" + LINE_H + "px;box-sizing:border-box;height:100%;";
				ta.value = ed.text;
				ta.spellcheck = false;
				ta.wrap = "off";
				ta.addEventListener("input", () => { ed.text = ta.value; });
				// 行号列与 textarea 同步滚动（wrap=off 时逻辑行 = 视觉行）
				ta.addEventListener("scroll", () => { numCol.scrollTop = ta.scrollTop; }, { passive: true });
				ta.addEventListener("keydown", (ev) => {
					if (ev.key === "Tab") {
						ev.preventDefault();
						const s = ta.selectionStart;
						const e = ta.selectionEnd;
						ta.setRangeText("  ", s, e, "end");
						ed.text = ta.value;
						return;
					}
					if (ev.key === "s" && (ev.ctrlKey || ev.metaKey)) {
						ev.preventDefault();
						saveEdit();
						return;
					}
					if (ev.key === "Escape") {
						ev.preventDefault();
						closeEditor();
						renderPreview();
					}
				});
				body.appendChild(numCol);
				body.appendChild(ta);
				wrap.appendChild(bar);
				wrap.appendChild(body);
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
					// 保存后刷新数据（重新渲染首段，保持当前模式）
					const mode = p.mode;
					state.preview = Object.assign({}, p, {
						size: res && typeof res.size === "number" ? res.size : p.size,
						version: res && res.version ? res.version : p.version,
						status: "loading",
						mode,
						data: null,
						error: null
					});
					closeEditor();
					renderPreview();
					refreshParentOf(p.path);
					showToast("已保存 " + p.name);
					loadPreviewSegment(p.path, 0, false);
				}).catch((err) => {
					saveBtnDisabled(false);
					showToast("保存失败：" + ((err && err.message) || err));
				});
			}
			function closeEditor() {
				if (state.editing) state.editing = null;
				saveBtnEl = null;
			}
			/** 进入编辑模式：从预览数据初始化编辑缓冲（truncated 时不可编辑）。 */
			function startEditing(p) {
				if (state.editing && state.editing.path === p.path) return;
				if (!p.data || typeof p.data.text !== "string") return;
				state.editing = { path: p.path, name: p.name, version: p.version || null, original: p.data.text, text: p.data.text };
			}
			/**
			 * Reload a directory in the tree. `dirPath` is the DIRECTORY to refresh
			 * (not a file inside it). `force` bypasses the in-flight guard so a
			 * mutation that just completed is always reflected immediately.
			 */
			function refreshDir(dirPath, force) {
				if (!dirPath) return;
				if (force) inflight.delete(dirPath);
				if (state.cache.has(dirPath) || force) fetchDir(dirPath);
			}
			/** Refresh the parent directory of a file/dir path. */
			function refreshParentOf(targetPath) {
				const dir = parentDir(targetPath);
				refreshDir(dir, true);
				return dir;
			}
			function openFile(entry) {
				closeEditor();
				state.preview = { path: entry.path, name: entry.name, size: entry.size, status: "loading", error: null, binary: false, mode: "source", kind: null, language: null, data: null, loadingMore: false };
				renderPreview();
				renderTree();
				loadPreviewSegment(entry.path, 0, false);
			}
			/** 拉取预览段。首段（append=false）走 fsRender 类型判定与模式记忆；
			 *  续段（append=true）追加 data.text 并更新行数/截断状态。
			 *  fsRender 不可用（旧服务端）时回退 fsRead 纯文本。 */
			function loadPreviewSegment(path, offsetChars, append) {
				const p = state.preview;
				if (!p || p.path !== path) return;
				if (append && p.loadingMore) return;
				if (append) p.loadingMore = true;
				remote().fsRender(path, PREVIEW_BYTES, offsetChars).then((res) => {
					if (!state.preview || state.preview.path !== path) return;
					if (res && res.binary) {
						state.preview = Object.assign({}, state.preview, { status: "done", binary: true, data: null, loadingMore: false });
						renderPreview();
						return;
					}
					if (append) {
						const d = state.preview.data || {};
						const prevText = typeof d.text === "string" ? d.text : "";
						const text = prevText + (typeof res.text === "string" ? res.text : "");
						// 续读后内容不再完整对应原高亮行 → 清 lines，渲染自动降级纯文本
						const hadLines = Array.isArray(d.lines);
						state.preview = Object.assign({}, state.preview, {
							loadingMore: false,
							data: Object.assign({}, d, {
								text,
								lineCount: text.split("\n").length,
								truncated: !!res.truncated,
								totalLines: res.totalLines || d.totalLines || null,
								offsetChars: typeof res.offsetChars === "number" ? res.offsetChars : 0,
								...(hadLines ? { lines: null, html: null, toc: null } : {})
							})
						});
						renderPreview();
						return;
					}
					const kind = res && res.kind ? res.kind : "text";
					let mode = readPreviewMode(kind) || (kind === "markdown" ? "render" : "source");
					const data = {
						lines: Array.isArray(res.lines) ? res.lines : null,
						html: typeof res.html === "string" ? res.html : null,
						toc: Array.isArray(res.toc) ? res.toc : null,
						text: typeof res.text === "string" ? res.text : null,
						lineCount: res.lineCount || 0,
						totalLines: res.totalLines || null,
						truncated: !!res.truncated,
						offsetChars: typeof res.offsetChars === "number" ? res.offsetChars : 0
					};
					// 截断文件无法完整编辑：记忆里的 edit 模式强制回退
					if (mode === "edit" && data.truncated) mode = kind === "markdown" ? "render" : "source";
					// 截断的 md 只有部分文本、无完整 html：渲染视图会空白，强制源码视图
					if (kind === "markdown" && mode === "render" && data.truncated) mode = "source";
					state.preview = Object.assign({}, state.preview, {
						status: "done",
						binary: false,
						kind,
						language: res && res.language ? res.language : null,
						mode,
						data,
						error: null,
						loadingMore: false
					});
					renderPreview();
				}).catch((err) => {
					if (!state.preview || state.preview.path !== path) return;
					if (append) {
						state.preview.loadingMore = false;
						renderPreview();
						return;
					}
					// 回退 fsRead（旧服务端无 fsRender）
					remote().fsRead(path).then((res) => {
						if (!state.preview || state.preview.path !== path) return;
						const text = typeof res.text === "string" ? res.text : "";
						state.preview = Object.assign({}, state.preview, {
							status: "done",
							binary: !!res.binary,
							kind: "text",
							language: null,
							mode: "source",
							data: { lines: null, html: null, toc: null, text, lineCount: text.split("\n").length, truncated: !!res.truncated, totalLines: null, offsetChars: 0 },
							error: null,
							loadingMore: false
						});
						renderPreview();
					}).catch((err2) => {
						if (!state.preview || state.preview.path !== path) return;
						state.preview = Object.assign({}, state.preview, { status: "error", error: String((err2 && err2.message) || err2), loadingMore: false });
						renderPreview();
					});
				});
			}

			function makeToolbarBtn(icon, label, title, onClick) {
				const b = document.createElement("button");
				b.className = "fexp-tbtn";
				const ic = document.createElement("span");
				ic.className = "fexp-tbtn-ic";
				ic.innerHTML = makeIcon(icon, 13);
				const lb = document.createElement("span");
				lb.textContent = label;
				b.appendChild(ic);
				b.appendChild(lb);
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
				if (state.dock === "right") {
					const nw = Math.min(Math.max(gripDrag.startW - dx, MIN_W), window.innerWidth * 0.7);
					panelEl.style.width = nw + "px";
					applyNarrow(nw);
					return;
				}
				if (state.dock === "middle") {
					const nw = Math.min(Math.max(gripDrag.startW + dx, MIN_W), window.innerWidth * 0.7);
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
					w = Math.min(Math.max(gripDrag.startW + dx, MIN_W), window.innerWidth * 0.75);
				} else if (mode === "w" || mode === "nw" || mode === "sw") {
					const nw = Math.min(Math.max(gripDrag.startW - dx, MIN_W), window.innerWidth * 0.75);
					left = gripDrag.startLeft + (gripDrag.startW - nw);
					w = nw;
				}
				if (mode === "s" || mode === "se" || mode === "sw") {
					h = Math.min(Math.max(gripDrag.startH + dy, MIN_H), window.innerHeight * 0.85);
				} else if (mode === "n" || mode === "ne" || mode === "nw") {
					const nh = Math.min(Math.max(gripDrag.startH - dy, MIN_H), window.innerHeight * 0.85);
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
			/** Shared panel builder. `host=true` renders inside ui-beautify's dock
			 * host (fills the container, inherits the card chrome, no own dock
			 * buttons / grips); `host=false` is the classic
			 * self-contained floating panel with its own dock modes. */
			function buildPanelInto(container, host) {
				if (!host) {
					/* v1.7.2: a slot remount rebuilds the standalone panel — clear
					   the grip/button registries first so stale (detached) entries
					   never accumulate */
					grips.length = 0;
					dockBtnEls.clear();
				}
				container.textContent = "";
				const panel = document.createElement("div");
				panel.className = "fexp-panel" + (host ? " fexp-hostpanel" : "");
				panel.style.display = host ? "flex" : ((hostMode || !state.open) ? "none" : "flex");
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
				x.title = "关闭";
				x.appendChild(makeCloseIcon(14));
				x.addEventListener("click", () => {
					if (host && dockApiRef !== undefined) {
						try { dockApiRef.closePanel(PANEL_ID); } catch (err) {}
						return;
					}
					state.open = false;
					applyOpen();
				});
				header.appendChild(hic);
				header.appendChild(title);
				if (!host) {
					header.appendChild(makeDockBtn("右侧", "right"));
					header.appendChild(makeDockBtn("中间", "middle"));
					header.appendChild(makeDockBtn("浮动", "float"));
					header.addEventListener("pointerdown", onHeaderDown);
					header.addEventListener("pointermove", onHeaderMove);
					header.addEventListener("pointerup", onHeaderUp);
					header.addEventListener("pointercancel", onHeaderUp);
				}
				header.appendChild(x);
				const toolbar = document.createElement("div");
				toolbar.className = "fexp-toolbar";
				toolbar.appendChild(makeToolbarBtn("refresh", "刷新", "重新加载目录", () => {
					state.cache = new Map();
					state.expanded = new Set();
					if (state.root !== null) fetchDir(state.root);
				}));
				hiddenBtn = makeToolbarBtn("eye", "隐藏", "显示/隐藏 node_modules、.git 等", () => {
					state.showHidden = !state.showHidden;
					if (hiddenBtn) hiddenBtn.classList.toggle("fexp-on", state.showHidden);
					renderTree();
				});
				toolbar.appendChild(hiddenBtn);
				/* v1.9.2: 帮助按钮固定在工具栏（刷新/隐藏旁），? 键同样可用 */
				toolbar.appendChild(makeToolbarBtn("help", "帮助", "快捷键帮助（? 键，即 Shift+/）", toggleHelp));
				const searchBar = buildSearchBar();
				searchBarEl = searchBar;
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
				bindTreeDropTargets();
				/* v1.9.1：面板内预览区退役（预览移至独立卡片）——splitter 与
				   preview 保留 DOM 结构（host/standalone refs 兼容）但恒隐藏 */
				const splitter = document.createElement("div");
				splitter.className = "fexp-splitter";
				splitter.style.display = "none";
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
				panel.appendChild(searchBar);
				panel.appendChild(tree);
				panel.appendChild(splitter);
				panel.appendChild(preview);
				if (!host) {
					panel.appendChild(makeGrip("nw", "fexp-grip-nw", "nwse-resize"));
					panel.appendChild(makeGrip("n", "fexp-grip-n", "n-resize"));
					panel.appendChild(makeGrip("ne", "fexp-grip-ne", "nesw-resize"));
					panel.appendChild(makeGrip("e", "fexp-grip-e", "e-resize"));
					panel.appendChild(makeGrip("w", "fexp-grip-w", "w-resize"));
					panel.appendChild(makeGrip("se", "fexp-grip-se", "nwse-resize"));
					panel.appendChild(makeGrip("s", "fexp-grip-s", "s-resize"));
					panel.appendChild(makeGrip("sw", "fexp-grip-sw", "nesw-resize"));
				}
				container.appendChild(panel);
				themeNow();
				if (!host) {
					applyDock();
				}
				updateHeader();
				renderTree();
				renderPreview();
				ensureRoot();
				ensureWsList();
			}
			/** Classic (standalone) panel: built once into the overlay host element. */
			function buildPanel() {
				if (!hostEl) return;
				buildPanelInto(hostEl, false);
				standaloneRefs = {
					panel: panelEl,
					tree: treeEl,
					preview: previewEl,
					headerTitle: headerTitleEl,
					hiddenBtn: hiddenBtn
				};
			}
			/** Re-point the shared refs at the classic panel after a host panel
			 * unmounts (tab switch / float / close), so renders keep targeting a
			 * live tree. */
			function restoreStandaloneRefs() {
				hostPanelActive = false;
				if (!standaloneRefs) return;
				panelEl = standaloneRefs.panel;
				treeEl = standaloneRefs.tree;
				previewEl = standaloneRefs.preview;
				headerTitleEl = standaloneRefs.headerTitle;
				hiddenBtn = standaloneRefs.hiddenBtn;
			}
			/** ui-beautify dock host calls this with the tab-body container on
			 * every host mount (docked tab active, or floating window). Returns
			 * the disposer restoring the classic refs on unmount. */
			function mountDockHost(el) {
				hostPanelActive = true;
				buildPanelInto(el, true);
				return restoreStandaloneRefs;
			}
			function ensureRoot() {
				if (state.root !== null) {
					fetchDir(state.root);
					return;
				}
				remote().wsRoot().then((res) => {
					const candidate = res && typeof res.root === "string" && res.root !== "" ? res.root : null;
					if (typeof res.platform === "string" && res.platform !== "") state.platform = res.platform;
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
			/** Clamp a floating panel's top-left corner into the viewport, honoring its actual width. */
			function clampFloatPos(left, top) {
				const w = panelEl ? panelEl.offsetWidth : 400;
				const maxLeft = Math.max(8, window.innerWidth - w - 8);
				const maxTop = Math.max(8, window.innerHeight - 48);
				return {
					left: Math.min(Math.max(left, 8), maxLeft),
					top: Math.min(Math.max(top, 8), maxTop)
				};
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
				const pos = clampFloatPos(drag.originLeft + e.clientX - drag.startX, drag.originTop + e.clientY - drag.startY);
				state.pos = pos;
				if (panelEl) {
					panelEl.style.left = pos.left + "px";
					panelEl.style.top = pos.top + "px";
				}
			}
			function onHeaderUp(e) {
				if (!drag) return;
				const pos = clampFloatPos(drag.originLeft + e.clientX - drag.startX, drag.originTop + e.clientY - drag.startY);
				state.pos = pos;
				writeJson(POS_KEY, pos);
				drag = null;
			}
			function applyOpen() {
				for (const el of btnEls.values()) el.classList.toggle("fexp-active", state.open);
				if (!panelEl) return;
				/* The mounted host panel is always visible while the tab lives; the
				   classic panel is hidden in host mode (the dock host owns the surface). */
				if (hostPanelActive) panelEl.style.display = "flex";
				else panelEl.style.display = (hostMode || !state.open) ? "none" : "flex";
			}
			/** Hide/show the classic-panel surface for the current mode. Called on
			 * every dock-state transition. */
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
			function toggleOpen() {
				const d = dockApiRef;
				if (hostMode && d !== undefined) {
					const open = typeof d.isOpen === "function" ? !!d.isOpen(PANEL_ID) : (document.querySelector(".fexp-hostpanel") !== null);
					if (open) { try { d.closePanel(PANEL_ID); } catch (err) {} }
					else { try { d.openPanel(PANEL_ID); } catch (err) {} }
					return;
				}
				state.open = !state.open;
				applyOpen();
			}

			/* --- v1.6: dock host integration (ui-beautify) --- */
			/** True while the app frame exists. Since v1.8 ui-beautify's plugin panel
			 * renders in BOTH modes (card dock card / classic right overlay), so the
			 * `data-vsc-layout` check no longer gates host mode — only a missing
			 * frame (engine unable to initialize) keeps the classic panel in charge. */
			function frameExists() {
				try {
					const root = document.querySelector('[data-slot="root"]');
					return root !== null && root.firstElementChild !== null;
				} catch (err) { return false; }
			}
			/** Re-evaluate host mode and keep the open state in sync across the
			 * classic panel and the dock host panel. Cheap when nothing changed
			 * (called from the dock subscription AND the periodic follow loop). */
			function onDockChange() {
				const d = dockApiRef;
				if (d === undefined) return;
				const nextHost = frameExists();
				if (nextHost === hostMode) {
					/* same mode: only sync the button highlight when the HOST panel
					   was opened/closed directly (tab ×, ⧉ float, closeDock…).
					   The standalone panel state is latent while hosted — it must
					   not re-open the classic panel behind the user's back. */
					if (hostMode && typeof d.isOpen === "function") {
						const open = !!d.isOpen(PANEL_ID);
						if (open !== state.open) { state.open = open; applyOpen(); }
					}
					return;
				}
				hostMode = nextHost;
				if (hostMode) {
					/* entering host mode: carry the standalone open state into the
					   host panel (open if it was open, close if it was closed). */
					if (typeof d.isOpen === "function") {
						const open = !!d.isOpen(PANEL_ID);
						if (state.open && !open) { try { d.openPanel(PANEL_ID); } catch (err) {} }
						else if (!state.open && open) { try { d.closePanel(PANEL_ID); } catch (err) {} }
						state.open = !!d.isOpen(PANEL_ID);
					}
				} else {
					/* leaving host mode: host state carries over to the standalone
					   panel; re-point refs in case they live in a now-unmounted
					   host tree. */
					state.open = typeof d.isOpen === "function" ? !!d.isOpen(PANEL_ID) : state.open;
					if (panelEl && panelEl.classList.contains("fexp-hostpanel")) restoreStandaloneRefs();
					if (panelEl) {
						applyDock();
						renderTree();
						renderPreview();
					}
				}
				applyOpen();
			}
			/** Register the panel with ui-beautify's dock host exactly once. */
			function initDockIntegration(d) {
				if (dockDispose !== null || dockUnsub !== null) return;
				try {
					dockDispose = d.registerPanel({
						id: PANEL_ID,
						title: "文件浏览器",
						icon: "📁",
						mount: mountDockHost
					});
				} catch (err) {
					console.error("[dsh-file-explorer] dock panel registration failed:", err);
					dockDispose = null;
					return;
				}
				if (typeof d.subscribe === "function") {
					try { dockUnsub = d.subscribe(onDockChange); } catch (err) { dockUnsub = null; }
				}
				onDockChange();
				bumpEntryListeners();
			}
			/** Lazily pick up the `dock` service (ui-beautify may load after us). */
			function ensureDock() {
				if (dockApiRef !== undefined) return;
				const d = ctx.get("dock");
				if (d === undefined) return;
				dockApiRef = d;
				initDockIntegration(d);
			}

			// --- v1.3: context menu, inline input, clipboard actions ---
			function menuItem(label, icon, onClick, disabled, danger) {
				const item = document.createElement("div");
				item.className = "fexp-menu-item" + (disabled ? " fexp-disabled" : "") + (danger ? " fexp-danger" : "");
				const ic = document.createElement("span");
				ic.className = "fexp-menu-ic";
				ic.innerHTML = makeIcon(icon || "doc", 13);
				const lab = document.createElement("span");
				lab.className = "fexp-menu-label";
				lab.textContent = label;
				item.appendChild(ic);
				item.appendChild(lab);
				if (disabled) return item;
				item.addEventListener("click", () => {
					closeMenu();
					onClick();
				});
				return item;
			}
			function closeMenu() {
				if (menuEl) { menuEl.remove(); menuEl = null; }
			}
			/** The rename/copy/paths group shared by the dir and file menus. */
			function pushCommonMenuItems(items, path, type, name) {
				items.push(menuItem("重命名…", "edit", () => startRenameInput(path, type, name)));
				items.push(menuItem("复制", "copy", () => setClipboard(path, type)));
				items.push(menuItem("复制绝对路径", "external", () => copyText(path)));
				items.push(menuItem("复制相对路径", "external", () => copyText(relativeToRoot(path))));
			}
			function onContextMenu(ev, path, type, name) {
				ev.preventDefault();
				ev.stopPropagation();
				closeMenu();
				closeEditor();
				lastMenuPos = { x: ev.clientX, y: ev.clientY };
				const el = document.createElement("div");
				el.className = "fexp-menu";
				el.style.left = ev.clientX + "px";
				el.style.top = ev.clientY + "px";
				const items = [];
				if (type === "dir") {
					items.push(menuItem("新建文件…", "file", () => startCreateInput(path, "file")));
					items.push(menuItem("新建文件夹…", "folder", () => startCreateInput(path, "dir")));
					items.push(menuSep());
					items.push(menuItem("粘贴", "copy", () => pasteInto(path), state.clipboard === null));
					items.push(menuSep());
					pushCommonMenuItems(items, path, type, name);
					items.push(menuSep());
					items.push(menuItem("删除", "trash", () => deletePath(path, type, name), false, true));
				} else {
					items.push(menuItem("粘贴到此处", "copy", () => pasteInto(parentDir(path) || state.root || path), state.clipboard === null));
					pushCommonMenuItems(items, path, type, name);
					items.push(menuSep());
					items.push(menuItem("删除", "trash", () => deletePath(path, type, name), false, true));
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
				const sameDir = state.platform === "win32" ? clip.path.toLowerCase() === dirPath.toLowerCase() : clip.path === dirPath;
				if (sameDir) {
					showToast("不能粘贴到自身所在目录");
					return;
				}
				remote().fsCopy(clip.path, dirPath).then((res) => {
					state.clipboard = null;
					writeClipboard();
					renderTree();
					refreshDir(dirPath, true);
					showToast("已粘贴到 " + dirPath);
				}).catch((err) => {
					showToast("粘贴失败：" + ((err && err.message) || err));
				});
			}
			function deletePath(path, type, name) {
				const confirmed = window.confirm('确定删除"' + name + '"吗？' + (type === "dir" ? "文件夹及其全部内容" : "文件") + "将移入回收站。");
				if (!confirmed) return;
				remote().fsDelete(path).then((res) => {
					if (state.preview && state.preview.path === path) {
						state.preview = null;
						closeEditor();
						renderPreview();
					}
					if (state.clipboard && state.clipboard.path === path) {
						state.clipboard = null;
						writeClipboard();
					}
					const sep = pathSep();
					const comparable = (s) => (state.platform === "win32" ? s.toLowerCase() : s);
					const prefix = comparable(path.replace(/[\\/]+$/, ""));
					for (const key of [...state.expanded]) if (comparable(key) === prefix || comparable(key).startsWith(prefix + sep)) state.expanded.delete(key);
					for (const key of [...state.cache.keys()]) if (comparable(key) === prefix || comparable(key).startsWith(prefix + sep)) state.cache.delete(key);
					renderTree();
					refreshParentOf(path);
					showToast(res && res.recycled ? "已移入回收站：" + name : "已删除：" + name);
				}).catch((err) => {
					showToast("删除失败：" + ((err && err.message) || err));
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
						const same = state.platform === "win32" ? target.toLowerCase() === path.toLowerCase() : target === path;
						if (same) return;
						remote().fsRename(path, target).then(() => {
							renderTree();
							refreshParentOf(path);
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
							if (type === "dir") state.expanded.add(target);
							renderTree();
							refreshDir(dirPath, true);
							showToast((type === "dir" ? "已创建文件夹 " : "已创建文件 ") + v);
						}).catch((err) => {
							showToast("创建失败：" + ((err && err.message) || err));
						});
					}
				});
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
					/* v1.7.2: only close THIS host — a stale blur timer must not
					   close a newly opened inline input */
					setTimeout(() => { if (inputHostEl === host) closeInputHost(); }, INPUT_BLUR_MS);
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
			}

			// --- v1.5: drag & drop move ---
			function isSelfOrDescendant(from, toDir) {
				const sep = pathSep();
				const norm = (s) => (state.platform === "win32" ? s.toLowerCase() : s);
				const f = norm(from.replace(/[\\/]+$/, ""));
				const t = norm(toDir.replace(/[\\/]+$/, ""));
				return t === f || t.startsWith(f + sep);
			}
			function onDragStart(ev, path) {
				dragSrcPath = path;
				closeAllOverlays();
				try {
					ev.dataTransfer.effectAllowed = "move";
					ev.dataTransfer.setData("text/plain", path);
				} catch (err) {}
				if (ev.currentTarget) ev.currentTarget.classList.add("fexp-dragging");
				// Safety net: if the tree re-renders mid-drag (workspace follow,
				// refresh) the source row is removed and its dragend never fires —
				// clear the drag state from the document instead.
				document.addEventListener("dragend", onDocumentDragEnd, true);
			}
			function onDocumentDragEnd() {
				dragSrcPath = null;
				clearDropTarget();
				document.removeEventListener("dragend", onDocumentDragEnd, true);
			}
			function onDragEnd(ev) {
				dragSrcPath = null;
				clearDropTarget();
				if (ev.currentTarget) ev.currentTarget.classList.remove("fexp-dragging");
			}
			function clearDropTarget() {
				if (dropTargetEl) {
					dropTargetEl.classList.remove("fexp-drop-target");
					dropTargetEl = null;
				}
			}
			/**
			 * Drop-target validity for a directory row. A drop is allowed only when
			 * the destination is not the source itself, not a descendant of it, and
			 * not the source's own parent (dropping into the same directory is a
			 * no-op). Invalid targets keep the native "not allowed" cursor and never
			 * highlight — highlight always means "safe to drop".
			 * @param dirPath - candidate destination directory.
			 * @param srcPath - explicit source path (defaults to `dragSrcPath`; pass
			 *   the captured value from onDrop because dragSrcPath is cleared there).
			 */
			function canDropInto(dirPath, srcPath) {
				const src = srcPath === undefined ? dragSrcPath : srcPath;
				if (src === null || !dirPath) return false;
				if (isSelfOrDescendant(src, dirPath)) return false;
				const srcDir = parentDir(src);
				if (srcDir !== null) {
					const same = state.platform === "win32" ? srcDir.toLowerCase() === dirPath.toLowerCase() : srcDir === dirPath;
					if (same) return false;
				}
				return true;
			}
			/** dragover fires continuously while the pointer is over the row, so it
			 * is the single source of truth for the highlight: no flicker from
			 * child-element enter/leave events. */
			function onDragOver(ev, dirPath) {
				if (dragSrcPath === null) return;
				if (!canDropInto(dirPath)) return; // no preventDefault → native forbidden cursor
				ev.preventDefault();
				try { ev.dataTransfer.dropEffect = "move"; } catch (err) {}
				if (dropTargetEl !== ev.currentTarget) {
					clearDropTarget();
					dropTargetEl = ev.currentTarget;
					dropTargetEl.classList.add("fexp-drop-target");
				}
			}
			/** Only clear the highlight when the pointer actually left the row
			 * (relatedTarget outside the row); moving between child spans keeps it. */
			function onDragLeave(ev) {
				if (dropTargetEl !== ev.currentTarget) return;
				const related = ev.relatedTarget;
				if (related && ev.currentTarget.contains(related)) return;
				clearDropTarget();
			}
			function onDrop(ev, dirPath) {
				if (dragSrcPath === null) return;
				ev.preventDefault();
				ev.stopPropagation();
				const src = dragSrcPath;
				clearDropTarget();
				dragSrcPath = null;
				if (!canDropInto(dirPath, src)) return; // native-cursor path already prevented, but guard anyway
				remote().fsMove(src, dirPath).then((res) => {
					if (state.preview && state.preview.path === src) {
						state.preview = null;
						closeEditor();
						renderPreview();
					}
					if (state.clipboard && state.clipboard.path === src) {
						state.clipboard = null;
						writeClipboard();
					}
					renderTree();
					refreshParentOf(src);
					refreshDir(dirPath, true);
					showToast("已移动到 " + dirPath);
				}).catch((err) => {
					showToast("移动失败：" + ((err && err.message) || err));
				});
			}
			/** True when the drag pointer is over blank tree space (not a real row). */
			function overBlankTree(ev) {
				const t = ev.target;
				if (!t || !t.closest) return false;
				return t.closest("[data-path]") === null;
			}
			function bindTreeDropTargets() {
				if (!treeEl) return;
				treeEl.addEventListener("dragover", (ev) => {
					if (dragSrcPath === null || !overBlankTree(ev)) return;
					if (!canDropInto(state.root)) return;
					ev.preventDefault();
					try { ev.dataTransfer.dropEffect = "move"; } catch (err) {}
					if (dropTargetEl !== treeEl) {
						clearDropTarget();
						dropTargetEl = treeEl;
						treeEl.classList.add("fexp-drop-target");
					}
				});
				treeEl.addEventListener("dragleave", (ev) => {
					if (dropTargetEl !== treeEl) return;
					const related = ev.relatedTarget;
					if (related && treeEl.contains(related)) return;
					clearDropTarget();
				});
				treeEl.addEventListener("drop", (ev) => {
					if (dragSrcPath === null || !overBlankTree(ev)) return;
					if (state.root === null) return;
					onDrop(ev, state.root);
				});
			}

			// ================= v1.9.0 帮助浮层 / 主题 =================
			const HELP_ROWS = [
				["Ctrl+F / ⌘F", "搜索 / 过滤文件名"],
				["Esc", "关闭搜索 · 退出编辑 · 关闭预览卡片"],
				["↑ / ↓", "搜索结果中导航"],
				["Enter", "打开选中文件（目录则展开）"],
				["→ / ←", "展开 / 收起目录"],
				["Ctrl+[ / Ctrl+]", "切换视图模式（渲染 / 源码 / 编辑）"],
				["Tab（编辑中）", "插入 2 空格缩进"],
				["Ctrl+S（编辑中）", "保存"],
				["?（Shift+/）", "打开本快捷键帮助（也可点工具栏「帮助」按钮）"],
			];
			let helpEl = null;
			let helpDrag = null;
			function closeHelp() {
				if (helpEl) { helpEl.remove(); helpEl = null; }
				helpDrag = null;
			}
			/** 帮助浮层拖动（标题区域）。pointer capture 保证移出标题栏后
			 *  move/up 仍派发到本元素 —— 否则 up 丢失会让拖动状态残留，
			 *  鼠标未按下时浮层也跟着移动。 */
			function onHelpHeadDown(e) {
				if (e.button !== 0 || !helpEl) return;
				const rect = helpEl.getBoundingClientRect();
				helpDrag = { startX: e.clientX, startY: e.clientY, left: rect.left, top: rect.top };
				e.preventDefault();
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onHelpHeadMove(e) {
				if (!helpDrag || !helpEl) return;
				const maxLeft = Math.max(8, window.innerWidth - helpEl.offsetWidth - 8);
				const maxTop = Math.max(8, window.innerHeight - 48);
				helpEl.style.left = Math.min(Math.max(helpDrag.left + e.clientX - helpDrag.startX, 8), maxLeft) + "px";
				helpEl.style.top = Math.min(Math.max(helpDrag.top + e.clientY - helpDrag.startY, 8), maxTop) + "px";
			}
			function onHelpHeadUp() {
				helpDrag = null;
			}
			function toggleHelp() {
				if (helpEl) { closeHelp(); return; }
				const el = document.createElement("div");
				el.className = "fexp-help";
				const head = document.createElement("div");
				head.className = "fexp-help-head";
				head.textContent = "快捷键";
				head.title = "拖动移动";
				head.addEventListener("pointerdown", onHelpHeadDown);
				head.addEventListener("pointermove", onHelpHeadMove);
				head.addEventListener("pointerup", onHelpHeadUp);
				head.addEventListener("pointercancel", onHelpHeadUp);
				const table = document.createElement("table");
				for (const [keys, desc] of HELP_ROWS) {
					const tr = document.createElement("tr");
					const tdK = document.createElement("td");
					const kbd = document.createElement("span");
					kbd.className = "kbd";
					kbd.textContent = keys;
					tdK.appendChild(kbd);
					const tdD = document.createElement("td");
					tdD.textContent = desc;
					tr.appendChild(tdK);
					tr.appendChild(tdD);
					table.appendChild(tr);
				}
				const close = document.createElement("button");
				close.className = "fexp-btn fexp-help-close";
				close.textContent = "关闭";
				close.addEventListener("click", closeHelp);
				el.appendChild(head);
				el.appendChild(table);
				el.appendChild(close);
				document.body.appendChild(el);
				helpEl = el;
				// 初始位置：视窗左上角（16, 16），可完整看到窗口内容
				el.style.left = "16px";
				el.style.top = "16px";
			}
			/** v1.9.0 视图模式循环切换（Ctrl+[ / Ctrl+]），跳过不可用模式。 */
			function cycleMode(delta) {
				const p = state.preview;
				if (!p || p.status !== "done" || p.binary || !p.kind) return;
				const modes = previewModes(p.kind);
				if (modes.length < 2) return;
				const cur = Math.max(0, modes.indexOf(p.mode));
				let picked = -1;
				for (let i = 1; i <= modes.length; i += 1) {
					const idx = (cur + delta * i + modes.length) % modes.length;
					const m = modes[idx];
					const disabled = (m === "edit" && !!(p.data && p.data.truncated)) ||
						(p.kind === "code" && m === "render" && !(p.data && p.data.lines));
					if (!disabled) { picked = idx; break; }
				}
				if (picked < 0 || picked === cur) return;
				const m = modes[picked];
				state.preview = Object.assign({}, state.preview, { mode: m });
				if (p.kind) writePreviewMode(p.kind, m);
				renderPreview();
			}
			/** v1.9.0 深/浅主题检测（data-theme 属性 + prefers-color-scheme）。 */
			function themeNow() {
				const dark = (document.documentElement.getAttribute("data-theme") === "dark") ||
					(document.documentElement.classList.contains("dark")) ||
					(typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
				/* v1.9.1: 预览独立卡片同样参与主题（hljs 配色选择器已覆盖） */
				for (const el of document.querySelectorAll(".fexp-panel, .fexp-preview-card")) {
					el.setAttribute("data-fexp-theme", dark ? "dark" : "light");
				}
			}

			ctx.effect(function globalOverlayHandlers() {
				const onDocClick = (ev) => {
					if (helpEl && !helpEl.contains(ev.target)) { closeHelp(); }
					if (menuEl && !menuEl.contains(ev.target) && (!inputHostEl || !inputHostEl.contains(ev.target))) {
						closeAllOverlays();
					}
				};
				const onDocKey = (ev) => {
					const mod = ev.ctrlKey || ev.metaKey;
					const tag = ev.target && ev.target.tagName;
					if (ev.key === "Escape") {
						if (helpEl) { closeHelp(); ev.preventDefault(); return; }
						if (menuEl || inputHostEl) { closeAllOverlays(); ev.preventDefault(); return; }
						if (state.search.active) { closeSearch(); ev.preventDefault(); return; }
						if (state.editing) { closeEditor(); renderPreview(); ev.preventDefault(); return; }
						if (state.preview) { closePreview(); ev.preventDefault(); return; }
						return;
					}
					if (ev.key === "?" && tag !== "INPUT" && tag !== "TEXTAREA") {
						ev.preventDefault();
						toggleHelp();
						return;
					}
					if (mod && (ev.key === "f" || ev.key === "F")) {
						ev.preventDefault();
						focusSearch();
						return;
					}
					if (mod && ev.key === "]") { ev.preventDefault(); cycleMode(1); return; }
					if (mod && ev.key === "[") { ev.preventDefault(); cycleMode(-1); return; }
				};
				document.addEventListener("click", onDocClick, true);
				document.addEventListener("keydown", onDocKey, true);
				return () => {
					/* v1.7.2: close any open overlay before detaching the global
					   listeners — otherwise a context menu / inline input left open
					   at plugin unload would linger in document.body forever */
					closeAllOverlays();
					closeHelp();
					document.removeEventListener("click", onDocClick, true);
					document.removeEventListener("keydown", onDocKey, true);
				};
			});
			ctx.effect(function themeWatcher() {
				themeNow();
				const mo = new MutationObserver(themeNow);
				mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
				let mq = null;
				const onMq = () => themeNow();
				if (typeof matchMedia === "function") {
					mq = matchMedia("(prefers-color-scheme: dark)");
					if (mq.addEventListener) mq.addEventListener("change", onMq);
				}
				return () => {
					mo.disconnect();
					if (mq && mq.removeEventListener) mq.removeEventListener("change", onMq);
				};
			});

			ctx.effect(function followLoop() {
				const id = window.setInterval(() => {
					/* v1.6: lazily pick up ui-beautify's dock host and re-sync the
					   mode/open state (subscription covers immediate changes; this
					   periodic pass covers load-order and engine-startup races). */
					ensureDock();
					if (dockApiRef !== undefined) onDockChange();
					if (state.dock === "middle" && panelEl && !hostPanelActive) {
						const w = sidebarWidth();
						panelEl.style.left = w + "px";
					}
					/* v1.7.1: while ui-beautify is dragging (dock-card handle, plugin
					   panel edge, float windows…), skip workspace follow and tree
					   rebuilds — a mid-drag re-render is what made resizes janky. */
					const dragging = (() => {
						try {
							const root = document.querySelector('[data-slot="root"]');
							return root !== null && root.firstElementChild !== null && root.firstElementChild.hasAttribute("data-vsc-dragging");
						} catch (err) { return false; }
					})();
					if (dragging) return;
					/* v1.7.2: never stack workspace probes — if the previous tick's
					   wsRoot call is still pending (slow RPC), skip this round. */
					if (wsProbeBusy) return;
					wsProbeBusy = true;
					ensureWsList().then(() => {
						const domPath = probeActiveWorkspacePath();
						if (domPath !== null) {
							switchRoot(domPath);
							wsProbeBusy = false;
							return;
						}
						remote().wsRoot().then((res) => {
							const candidate = res && typeof res.root === "string" && res.root !== "" ? res.root : null;
							if (typeof res.platform === "string" && res.platform !== "") state.platform = res.platform;
							if (candidate && candidate !== state.root) {
								switchRoot(candidate);
							}
						}).catch(() => {}).finally(() => { wsProbeBusy = false; });
					}).catch(() => { wsProbeBusy = false; });
				}, POLL_MS);
				/* v1.5.6: keep a floating panel inside the viewport when the window resizes. */
				const onResize = () => {
					if (state.dock === "float" && panelEl && state.pos && !hostPanelActive) {
						const p = clampFloatPos(state.pos.left, state.pos.top);
						state.pos = p;
						panelEl.style.left = p.left + "px";
						panelEl.style.top = p.top + "px";
					}
					/* v1.9.1: 最大化预览卡片跟随视口 */
					if (previewCardMax && previewCardEl) {
						previewCardEl.style.left = "8px";
						previewCardEl.style.top = "8px";
						previewCardEl.style.width = (window.innerWidth - 16) + "px";
						previewCardEl.style.height = (window.innerHeight - 16) + "px";
					}
				};
				window.addEventListener("resize", onResize);
				return () => {
					window.clearInterval(id);
					window.removeEventListener("resize", onResize);
				};
			});

			ctx.effect(function registerSlots() {
				const slotsService = slots;
				/* v1.7: with ui-beautify's dock host present the header button is
				   redundant (the "插件面板" entry takes over) — render null then.
				   Without it the classic button stays, as the standalone fallback. */
				function HeaderEntry() {
					const [, setV] = React.useState(0);
					React.useEffect(() => {
						const fn = () => setV((v) => v + 1);
						entryListeners.add(fn);
						return () => { entryListeners.delete(fn); };
					}, []);
					if (dockApiRef !== undefined) return null;
					return React.createElement("button", {
						ref: mountButton("header"),
						onClick: toggleOpen,
						className: "fexp-toggle fexp-toggle-wide",
						title: "文件浏览器（Ctrl+F 搜索 · ? 帮助）"
					}, React.createElement("span", {
						className: "fexp-pbtn-ic",
						dangerouslySetInnerHTML: { __html: makeIcon("folder", 13) }
					}), " 文件");
				}
				return slotsService.inject("conversation.session.header.utilities", () => slotsService.register(
					{ name: "conversation.session.header.utilities", id: "file-explorer-main", order: 10, label: "文件浏览器" },
					() => React.createElement(HeaderEntry)
				));
			});
			ctx.effect(function registerOverlay() {
				const slotsService = slots;
				return slotsService.inject("shell.overlay", () => slotsService.register(
					{ name: "shell.overlay", id: "file-explorer-panel", order: 0 },
					() => React.createElement("div", { ref: mountHost, className: "fexp-host" })
				));
			});

			/* v1.6: dock host integration — pick up ui-beautify's `dock` service
			   when present (it may mount before or after us; the follow loop also
			   re-checks) and own the panel registration + subscription cleanup. */
			ensureDock();
			ctx.effect(function dockIntegrationCleanup() {
				return () => {
					if (dockUnsub !== null) { try { dockUnsub(); } catch (err) {} dockUnsub = null; }
					if (dockDispose !== null) { try { dockDispose(); } catch (err) {} dockDispose = null; }
					dockApiRef = undefined;
					hostMode = false;
					hostPanelActive = false;
					bumpEntryListeners();
				};
			});
		}

		const inject = ["slots", "remote"];

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
