# MCloud Template Card Designer — User Guide

> **Who is this for?** Business users and operators who want to design how their report cards look in the MCloud mobile app — no technical knowledge required.
> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for developer reference.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Screen Tour](#2-screen-tour)
3. [Control Reference](#3-control-reference)
4. [Core Workflows](#4-core-workflows)
5. [Feature Reference Table](#5-feature-reference-table)
6. [If You Want X, Do Y](#6-if-you-want-x-do-y)
7. [Troubleshooting](#7-troubleshooting)
8. [Best Practices](#8-best-practices)
9. [Glossary](#9-glossary)

---

## 1. Quick Start

### What does this tool do?

The MCloud Template Card Designer lets you design how a report looks in the MCloud mobile app — without writing any code.

You pick which fields to show (Party Name, Date, Amount, etc.), arrange them into rows, and style them (colors, font sizes, header strips, etc.). The tool generates a **JSON file** that the mobile app uses to display your data in cards.

Think of it like a layout editor for a business card — except the card shows live accounting data.

---

### How to open it

1. Open the file `report-designer/index.html` in a browser (use **Live Server** in VS Code, or any local server).
2. The designer opens with a blank canvas, ready to use.

---

### Your first template in 7 steps

| Step | What to do |
|---|---|
| **1** | Click **⬇ Import** → **Copy Existing Format** → pick any template → click **Load into Designer** |
| **2** | You now have a working card to start from. Look at the **📱 Preview** on the right. |
| **3** | Click **+ Add Row** (above the canvas) to add a new row to the card |
| **4** | In the left panel, click **+** on any field (e.g. "Party Name") to place it in the row |
| **5** | Click the **✎** (pencil) on any filled cell to open the Property Panel and change its caption or text size |
| **6** | Click the **⬡** button on a row to open Row Style — try clicking **Header Strip** under Quick Presets |
| **7** | Click **⬆ Save Template** when done. Click **{ } JSON** to see the generated config. |

---

## 2. Screen Tour

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP BAR: Logo | Template Name | Mode | Theme | Import | Save    │
├───────────────┬──────────────────────────────┬───────────────────┤
│  LEFT PANEL   │        CANVAS                │  PREVIEW PANEL    │
│               │                              │                   │
│ Field Palette │  [ + Add Row ]               │  📱 Phone preview │
│ (click + to   │                              │                   │
│  add fields)  │  ┌──────────────────────┐    │  Normal | Expanded│
│               │  │ Row 1  ↑↓ ⧉ ↺ ⬡ ✕  │    │                   │
│ ──────────── │  │ [Col 1] [Col 2]      │    │  Shows 3 sample   │
│               │  └──────────────────────┘    │  cards live       │
│ Card Settings │  ┌──────────────────────┐    │                   │
│ (indicator,   │  │ Row 2  ...           │    │                   │
│  tap actions) │  └──────────────────────┘    │                   │
└───────────────┴──────────────────────────────┴───────────────────┘
```

---

### Top Bar

| Element | What it is | When to use |
|---|---|---|
| **Template Name** (text box) | The name you give this layout | Fill this before saving |
| **Status chip** (e.g. "Unsaved changes") | Shows whether your work is saved | Check this before closing the browser |
| **Mode** (Full Template / Layout Only) | Switches between real-data mode and placeholder mode | Leave on "Full Template" unless designing a reusable skeleton |
| **Theme toggle** (🎨 button) | Switches the designer's visual theme | Personal preference — does not affect the exported card |
| **⬇ Import** | Opens the import dialog | Load an existing format or paste JSON |
| **✕ Clear** | Wipes the canvas completely | When you want to start fresh |
| **{ } JSON** | Shows the generated config code | When you need to copy the output |
| **⬆ Save Template** | Saves the template | After you're happy with the design |

---

### Left Panel

**Field Palette (top half)**
The palette shows all the data fields available for your report (Party Name, Date, Amount, etc.), grouped by category. There are two stages:

1. **Group Fields stage** — pick fields to group/drill-down by (e.g. group by City first, then by Party).
2. **Column Fields stage** — pick fields to show on the card rows.

Use the **search box** at the top to find a field quickly.

**Card Settings (bottom half)**
Controls that apply to the whole card:
- **Indicator** — enables a colored bar on the left side of each card (green = positive, red = negative).
- **On Tap / On Double Tap** — these are auto-set by the tool based on your group fields. You don't need to change them manually.

---

### Canvas (Center)

This is your design area. Each horizontal band is a **row**, and each row contains one or more **cells** (columns).

**Row header buttons:**

| Button | What it does |
|---|---|
| **↑ / ↓** | Move the row up or down |
| **⧉** | Duplicate the row (creates an exact copy below) |
| **↺** | Reset the row's style back to plain default |
| **⬡** | Open the Row Style panel |
| **✕** | Delete the row |
| **Normal / Expanded badge** | Click to toggle whether this row hides until the card is tapped |

**Inside a cell:**
- Empty cell shows "Drop field here" — click any field's **+** button to fill it.
- Filled cell shows the field name + a **✎** edit button and **✕** remove button (visible on hover).

---

### Preview Panel (Right)

Shows a live mobile phone preview with 3 sample data cards. Updates automatically every time you make a change.

- **Normal tab** — shows the card as it looks in the app by default.
- **Expanded tab** — shows what the card looks like after a user taps it (expanded rows appear).
- **Drill navigation** — if you set group fields, you can click cards in the preview to drill down through levels.

---

### Property Panel (slide-in)

Opens from the right side when you click **✎** on a filled cell. Lets you customize:
- Caption text, icon, alignment, max lines
- Column span (how wide the cell is)
- Cell variant (plain text, metric, bold, etc.)
- Font size, weight, family, and color
- Level visibility (which drill levels show this cell)
- For amount fields: total config

Click **Apply** to save. Click **✕** or outside the panel to cancel.

---

### Row Style Panel (slide-in)

Opens when you click **⬡** on a row. Lets you customize:
- Row variant (strip header, soft panel, summary band, footer actions)
- Vertical rhythm (compact, normal, spacious padding)
- Row type (normal or repeating list)
- Background color, border, corner radius, divider
- Quick Presets for one-click styles

Click **Apply** to save. Click **↺ Reset** at the bottom to clear all styling.

---

### Import / Export / Recovery

| Area | How to open | What it does |
|---|---|---|
| **JSON output** | **{ } JSON** button | View and copy the generated config |
| **Import** | **⬇ Import** button | Load from paste, existing format, or sample layouts |
| **Draft recovery** | Automatic popup on page load (if unsaved work exists) | Restore your last session's unsaved work |

---

## 3. Control Reference

### Top Bar Controls

---

#### Template Name Input
- **Where:** Center of the top bar
- **What it does:** Sets a display name for the template
- **When to use:** Before saving — this name may appear in the app's format list
- **Example:** `"Ledger — Party Summary"`
- **Common mistake:** Leaving it blank — the template saves with no name, making it hard to identify later

---

#### Mode Selector
- **Where:** Top bar, next to the template name
- **Options:** `Full Template`, `Layout Only`
- **What it does:**
  - **Full Template** — you bind real data fields to cells. This is the normal mode.
  - **Layout Only** — cells are placeholders with no field binding. Use this to design a reusable skeleton that can be adapted for different reports.
- **When to switch to Layout Only:** When you want to create a design template not tied to specific fields yet
- **Common mistake:** Switching modes after filling the canvas — the tool will convert or clear cells and will ask for confirmation

---

#### Theme Toggle
- **Where:** Top bar, small button with an icon
- **What it does:** Cycles between "Classic Blue" (light, ERP-style) and "Modern Dark" themes
- **When to use:** Personal preference — choose whichever is easier on your eyes
- **Impact:** Theme is saved in the browser and restored next time. It does NOT affect the exported JSON or the mobile app's appearance.

---

#### ⬇ Import Button
- **Where:** Top bar, right side
- **What it does:** Opens the Import dialog with three tabs
- **Tabs:**
  - **Paste JSON** — paste a raw JSON config to load it
  - **Copy Existing Format** — browse built-in templates and formats, preview, then load
  - **Sample Layouts** — load one of 4 built-in placeholder skeleton layouts (Layout Only mode)
- **When to use:** Starting from an existing design, or migrating an old format

---

#### ✕ Clear Button
- **Where:** Top bar, right side
- **What it does:** Clears everything on the canvas — all rows, cells, and settings
- **When to use:** When you want a completely fresh start
- **Common mistake:** Clicking Clear when you meant to delete just one row — use the row's **✕** button instead

---

#### { } JSON Button
- **Where:** Top bar, right side
- **What it does:** Opens a dialog showing the full generated JSON config for this layout
- **When to use:** To copy the output and paste it into the backend, share it, or review what was generated

---

#### ⬆ Save Template Button
- **Where:** Top bar, far right
- **What it does:** Saves the current design (in this demo, to browser storage); marks the template as "Saved"; clears the autosave draft
- **Common mistake:** Closing the browser before saving — the autosave draft will be offered on next open, but it's safer to click Save

---

### Canvas Controls

---

#### + Add Row Button
- **Where:** Above the canvas, in the canvas toolbar
- **What it does:** Adds a new empty row at the bottom of the canvas
- **When to use:** Whenever you need a new line in the card layout

---

#### ↑ / ↓ (Move Row)
- **Where:** Row header, left side
- **What it does:** Moves the row one position up or down
- **When to use:** To reorder rows after adding them
- **Common mistake:** Moving expanded rows above normal rows — the order in canvas is the order in the card

---

#### ⧉ (Duplicate Row)
- **Where:** Row header
- **What it does:** Creates an exact copy of the row (all cells, fields, styles) and places it directly below
- **When to use:** When multiple rows should look identical — style once, then duplicate
- **Example:** Duplicate a "strip header" styled row to reuse its formatting

---

#### ↺ (Reset Row Style)
- **Where:** Row header (only visible when the row has non-default styling)
- **What it does:** Clears all visual styling (background, border, padding, variant, rhythm) from the row without touching the fields inside
- **When to use:** When you want to undo all style changes on a row and go back to a plain look

---

#### ⬡ (Row Style)
- **Where:** Row header
- **What it does:** Opens the Row Style panel where you can change the row's appearance
- **When to use:** To apply a background color, header strip, summary band, or any visual style

---

#### Normal / Expanded Badge (on row header)
- **Where:** Row header, colored badge
- **What it does:** Toggles whether this row is an "expanded" row — expanded rows are hidden by default and only appear when the user taps the card in the app
- **When to use:** For detail rows you want hidden until the user taps (e.g. Narration, extra info)
- **Example:** Put "Party Name" and "Balance" in normal rows, put "Narration" in an expanded row

---

#### ✕ (Delete Row)
- **Where:** Row header, far right
- **What it does:** Removes the entire row and its contents permanently
- **No undo** — be sure before clicking

---

#### Cell + Button (add column to row)
- **Where:** Bottom of the row, small "+" button
- **What it does:** Adds an empty cell slot to the right of the row (up to 5 columns max)

---

#### Cell − Button (remove column)
- **Where:** Bottom of the row, "−" button
- **What it does:** Removes the rightmost cell slot from the row

---

#### Field + Button (in palette)
- **Where:** Left panel, next to each field name
- **What it does:** Places that field into the first empty cell. If no empty cell exists, adds a new row first.
- **Alternative:** Drag the field chip and drop it onto any empty cell

---

#### ✎ (Edit Cell)
- **Where:** Hover over a filled cell
- **What it does:** Opens the Property Panel for that cell
- **When to use:** To change caption, alignment, font size, color, variant, etc.

---

#### ✕ (Remove field from cell)
- **Where:** Hover over a filled cell, next to the edit button
- **What it does:** Clears the field from that cell (cell becomes empty again)

---

### Property Panel Controls

Opens when you click ✎ on a filled cell.

---

#### Caption
- **What it does:** The label shown on the card next to the field value (e.g. "Party:", "Balance:")
- **Default:** The field's default label from the registry
- **Tip:** Keep captions short — they appear in small text on the mobile card

---

#### Icon Caption
- **What it does:** Adds a small emoji icon before the value
- **Options:** None, Location 📍, Amount ₹, Date 📅, Phone 📞, Email ✉, Person 👤, Invoice 🧾, Stock 📦, Print 🖨, Share 📤, WhatsApp 💬, Copy ⎘
- **When to use:** To make rows more visual and easier to scan at a glance

---

#### Text Align
- **Options:** Left (default) | Center | Right
- **When to use right:** For numeric values like Balance, Amount, Debit/Credit — matches how numbers look in spreadsheets

---

#### Max Lines
- **What it does:** Limits how many lines the value text can wrap to
- **Range:** 1 to 5
- **Default:** 1 (no wrapping — text cuts off with "…")
- **When to use more than 1:** For fields that can have long text, like Narration or Address

---

#### Column Span
- **What it does:** Makes this cell stretch across multiple columns
- **Range:** 1 to 5 (limited by actual number of columns in the row)
- **When to use:** For a wide field like Party Name that should span the full width
- **Example:** Party Name with `colSpan: 2` in a 2-column row takes the full width

---

#### Cell Variant
- **What it does:** Changes how the caption and value are visually arranged
- **Options:**

| Variant | How it looks |
|---|---|
| **Text** (default) | Caption beside value, standard style |
| **Icon Text** | Slightly larger icon + value |
| **Metric** | Large number on top, tiny uppercase caption below |
| **Meta Pair** | Tiny caption above, value below (good for label+value stacking) |
| **Emphasis** | Bold, accent-colored value (draws attention) |
| **Muted** | Italic, grayed-out text (for secondary info) |

---

#### Level Visibility
- **What it does:** Controls at which drill-down levels this cell appears
- **Default:** "All levels" (checkbox: All Levels checked)
- **When to use:** To show different columns at different levels — e.g. show "City" only at the top level

---

#### Total Config (amount fields only)
- **What it does:** Tells the app to show a totals row for this amount field
- **Scope:** "All levels", "First level only", or specific levels
- **When to use:** For Debit, Credit, Balance, Amount fields where you want a running total

---

#### Style: Font Size
- **Range:** Any number (leave blank for app default)
- **Common values:** 10–14 for regular text, 16+ for prominent figures

---

#### Style: Font Weight
- **Options:** Normal | Bold
- **When to use Bold:** For party names, totals, important figures

---

#### Style: Font Family
- **Options:** (Default) | Quicksand | Quicksand-Bold
- **When to use:** Quicksand gives a rounded, modern look; useful for headings

---

#### Style: Text Color
- **What it does:** Sets the text color using a color picker
- **Default:** Blank (uses the app's theme color)
- **Common use:** Blue for headers, orange/red for overdue amounts

---

#### Remove Field (button)
- **What it does:** Clears the field from this cell (same as the ✕ on the canvas cell)

---

#### Apply (button)
- **What it does:** Saves all property panel changes and updates the preview
- **Common mistake:** Closing the panel without clicking Apply — changes are lost

---

### Row Style Panel Controls

Opens when you click **⬡** on a row.

---

#### Quick Presets
- **What it does:** One-click styles — applies a pre-configured look to the row
- **If the row already has a style:** A confirmation prompt appears before overwriting

| Preset | Best used for |
|---|---|
| **Compact Ledger** | Dense rows with thin dividers |
| **Header Strip** | Top row — tinted blue with bold text |
| **Alert Card** | Warning rows — amber background |
| **Summary Band** | Total rows — amber with bold values |
| **Line-Item List** | Repeating product/order line rows |
| **Footer Actions** | Print / Share / WhatsApp icon row |
| **Contact Compact** | Party + location/phone, very tight |
| **Detail Expanded** | Extra detail shown on tap |
| **Transaction List** | Repeating Date + Voucher + DR/CR rows |
| **Soft Panel** | Subtle light blue background group |

---

#### Row Variant
- **What it does:** Sets the visual style category for the row
- **Options:** Default | Strip Header | Soft Panel | Summary | Footer Actions
- **When to use:** Quick visual categorization of what this row represents

---

#### Rhythm (Vertical Spacing)
- **Options:** Compact | Normal | Spacious
- **What it changes:** The top/bottom padding inside the row
- **When to use Compact:** For dense lists with many rows. Spacious for summary/total rows.

---

#### Row Type
- **Options:** Normal | Repeating List
- **What it does:** A "Repeating List" row renders multiple sub-rows automatically, using mock data in the preview
- **When to use:** For transaction lists, line-item tables, or bill lists inside a card

---

#### Repeating List Settings (visible when Row Type = Repeating List)

| Control | What it does |
|---|---|
| **Mock Data** | Choose the data source: Transactions, Line Items, or Bills |
| **Items to Show** | Max number of sub-rows (1–10) |
| **Show Divider** | Add a line between each sub-row |
| **Show "+N more"** | Show a footer when there are more items than the limit |

---

#### Background Color
- Color picker — sets the row's background fill

#### Border Color / Width
- Sets the border around the row

#### Corner Radius
- Rounds the corners of the row (in pixels)

#### Padding (Vertical / Horizontal)
- Fine-tune the inner spacing. Overrides the Rhythm setting when set.

#### Divider
- **Show Divider toggle** — adds a horizontal line below the row
- **Divider Color** — color of that line
- **Divider Style** — Solid or Dashed

---

#### ↺ Reset (in panel footer)
- Clears ALL styling, variant, rhythm, and row type — returns the row to plain default

---

## 4. Core Workflows

### Build a Template From Scratch

1. Click **✕ Clear** if the canvas has any existing content.
2. Enter a **Template Name** in the top bar.
3. Click **+ Add Row** to add your first row.
4. From the left panel, click **+** on a field (e.g. "Party Name") — it fills the first empty cell.
5. Click **+** on another field to add a second column to the same row.
6. Repeat — add more rows as needed.
7. Style rows using **⬡** → Quick Presets.
8. Check the preview on the right to see how it looks.
9. Click **⬆ Save Template**.

---

### Add and Arrange Rows and Columns

- **Add a row:** Click **+ Add Row**
- **Add a column to an existing row:** Click the small **+** at the bottom of the row (up to 5 columns per row)
- **Remove a column:** Click **−** at the bottom of the row (removes the last slot)
- **Move a row:** Use the **↑ / ↓** buttons in the row header
- **Delete a row:** Click **✕** in the row header

**Tip:** Add a field before adding extra columns. The palette's **+** auto-fills the first empty slot. If all slots are filled, it adds a new row first.

---

### Edit a Cell's Properties

1. Hover over any filled cell — the **✎** pencil appears.
2. Click **✎** — the Property Panel slides in from the right.
3. Change caption, alignment, font size, color, or any other property.
4. Click **Apply** to save and update the preview.
5. Click **✕** or click outside the panel to close without saving.

---

### Apply Row Styling

1. Click **⬡** on any row header — the Row Style panel opens.
2. **Fastest approach:** Click one of the **Quick Presets** buttons (e.g. "Header Strip").
3. **Fine-tune:** Adjust background color, border, corner radius, padding as needed.
4. Click **Apply** to save.
5. To undo: click **↺ Reset** in the panel footer, or click the **↺** button on the row header in the canvas.

---

### Set Up Drill-Down Navigation

1. In the left panel, you'll see two stages of the palette. The first stage is for **Group Fields**.
2. Add group fields (e.g. City, then Account Group) by clicking **+** next to them. The order matters — first added = top drill level.
3. The preview will show group-level cards. Click a card to drill into the next level.
4. The **On Tap** behavior auto-switches to "Navigate" when group fields are set.
5. Use **Level Visibility** on cells (in the Property Panel) to show different columns at different levels.

---

### Preview and Verify

- The **📱 Preview panel** on the right always reflects the current state — no refresh needed.
- Switch between **Normal** and **Expanded** tabs to check both states.
- If group fields are set, click cards in the preview to navigate drill levels.
- The back arrow (←) in the preview returns to the previous level.

---

### Export the JSON

1. Click **{ } JSON** in the top bar.
2. A dialog shows the generated JSON config.
3. Click **Copy** to copy it to the clipboard.
4. Paste it into your backend system or share it.

---

### Import JSON / Copy an Existing Format

**Option A — Paste JSON:**
1. Click **⬇ Import** → **Paste JSON** tab.
2. Paste the JSON into the text area.
3. Click **Load**.

**Option B — Copy an Existing Format:**
1. Click **⬇ Import** → **Copy Existing Format** tab.
2. Select a **Template** from the dropdown.
3. Select a **Format** — a JSON preview appears on the right.
4. Click **Load into Designer** to apply it.

**Option C — Sample Layouts (Layout Only mode):**
1. Click **⬇ Import** → **Sample Layouts** tab.
2. Browse the 4 built-in layout skeletons.
3. Click one to preview, then **Load** to apply.

---

### Save and Recover Drafts

The designer **auto-saves your work every second** while you're editing. If you close the browser accidentally:

1. Reopen the designer.
2. A **recovery dialog** will appear: "Restore Draft" or "Discard".
3. Click **Restore Draft** to get your work back.
4. Click **Discard** to start fresh.

The **status chip** in the top bar shows:
- **"Unsaved changes"** (amber) — you have changes not yet saved with the Save button
- **"Autosaved"** (blue) — auto-saved a moment ago
- **"Saved"** (green) — you clicked Save and everything is current

---

### Work in Layout Only Mode

Layout Only mode lets you design a card structure without binding it to specific data fields. Good for creating template skeletons.

1. Select **Layout Only** from the Mode dropdown in the top bar.
2. The field palette disappears — the canvas still works normally.
3. Add rows and columns as usual. Each cell becomes a **placeholder** with a label you set.
4. Set placeholder labels in the Property Panel (e.g. "Party Name", "Balance").
5. Style rows exactly as in full mode.
6. Export the JSON — it will have `"mode": "layout"` and placeholder IDs instead of field names.

**Switching back to Full Template:** Placeholder cells are cleared (cannot auto-map to real fields). A confirmation dialog appears first.

---

## 5. Feature Reference Table

| Feature | What it solves | Required? | Best practice | Key controls |
|---|---|---|---|---|
| **Rows** | Defines horizontal lines on the card | Yes | Use 2–4 rows for readable cards | + Add Row, ↑↓, ✕ |
| **Columns (cells)** | Shows data fields side by side | Yes | Max 3 cols for phone screen readability | Field + button, +/− per row |
| **Field binding** | Links a cell to real report data | Yes (full mode) | Use default captions where possible | Palette + button |
| **Caption** | Labels the data field | No (defaults provided) | Keep under 12 characters | Property Panel |
| **Icon Caption** | Adds an emoji hint to the value | No | Use for key fields: party, location, date, amount | Property Panel → Icon |
| **Text Align** | Right-aligns numbers | No | Always right-align amounts and quantities | Property Panel → Align |
| **Max Lines** | Prevents text overflow | No | Set to 2–3 for Narration/Address fields | Property Panel |
| **Column Span** | Merges cells for wide fields | No | Use for Party Name or description fields | Property Panel |
| **Cell Variant** | Changes caption/value layout style | No | Use Metric for totals, Meta Pair for labels | Property Panel |
| **Expanded Row** | Hides detail until card is tapped | No | Put narration, extra info here | Row header toggle |
| **Row Style** | Visual design of each row | No | Use Quick Presets for consistent look | ⬡ button |
| **Row Variant** | Categorizes row appearance | No | Use Strip Header for top row, Summary for totals | Row Style panel |
| **Rhythm** | Controls row padding | No | Compact for dense lists, Spacious for totals | Row Style panel |
| **Repeater Row** | Shows a mini-list inside one row | No | Use for transactions, line items, bills | Row Style → Row Type |
| **Group Fields** | Enables drill-down navigation | No | Add in order: widest → narrowest group | Left panel — group stage |
| **Level Visibility** | Shows different cells per drill level | No | Use when same field makes no sense at all levels | Property Panel |
| **Indicator** | Colored left bar (green/red) | No | Use for balance or amount fields | Card Settings |
| **Total Config** | Shows totals for amount fields | No | Use for Debit, Credit, Balance | Property Panel (amount fields) |
| **Duplicate Row** | Copy a styled row instantly | No | Style one row first, then duplicate | ⧉ button |
| **Reset Style** | Remove all styling from a row | No | Use when a preset went wrong | ↺ button |
| **Autosave** | Protects against browser crash | Always on | Don't rely on it — click Save when done | Status chip |
| **Import** | Load existing formats | No | Great starting point — customise from there | ⬇ Import |
| **Layout Mode** | Design without field binding | No | Use for reusable skeleton templates | Mode dropdown |
| **Theme** | Designer UI appearance | No | Choose whatever is comfortable | Theme toggle |

---

## 6. If You Want X, Do Y

| I want to… | Steps |
|---|---|
| **Make the party name bigger** | Click ✎ on the Party Name cell → Font Size → enter `14` or higher → Apply |
| **Put the balance on the right side** | Click ✎ on the Balance cell → Text Align → click **Right** → Apply |
| **Show extra detail only when tapped** | Click the **Normal** badge on that row → it changes to **Expanded**. Row hides by default; shown on tap. |
| **Duplicate a styled row** | Click **⧉** on the row header — a copy appears directly below |
| **Reset a row's style back to plain** | Click **↺** on the row header, or open **⬡** → click **↺ Reset** at the panel bottom |
| **Start from a pre-built design** | Click **⬇ Import** → **Copy Existing Format** → pick any template/format → **Load** |
| **Import a JSON I already have** | Click **⬇ Import** → **Paste JSON** tab → paste → **Load** |
| **See the generated JSON code** | Click **{ } JSON** in the top bar → **Copy** to clipboard |
| **Recover unsaved work after a crash** | Reopen the designer → click **Restore Draft** in the popup |
| **Add a divider line below a row** | Click **⬡** on the row → enable **Show Divider** → pick color → **Apply** |
| **Show a colored side bar on cards** | Left panel → Card Settings → enable **Indicator** → pick a field (e.g. Balance) |
| **Make a header strip at the top of the card** | Click **⬡** on the top row → Quick Presets → **Header Strip** → Apply |
| **Add a repeating list of transactions** | Click **⬡** on a row → Row Type → **Repeating List** → pick **Transactions** → Apply |
| **Show a field only at the top drill level** | Click ✎ on the cell → Level Visibility → uncheck "All Levels" → check Level 1 only → Apply |
| **Merge two columns into one wide cell** | Click ✎ on the cell → Column Span → set to `2` → Apply |
| **Show a total/sum for an amount field** | Click ✎ on an amount cell → tick **Include in Total** → set scope → Apply |
| **Switch to a lighter / darker theme** | Click the theme toggle button in the top bar |
| **Design a layout without field binding** | Top bar → Mode → **Layout Only**. Add rows/columns as normal; cells become placeholders. |
| **Change the template name** | Click the template name text box in the top bar and type |
| **Add an emoji icon next to a value** | Click ✎ on the cell → Icon Caption → pick an icon → Apply |

---

## 7. Troubleshooting

### Import Errors

| Error message | What it means | What to do |
|---|---|---|
| "The pasted content is not valid JSON" | The text you pasted isn't proper JSON | Check for missing `{`, `}`, `,` or extra characters. Paste fresh from source. |
| "The layout type is missing or not 'grid'" | The JSON is from an incompatible system | Check that the JSON has `"layoutType": "grid"` at the top |
| "The layout has no row definitions" | `fieldConfigs` is missing or empty | The JSON is incomplete — check if it was copied fully |
| "Row N has no columns defined" | A row has no cells | Add at least one cell to every row in the JSON |
| "Row N repeater has an invalid mock data source" | The `mockKey` isn't one of the valid options | Use `"transactions"`, `"lineItems"`, or `"bills"` |
| "Please paste a JSON config first" | The paste box was empty when you clicked Load | Paste the JSON text before clicking Load |

---

### Canvas / Preview Issues

| Problem | Fix |
|---|---|
| Added a field but preview didn't change | Click **Apply** in the Property Panel — changes require Apply to take effect |
| Row style looks wrong in preview | The preview reflects the live state; try clicking ↺ Reset on the row if unsure |
| Column span reduced automatically with a warning | A span would have covered a non-empty cell — adjust cells first, then set span |
| Can't see expanded rows in preview | Switch to the **Expanded** tab in the preview panel |
| Drill-down not working in preview | Make sure you've added group fields in the left panel (group stage) |
| "+" field button didn't place the field on the canvas | All cells are full — click **+** on a row to add a new column slot first |
| Max 5 columns — can't add more | This is a hard limit — use Row Span or move fields to a different row |

---

### Saving / Recovery Issues

| Problem | Fix |
|---|---|
| No recovery popup appeared after a crash | The session may have been too short to auto-save. Start fresh. |
| "Autosaved" chip shows but Save was not clicked | Autosave protects against crashes but is not the same as a confirmed Save — click **⬆ Save Template** |
| Status chip keeps showing "Unsaved changes" | Click **⬆ Save Template** — the chip turns green ("Saved") |
| Saved template not found | In this demo, templates save to browser storage. Clearing browser data removes them. |

---

## 8. Best Practices

### Naming Templates
- Use a clear, specific name: `"Ledger — City Group Summary"` not `"Template 1"`
- Include the report type and what makes this format unique
- Avoid abbreviations that only you understand

### Start From a Working Example
- Use **⬇ Import → Copy Existing Format** to load a pre-built layout
- Modify it rather than building from scratch — it's faster and avoids blank-canvas mistakes

### Keep Cards Readable
- Aim for **2–4 rows** per card — more rows = harder to scan on a small phone screen
- Use **at most 3 columns** per row — 4–5 columns make text very small on mobile
- Use **Max Lines = 1** for most fields; only increase for narration/description fields

### Use the Preview Constantly
- The right panel updates live — check it after every change
- Switch between **Normal** and **Expanded** tabs to verify both states

### Style Consistently
- Use Quick Presets for a consistent look across rows
- If you duplicate a styled row, both copies share the same visual style — update only one if needed
- Use **Strip Header** for the top row and **Summary Band** for totals rows — these are recognizable patterns in the MCloud app

### Use Expanded Rows for Detail
- Keep the main card lean — put secondary info (Narration, Bill No, Address) in **Expanded** rows
- This keeps the card list fast to scan; users tap only when they need detail

### Save Often
- Autosave protects you, but click **⬆ Save Template** whenever you reach a good checkpoint
- The status chip tells you whether there are unsaved changes

### Avoid Accidental Overwrites
- The **Clear** button has no undo — be certain before using it
- When applying a **Quick Preset** to a row that already has styles, confirm the overwrite prompt carefully
- Switching modes (**Full ↔ Layout**) will clear or convert cell content — read the confirmation dialog

---

## 9. Glossary

| Term | Plain-language explanation |
|---|---|
| **Row** | A horizontal band on the card. A card can have multiple rows. Each row holds one or more cells side by side. |
| **Column / Cell** | One slot inside a row. Each cell displays one data field. A row can have 1–5 cells. |
| **Field** | A piece of data from the report — like "Party Name", "Date", or "Balance". Fields come from the system and are listed in the left panel. |
| **Caption** | The small label shown next to a field's value. Example: "Balance: ₹12,000" — "Balance" is the caption. |
| **Expanded Row** | A row that is hidden by default and only appears when the user taps the card. Good for secondary info. |
| **Indicator** | A colored vertical bar on the left side of each card. Green = positive value, Red = negative value. Based on a field you choose (like Balance). |
| **Variant (Row)** | A pre-defined visual style for a row — like a blue header strip, or an amber summary band. |
| **Variant (Cell)** | A pre-defined display layout for a cell — like showing a large number with a small caption below (Metric style). |
| **Rhythm** | The amount of vertical padding inside a row. Compact = tight, Normal = default, Spacious = roomy. |
| **Repeater Row** | A row that displays multiple sub-rows automatically — like a mini-table of transactions inside one card row. |
| **Group Fields** | Fields used to organize cards into levels for drill-down navigation. Example: Group by City → see all cities first, tap to see parties in that city. |
| **Drill-down** | Navigating from a summary level to a detail level by tapping a card. Enabled by adding Group Fields. |
| **Level** | One depth in drill-down navigation. Level 1 = top (e.g. Cities), Level 2 = next (e.g. Parties in a City), and so on. |
| **Level Visibility** | A setting that controls which drill levels a cell is shown at. Useful for showing different info at different levels. |
| **JSON** | The technical config file generated by this tool. The mobile app reads this file to know how to display your report cards. You don't need to understand it — just copy and submit it. |
| **Import** | Loading a JSON config into the designer so you can view and edit it. |
| **Export** | Clicking **{ } JSON** to get the config code to copy and submit. |
| **Autosave / Draft** | The designer automatically saves your work every second in the background. If you close without saving, a "Restore Draft" option appears next time. |
| **Preset** | A named style you can apply to a row in one click. Example: "Header Strip" applies a blue tinted background with bold white text. |
| **Template** | The complete layout design for one type of report card. One template can have multiple formats. |
| **Full Template mode** | The normal mode where cells are bound to real data fields from the report. |
| **Layout Only mode** | A mode for designing card structures with placeholder cells — not bound to any specific data field. |
| **Placeholder** | In Layout Only mode, a cell that has a label but no real data binding (e.g. "Party Name" placeholder). |
| **Column Span** | When a cell stretches across 2 or more column slots to take up more horizontal space. |
| **colSpan** | The technical name for Column Span (same thing — used in JSON). |
| **ARGB color** | The color format used internally (e.g. `0xFF1565C0`). You don't need to know this — the color picker handles it for you. |
