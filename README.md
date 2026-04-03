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

---

## CHANGELOG
> Append new entries here. Never delete old entries. Format: `## [DATE] — CHANGE TITLE`

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

**Remaining known limitations:**
- `⧉` duplicate and `↺` reset are not undoable (no undo stack yet — Phase 5 candidate)
- Preset overwrite confirmation is a native `confirm()` dialog — could be a custom modal in future
- `propResetStyle` button style is `.btn-ghost` (red hover) — could have a dedicated neutral style

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

**JSON extension example:**

*Before (Phase 1/2 normal row — unchanged):*
```json
{ "isExpandedRow": false, "columnCount": 4, "columnConfig": [...] }
```

*After (Phase 3 repeater row — new fields only added when needed):*
```json
{
  "isExpandedRow": false,
  "columnCount": 4,
  "rowType": "repeater",
  "repeaterConfig": { "mockKey": "transactions", "maxItems": 3, "showDivider": true, "showMoreFooter": true },
  "columnConfig": [
    { "dataField": "R0001F0009", "col": 1, "caption": "Date" },
    { "dataField": "R0001F0007", "col": 2, "caption": "Vou No" },
    { "dataField": "R0001F0011", "col": 3, "caption": "Debit",  "textAlign": "right" },
    { "dataField": "R0001F0012", "col": 4, "caption": "Credit", "textAlign": "right" }
  ]
}
```

**Image coverage:**

| Image pattern | Implemented | Coverage |
|---|---|---|
| Party header + repeating transaction rows | header row + repeater(transactions) | Exact |
| Product company + line-item list + "+N more" | header + repeater(lineItems) + more footer | Exact |
| Outstanding party + multiple bill rows | header + repeater(bills) | Exact |
| Divider between repeated items | `showDivider: true` | Exact |
| "+N more" overflow indicator | `showMoreFooter: true` | Exact |
| Summary/total row after item list | normal `summary` variant row | Exact |
| Mixed header/list/footer card | supported natively (rows are independent) | Exact |

**Phase 4 deferred items:**
- Real backend data binding (replace mock data with actual API list fields)
- Dynamic `mockKey` driven by selected template's data schema
- Repeater column span auto-layout (currently uses same `colSpan` as Phase 1)
- Nested group headers within repeater (e.g. group-by within a list)
- Drag-and-drop reordering of repeater items in canvas

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
- Clicking a preset populates all form fields for review; Apply then saves.

**E) Action icons added to ICON_MAP** (for footer rows):
- `print` → 🖨, `share` → 📤, `whatsapp` → 💬, `copy` → ⎘

**F) Canvas header badges** — non-default `rowVariant` and `rhythm` shown as colour-coded badges in the row header. Non-default `cellVariant` shown as a cyan tag in the cell meta row.

**Files changed:**
- `js/modules/canvas.js` — `addRow()` + `addFieldToCell()` defaults; header badges; cell variant tag
- `js/modules/property-panel.js` — `openPropPanel()`, `openRowStylePanel()`, `applyPropPanel()`, `applyRowStyle()` all updated; `applyPreset()` + `PRESETS` map added; preset button binding
- `js/modules/preview.js` — `buildDetailCard()` refactored: rhythm padding, `pv-row--*` class, `footerActions` branch; `buildPreviewCellEl()` helper added; `buildFooterActionRow()` added
- `js/modules/json-modal.js` — emit `rowVariant`, `rhythm`, `cellVariant` (omit if defaults); hydrate all three on import
- `js/data/field-registry.js` — ICON_MAP extended with 4 action icons
- `js/data/format-library.js` — R0006 Variant Showcase template: 5 formats (F0001–F0005) covering all 5 row variants and all 6 cell variants
- `report-designer/index.html` — `#propCellVariant` select in cell panel; `#rsVariant`, `#rsRhythm` selects + `#presetGrid` in row-style panel; 4 new `iconCaption` options
- `css/preview.css` — `.pv-row--*` variant classes; `.pv-cell--*` variant classes; `.pv-footer-actions`, `.pv-action-btn`; rhythm padding constants
- `css/canvas.css` — `.row-variant-badge`, `.row-rhythm-badge`, `.tag-cell-variant` with colour coding
- `css/property-panel.css` — `.preset-grid`, `.preset-btn`, `.preset-btn-active`

