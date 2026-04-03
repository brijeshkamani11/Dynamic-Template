# MCloud Report Template Designer — Changelog

> Append new entries at the **top** of this file (newest first).
> Format: `### [DATE] — CHANGE TITLE`
> Never delete old entries.
> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for technical reference.

---

### [2026-04-03] — Dual-Mode Designer: Full Template + Layout Only

**Branch:** `feature/integrate-all-design`

**What changed:**

Introduced a two-mode designer model. The mode is stored in `state.designerMode` (`"full"` | `"layout"`) and persisted in autosave drafts and exported JSON.

**Full Template mode** (default) — no behavior change. All existing JSON is backward-compatible.

**Layout Only mode** — placeholder-based skeleton designer:
- Field palette hidden; canvas structure (rows, columns, row styles, variants, repeater) fully usable.
- Each cell carries `placeholderId` / `placeholderLabel` instead of `dataField`.
- Exported JSON has a top-level `"mode": "layout"` marker.
- Importing a layout JSON auto-detects the marker and routes to `hydrateFromLayoutJSON()`.
- Property panel still usable for visual/config on placeholder cells.

**Mode switching (topbar selector):**
- `full → layout`: filled cells are converted to placeholder cells (caption + style preserved, `dataField` dropped). Group fields cleared.
- `layout → full`: placeholder cells are cleared to `null` (cannot auto-map to real fields). Confirmation required for both directions if canvas has content.

**Sample Layout Presets (Import → Sample Layouts tab):**
- 4 built-in layout skeletons: Compact Ledger Card, Summary Card with Totals, Transaction List Card, Alert / Outstanding Card (`L0001`–`L0004`).
- Selectable from the import modal's new "Sample Layouts" tab; shows description and JSON preview before loading.

**Files changed:** `state.js`, `format-library.js`, `index.html`, `canvas.css`, `topbar.css`, `canvas.js`, `palette.js`, `property-panel.js`, `preview.js`, `json-modal.js`, `recovery.js`, `topbar.js`, `app.js`.

---

### [2026-04-03] — Code-Review Fixes (Steps A–E)

**Branch:** `ui-polish`

**What changed:**

**A) Recovery parity — `recovery.js` `buildDraftPayload()`**
- Row serialization now persists all Phase 1–3 row-level properties: `rowStyle`, `rowVariant`, `rhythm`, `rowType`, and (conditionally) `repeaterConfig`.
- Previously only `id`, `isExpandedRow`, and `cols` were saved; the rest were silently dropped on draft restore.
- `hydrateFromDraft()` unchanged — it uses `state.rows = s.rows` directly, so the fix is entirely in the payload builder.

**B) Column-count spec alignment — `README.md` / `ARCHITECTURE.md`**
- Constraint #1 updated: "Max 3 columns" → "Max 5 columns" to match `MAX_COLS = 5` in state.js.

**C) Import enum/range validation — `json-modal.js` `hydrateFromJSON()`**
- Added five clamping helpers before the `newRows` build loop: `clampTextAlign`, `clampCellVariant`, `clampRowType`, `clampColSpan`, `clampLevelVis`.
- `textAlign` clamped to `["left","center","right"]` (was unchecked string pass-through).
- `colSpan` clamped to `1..MAX_COLS` integer (was unchecked number).
- `cellVariant` clamped to `["text","amount","badge","icon","date","link"]` (was unchecked string).
- `rowType` clamped to `["normal","repeater"]` (was unchecked string).
- `levelVisibility` clamped: must be `"all"` or an array (was unchecked pass-through).
- Strategy is clamp-to-default (not reject) — preserves backward compat with older exports.

**D) Mock-data null guard — `field-registry.js` `getMockRecordsForDrill()`**
- Base entry `MOCK_GROUPED_DATA["R0001F0002"]` now accessed with a null check.
- If key or `.records` is absent, falls back to `[]` instead of throwing a TypeError.

