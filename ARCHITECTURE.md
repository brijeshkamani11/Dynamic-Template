# MCloud Report Template Designer — Architecture Reference

> This file is the technical reference for any AI model, IDE, or developer working on this project.
> Read this file before making any change, suggestion, or code generation.
> See also: [CHANGELOG.md](CHANGELOG.md) for change history.

---

## 1. PROJECT OVERVIEW

**Project Name:** MCloud Report Template Designer
**Type:** Web-based visual designer (single-page HTML application)
**Purpose:** Allow non-technical users (customers) to design card-layout templates for reports
displayed in a Flutter-based mobile app (MCloud). Users drag/click fields onto a grid canvas,
configure properties, and the tool generates a JSON config that the Flutter app consumes to
render report cards with real data.

**Key Principle:** User needs zero technical/design/Dart knowledge to use this tool.

---

## 2. TECH STACK

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | Pure HTML5 + CSS3 + Vanilla JavaScript (ES6+)  |
| Libraries   | None currently. DevExtreme CDN allowed if needed. jQuery allowed if needed. No React, No Angular, No Vue. |
| Backend     | ASP.NET Web API / .NET Core (separate project, not in scope here) |
| Storage     | LocalStorage (Phase 1 demo). Real: REST API POST endpoint (future) |
| Build tool  | None. Open `report-designer/index.html` via local server or Live Server. |

---

## 3. FILE STRUCTURE

```
project-root/
│
├── report-designer/              ← MAIN APPLICATION (modular, separated by concern)
│   ├── index.html                   Entry point — links all CSS & JS files
│   ├── css/
│   │   ├── themes.css               All theme definitions (design token blocks per theme)
│   │   ├── variables.css            CSS reset, layout sizing, shared button classes
│   │   ├── topbar.css               Top bar & logo styles
│   │   ├── panels.css               Left panel (field palette), card settings
│   │   ├── canvas.css               Center canvas, rows, cells, grid
│   │   ├── property-panel.css       Slide-in property editor overlay
│   │   ├── preview.css              Right panel, phone shell, preview cards
│   │   ├── modal.css                JSON modal & toast notifications
│   │   └── responsive.css           Media query breakpoints
│   └── js/
│       ├── theme-manager.js         Theme registry, init, toggle, localStorage persist
│       ├── data/
│       │   ├── field-registry.js    FIELD_REGISTRY, SAMPLE_DATA, MOCK data, ICON_MAP
│       │   └── format-library.js    DUMMY_FORMAT_LIBRARY (sample formats), LAYOUT_LIBRARY
│       ├── state.js                 Application state object, constants, variant registries
│       ├── utils.js                 Shared: renderAll, showToast, color converters
│       ├── modules/
│       │   ├── palette.js           Field palette build, search, drag support
│       │   ├── canvas.js            Row/cell CRUD, canvas DOM rendering
│       │   ├── preview.js           Mobile preview rendering, drill-down, tab switching
│       │   ├── property-panel.js    Prop panel open/close/apply logic, presets
│       │   ├── recovery.js          Autosave, draft lifecycle, recovery modal
│       │   ├── json-modal.js        JSON generation, import, validation, hydration
│       │   └── topbar.js            Topbar bindings, mode switching, save, keyboard
│       └── app.js                   Boot orchestrator (DOMContentLoaded)
│
├── README.md                     ← Entry point — links here and to CHANGELOG.md
├── ARCHITECTURE.md               ← THIS FILE. Technical reference.
├── CHANGELOG.md                  ← Full change history.
├── PROJECT_REVIEW.md             ← External code review findings (2026-04-03)
├── Dynamic Template Initial JSON Required Properties.pdf
└── MCloud App Card Designs.pdf
```

**Primary deliverable:** `report-designer/index.html` — modular version, open via Live Server or local server.
**`report-designer-single.html` has been removed.** The modular version is now the sole version.
**File counts:** 9 CSS + 13 JS + 1 HTML.