**Regression checklist (all pass):**
- [x] Existing Phase 1 layouts load and render identically (no Phase 2 keys in JSON → defaults applied)
- [x] Existing Phase 1 `rowStyle` still applies correctly on top of rhythm base padding
- [x] `colSpan` still works (independent of `cellVariant`)
- [x] `footerActions` row renders icon grid instead of data cells
- [x] `metric` / `metaPair` cells show correct caption/value layout
- [x] Preset buttons populate form fields but do NOT auto-save (requires Apply)
- [x] JSON emit omits `rowVariant`/`rhythm`/`cellVariant` when at defaults → clean output for legacy layouts
- [x] Import hydrates Phase 2 keys from JSON; missing keys fall back to safe defaults

**Phase 2 variant coverage matrix (R0006 formats):**

| Format | rowVariant used | cellVariant used | rhythm |
|--------|-----------------|------------------|--------|
| F0001 Compact Ledger | stripHeader, softPanel | emphasis, muted, metric, metaPair | compact |
| F0002 Strip Header Card | stripHeader, default, footerActions | muted, iconText, metric, metaPair | normal/compact |
| F0003 Alert Summary | default, summary, softPanel | emphasis, metric, iconText, metaPair | normal/spacious/compact |
| F0004 Soft Detail Card | softPanel, footerActions | emphasis, muted, metaPair, metric | normal/compact |
| F0005 All Variants Demo | stripHeader, default, softPanel, summary, footerActions | iconText, metric, metaPair, emphasis, muted | all 3 |

---

### [2026-04-02] — Phase 1 Design Integration: Row Style + Column Span

**Branch:** `feature/integrate-all-design`

**What changed (Phase 1 only — visual foundation):**

**A) Row-level visual style controls**
- Each row now carries an optional `rowStyle` object: `background`, `borderColor`, `borderWidth`, `cornerRadius`, `paddingVertical`, `paddingHorizontal`, `showDivider`, `dividerColor`, `dividerStyle`.
- All fields default to "off" — existing layouts are visually identical if `rowStyle` is absent or empty.
- A **⬡ Row Style** button added to every canvas row header. When any style is active the button highlights (accent color).
- Clicking the button opens the property panel in **row-style mode** (cell controls are hidden; row style controls shown): Background (checkbox+picker), Border (color+width), Corner, Padding V/H, Divider (toggle + color/style sub-options).

**B) Column span (per-cell `colSpan`)**
- Each cell now has a `colSpan` field (default 1).
- Editable via **Column Span** input in the property panel DISPLAY section (range 1–MAX_COLS).
- Canvas renders spanning cells with `grid-column: span N`; covered neighbour slots are skipped.
- Overlap auto-correction: if a span would cover a non-null cell, span is reduced + a warning toast shown.
- Canvas shows a purple `⊞×N` tag on spanning cells.

**C) Canvas rendering**
- Row-style background and border/radius applied as inline styles on `.canvas-row-wrap`.
- Row padding applied to the `.cell-grid` inner area.
- colSpan applied via CSS grid `gridColumn: span N`.

**D) Preview rendering**
- `rowStyle` applied to each `.preview-row` element (background, padding, border, divider).
- `colSpan` renders as proportional `flex` growth in the preview flex row.

**E) JSON — additive only (fully backward-compatible)**
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

**Regression checklist:**
1. ✅ Old JSON (no rowStyle/colSpan) loads and renders identically.
2. ✅ Grouping/drill/back unaffected (preview.js path unchanged).
3. ✅ Terminal tap-to-expand unaffected (buildDetailCard logic unchanged).
4. ✅ Import/edit flow unaffected (hydrateFromJSON handles missing fields gracefully).
5. ✅ Recovery restore unaffected (rowStyle:{} is serializable; old drafts missing it default safely).
6. ✅ Save flow unaffected (generateJSON omits new fields when default).
7. ✅ No row style = no visual change (all new inline styles conditional on non-empty values).

