# MCloud Report Template Designer — Project Context & Journal
> **PURPOSE OF THIS FILE**
> This file is the single source of truth for any AI model, IDE, or developer working on this project.
> Read this ENTIRE file before making ANY change, suggestion, or code generation.
> After applying any change, update this file immediately in the CHANGELOG section.
> Never rewrite the entire project. Never restructure files. Apply only the specific change requested.

---

## ⚠ CRITICAL INSTRUCTIONS FOR ANY AI/MODEL READING THIS

1. **Read this file first, always.** Do not assume anything not written here.
2. **Never recreate the entire project.** Core is built. Only modify what is asked.
3. **Never change file structure, naming, or architecture** unless explicitly instructed.
4. **If a change is small (one function, one style, one field), generate ONLY that changed part.**
5. **After every change, append an entry to the CHANGELOG section at the bottom.**
6. **If something is unclear, ask before acting.** Do not guess.
7. **This file is the bridge between all AI tools (Claude, GPT, Gemini, Cursor, Copilot, etc.).**
   Whatever tool is used, this file keeps everyone on the same page.

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
│   │   ├── variables.css            CSS custom properties, reset, buttons
│   │   ├── topbar.css               Top bar & logo styles
│   │   ├── panels.css               Left panel (field palette), card settings
│   │   ├── canvas.css               Center canvas, rows, cells, grid
│   │   ├── property-panel.css       Slide-in property editor overlay
│   │   ├── preview.css              Right panel, phone shell, preview cards
│   │   ├── modal.css                JSON modal & toast notifications
│   │   └── responsive.css           Media query breakpoints
│   └── js/
│       ├── data/
│       │   └── field-registry.js    FIELD_REGISTRY, SAMPLE_DATA, ICON_MAP
│       ├── state.js                 Application state object & constants
│       ├── utils.js                 Shared: renderAll, showToast, color converters
│       ├── modules/
│       │   ├── palette.js           Field palette build, search, drag support
│       │   ├── canvas.js            Row/cell CRUD, canvas DOM rendering
│       │   ├── preview.js           Mobile preview rendering, tab switching
│       │   ├── property-panel.js    Prop panel open/close/apply logic
│       │   ├── json-modal.js        JSON generation & modal management
│       │   └── topbar.js            Topbar bindings, card settings, save, keyboard
│       └── app.js                   Boot orchestrator (DOMContentLoaded)
│
├── PROJECT_CONTEXT (1).md        ← THIS FILE. Always update after changes.
├── Dynamic Template Initial JSON Required Properties.pdf
└── MCloud App Card Designs.pdf
```

**Primary deliverable:** `report-designer/index.html` — modular version, open via Live Server or local server.
**`report-designer-single.html` has been removed.** The modular version is now the sole version.

### JS Load Order (in index.html)
Scripts must load in this order due to global function dependencies:
1. `js/data/field-registry.js` — data constants
2. `js/state.js` — state object & globals
3. `js/utils.js` — shared utilities (used by all modules)
4. `js/modules/palette.js` — field palette
5. `js/modules/canvas.js` — canvas (depends on property-panel.js for openPropPanel)
6. `js/modules/preview.js` — preview (depends on utils.js for argbToHex)
7. `js/modules/property-panel.js` — property panel (depends on canvas.js for removeFieldFromCell)
8. `js/modules/json-modal.js` — JSON generation
9. `js/modules/topbar.js` — topbar, save, keyboard (depends on json-modal.js for generateJSON)
10. `js/app.js` — boot (calls all bind/build functions)

---

## 4. JSON STRUCTURE (The Output Format)

This is the exact JSON the designer must produce. Flutter app consumes this.
Do NOT change this structure without explicit instruction.

```json
{
  "layoutType": "grid",
  "gridSize": { "rows": 2 },
  "indicator": {
    "isShow": true,
    "dataField": "R0001F0006"
  },
  "mOnTap": "expand",
  "mOnDoubleTap": "",
  "fieldConfigs": [
    {
      "isExpandedRow": false,
      "columnConfig": [
        {
          "dataField": "R0001F0001",
          "col": 1,
          "caption": "Party Name",
          "iconCaption": "person",
          "maxLine": 1,
          "textAlign": "left",
          "style": {
            "color": "0xFF1565C0",
            "fontSize": 14,
            "fontWeight": "bold",
            "fontFamily": "Quicksand-Bold"
          }
        },
        {
          "dataField": "R0001F0006",
          "col": 3,
          "caption": "Balance",
          "textAlign": "right"
        }
      ]
    },
    {
      "isExpandedRow": true,
      "columnConfig": [
        {
          "dataField": "R0001F0002",
          "col": 1,
          "caption": "City",
          "iconCaption": "location"
        }
      ]
    }
  ]
}
```

**Key rules for JSON generation:**
- `col` is 1-indexed (col 1, 2, or 3)
- `style` object is omitted if all values are default
- `textAlign` is omitted if "left" (default)
- `maxLine` is omitted if 1 (default)
- `iconCaption` is omitted if empty
- `gridSize.rows` = count of non-expanded rows only
- Color format is ARGB string: `"0xFF"` + hex (e.g. `"0xFF1565C0"`)
- `isExpandedRow: true` rows only show when card is tapped/expanded in Flutter

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
  category: "Account"            // grouping in field palette
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
location, amount, date, phone, email, person, invoice, stock
```
Maps to emoji in preview: 📍 ₹ 📅 📞 ✉ 👤 🧾 📦

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
- Cell grid: always 3 columns, CSS grid 1fr 1fr 1fr
- Empty cell: shows "Drop field here / Col N" hint
- Filled cell: shows field label, caption in mono, style tags
- Hover on filled cell: shows ✎ edit + ✕ remove buttons
- Drag-over cell: blue dashed highlight
- "Show Expanded Rows" checkbox in toolbar: when unchecked, expanded rows hidden from canvas

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
  templateName : "",           // from topbar input
  mOnTap       : "expand",     // card settings
  mOnDoubleTap : "",
  indicator    : {
    isShow    : false,
    dataField : ""
  },
  rows: [                      // array of row objects
    {
      id           : "row_1234567890",   // unique string
      isExpandedRow: false,
      cols         : [                   // always length 3
        null,                            // empty cell
        {                                // filled cell (FieldCell)
          uid        : "c1",             // internal unique counter
          fieldId    : "f001",           // ref to FIELD_REGISTRY
          dataField  : "R0001F0001",     // copied from registry
          caption    : "Party Name",
          iconCaption: "",
          textAlign  : "left",
          maxLine    : 1,
          style: {
            color      : "",
            fontSize   : "",
            fontWeight : "normal",
            fontFamily : ""
          }
        },
        null
      ]
    }
  ]
}
```

**State mutation pattern:**
1. Event fires
2. Mutate `state` object directly
3. Call `renderAll()` → `renderCanvas()` + `renderPreview()`
4. DOM is fully re-rendered from state (no partial updates)

---

## 8. KEY FUNCTIONS (by module)

### utils.js
| Function | Purpose |
|---|---|
| `renderAll()` | Re-renders canvas + preview from state |
| `showToast(msg, type)` | Shows bottom toast notification |
| `hexToArgb(hex)` | "#1565C0" → "0xFF1565C0" |
| `argbToHex(argb)` | "0xFF1565C0" → "#1565c0" |

### modules/palette.js
| Function | Purpose |
|---|---|
| `buildFieldPalette()` | Renders field chips in left panel |
| `buildIndicatorFieldSelect()` | Populates indicator field dropdown |
| `bindFieldSearch()` | Binds search input to palette rebuild |

### modules/canvas.js
| Function | Purpose |
|---|---|
| `renderCanvas()` | Builds all row/cell DOM from state.rows |
| `addRow()` | Pushes new row to state.rows |
| `deleteRow(rowIdx)` | Splices row from state.rows |
| `toggleExpandedRow(rowIdx)` | Flips isExpandedRow flag |
| `moveRow(rowIdx, dir)` | Swaps row with neighbour (+1/-1) |
| `addFieldToCell(fieldId, rowIdx, colIdx)` | Places field into specific cell |
| `addFieldToFirstEmpty(fieldId)` | Auto-places field, adds row if needed |
| `removeFieldFromCell(rowIdx, colIdx)` | Nulls a cell |
| `flashCell(r, c)` | CSS flash animation on newly added cell |
| `bindCanvasToolbar()` | Binds add-row button & expanded toggle |

### modules/preview.js
| Function | Purpose |
|---|---|
| `renderPreview()` | Builds phone card DOM from state.rows |
| `buildPreviewCard(sampleIdx)` | Creates one phone card element |
| `bindPreviewTabs()` | Binds Normal/Expanded tab switching |

### modules/property-panel.js
| Function | Purpose |
|---|---|
| `openPropPanel(rowIdx, colIdx)` | Opens property slide panel for a cell |
| `closePropPanel()` | Closes property panel |
| `applyPropPanel()` | Reads prop panel form → mutates cell/row state → renderAll |
| `bindPropPanel()` | Binds panel buttons & controls |

### modules/json-modal.js
| Function | Purpose |
|---|---|
| `generateJSON()` | Converts state → final JSON object |
| `openJSONModal()` | Stringifies JSON → shows in modal |
| `bindJSONModal()` | Binds modal close & copy buttons |

### modules/topbar.js
| Function | Purpose |
|---|---|
| `bindTopBar()` | Binds template name, clear, save, JSON buttons |
| `bindCardSettings()` | Binds onTap, onDoubleTap, indicator controls |
| `saveTemplate()` | Validates → saves to localStorage (demo) |
| `bindKeyboard()` | Binds Escape key to close panels/modals |

---

## 9. DESIGN SYSTEM / CSS VARIABLES

```css
--bg-app       : #0f1117   /* app background */
--bg-panel     : #161b27   /* panel background */
--bg-panel2    : #1c2336   /* secondary panel */
--bg-card      : #202840   /* card bg */
--bg-cell      : #242d45   /* filled cell bg */
--bg-cell-empty: #1a2235   /* empty cell bg */
--border       : #2d3a54   /* default border */
--border-light : #38476a   /* hover border */
--accent       : #3b82f6   /* primary blue */
--accent-glow  : rgba(59,130,246,0.25)
--accent-hover : #2563eb
--green        : #22c55e
--red          : #ef4444
--amber        : #f59e0b
--text-primary : #e8edf8
--text-secondary: #8b9bbf
--text-muted   : #4e5f85
--font-ui      : 'DM Sans', sans-serif
--font-mono    : 'JetBrains Mono', monospace
--topbar-h     : 56px
--panel-w      : 260px      /* left panel */
--preview-w    : 280px      /* right panel */
```

Phone preview uses light theme (white cards, #1976D2 app bar — Material Design blue).

---

## 10. WHAT IS NOT YET BUILT (Future Phases)

### Phase 2 (Planned)
- [ ] Template list management (save/load/delete named templates)
- [ ] Import existing JSON → populate canvas
- [ ] Report ID selector (loads field list from real API)

### Phase 3 (Planned)
- [ ] Column spanning / cell merging
- [ ] Multi-template management per report
- [ ] Real API integration (replace localStorage)
- [ ] Backend: ASP.NET endpoint to store/retrieve template JSON

### Future Considerations (not scoped)
- Row-level background color
- Field value formatting rules (date format, currency symbol)
- Conditional styling (color based on value positive/negative)
- Export template as shareable link
- Template versioning

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

1. Max 3 columns per row (hard limit from Flutter layout)
2. Field registry is per-report (dataField keys change per report type)
3. iconCaption is enum only — no free text (prevents Flutter icon lookup failure)
4. Color must be stored as ARGB string `"0xFF######"` for Flutter compatibility
5. JSON output keys must exactly match the structure in Section 4
6. No major JS framework (React/Angular/Vue) — jQuery + vanilla JS only
7. `report-designer/index.html` is the primary deliverable (modular, 8 CSS + 10 JS + 1 HTML)
8. Open via Live Server or any local HTTP server (file:// won't load separate JS/CSS)

---

## CHANGELOG
> Append new entries here. Never delete old entries. Format: `## [DATE] — CHANGE TITLE`