### JS Load Order (in index.html)
Scripts must load in this order due to global function dependencies:
1. `js/theme-manager.js` — theme init (must run before any rendering)
2. `js/data/field-registry.js` — data constants
3. `js/data/format-library.js` — sample format library
4. `js/state.js` — state object, constants, variant registries
5. `js/utils.js` — shared utilities (used by all modules)
6. `js/modules/palette.js` — field palette
7. `js/modules/canvas.js` — canvas (depends on property-panel.js for openPropPanel)
8. `js/modules/preview.js` — preview (depends on utils.js for argbToHex)
9. `js/modules/property-panel.js` — property panel (depends on canvas.js for removeFieldFromCell)
10. `js/modules/recovery.js` — autosave & draft recovery
11. `js/modules/json-modal.js` — JSON generation, import, validation
12. `js/modules/topbar.js` — topbar, mode switching, save, keyboard (depends on json-modal.js)
13. `js/app.js` — boot (calls all bind/build functions)

---

## 4. JSON STRUCTURE (The Output Format)

This is the exact JSON the designer must produce. Flutter app consumes this.
Do NOT change this structure without explicit instruction.

### Full Template JSON (mode: "full", the default)

```json
{
  "layoutType": "grid",
  "gridSize": { "rows": 2 },
  "templateId": "R0001",
  "formatId": "F0001",
  "reportDisplayName": "Account Ledger",
  "indicator": {
    "isShow": true,
    "dataField": "R0001F0006"
  },
  "mOnTap": "expand",
  "mOnDoubleTap": "",
  "fieldConfigs": [
    {
      "isExpandedRow": false,
      "columnCount": 2,
      "columnConfig": [
        {
          "dataField": "R0001F0001",
          "col": 1,
          "caption": "Party Name",
          "iconCaption": "person",
          "style": {
            "color": "0xFF1565C0",
            "fontSize": 14,
            "fontWeight": "bold",
            "fontFamily": "Quicksand-Bold"
          },
          "display": {
            "layout": "inline",
            "accentColor": "#1976D2"
          }
        },
        {
          "dataField": "R0001F0006",
          "col": 2,
          "caption": "Balance",
          "textAlign": "right",
          "totalConfig": {
            "includeTotal": true,
            "totalScopeLevel": "all"
          }
        }
      ],
      "rowStyle": {
        "background": "#e3f0fb",
        "paddingVertical": 6,
        "paddingHorizontal": 8,
        "cornerRadius": 6,
        "borderBottomColor": "#b0cfe8",
        "textColor": "#1565C0",
        "textFontWeight": "600"
      }
    },
    {
      "isExpandedRow": true,
      "columnCount": 1,
      "columnConfig": [
        {
          "dataField": "R0001F0002",
          "col": 1,
          "caption": "City",
          "iconCaption": "location",
          "levelVisibility": [1, 2]
        }
      ],
      "rowType": "repeater",
      "repeaterConfig": {
        "mockKey": "transactions",
        "maxItems": 3,
        "showDivider": true,
        "showMoreFooter": true
      }
    }
  ],
  "groupFields": [
    { "level": 1, "fieldId": "f002", "dataField": "R0001F0002", "label": "City" }
  ],
  "drillConfig": {
    "enabled": true,
    "levelCount": 2,
    "terminalLevel": 2
  }
}
```

### Layout Only JSON (mode: "layout")

```json
{
  "layoutType": "grid",
  "mode": "layout",
  "gridSize": { "rows": 1 },
  "fieldConfigs": [
    {
      "isExpandedRow": false,
      "columnCount": 2,
      "columnConfig": [
        {
          "placeholderId": "ph_1",
          "placeholderLabel": "Party",
          "col": 1,
          "caption": "Placeholder"
        },
        {
          "placeholderId": "ph_2",
          "placeholderLabel": "Balance",
          "col": 2,
          "caption": "Placeholder",
          "textAlign": "right"
        }
      ]
    }
  ]
}
```

**Key rules for JSON generation:**
- `col` is 1-indexed (col 1, 2, … up to MAX_COLS)
- `columnCount` = number of non-null cells in the row
- `style` object is omitted if all values are default/empty
- `textAlign` is omitted if "left" (default)
- `maxLine` is omitted if 1 (default)
- `colSpan` is omitted if 1 (default)
- `iconCaption` is omitted if empty
- `levelVisibility` is omitted if "all" (default)
- `rowStyle` is omitted if empty/default
- `rowType` is omitted if "normal" (default)
- `repeaterConfig` is only present when `rowType === "repeater"`
- `groupFields` and `drillConfig` are omitted when no group fields are set
- `indicator` is omitted in layout mode JSON
- `gridSize.rows` = count of non-expanded rows only
- Color format is ARGB string: `"0xFF"` + hex (e.g. `"0xFF1565C0"`)
- `isExpandedRow: true` rows only show when card is tapped/expanded in Flutter
- `rowVariant`, `rhythm`, and `cellVariant` are **not emitted** — their effects are expanded into `rowStyle` and `display` objects respectively
- Layout mode JSON has a top-level `"mode": "layout"` marker; full mode has no `mode` key