**Also added — Advanced Format Library (format-library.js):**
- 5 templates × 3–5 formats = 18 total sample formats (up from 6)
- Every new format exercises Phase 1 rowStyle and/or colSpan attributes
- See matrix below

| TemplateID | FormatID | Visual intent |
|---|---|---|
| R0001 | F0001 | Compact ledger — indicator, icon+text, bold balance |
| R0001 | F0002 | Grouped by City — drill navigation |
| R0001 | F0003 | Rich Card — header bg, dividers, expanded tinted row |
| R0001 | F0004 | GST Detail — colSpan party, 3-col GST table, red total |
| R0001 | F0005 | Transaction View — purple header, colSpan date, DR/CR colors |
| R0002 | F0001 | Day Book standard — indicator, date header |
| R0002 | F0002 | Day Book grouped by Type — drill |
| R0002 | F0003 | Colored Header — green header bg, colSpan party×3, DR/CR |
| R0002 | F0004 | 3-Column Full — bordered body, colSpan narration, DR/CR |
| R0003 | F0001 | Outstanding summary — red pending, due days |
| R0003 | F0002 | Outstanding grouped by City — drill |
| R0003 | F0003 | Invoice Detail — amber warning bg, colSpan party, expanded bill |
| R0003 | F0004 | Status Bands — orange bordered row, colSpan+city, 3-col amounts |
| R0004 | F0001 | Stock Compact — stock icon, 3-col qty/rate/uom |
| R0004 | F0002 | Stock Grouped — product group drill, levelVisibility |
| R0004 | F0003 | Order Summary — indigo header bg, colSpan party, qty status |
| R0004 | F0004 | Order Status View — colSpan order no, bordered party+pending |
| R0005 | F0001 | GST Basic — pink header, colSpan party, 2-row GST table |
| R0005 | F0002 | GST Full Detail — 3-col header, max complexity, expanded narration |
| R0005 | F0003 | GST by Party — group drill, levelVisibility on date vs party |

**Deferred to Phase 2/3/4:**
- Cell visual variants (text/icon/metric/badge)
- Repeater/nested line-item rows
- One-click style presets
- Action icon behavior system

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

### [2026-03-27] — Feature Update: Drill-down, Import, Identity, Naming

**Summary:** 11-feature scoped update across all modules. JSON remains backward-compatible; all new keys are additive only.

**A) On Tap / On Double Tap controls removed from UI**
- Removed `mOnTap` and `mOnDoubleTap` `<select>` elements from Card Settings in index.html
- Removed their bindings from `topbar.js` `bindCardSettings()`
- Added `computeTapValues()` in `state.js` — auto-sets `mOnTap` to `"navigate"` (if groupFields exist) or `"expand"` (flat)
- Values still present in generated JSON — now auto-decided, not user-selected

**B) Preview back arrow works (level navigation)**
- Made `.phone-back` arrow clickable in preview — pops `_drillPath` one level
- Bound in `preview.js` via `bindPhoneBackArrow()` (called from `bindPreviewTabs()`)
- Breadcrumb still present and functional with home + per-level links

**C) Expanded rows: tap-only behavior**
- Added `_expandedCardIdx` transient state — tracks which terminal card is tapped/expanded
- Detail cards are now clickable: tapping toggles expanded rows for that card only
- Expanded rows never auto-show — only appear after user tap on terminal-level (or only-level) card
- Normal/Expanded preview tabs removed from HTML and preview.js
- `_previewTab` variable removed (unused)

**D) Group field config placeholder panel**
- Added `⚙` config button per selected group field in palette.js
- Added `openGroupConfigPanel(idx)` / `closeGroupConfigPanel()` / `bindGroupConfigPanel()` in palette.js
- Added `#groupConfigPanel` + `#groupConfigOverlay` HTML elements (slide-in panel, same style as prop panel)
- Panel shows placeholder message — empty controls for future implementation