**E) Row ID collision suffix — `canvas.js`**
- `addRow()` and `duplicateRow()` now generate IDs as `"row_" + Date.now() + "_" + random4chars`.
- Matches the suffix format already used in `hydrateFromJSON()` — consistent across all creation paths.

**F) README split — documentation restructure**
- `README.md` — shortened to entry point with AI instructions + links
- `ARCHITECTURE.md` — all technical reference (sections 1–12, Quick-Start, Presets, Feature Matrix)
- `CHANGELOG.md` — this file; all change history

**Files changed:**
- `js/modules/recovery.js` — `buildDraftPayload()` row serialization
- `js/modules/json-modal.js` — five clamping helpers + applied in cell/row construction
- `js/data/field-registry.js` — `getMockRecordsForDrill()` null guard
- `js/modules/canvas.js` — row ID suffix in `addRow()` + `duplicateRow()`
- `README.md` — shortened entry point
- `ARCHITECTURE.md` — NEW: full technical reference
- `CHANGELOG.md` — NEW: this file

---

### [2026-04-03] — Phase 4: UX Simplification, Visual Polish, Quality Hardening

**Branch:** `feature/integrate-all-design`

**What changed (Phase 4 — non-technical UX, polish, safety):**

**A) Preset expansion (5 → 10 presets)**
- Added: **Header Strip**, **Alert Card**, **Summary Band**, **Line-Item List**, **Contact Compact**, **Detail Expanded**, **Transaction List**
- Renamed "stripHeader" → "Header Strip", "alertSummary" → "Alert Card" for plain-language display
- Repeater presets (Line-Item List, Transaction List) now also set `rowType`/`repeaterConfig` via the preset
- `applyPreset()` now confirms before overwriting a row that already has a non-default style

**B) Duplicate row (⧉ button)**
- Every canvas row header now has a ⧉ button that deep-clones the row (including all column/field config) and inserts it directly below
- New row gets fresh IDs/UIDs — no shared references
- One-click — no dialog needed

**C) Reset style (↺)**
- Canvas row header shows ↺ when the row has any non-default style/variant/rhythm/type
- Row-style panel footer shows a ↺ Reset button
- Both clear `rowStyle`, `rowVariant`, `rhythm`, `rowType`, `repeaterConfig` back to defaults without touching field data

**D) Visual polish**
- Card `border-radius` increased to `12px`
- Card `box-shadow` improved: `0 1px 3px rgba(0,0,0,0.07), 0 4px 10px rgba(0,0,0,0.05)` (softer and more layered)
- Expanded card uses ring shadow instead of flat border
- `preview-row` padding increased slightly (`5px 10px`), gap `6px` for better visual breathing
- `preview-val` font size bumped to `11.5px`, `line-height: 1.35`
- `phone-list` background changed to `#f0f3f8` (matches image tone)
- `preview-icon` opacity lowered to `0.75` for secondary visual weight

**E) Import error messages — plain language**
- All validation errors now use plain English, not technical keys
- "Not a valid JSON object" → "The pasted content is not valid JSON…"
- "fieldConfigs missing" → "The layout has no row definitions…"
- Repeater `mockKey` validated; invalid values report which keys are valid
- JSON syntax error includes both friendly message + original parser detail

**F) Sample library — R0008 Image-Inspired Cards (3 formats)**
- **F0001 Full Party Ledger Card**: header → city strip → transaction repeater (3) → summary band → narration expanded
- **F0002 Product Order Card**: green header strip → line-item repeater (4, +more) → total band → footer actions
- **F0003 Outstanding with Bill List**: party header → alert strip → bill repeater (3) → pending summary

**G) Documentation**
- Added **Quick-Start Guide** (7 steps, non-technical)
- Added **Preset Usage Guide** (table of all 10 presets with intent description)
- Added **Feature Matrix** (all features by phase)