---

## 5. FIELD DATA MODEL

### dataField Key Format
- Format: `R####F####` — e.g. `R0001F0001`
- `R0001` = Report ID (backend assigned)
- `F0001` = Field ID within that report (backend assigned)
- Users never see or type these keys. They are hidden from UI.
- In production: field list comes from API based on selected Report ID.
- In Phase 1: hardcoded sample registry in `fields.js` / inline script.

### Field Registry Structure (per field)
```javascript
{
  id: "f001",                    // internal designer ID
  label: "Party Name",           // shown to user in palette
  dataField: "R0001F0001",       // backend key, used in JSON output
  defaultCaption: "Party Name",  // pre-filled caption when dropped
  category: "Account",           // grouping in field palette
  groupable: true,               // true = can be used as a group/drill-down field
  isAmount: false                // true = amount fields (enables totalConfig in JSON)
}
```

### Current Field Categories & Count
- Account: 6 fields (Party Name, City, Bill No, Account Group, Amount, Balance)
- Transaction: 6 fields (Voucher No, Voucher Type, Date, Narration, Debit Amount, Credit Amount)
- GST: 6 fields (GST Ass. Amount, SGST, CGST, IGST, CESS, Total Expense)
- Stock: 6 fields (Product Name, Product Group, Quantity, Rate, Prod. Amount, UOM)
- Order: 5 fields (Order No, Order Date, Order Qty, Delivered Qty, Pending Qty)
- Outstanding: 3 fields (Due Days, Bill Amount, Pending Amount)
- **Total: 32 fields**

### Sample Data (for live preview)
Hardcoded dummy values mapped by dataField key in `SAMPLE_DATA` object.
Numbers auto-formatted as Indian currency (₹ with en-IN locale).

### iconCaption Enum (fixed list, no free text)
```
location, amount, date, phone, email, person, invoice, stock, print, share, whatsapp, copy
```
Maps to emoji in preview: 📍 ₹ 📅 📞 ✉ 👤 🧾 📦 🖨 📤 💬 ⎘

The four action icons (`print`, `share`, `whatsapp`, `copy`) are intended for use in `footerActions` variant rows.

---