**E) Amount field metadata + totals config**
- Added `isAmount: true` to 9 amount/balance fields in `field-registry.js` (Amount, Balance, Debit Amount, Credit Amount, GST Ass. Amount, Total Expense, Prod. Amount, Bill Amount, Pending Amount)
- `addFieldToCell` in `canvas.js` auto-adds `includeTotal: false` and `totalScopeLevel: "all"` for amount fields
- Added `buildAmountTotalUI()` in `property-panel.js` — shows Include Total checkbox + scope radio (All/First/Specific levels)
- Added `#propAmountTotal` + `#propAmountTotalRow` in index.html
- `applyPropPanel()` reads and stores total config on cell
- JSON output includes `totalConfig: { includeTotal, totalScopeLevel }` per column (additive)

**F) Canvas scroll usability**
- Added `flex-shrink: 0` to `.canvas-row-wrap` in canvas.css — prevents rows from collapsing when many rows added
- Canvas `.canvas` div already had `overflow-y: auto` + `flex: 1` — confirmed working for scroll

**G) Show Expanded Rows toggle removed**
- Removed `<label class="toggle-label">` with `#toggleExpandedView` from canvas toolbar in index.html
- Removed its `change` event binding from `canvas.js` `bindCanvasToolbar()`
- `renderCanvas()` no longer filters rows by `_showExpandedInCanvas` — all rows always visible in canvas
- Expanded rows in preview follow new tap-only rule (Feature C)

**H) Product naming updated**
- Renamed `<title>` to "MCloud — Mobile Template Card Designer"
- Updated logo text from `<em>Template Designer</em>` to `<em>Mobile Template Card Designer</em>`
- Updated all JS file header comments to reference "Mobile Template Card Designer"
- Topbar em font-size adjusted to 12px for longer name

**I) Template/format identity**
- Added `DUMMY_TEMPLATE_ID = "R0001"`, `DUMMY_FORMAT_ID = "F0001"`, `DUMMY_TEMPLATE_NAME = "Account Ledger"` in state.js
- Added `templateId`, `formatId`, `reportDisplayName` to state object
- Added read-only "Format Identity" section in left panel (below Card Settings) showing Template ID, Format ID, Report Name
- Phone app bar title now uses `reportDisplayName` via `#phoneAppTitle`
- JSON output includes `templateId`, `formatId`, `reportDisplayName` (additive keys)

**J) Import JSON + Edit mode**
- Added "⬇ Import" button in topbar (`#btnImportJSON`)
- Added import modal HTML (`#importOverlay`) with textarea for pasting JSON
- Added `validateImportJSON(obj)` — checks for `layoutType: "grid"` + `fieldConfigs` array + per-column `dataField`
- Added `hydrateFromJSON(json)` — rebuilds full state from valid JSON (rows, cells, groupFields, indicator, identity)
- If JSON invalid: state unchanged, error shown in modal + toast
- Added `initDesigner(payload)` — supports `{ mode: "edit", json: {...} }` for caller-provided edit payloads
- Boot checks `window.DESIGNER_INIT` for external initialization
- Added `_designerMode` ("add"/"edit") transient state
- Keyboard Escape closes import modal

**K) JSON compatibility**
- No existing keys removed or renamed
- All new keys are additive: `templateId`, `formatId`, `reportDisplayName`, `groupFields[]`, `drillConfig`, `totalConfig`, `columnCount`
- `mOnTap` / `mOnDoubleTap` still present in output with auto-computed values

**Files changed:**
- `report-designer/index.html` — major HTML restructure (removed tap selects, preview tabs, expanded toggle; added import modal, group config panel, identity display, amount total section)
- `report-designer/js/state.js` — identity fields, `computeTapValues()`, `_expandedCardIdx`, `_designerMode`
- `report-designer/js/data/field-registry.js` — `isAmount: true` on 9 fields
- `report-designer/js/modules/palette.js` — group config button, `openGroupConfigPanel()`, `bindGroupConfigPanel()`
- `report-designer/js/modules/canvas.js` — removed expanded toggle binding, amount total defaults in `addFieldToCell`
- `report-designer/js/modules/preview.js` — complete rewrite: tap-to-expand, back arrow, no tabs, `_expandedCardIdx` support
- `report-designer/js/modules/property-panel.js` — `buildAmountTotalUI()`, amount total read in `applyPropPanel()`
- `report-designer/js/modules/json-modal.js` — `computeTapValues()` call, identity in JSON, amount `totalConfig`, full import system (`validateImportJSON`, `hydrateFromJSON`, `initDesigner`, import modal handlers)
- `report-designer/js/modules/topbar.js` — removed tap bindings, added import button binding, clear resets new state
- `report-designer/js/app.js` — updated boot: `bindImportModal`, `bindGroupConfigPanel`, `computeTapValues`, `DESIGNER_INIT` check
- `report-designer/css/modal.css` — import textarea + error styles
- `report-designer/css/panels.css` — identity display + group config button styles
- `report-designer/css/preview.css` — expanded card highlight style
- `report-designer/css/canvas.css` — row flex-shrink fix for scroll usability
- `report-designer/css/topbar.css` — logo em font-size for longer name

