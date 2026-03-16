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
| Build tool  | None. Single HTML file, open directly in browser. |

---

## 3. FILE STRUCTURE

```
project-root/
│
├── report-designer-single.html   ← MAIN FILE. Single self-contained file.
│                                    CSS, JS all inlined. No external file deps
│                                    except Google Fonts CDN.
│
├── report-designer/              ← SEPARATED version (same code, 4 files)
│   ├── index.html
│   ├── css/style.css
│   ├── js/fields.js
│   └── js/designer.js
│
└── PROJECT_CONTEXT.md            ← THIS FILE. Always update after changes.
```

**Primary deliverable:** `report-designer-single.html` — this is what gets deployed/used.
The `report-designer/` folder is the development copy (easier to read/edit per file).
**Keep both in sync whenever a change is made.**

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

## 8. KEY FUNCTIONS (designer.js)

| Function | Purpose |
|---|---|
| `renderAll()` | Re-renders canvas + preview from state |
| `renderCanvas()` | Builds all row/cell DOM from state.rows |
| `renderPreview()` | Builds phone card DOM from state.rows |
| `buildPreviewCard(sampleIdx)` | Creates one phone card element |
| `addRow()` | Pushes new row to state.rows |
| `deleteRow(rowIdx)` | Splices row from state.rows |
| `toggleExpandedRow(rowIdx)` | Flips isExpandedRow flag |
| `moveRow(rowIdx, dir)` | Swaps row with neighbour (+1/-1) |
| `addFieldToCell(fieldId, rowIdx, colIdx)` | Places field into specific cell |
| `addFieldToFirstEmpty(fieldId)` | Auto-places field, adds row if needed |
| `removeFieldFromCell(rowIdx, colIdx)` | Nulls a cell |
| `openPropPanel(rowIdx, colIdx)` | Opens property slide panel for a cell |
| `closePropPanel()` | Closes property panel |
| `applyPropPanel()` | Reads prop panel form → mutates cell state → renderAll |
| `generateJSON()` | Converts state → final JSON object |
| `openJSONModal()` | Stringifies JSON → shows in modal |
| `saveTemplate()` | Validates → saves to localStorage (demo) |
| `buildFieldPalette()` | Renders field chips in left panel |
| `hexToArgb(hex)` | "#1565C0" → "0xFF1565C0" |
| `argbToHex(argb)` | "0xFF1565C0" → "#1565c0" |
| `showToast(msg, type)` | Shows bottom toast notification |
| `flashCell(r, c)` | CSS flash animation on newly added cell |

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
7. Single HTML file is the primary deliverable for deployment
8. Separated 4-file version kept in sync for development convenience

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