**Files changed:**
- `js/modules/canvas.js` — `duplicateRow()`, `resetRowStyle()`, ⧉ + ↺ buttons in row header, routing
- `js/modules/property-panel.js` — PRESETS expanded to 10; `applyPreset()` overwrite guard + repeater preset support; `propResetStyle` button show/hide + handler; `closePropPanel()` resets reset button
- `report-designer/index.html` — 10 preset buttons with `title` tooltips; `#propResetStyle` button
- `js/modules/json-modal.js` — plain-language validation messages; repeater config validation; friendly syntax error
- `js/data/format-library.js` — R0008 with 3 image-inspired complex formats
- `css/preview.css` — card radius, shadow, padding, typography, list background
- `css/canvas.css` — `.row-btn-dup`, `.row-btn-reset` hover styles
- `css/property-panel.css` — `.prop-section-hint` style
- `README.md` — Quick-Start Guide, Preset Usage Guide, Feature Matrix added

**Regression checklist (all pass):**
- [x] All Phase 1/2/3 layouts render identically — no style regressions
- [x] Duplicate row creates independent deep clone — no shared state
- [x] Reset style clears only visual properties — field data preserved
- [x] Preset confirmation fires correctly when row already has style
- [x] Old JSON (no Phase 4 fields) loads without error
- [x] Import error messages never cause state corruption (errors happen before hydration)
- [x] Drill/back/expand/recovery still work
- [x] 10 presets all populate form fields correctly; apply saves correct state

---

### [2026-04-03] — Phase 3 Design Integration: Repeater Row Blocks

**Branch:** `feature/integrate-all-design`

**What changed (Phase 3 — repeater / nested list rows):**

**A) Repeater row type** (`rowType: "repeater"` on a row):
- A row can now be configured as a **Repeating List** that renders multiple sub-rows in the preview using mock data, each using the same column layout.
- `repeaterConfig`: `{ mockKey, maxItems, showDivider, showMoreFooter }`
- Three mock data sources: `transactions` (date/vou/DR/CR), `lineItems` (product/qty/rate/amt), `bills` (bill no/date/amount/due days)
- Optional `showDivider` adds a separator line between repeated items
- Optional `showMoreFooter` shows a "+N more" footer when items exceed `maxItems`

**B) Canvas header badge** — `⟳ Repeater` purple badge appears in row header when `rowType === "repeater"`

**C) Property panel controls** (in row-style panel):
- **Row Type** selector: Normal / Repeating List
- When Repeating List selected: Mock Data source, Items to Show (1–10), Item Divider toggle, Show "+N more" toggle
- Controls are compact, non-technical, immediately understandable

**D) JSON extension (additive)**:
- `rowType` emitted only when `"repeater"` (omitted for normal rows → backward compatible)
- `repeaterConfig` emitted only when `rowType === "repeater"`
- Old JSON without these keys hydrates safely with `normal` defaults

**E) R0007 Repeater Showcase formats** (3 new formats):
- **F0001 Ledger — Transaction List**: header → strip → repeater(transactions, 3) → summary footer
- **F0002 Stock — Line Item Card**: strip header → repeater(lineItems, 4) → footer actions
- **F0003 Outstanding — Multi-Bill Card**: header → strip → repeater(bills, 3) → summary with due-days emphasis

**Files changed:**
- `js/data/field-registry.js` — `MOCK_REPEATER_DATA` added (3 lists, 5–6 items each)
- `js/modules/canvas.js` — `addRow()` `rowType` default; `⟳ Repeater` badge in header
- `report-designer/index.html` — `#rsRowType` select + `#rsRepeaterSection` controls in row-style panel
- `js/modules/property-panel.js` — `openRowStylePanel()` populates repeater fields; `bindPropPanel()` binds toggle; `applyRowStyle()` saves `rowType`/`repeaterConfig`
- `js/modules/preview.js` — `buildDetailCard()` branches on `rowType === "repeater"`; `buildRepeaterSubRowEl()` helper added
- `js/modules/json-modal.js` — emit/hydrate `rowType`, `repeaterConfig`
- `css/preview.css` — `.pv-repeater-item`, `.pv-repeater-more`
- `css/canvas.css` — `.row-repeater-badge`
- `js/data/format-library.js` — R0007 template with 3 repeater showcase formats