---

### [2026-03-27] — Bugfix: Row-group / display-column collision & duplicate-add (3 issues)

**Issue 1 — Group-level preview cards showed display columns (visual collision)**
- **Root cause:** `renderGroupLevel()` in `preview.js` called `buildGroupSummaryRow(level)` which rendered `state.rows` display column values (e.g. "Ahmed...", "A/1") inside each group-level card alongside the group value name. This made group cards look cramped/messy with unrelated column data colliding with the group value.
- **Fix:** Removed `buildGroupSummaryRow()` call from group card rendering. Group-level cards now show only the group value + drill chevron. Display columns (`state.rows`) render only at terminal/detail level. Removed dead `buildGroupSummaryRow()` function.
- **Clarification:** Group fields and display columns are independent — a field CAN be both a group field AND a display column. An earlier incorrect `isGroupField()` guard that blocked this was also removed.

**Issue 2 — Intermittent duplicate add for row-group fields**
- **Root cause:** In `palette.js` `renderGroupStage()`, each available group field chip had TWO separate click listeners — one on `.chip-add` (the "+" button) and one on the parent `.field-chip` element. When clicking "+", the click event bubbled from button to parent, firing both handlers and pushing the same field into `state.groupFields` twice.
- **Fix:** Replaced the two anonymous handlers with a single shared `addGroupField(e)` function that calls `e.stopPropagation()` to prevent bubble. Added idempotency guard: `if (state.groupFields.some(g => g.fieldId === f.id)) return;` — prevents duplicate insertion even under rapid double-click or re-render race.

**Issue 3 — Row-group reorder controls not fully visible**
- **Root cause:** ↑↓ reorder buttons existed in the HTML but could be pushed offscreen by long group field labels in the 260px panel. `.chip-label` had no overflow constraint, and `.group-actions` had no `flex-shrink: 0`.
- **Fix:** Added CSS: `.group-actions { flex-shrink: 0; }` and `.field-chip.group-selected .chip-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }`. Also added `_drillPath`/`_expandedCardIdx` reset on reorder/remove so preview reflects new hierarchy immediately.

**Files changed:**
- `report-designer/js/state.js` — removed dead `isGroupField()` function (was incorrectly blocking group fields from display columns)
- `report-designer/js/modules/preview.js` — removed `buildGroupSummaryRow()` call + function; group cards now show only group value + chevron
- `report-designer/js/modules/canvas.js` — removed incorrect `isGroupField()` guard from `addFieldToCell()`; group fields can be used as display columns
- `report-designer/js/modules/palette.js` — fixed duplicate-add (shared handler + stopPropagation + idempotency guard), added drill reset on reorder/remove
- `report-designer/css/panels.css` — `flex-shrink: 0` on `.group-actions`, overflow/ellipsis on `.group-selected .chip-label`
- `README.md` — this changelog entry

---

### [2026-03-27] — Fix: Group-level cards now render display columns, not group value

**What changed:**
Group-level cards in the preview no longer show the group field value as card content. Instead, they render the user's selected display columns (`state.rows`) filtered by `levelVisibility` for that level — identical to how terminal cards render but at the group level.

- If a user wants the group value visible in the card, they manually add that field as a display column in Stage B (Column selection) and set its level visibility.
- Tapping a group-level card still drills into the next level.
- Each group card uses a mock record filtered to that group value so column data is contextually correct.

**Files changed:**
- `report-designer/js/modules/preview.js` — rewrote `renderGroupLevel()` to use `buildDetailCard()` with level-filtered display columns instead of showing group value + chevron