---

### [2026-03-16] — Phase 1 Complete: Initial Build

**What was built:**
- Full single-page Report Template Designer
- Left panel: searchable field palette (32 fields, 6 categories), card settings
- Center canvas: add/delete/reorder rows, 3-col cell grid, drag-drop fields
- Right panel: live mobile preview (phone shell, 3 sample cards, normal/expanded tabs)
- Property slide panel: caption, icon, align, maxLine, fontSize, fontWeight, fontFamily, color, expanded flag
- JSON modal with copy button
- Save to localStorage (simulated API)
- Toast notification system
- Full CSS design system (dark navy theme)

**Files created:**
- `report-designer/index.html` — HTML structure
- `report-designer/css/style.css` — full stylesheet
- `report-designer/js/fields.js` — FIELD_REGISTRY, SAMPLE_DATA, ICON_MAP
- `report-designer/js/designer.js` — all logic
- `report-designer-single.html` — single inlined file (PRIMARY)

**State:** Working. Open `report-designer-single.html` in any browser, no server needed.

---

### [2026-03-16] — Fix: Single File Inline

**Change:** `report-designer-single.html` recreated with CSS and JS fully inlined
inside `<style>` and `<script>` tags so it works in Claude.ai preview and any
environment without needing the separate css/ and js/ folders.