## 6. UI LAYOUT & COMPONENTS

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo | Template Name Input | Clear / JSON / Save   │
├──────────────┬──────────────────────────────┬───────────────┤
│  LEFT PANEL  │       CENTER CANVAS          │  RIGHT PANEL  │
│  (260px)     │       (flex: 1)              │  (280px)      │
│              │                              │               │
│ Field Palette│  Toolbar: +AddRow | toggle   │ Live Preview  │
│ (searchable) │                              │ (phone shell) │
│              │  Rows:                       │               │
│ Categories:  │  ┌─────────────────────────┐ │ Normal tab    │
│ - Account    │  │ Row 1 header + actions  │ │ Expanded tab  │
│ - Transaction│  │ [Col1] [Col2] [Col3]    │ │               │
│ - GST        │  └─────────────────────────┘ │ 3 sample cards│
│ - Stock      │  ┌─────────────────────────┐ │               │
│ - Order      │  │ Row 2 ...               │ │               │
│ - Outstanding│  └─────────────────────────┘ │               │
│              │                              │               │
│ ─────────── │                              │               │
│ Card Settings│                              │               │
│ - mOnTap     │                              │               │
│ - mOnDoubleTap                              │               │
│ - Indicator  │                              │               │
└──────────────┴──────────────────────────────┴───────────────┘
```

### Components Detail

**Field Palette (left panel top)**
- Searchable by label/caption
- Grouped by category with headers
- Each chip: label + "+" button
- Draggable (HTML5 drag API)
- Click "+" → auto-place in first empty cell; if none, adds new row

**Canvas (center)**
- Each row = `canvas-row-wrap` div
- Row header: Row N badge | Normal/Expanded toggle badge | ↑↓ move | ⤵ toggle | ✕ delete
- Cell grid: dynamic columns (1–MAX_COLS), CSS grid with 1fr per column
- Empty cell: shows "Drop field here / Col N" hint
- Filled cell: shows field label, caption in mono, style tags
- Hover on filled cell: shows ✎ edit + ✕ remove buttons
- Drag-over cell: blue dashed highlight

**Property Panel (slide-in from right, z-index overlay)**
- Opens when clicking ✎ on a filled cell
- Fields: Caption, Icon Caption (select), Text Align (3 buttons), Max Lines
- Style: Font Size, Font Weight (Normal/Bold toggle), Font Family (select), Text Color (color picker)
- Behavior: Expanded Row toggle (checkbox with toggle-switch UI)
- Footer: Remove Field (danger) | Apply (primary)
- Closes on overlay click or ✕

**Mobile Preview (right panel)**
- Phone shell with status bar + app bar (static decoration)
- Renders 3 identical sample cards using SAMPLE_DATA
- Normal tab: shows only non-expanded rows
- Expanded tab: shows all rows including expanded
- Indicator: colored left bar (green/red) based on field value sign
- Updates in real-time on every state change

**JSON Modal**
- Triggered by "{ } JSON" button in topbar
- Shows generated JSON in syntax-colored `<pre>` block
- Copy button with confirmation flash

**Toast notifications**
- Bottom-center, slide up animation
- success (green border) and warn (amber border) types
- Auto-dismiss after 3 seconds

---

## 7. APPLICATION STATE MODEL

```javascript
state = {
  // ── Identity (from bootstrap or defaults) ──────────────
  templateName      : "",              // from topbar input
  templateId        : "R0001",         // from bootstrap payload
  formatId          : "F0001",         // from bootstrap payload
  reportDisplayName : "Account Ledger",// from bootstrap payload

  // ── Designer mode ───────────────────────────────────────
  designerMode : "full",               // "full" | "layout" — controls palette, JSON generation, cell type

  // ── Tap behavior (auto-computed from groupFields) ───────
  mOnTap       : "expand",            // "expand" (no groups) | "navigate" (groups present)
  mOnDoubleTap : "",

  // ── Indicator (colored left bar in preview) ─────────────
  indicator : {
    isShow    : false,
    dataField : ""
  },

  // ── Group/drill-down fields (full mode only) ────────────
  // Each entry: { fieldId, dataField, label }
  // Order defines hierarchy. groupFields.length > 0 triggers drillConfig in JSON.
  groupFields : [],

  // ── Canvas rows ─────────────────────────────────────────
  rows: [
    {
      id           : "row_1234567890_ab12",  // unique: "row_" + Date.now() + "_" + random4
      isExpandedRow: false,                   // shown only on tap in Flutter
      rowStyle     : {},                      // expanded style object (Phase 1)
      rowVariant   : "default",               // Phase 2: default|stripHeader|softPanel|summary|footerActions
      rhythm       : "normal",                // Phase 2: compact|normal|spacious
      rowType      : "normal",                // Phase 3: normal|repeater
      // repeaterConfig only present when rowType === "repeater":
      // { mockKey: "transactions"|"lineItems"|"bills", maxItems: 3, showDivider: true, showMoreFooter: true }
      cols: [
        null,       // empty cell slot
        {           // ── Full Mode Cell (FieldCell) ──────────
          uid             : "c1",          // auto-incremented string
          fieldId         : "f001",        // ref to FIELD_REGISTRY
          dataField       : "R0001F0001",  // copied from registry on drop
          caption         : "Party Name",
          iconCaption     : "",            // "" or enum value (see Section 5)
          textAlign       : "left",        // "left" | "center" | "right"
          maxLine         : 1,             // 1..5
          colSpan         : 1,             // 1..MAX_COLS (Phase 1)
          cellVariant     : "text",        // Phase 2: text|iconText|metric|metaPair|emphasis|muted
          levelVisibility : "all",         // "all" or array of 1-indexed level numbers e.g. [1,3]
          includeTotal    : false,         // amount fields only (Phase 1)
          totalScopeLevel : "all",         // "all" | "first" | number[] (Phase 1)
          display         : {},            // Phase 2: expanded variant control values
          style: {
            color      : "",              // ARGB string "0xFF######" or ""
            fontSize   : "",              // number or ""
            fontWeight : "normal",        // "normal" | "bold"
            fontFamily : ""              // "" | "Quicksand" | "Quicksand-Bold"
          }
        },
        {           // ── Layout Mode Cell (PlaceholderCell) ──
          uid              : "c2",
          placeholderId    : "ph_1",       // auto-incremented
          placeholderLabel : "Party",      // user-set label
          caption          : "Placeholder",
          iconCaption      : "",
          textAlign        : "left",
          maxLine          : 1,
          colSpan          : 1,
          cellVariant      : "text",
          levelVisibility  : "all",
          style            : { color: "", fontSize: "", fontWeight: "normal", fontFamily: "" }
        }
      ]
    }
  ]
}
```

> **Note:** `rowVariant`, `rhythm`, and `cellVariant` are internal editor-only state. They are NOT emitted directly to JSON — their values are expanded into `rowStyle` and `display` objects on export. On import, they are re-detected from those expanded values.

**State mutation pattern:**
1. Event fires
2. Mutate `state` object directly
3. Call `renderAll()` → `renderCanvas()` + `renderPreview()`
4. DOM is fully re-rendered from state (no partial updates)

---

## 8. KEY FUNCTIONS (by module)

### theme-manager.js
| Function | Purpose |
|---|---|
| `initTheme()` | Restores saved theme from localStorage; defaults to `classic-blue` |
| `setTheme(themeId)` | Applies `data-theme` attribute to `<html>`, persists to localStorage |
| `toggleTheme()` | Cycles through all entries in `THEMES` array |
| `getTheme()` | Returns current theme id string |
| `buildThemeSwitcher()` | Renders theme toggle button + dropdown in topbar |

### utils.js
| Function | Purpose |
|---|---|
| `renderAll()` | Re-renders canvas + preview from state; schedules autosave |
| `showToast(msg, type)` | Shows bottom toast notification (`success` or `warn`) |
| `hexToArgb(hex)` | `"#1565C0"` → `"0xFF1565C0"` |
| `argbToHex(argb)` | `"0xFF1565C0"` → `"#1565c0"` |

### modules/palette.js
| Function | Purpose |
|---|---|
| `buildFieldPalette()` | Two-stage palette: group-stage chips then column-stage chips |
| `buildIndicatorFieldSelect()` | Populates indicator field dropdown |
| `bindFieldSearch()` | Binds search input to palette filtering |
| `renderGroupStage()` | Renders groupable fields for drill-down selection |
| `renderColumnStage()` | Renders all fields for canvas cell placement |

### modules/canvas.js
| Function | Purpose |
|---|---|
| `renderCanvas()` | Builds all row/cell DOM from state.rows |
| `addRow()` | Appends new empty row to state.rows |
| `deleteRow(rowIdx)` | Removes row at index |
| `duplicateRow(rowIdx)` | Deep-clones row + inserts below (Phase 4) |
| `resetRowStyle(rowIdx)` | Clears rowStyle/rowVariant/rhythm/rowType/repeaterConfig (Phase 4) |
| `toggleExpandedRow(rowIdx)` | Flips `isExpandedRow` flag |
| `moveRow(rowIdx, dir)` | Swaps row with neighbour (+1 or -1) |
| `addColToRow(rowIdx)` | Appends a null cell slot to row |
| `removeColFromRow(rowIdx)` | Removes last cell slot from row |
| `addFieldToCell(fieldId, rowIdx, colIdx)` | Places field (full mode) into specific cell |
| `addPlaceholderToCell(rowIdx, colIdx)` | Places placeholder cell (layout mode) |
| `addFieldToFirstEmpty(fieldId)` | Auto-places field; adds new row if no empty cell |
| `removeFieldFromCell(rowIdx, colIdx)` | Nulls a cell |
| `flashCell(r, c)` | CSS flash animation on newly added cell |
| `bindCanvasToolbar()` | Binds add-row button |

### modules/preview.js
| Function | Purpose |
|---|---|
| `renderPreview()` | Entry: routes to group level or terminal level based on drill path |
| `renderGroupLevel(phoneList, level)` | Renders distinct group-value cards for current drill level |
| `renderTerminalLevel(phoneList)` | Renders detail cards (with expand/collapse) |
| `renderBreadcrumb()` | Renders drill navigation path above phone list |
| `bindPhoneBackArrow()` | Binds back-arrow button for drill-up |
| `buildDetailCard(record, level, isGroup, expandedIdx)` | Builds one card DOM element |
| `buildPreviewCellEl(record, cell, rowTextOverrides)` | Builds one cell DOM element with variant rendering |
| `buildRepeaterSubRowEl(items, row, record)` | Builds repeater sub-row list (Phase 3) |
| `buildFooterActionRow(row)` | Builds icon action row for `footerActions` variant |
| `bindPreviewTabs()` | Binds Normal/Expanded tab switching |

### modules/property-panel.js
| Function | Purpose |
|---|---|
| `openPropPanel(rowIdx, colIdx)` | Opens cell property editor panel |
| `openRowStylePanel(rowIdx)` | Opens row style/variant/rhythm editor panel |
| `closePropPanel()` | Closes panel and clears overlay |
| `applyPropPanel()` | Reads form → updates cell state → renderAll |
| `applyRowStyle()` | Reads form → updates row state → renderAll |
| `applyPreset(presetKey)` | Loads named preset into form fields (with overwrite guard) |
| `buildVariantControls(...)` | Renders variant-specific control inputs dynamically |
| `buildLevelVisibilityUI(cell)` | Renders per-level visibility checkboxes |
| `buildAmountTotalUI(cell)` | Renders total config controls for amount fields |
| `bindPropPanel()` | Binds all panel event listeners |

### modules/recovery.js
| Function | Purpose |
|---|---|
| `buildDraftPayload()` | Serializes full state to draft object (all row/cell/mode properties) |
| `saveDraftNow()` | Writes draft to localStorage immediately |
| `scheduleDraftSave()` | Debounced (1 s) autosave; skips until boot is complete |
| `getDraftKey()` | Returns scoped key: `mcloud_draft_add_<id>` or `mcloud_draft_edit_<id>_<fid>` |
| `readDraft(key)` | Reads and validates draft from localStorage |
| `hydrateFromDraft(draft)` | Restores full state from draft payload |
| `checkAndPromptRecovery(cb)` | Shows recovery modal at startup if matching draft found |
| `markBootComplete()` | Enables autosave after boot flow finishes |
| `clearDraft()` | Removes draft key from localStorage |
| `markDirty()` / `markSaved()` | Updates "Unsaved changes" / "Saved" status chip in topbar |

### modules/json-modal.js
| Function | Purpose |
|---|---|
| `generateJSON()` | Mode router → calls `generateFullJSON()` or `generateLayoutJSON()` |
| `generateFullJSON()` | Produces full-template JSON from state |
| `generateLayoutJSON()` | Produces layout-only JSON with `"mode":"layout"` marker |
| `openJSONModal()` | Stringifies JSON → displays in modal with syntax highlighting |
| `bindJSONModal()` | Binds copy and close buttons |
| `openImportModal()` | Shows tabbed import modal |
| `bindImportModal()` | Binds all import modal interactions (tabs, paste, load, copy) |
| `validateImportJSON(obj)` | Validates full-mode JSON; returns `{valid, error}` |
| `validateLayoutJSON(obj)` | Validates layout-mode JSON; returns `{valid, error}` |
| `hydrateFromJSON(json)` | Mode router → calls full or layout hydration |
| `hydrateFromFullJSON(json)` | Rebuilds state from full-template JSON (validated + clamped) |
| `hydrateFromLayoutJSON(json)` | Rebuilds state from layout-only JSON |

### modules/topbar.js
| Function | Purpose |
|---|---|
| `bindTopBar()` | Binds template name input, clear, save, JSON/import buttons |
| `bindCardSettings()` | Binds indicator checkbox/select and onTap/onDoubleTap |
| `switchDesignerMode(newMode)` | Switches between "full" and "layout" with confirmation and cell conversion |
| `syncModeUI()` | Updates topbar select + palette/canvas visibility to match `state.designerMode` |
| `syncUIFromState()` | Populates all form inputs from current state (used after import/recovery) |
| `saveTemplate()` | Validates → saves to localStorage (demo); marks saved, clears draft |
| `markDirty()` | Sets status chip to "Unsaved changes" (amber) |
| `updateStatusChip(text, cls)` | Updates topbar status chip text and CSS class |
| `bindKeyboard()` | Binds Escape key to close open panels/modals |
| `bindBeforeUnload()` | Warns browser before page unload if unsaved changes exist |
| `computeTapValues()` | Auto-sets mOnTap based on groupFields count |

---

## 9. DESIGN SYSTEM / CSS VARIABLES

Design tokens live in **`css/themes.css`** as `[data-theme="..."]` blocks on the `<html>` element. `css/variables.css` contains only layout constants, reset, and shared button classes — no color values.

### Available Themes

| Theme ID | Label | Description |
|---|---|---|
| `classic-blue` | Classic Blue (default) | Light cyan ERP look — matches Miracle Cloud reference images |
| `modern-dark` | Modern Dark | Original dark navy theme |

To add a new theme: add a `[data-theme="new-id"] { ... }` block to `themes.css` and register `{ id, label, icon }` in `THEMES` in `theme-manager.js`. Zero component CSS edits needed.

### Token Contract (all themes must define these)

| Token | Purpose | classic-blue | modern-dark |
|---|---|---|---|
| `--bg-app` | Main app background | `#dceef8` | `#0f1117` |
| `--bg-panel` | Sidebar panels | `#c8e6f5` | `#161b27` |
| `--bg-card` | Card elements | `#d0eaf6` | `#202840` |
| `--bg-cell` | Filled canvas cell | `#d8ecf7` | `#242d45` |
| `--bg-cell-empty` | Empty canvas cell | `#cce4f2` | `#1a2235` |
| `--border` | Default border | `#9ecbdf` | `#2d3a54` |
| `--border-light` | Hover/light border | `#78b8d4` | `#38476a` |
| `--accent` | Primary brand blue | `#1976D2` | `#3b82f6` |
| `--accent-hover` | Accent on hover | `#1565C0` | `#2563eb` |
| `--text-primary` | Main text | `#1a2b3c` | `#e8edf8` |
| `--text-secondary` | Secondary text | `#456175` | `#8b9bbf` |
| `--text-muted` | Muted/tertiary text | `#7a9bb5` | `#4e5f85` |
| `--topbar-h` | Topbar height | `48px` | `56px` |
| `--panel-w` | Left panel width | `260px` | `260px` |
| `--preview-w` | Right panel width | `280px` | `280px` |
| `--sidebar-bg` | Left sidebar background | `#003f5f` | `#0d1526` |
| `--font-ui` | UI font stack | `'DM Sans', 'Segoe UI', sans-serif` | `'DM Sans', sans-serif` |
| `--font-mono` | Monospace font | `'JetBrains Mono', Consolas` | `'JetBrains Mono', Consolas` |