---

### [2026-03-27] — Feature: Recovery autosave, Import/Copy format flow, Bootstrap modes

**Feature 1: Recovery state management (autosave/draft restore)**
- New module `js/modules/recovery.js` with full draft lifecycle
- Draft auto-saved to localStorage with debounce (1s) after every state render, immediate on import/save
- Scoped localStorage keys: `mcloud_draft_add_<templateId>` / `mcloud_draft_edit_<templateId>_<formatId>`
- Draft payload: `{ schemaVersion, mode, templateId, formatId, updatedAt, state: {...} }`
- On startup: checks for matching draft → shows recovery modal (Restore / Discard)
- Restore: hydrates full state from draft, renders all, marks dirty
- Discard: clears draft key, continues fresh
- Invalid/corrupt draft: ignored with warning toast
- `beforeunload` warning when unsaved changes exist; final autosave attempt on page close
- Status chip in topbar: "Unsaved changes" (amber) / "Autosaved" (blue) / "Saved" (green)
- `markSaved()` clears draft + sets status; `markDirty()` triggers autosave + updates chip

**Feature 2: Import modal with tabs — Paste JSON + Copy Existing Format**
- Import modal now has two tabs: "Paste JSON" (existing) and "Copy Existing Format" (new)
- Copy Existing Format tab: Template dropdown → Format dropdown (filtered) → JSON preview → Load / Copy buttons
- New data file `js/data/format-library.js` with `DUMMY_FORMAT_LIBRARY` containing 3 templates, 2 formats each (6 total)
- Template IDs: R0001 (Account Ledger), R0002 (Day Book), R0003 (Outstanding Report)
- Format IDs per template: F0001, F0002 — mix of flat and grouped layouts
- "Load into Designer" validates + hydrates same as paste import
- "Copy JSON" copies selected format JSON to clipboard
- All imports trigger `saveDraftImmediate()` for recovery protection

**Feature 3: Edit/Add context-aware initializer**
- Supports `window.DESIGNER_BOOTSTRAP` payload: `{ mode, templateId, formatId, templateName, initialJson }`
- Also supports legacy `window.DESIGNER_INIT` for backward compat
- Boot sequence: bind modules → read bootstrap → check recovery draft → hydrate edit JSON → fresh start
- Recovery prompt shown only if matching draft exists; edit-mode JSON loads only if no draft restored
- `_designerMode` set from bootstrap payload; identity fields populated from payload

**Validation guarantees:**
- `validateImportJSON()` checks layoutType, fieldConfigs array, per-column dataField
- `hydrateFromJSON()` validates first, returns false on failure with no state mutation
- `hydrateFromDraft()` checks schemaVersion, state shape, rows array before applying
- Invalid draft/import: state unchanged, clear error shown

**Dummy format library overview:**

| Template | Formats |
|---|---|
| R0001 — Account Ledger | F0001 (Compact, flat), F0002 (Grouped by City) |
| R0002 — Day Book | F0001 (Standard, flat), F0002 (Grouped by Voucher Type) |
| R0003 — Outstanding Report | F0001 (Summary, flat), F0002 (Grouped by City) |

**Files changed:**
- `report-designer/js/data/format-library.js` — NEW: dummy format library (6 format entries)
- `report-designer/js/modules/recovery.js` — NEW: autosave, draft read/write/validate, recovery prompt, status chip, beforeunload
- `report-designer/js/modules/json-modal.js` — rewritten import modal with tabs, copy-format handlers, updated initDesigner
- `report-designer/js/modules/topbar.js` — markDirty on input/indicator changes, recovery overlay in keyboard handler
- `report-designer/js/app.js` — new bootstrap flow: DESIGNER_BOOTSTRAP → recovery check → edit hydrate → fresh
- `report-designer/js/utils.js` — renderAll now calls scheduleDraftSave
- `report-designer/index.html` — recovery modal, tabbed import modal, status chip, format-library + recovery.js script tags
- `report-designer/css/topbar.css` — status chip styles (dirty/autosaved/saved)
- `report-designer/css/modal.css` — import tabs, copy-format controls, recovery modal styles
- `README.md` — this changelog entry

---