**Files changed:** `report-designer-single.html` only.

**State:** All features identical to Phase 1. Single file is self-contained.

---

### [2026-03-26] — Fix: 8 UI/UX Bugs

**Bugs found and fixed in `report-designer-single.html`:**

1. **`isExpandedRow` property mismatch** — Property panel was reading/writing `cell.isExpandedRow` instead of `row.isExpandedRow`. Toggle had no effect on JSON output or preview. Fixed to use row-level property.
2. **Preview text color rendering broken** — `cell.style.color` stored as ARGB (`"0xFF1565C0"`) but preview compared against hex `"#000000"` and injected raw ARGB into CSS. Fixed comparison to use `"0xFF000000"` and convert via `argbToHex()` before CSS injection.
3. **Clicking filled cell didn't open property panel** — Only the tiny pencil icon had a click handler. Added click handler on the entire `cell-filled` element.
4. **Dropping field on filled cell silently overwrites** — No confirmation dialog. Added `confirm()` before replacing an existing field.
5. **Escape key didn't close panels/modals** — Added global `keydown` listener for Escape key to close property panel and JSON modal.
6. **Empty canvas state shown incorrectly** — When all rows are expanded-only and toggle is off, canvas appeared blank with no guidance. Now shows contextual message: "All rows are expanded-only."
7. **MaxLine accepted invalid values** — `min="1" max="5"` HTML attributes only constrain stepper, not keyboard input. Added `Math.max(1, Math.min(5, ...))` clamping in `applyPropPanel`.
8. **Expanded Row toggle description** — Updated from "Only shows when card is expanded" to "Marks this field's row as expanded-only" for clarity.