**Regression checklist (all pass):**
- [x] All Phase 1/2 normal rows render identically — `rowType` defaults to `"normal"`, no change
- [x] `rowStyle`, `rowVariant`, `rhythm` all still apply on repeater items (merged styling)
- [x] Indicator still renders on card (not inside repeater loop)
- [x] `isExpandedRow` still hides/shows correctly — repeater rows support expand visibility
- [x] Level visibility on cells still filters within repeater column rendering
- [x] `colSpan` still works on repeater columns (e.g. product name spanning 2 cols)
- [x] JSON omits `rowType`/`repeaterConfig` for normal rows → old JSON unchanged
- [x] Import of old JSON hydrates with `rowType: "normal"` default
- [x] Drill/back/breadcrumb navigation unaffected
- [x] Copy-format and paste-JSON import both work with new formats

---

### [2026-04-03] — Phase 2 Design Integration: Variants, Rhythm, Presets

**Branch:** `feature/integrate-all-design`

**What changed (Phase 2 — visual fidelity, variants, presets):**

**A) Row variants** (`rowVariant` on each row, default `"default"`):
- `default` — standard card row (no change from Phase 1 baseline)
- `stripHeader` — tinted blue header strip (`#e3f0fb` bg, bold blue text)
- `softPanel` — soft background panel (`#f0f4ff`, slight radius)
- `summary` — amber warning band (`#fff3e0`, orange border, bold values)
- `footerActions` — icon action row rendered as centred icon+label buttons (print / whatsapp / share / copy)

**B) Cell variants** (`cellVariant` on each cell, default `"text"`):
- `text` — standard icon + value (unchanged baseline)
- `iconText` — slightly larger icon prefix + value
- `metric` — large numeric value + small caption label below
- `metaPair` — uppercase caption label above, value below
- `emphasis` — bold accent-coloured value (`#1976D2`)
- `muted` — italic secondary text (`#999`)

**C) Vertical rhythm** (`rhythm` on each row, default `"normal"`):
- `compact` → `2px 8px` row padding
- `normal` → `4px 8px` row padding
- `spacious` → `8px 10px` row padding
- Explicit `rowStyle.paddingVertical/Horizontal` still overrides rhythm when set.

**D) Quick presets** (5 named presets in row-style panel):
- **Compact Ledger** — default/compact + divider
- **Strip Header** — stripHeader/normal + blue tint
- **Alert Summary** — summary/spacious + amber border
- **Footer Actions** — footerActions/compact + light bg
- **Soft Detail Card** — softPanel/normal + light blue bg

**E) Action icons added to ICON_MAP** (for footer rows):
- `print` → 🖨, `share` → 📤, `whatsapp` → 💬, `copy` → ⎘

**F) Canvas header badges** — non-default `rowVariant` and `rhythm` shown as colour-coded badges in the row header. Non-default `cellVariant` shown as a cyan tag in the cell meta row.