Additional token families (all defined per theme): `--input-*`, `--btn-*`, `--table-*`, `--modal-*`, `--tab-*`, `--code-*`, `--phone-*`, `--shadow-*`, `--radius-*`, `--variant-*`, `--pv-*` (preview row variants).

Full token list: see `css/themes.css`.

---

## 10. WHAT IS NOT YET BUILT (Future Phases)

### Future (not scoped)
- Template list management (save/load/delete named templates)
- Real API integration (replace localStorage + mock data)
- Backend: ASP.NET endpoint to store/retrieve template JSON
- Row-level background color (dynamic, value-based)
- Field value formatting rules (date format, currency symbol)
- Conditional styling (color based on value positive/negative)
- Export template as shareable link
- Template versioning
- Nested group headers within repeater rows
- Dynamic `mockKey` driven by selected template's data schema

---

## 11. BUSINESS CONTEXT

- **Product:** MCloud — accounting ERP mobile app (Flutter)
- **Company:** RKIT Software Pvt. Ltd., Rajkot, Gujarat, India
- **Developer:** Brijesh Kamani (Full Stack, .NET Core + JS + jQuery + MySQL)
- **Users of this designer tool:** Non-technical customers/end-users of MCloud
- **Consumers of the JSON output:** Flutter app developers / Flutter runtime