**Files changed:** `report-designer-single.html`

---

### [2026-03-26] — Modular File Separation

**What changed:**
Separated the single-file `report-designer-single.html` into a proper modular structure under `report-designer/` for development convenience.

**New file structure (16 files):**

CSS modules (8 files):
- `css/variables.css` — CSS custom properties, reset, base styles, button classes
- `css/topbar.css` — Top bar, logo, template name input
- `css/panels.css` — Left panel (field palette, card settings), workspace layout
- `css/canvas.css` — Canvas area, rows, cells, cell grid, empty state
- `css/property-panel.css` — Slide-in property editor overlay
- `css/preview.css` — Right panel, phone shell, preview cards
- `css/modal.css` — JSON modal dialog & toast notifications
- `css/responsive.css` — Media query breakpoints (1100px, 860px)

JS modules (7 files):
- `js/data/field-registry.js` — FIELD_REGISTRY (32 fields), SAMPLE_DATA, ICON_MAP
- `js/state.js` — Application state object, constants (MAX_COLS), globals (_editTarget, etc.)
- `js/utils.js` — Shared: renderAll(), showToast(), hexToArgb(), argbToHex()
- `js/modules/palette.js` — Field palette build, search, indicator select
- `js/modules/canvas.js` — Row CRUD, cell CRUD, canvas rendering, drag-drop
- `js/modules/preview.js` — Mobile preview rendering, preview tab switching
- `js/modules/property-panel.js` — Property panel open/close/apply logic
- `js/modules/json-modal.js` — JSON generation & modal management
- `js/modules/topbar.js` — Topbar bindings, card settings, save, keyboard shortcuts
- `js/app.js` — Boot orchestrator (DOMContentLoaded entry point)

Entry point: `report-designer/index.html` — links all CSS and JS files in correct load order.

**All bug fixes from earlier this session are included in both versions.**

**State:** Both `report-designer-single.html` and `report-designer/index.html` are in sync and working.

---