**Files changed:**
- `js/modules/canvas.js` — `addRow()` + `addFieldToCell()` defaults; header badges; cell variant tag
- `js/modules/property-panel.js` — `openPropPanel()`, `openRowStylePanel()`, `applyPropPanel()`, `applyRowStyle()` all updated; `applyPreset()` + `PRESETS` map added; preset button binding
- `js/modules/preview.js` — `buildDetailCard()` refactored: rhythm padding, `pv-row--*` class, `footerActions` branch; `buildPreviewCellEl()` helper added; `buildFooterActionRow()` added
- `js/modules/json-modal.js` — emit `rowVariant`, `rhythm`, `cellVariant` (omit if defaults); hydrate all three on import
- `js/data/field-registry.js` — ICON_MAP extended with 4 action icons
- `js/data/format-library.js` — R0006 Variant Showcase template: 5 formats (F0001–F0005)
- `report-designer/index.html` — `#propCellVariant` select; `#rsVariant`, `#rsRhythm` selects + `#presetGrid`; 4 new `iconCaption` options
- `css/preview.css` — `.pv-row--*` variant classes; `.pv-cell--*` variant classes; `.pv-footer-actions`, `.pv-action-btn`
- `css/canvas.css` — `.row-variant-badge`, `.row-rhythm-badge`, `.tag-cell-variant`
- `css/property-panel.css` — `.preset-grid`, `.preset-btn`, `.preset-btn-active`

**Regression checklist (all pass):**
- [x] Existing Phase 1 layouts load and render identically
- [x] Existing Phase 1 `rowStyle` still applies correctly on top of rhythm base padding
- [x] `colSpan` still works (independent of `cellVariant`)
- [x] `footerActions` row renders icon grid instead of data cells
- [x] `metric` / `metaPair` cells show correct caption/value layout
- [x] Preset buttons populate form fields but do NOT auto-save (requires Apply)
- [x] JSON emit omits `rowVariant`/`rhythm`/`cellVariant` when at defaults
- [x] Import hydrates Phase 2 keys from JSON; missing keys fall back to safe defaults

---

### [2026-04-02] — Phase 1 Design Integration: Row Style + Column Span

**Branch:** `feature/integrate-all-design`

**What changed (Phase 1 only — visual foundation):**

**A) Row-level visual style controls**
- Each row now carries an optional `rowStyle` object: `background`, `borderColor`, `borderWidth`, `cornerRadius`, `paddingVertical`, `paddingHorizontal`, `showDivider`, `dividerColor`, `dividerStyle`.
- All fields default to "off" — existing layouts are visually identical if `rowStyle` is absent or empty.
- A **⬡ Row Style** button added to every canvas row header. When any style is active the button highlights (accent color).
- Clicking the button opens the property panel in **row-style mode**.

**B) Column span (per-cell `colSpan`)**
- Each cell now has a `colSpan` field (default 1).
- Editable via **Column Span** input in the property panel DISPLAY section (range 1–MAX_COLS).
- Canvas renders spanning cells with `grid-column: span N`; covered neighbour slots are skipped.
- Overlap auto-correction: if a span would cover a non-null cell, span is reduced + a warning toast shown.
- Canvas shows a purple `⊞×N` tag on spanning cells.

**C) JSON — additive only (fully backward-compatible)**
- `rowStyle` written to `fieldConfigs[i].rowStyle` only if non-empty.
- `colSpan` written to `columnConfig[j].colSpan` only if > 1.
- Import: `hydrateFromJSON` reads both fields with safe defaults if absent.

**Files changed:**
- `js/modules/canvas.js` — addRow, addFieldToCell, renderCanvas
- `js/modules/property-panel.js` — openPropPanel, openRowStylePanel, closePropPanel, applyPropPanel, applyRowStyle, bindPropPanel
- `js/modules/preview.js` — buildDetailCard
- `js/modules/json-modal.js` — generateJSON, hydrateFromJSON
- `index.html` — prop panel body: cellPropSections wrapper, propColSpan input, rowStyleSection
- `css/canvas.css` — .row-btn-style, .row-btn-style-active, .tag-span

**Also added — Advanced Format Library (format-library.js):**
- 5 templates × 3–5 formats = 18 total sample formats

---

### [2026-03-27] — Feature: Recovery autosave, Import/Copy format flow, Bootstrap modes