**Report card concept:**
- Each report (Ledger, Day Book, Outstanding, Stock, Orders, etc.) shows data as a scrollable list of cards
- Each card = one data row (one party, one transaction, one product, etc.)
- Card layout defined by this JSON — rows of columns with field bindings
- Expanded rows show additional detail when user taps the card in the app

---

## 12. CONSTRAINTS & RULES (Permanent)

1. Max 5 columns per row (runtime limit; `MAX_COLS = 5` in state.js)
2. Field registry is per-report (dataField keys change per report type)
3. iconCaption is enum only — no free text (prevents Flutter icon lookup failure)
4. Color must be stored as ARGB string `"0xFF######"` for Flutter compatibility
5. JSON output keys must exactly match the structure in Section 4
6. No major JS framework (React/Angular/Vue) — jQuery + vanilla JS only
7. `report-designer/index.html` is the primary deliverable (modular, 8 CSS + 10 JS + 1 HTML)
8. Open via Live Server or any local HTTP server (file:// won't load separate JS/CSS)

---

## QUICK-START GUIDE (Non-Technical Users)

> **Goal:** Create a card layout like the example screenshots in 5 minutes.

### Step 1 — Load an example
Click **⬇ Import** → **Copy Existing Format** → pick a Template and Format → click **Load into Designer**.
This gives you a working card to start from. You can then tweak it.

### Step 2 — Add or remove rows
Each row is one horizontal line in the card. Click **+ Add Row** at the top of the canvas to add a new line.
Delete rows with the **✕** button, or move them up/down with **↑ ↓**.

### Step 3 — Add fields to cells
Fields (Party Name, Date, Amount, etc.) appear in the left panel.
Drag a field into an empty cell, or click a field to place it automatically.

### Step 4 — Style a row
Click the **⬡** button on any row to open the style panel.
For the fastest results, click one of the **Quick Presets** buttons — they instantly apply a common design style.
Click **Apply** when done.

### Step 5 — Duplicate a row
Already styled a row? Click **⧉** to duplicate it — saves repeating the same style setup.

### Step 6 — Preview
The **📱 Live Preview** panel on the right updates in real time. Tap the cards in the preview to see how expanded rows look.

### Step 7 — Save / Export
Click **⬆ Save Template** to save. Click **{ } JSON** to see the generated layout code.

---

## PRESET USAGE GUIDE

Presets are applied per-row via the **⬡ Row Style** button → **Quick Presets** section.

| Preset | Best used for |
|---|---|
| **Compact Ledger** | Dense transaction rows with thin dividers |
| **Header Strip** | Top row of a card — tinted blue strip with party/date |
| **Alert Card** | Overdue or warning rows — amber background |
| **Summary Band** | Total/balance rows — green highlight |
| **Line-Item List** | Product or order line item repeating rows |
| **Footer Actions** | Print / WhatsApp / Share icon row at card bottom |
| **Contact Compact** | Compact party + location/phone info row |
| **Detail Expanded** | Narration or extra detail row (shows on tap) |
| **Transaction List** | Repeating date + vou + DR/CR rows |
| **Soft Panel** | Subtle background panel for grouping related rows |

After clicking a preset, all form fields are updated — you can tweak before clicking **Apply**.
If the row already has a style, you'll be asked to confirm before overwriting.
Use **↺ Reset** in the panel footer to clear all style back to plain defaults.

---

## FEATURE MATRIX

| Feature | Phase | Status |
|---|---|---|
| Row/column grid canvas | Core | ✓ |
| Drag-and-drop field placement | Core | ✓ |
| Cell properties (caption, align, color, font) | Core | ✓ |
| Column span (merge cells) | Phase 1 | ✓ |
| Row visual style (background, border, radius, padding, divider) | Phase 1 | ✓ |
| Advanced format library (19 built-in formats) | Phase 1 | ✓ |
| Row variants (stripHeader, softPanel, summary, footerActions) | Phase 2 | ✓ |
| Cell variants (metric, metaPair, iconText, emphasis, muted) | Phase 2 | ✓ |
| Vertical rhythm (compact / normal / spacious) | Phase 2 | ✓ |
| Quick presets (10) | Phase 2/4 | ✓ |
| Repeater row blocks (line-item lists, transaction lists) | Phase 3 | ✓ |
| Mock data sources (transactions, lineItems, bills) | Phase 3 | ✓ |
| "+N more" footer on repeater rows | Phase 3 | ✓ |
| Duplicate row (one click) | Phase 4 | ✓ |
| Reset style (one click) | Phase 4 | ✓ |
| Plain-language import error messages | Phase 4 | ✓ |
| Confirm-before-preset-overwrite | Phase 4 | ✓ |
| Group / drill-down navigation | Core | ✓ |
| Tap-to-expand terminal cards | Core | ✓ |
| Copy existing format (tabbed import) | Core | ✓ |
| Autosave + draft recovery | Core | ✓ |
| JSON import/export (backward compatible) | All phases | ✓ |
| Real backend data binding | Future | — |
| Template version management | Future | — |
| Conditional styling (value-based colors) | Future | — |
