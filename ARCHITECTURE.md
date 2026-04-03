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
├── README.md                     ← Entry point — links here and to CHANGELOG.md
├── ARCHITECTURE.md               ← THIS FILE. Technical reference.
├── CHANGELOG.md                  ← Full change history.
├── PROJECT_REVIEW.md             ← External code review findings (2026-04-03)
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
- `col` is 1-indexed (col 1, 2, … up to MAX_COLS)
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
  templateName : "",           // from topbar input
  mOnTap       : "expand",     // card settings (auto-computed)
  mOnDoubleTap : "",
  indicator    : {
    isShow    : false,
    dataField : ""
  },
  rows: [                      // array of row objects
    {
      id           : "row_1234567890_ab12",  // unique string (timestamp + random suffix)
      isExpandedRow: false,
      rowStyle     : {},                      // Phase 1: visual style (empty = all defaults)
      rowVariant   : "default",               // Phase 2: default|stripHeader|softPanel|summary|footerActions
      rhythm       : "normal",                // Phase 2: compact|normal|spacious
      rowType      : "normal",                // Phase 3: normal|repeater
      // repeaterConfig only present when rowType === "repeater":
      // { mockKey: "transactions"|"lineItems"|"bills", maxItems: 3, showDivider: true, showMoreFooter: true }
      cols         : [                        // array of null or FieldCell objects
        null,                                 // empty cell
        {                                     // filled cell (FieldCell)
          uid        : "c1",                  // internal unique counter
          fieldId    : "f001",                // ref to FIELD_REGISTRY
          dataField  : "R0001F0001",          // copied from registry
          caption    : "Party Name",
          iconCaption: "",
          textAlign  : "left",
          maxLine    : 1,
          colSpan    : 1,                     // Phase 1: 1..MAX_COLS
          cellVariant: "text",                // Phase 2: text|amount|badge|icon|date|link
          levelVisibility: "all",             // "all" or array of level indices
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
| `duplicateRow(rowIdx)` | Deep-clones row + inserts after source (Phase 4) |
| `resetRowStyle(rowIdx)` | Clears all visual properties on row (Phase 4) |
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
| `openRowStylePanel(rowIdx)` | Opens row-style slide panel (Phase 1) |
| `closePropPanel()` | Closes property panel |
| `applyPropPanel()` | Reads prop panel form → mutates cell/row state → renderAll |
| `applyRowStyle()` | Reads row-style form → mutates row state → renderAll |
| `applyPreset(presetKey)` | Applies named preset to current row (Phase 2/4) |
| `bindPropPanel()` | Binds panel buttons & controls |

### modules/json-modal.js
| Function | Purpose |
|---|---|
| `generateJSON()` | Converts state → final JSON object |
| `openJSONModal()` | Stringifies JSON → shows in modal |
| `hydrateFromJSON(json)` | Imports JSON → rebuilds state (validated + clamped) |
| `bindJSONModal()` | Binds modal close & copy buttons |

### modules/topbar.js
| Function | Purpose |
|---|---|
| `bindTopBar()` | Binds template name, clear, save, JSON buttons |
| `bindCardSettings()` | Binds onTap, onDoubleTap, indicator controls |
| `saveTemplate()` | Validates → saves to localStorage (demo) |
| `bindKeyboard()` | Binds Escape key to close panels/modals |

### modules/recovery.js
| Function | Purpose |
|---|---|
| `buildDraftPayload()` | Serializes full state to draft (all row/cell properties) |
| `saveDraftNow()` | Writes draft to localStorage |
| `scheduleDraftSave()` | Debounced (1s) autosave trigger |
| `hydrateFromDraft(draft)` | Restores full state from draft payload |
| `checkAndPromptRecovery(cb)` | Shows recovery modal at startup if draft exists |
| `markSaved()` / `markDirty()` | Updates save-status chip in topbar |

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