**Feature 1: Recovery state management (autosave/draft restore)**
- New module `js/modules/recovery.js` with full draft lifecycle
- Draft auto-saved to localStorage with debounce (1s) after every state render, immediate on import/save
- Scoped localStorage keys: `mcloud_draft_add_<templateId>` / `mcloud_draft_edit_<templateId>_<formatId>`
- On startup: checks for matching draft → shows recovery modal (Restore / Discard)
- Status chip in topbar: "Unsaved changes" (amber) / "Autosaved" (blue) / "Saved" (green)

**Feature 2: Import modal with tabs — Paste JSON + Copy Existing Format**
- Import modal now has two tabs: "Paste JSON" (existing) and "Copy Existing Format" (new)
- Copy Existing Format tab: Template dropdown → Format dropdown → JSON preview → Load / Copy buttons
- New data file `js/data/format-library.js` with `DUMMY_FORMAT_LIBRARY`

**Feature 3: Edit/Add context-aware initializer**
- Supports `window.DESIGNER_BOOTSTRAP` payload: `{ mode, templateId, formatId, templateName, initialJson }`
- Also supports legacy `window.DESIGNER_INIT` for backward compat

**Files changed:**
- `report-designer/js/data/format-library.js` — NEW
- `report-designer/js/modules/recovery.js` — NEW
- `report-designer/js/modules/json-modal.js` — rewritten import modal with tabs
- `report-designer/js/modules/topbar.js` — markDirty on input/indicator changes
- `report-designer/js/app.js` — new bootstrap flow
- `report-designer/js/utils.js` — renderAll now calls scheduleDraftSave
- `report-designer/index.html` — recovery modal, tabbed import modal, status chip

---

### [2026-03-27] — Fix: Group-level cards now render display columns

Group-level cards in the preview now render the user's selected display columns (`state.rows`) filtered by `levelVisibility` for that level, instead of showing the group field value.

**Files changed:** `report-designer/js/modules/preview.js`

---

### [2026-03-27] — Bugfix: Row-group / display-column collision & duplicate-add (3 issues)

1. **Group-level cards showed display columns** — removed `buildGroupSummaryRow()` call; group cards now render only the group value + drill chevron.
2. **Intermittent duplicate add for row-group fields** — fixed by shared handler with `stopPropagation()` + idempotency guard.
3. **Row-group reorder controls not fully visible** — fixed with `flex-shrink: 0` on `.group-actions` and overflow/ellipsis on chip label.

**Files changed:** `state.js`, `modules/preview.js`, `modules/canvas.js`, `modules/palette.js`, `css/panels.css`

---

### [2026-03-27] — Feature Update: Drill-down, Import, Identity, Naming

**Summary:** 11-feature scoped update across all modules. JSON remains backward-compatible.

Key features: On Tap/Double Tap auto-computed, preview back arrow, tap-to-expand terminal cards, amount field totals config, group field config panel, Show Expanded toggle removed, product naming updated, template/format identity fields, Import JSON + Edit mode, full JSON compatibility.

**Files changed:** All modules — see previous README changelog for full detail.

---

### [2026-03-26] — Modular File Separation

Separated `report-designer-single.html` into proper modular structure under `report-designer/` with 8 CSS + 9 JS + 1 HTML files.

---

### [2026-03-26] — Fix: 8 UI/UX Bugs

Fixed: isExpandedRow mismatch, preview text color rendering, click on filled cell, drop-on-filled confirm, Escape key, empty canvas state, MaxLine clamping, expanded row toggle description.

**Files changed:** `report-designer-single.html`

---

### [2026-03-16] — Phase 1 Complete: Initial Build

Full single-page Report Template Designer built:
- Left panel: searchable field palette (32 fields, 6 categories), card settings
- Center canvas: add/delete/reorder rows, 3-col cell grid, drag-drop fields
- Right panel: live mobile preview (phone shell, 3 sample cards)
- Property slide panel, JSON modal, save to localStorage, toast notifications

**Files created:** `report-designer/index.html`, `css/`, `js/`
