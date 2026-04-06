# MCloud Report Template Designer — JSON Reference

> **Source of truth:** This document is derived from actual code in `js/modules/json-modal.js`, `js/state.js`, and `js/data/field-registry.js`.
> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for system overview, [CHANGELOG.md](CHANGELOG.md) for change history.

---

## Table of Contents

1. [Top-Level Properties](#1-top-level-properties)
2. [fieldConfigs — Row Array](#2-fieldconfigs--row-array)
3. [columnConfig — Cell Array](#3-columnconfig--cell-array)
4. [style — Cell Style Object](#4-style--cell-style-object)
5. [display — Cell Variant Config](#5-display--cell-variant-config)
6. [rowStyle — Row Visual Style Object](#6-rowstyle--row-visual-style-object)
7. [repeaterConfig — Repeater Row Config](#7-repeaterconfig--repeater-row-config)
8. [groupFields — Drill-Down Hierarchy](#8-groupfields--drill-down-hierarchy)
9. [drillConfig — Drill Navigation Config](#9-drillconfig--drill-navigation-config)
10. [indicator — Colored Side Bar](#10-indicator--colored-side-bar)
11. [totalConfig — Amount Totals (per cell)](#11-totalconfig--amount-totals-per-cell)
12. [Minimal Valid JSON Example](#12-minimal-valid-json-example)
13. [Rich Full Example](#13-rich-full-example)
14. [Layout Only Mode Example](#14-layout-only-mode-example)
15. [Backward Compatibility Notes](#15-backward-compatibility-notes)
16. [Common Mistakes and How Validation Handles Them](#16-common-mistakes-and-how-validation-handles-them)

---

## 1. Top-Level Properties

These properties sit at the root of the JSON object.

---

### `layoutType`
| | |
|---|---|
| **Type** | `string` |
| **Required** | Yes |
| **Allowed values** | `"grid"` |
| **Default** | — |
| **When omitted** | Import validation fails: "The layout type is missing or not 'grid'" |
| **Mode** | Both |
| **Example** | `"layoutType": "grid"` |

The layout engine selector. Currently only `"grid"` is supported. Must always be present.

---

### `mode`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Allowed values** | `"layout"` |
| **Default** | Absent (implies full-template mode) |
| **When omitted** | JSON is treated as full-template mode |
| **Mode** | Layout only |
| **Example** | `"mode": "layout"` |

Present only in layout-only JSON. Triggers `hydrateFromLayoutJSON()` on import instead of `hydrateFromFullJSON()`. Full-template JSON must NOT include this key.

---

### `gridSize`
| | |
|---|---|
| **Type** | `object` |
| **Required** | Yes |
| **Default** | — |
| **When omitted** | Import proceeds; `gridSize.rows` defaults to 0 |
| **Mode** | Both |
| **Example** | `"gridSize": { "rows": 2 }` |

Contains a single child property:

#### `gridSize.rows`
| | |
|---|---|
| **Type** | `number` |
| **Value** | Count of **non-expanded** rows (rows where `isExpandedRow === false`) |
| **Set by** | Auto-computed during JSON generation; do not set manually |

---

### `templateId`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | `"R0001"` (demo dummy value) |
| **When omitted** | State retains its current `templateId` |
| **Mode** | Full only |
| **Example** | `"templateId": "R0001"` |

Backend report identifier. Format: `R####`. Used to scope autosave draft keys.

---

### `formatId`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | `"F0001"` (demo dummy value) |
| **When omitted** | State retains its current `formatId` |
| **Mode** | Full only |
| **Example** | `"formatId": "F0001"` |

Backend format identifier within the report. Format: `F####`. Used alongside `templateId` in edit-mode draft keys.

---

### `reportDisplayName`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | `"Account Ledger"` (demo dummy value) |
| **When omitted** | State retains its current display name |
| **Mode** | Full only |
| **Example** | `"reportDisplayName": "Outstanding Report"` |

Human-readable report name shown in the preview phone app bar.

---

### `mOnTap`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Allowed values** | `"expand"`, `"navigate"` |
| **Default** | `"expand"` |
| **When omitted** | Defaults to `"expand"` |
| **Mode** | Full only |
| **Example** | `"mOnTap": "navigate"` |

Card tap behavior in Flutter app. **Auto-computed** by the designer: set to `"navigate"` when `groupFields` is non-empty, `"expand"` otherwise. Manually set values are overwritten by `computeTapValues()` at boot and after any group field change.

---

### `mOnDoubleTap`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | `""` (no action) |
| **When omitted** | Treated as empty string |
| **Mode** | Full only |
| **Example** | `"mOnDoubleTap": ""` |

Card double-tap behavior. Currently always `""` in the designer — reserved for future use.

---

### `fieldConfigs`
| | |
|---|---|
| **Type** | `array` |
| **Required** | Yes |
| **Min length** | 1 |
| **When omitted / empty** | Import validation fails: "The layout has no row definitions" |
| **Mode** | Both |

Array of row objects. See [Section 2](#2-fieldconfigs--row-array).

---

### `groupFields`
| | |
|---|---|
| **Type** | `array` |
| **Required** | No |
| **Default** | Absent (no drill-down) |
| **When omitted** | No drill-down navigation; `mOnTap` stays `"expand"` |
| **Mode** | Full only |

Array of group/drill-down field descriptors. See [Section 8](#8-groupfields--drill-down-hierarchy).

---

### `drillConfig`
| | |
|---|---|
| **Type** | `object` |
| **Required** | No |
| **Default** | Absent |
| **When omitted** | No drill-down; ignored if `groupFields` is also absent |
| **Mode** | Full only |

Auto-generated when `groupFields` is non-empty. See [Section 9](#9-drillconfig--drill-navigation-config).

---

### `indicator`
| | |
|---|---|
| **Type** | `object` |
| **Required** | No |
| **Default** | Absent (no indicator shown) |
| **When omitted** | No colored side bar rendered |
| **Mode** | Full only |

See [Section 10](#10-indicator--colored-side-bar).

---

## 2. `fieldConfigs` — Row Array

Each element in `fieldConfigs` represents one row on the card.

---

### `fieldConfigs[].isExpandedRow`
| | |
|---|---|
| **Type** | `boolean` |
| **Required** | No |
| **Default** | `false` |
| **When omitted** | Treated as `false` (normal row, always visible) |
| **Mode** | Both |
| **Example** | `"isExpandedRow": true` |

When `true`, this row only renders in Flutter when the card is tapped/expanded. In the designer preview, it is shown under the "Expanded" tab. Affects `gridSize.rows` (excluded from count).

---

### `fieldConfigs[].columnCount`
| | |
|---|---|
| **Type** | `number` |
| **Required** | No (informational) |
| **Value** | Count of non-null cells in the row |
| **Set by** | Auto-computed during export |
| **When omitted** | Import ignores this; cell count is derived from `columnConfig.length` |
| **Mode** | Both |
| **Example** | `"columnCount": 3` |

---

### `fieldConfigs[].columnConfig`
| | |
|---|---|
| **Type** | `array` |
| **Required** | Yes |
| **Min length** | 1 |
| **When omitted / empty** | Import validation fails for that row |
| **Mode** | Both |

Array of cell objects. See [Section 3](#3-columnconfig--cell-array).

---

### `fieldConfigs[].rowStyle`
| | |
|---|---|
| **Type** | `object` |
| **Required** | No |
| **Default** | Absent (all visual defaults apply) |
| **When omitted** | Row uses default appearance |
| **Mode** | Both |

Visual style overrides for the row. See [Section 6](#6-rowstyle--row-visual-style-object).

---

### `fieldConfigs[].rowType`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Allowed values** | `"normal"`, `"repeater"` |
| **Default** | `"normal"` (omitted from JSON when normal) |
| **When omitted** | Treated as `"normal"` |
| **Validation** | Clamped to `"normal"` if unrecognised value |
| **Mode** | Both |
| **Example** | `"rowType": "repeater"` |

`"repeater"` rows render multiple sub-rows in the preview using mock data from the selected `mockKey`. Only present in JSON when value is `"repeater"`.

---

### `fieldConfigs[].repeaterConfig`
| | |
|---|---|
| **Type** | `object` |
| **Required** | Only when `rowType === "repeater"` |
| **When omitted** | If `rowType` is `"repeater"`, repeater renders with no items |
| **Mode** | Both |

Present only when `rowType === "repeater"`. See [Section 7](#7-repeaterconfig--repeater-row-config).

---

## 3. `columnConfig` — Cell Array

Each element in `columnConfig` represents one cell in a row.

---

### `columnConfig[].col`
| | |
|---|---|
| **Type** | `number` |
| **Required** | Yes |
| **Range** | 1 to `MAX_COLS` (5) |
| **Default** | — |
| **Mode** | Both |
| **Example** | `"col": 1` |

1-indexed column position. Column 1 is leftmost. Gaps in `col` sequence (e.g. col 1 and col 3, skipping 2) are valid — null slots are not emitted.

---

### `columnConfig[].dataField`
| | |
|---|---|
| **Type** | `string` |
| **Required** | Yes (full mode only) |
| **Format** | `R####F####` e.g. `"R0001F0001"` |
| **Default** | — |
| **When omitted** | Import validation fails for that cell (full mode) |
| **Mode** | Full only |
| **Example** | `"dataField": "R0001F0001"` |

Backend field key. Maps to a real data value at runtime. Not present in layout mode JSON (use `placeholderId` instead).

---

### `columnConfig[].placeholderId`
| | |
|---|---|
| **Type** | `string` |
| **Required** | Yes (layout mode only) |
| **Format** | `ph_N` e.g. `"ph_1"` |
| **Default** | — |
| **Mode** | Layout only |
| **Example** | `"placeholderId": "ph_1"` |

Auto-incremented identifier for a placeholder cell. Used instead of `dataField` in layout mode.

---

### `columnConfig[].placeholderLabel`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | `""` |
| **Mode** | Layout only |
| **Example** | `"placeholderLabel": "Party Name"` |

User-assigned semantic label for the placeholder (e.g. what kind of data it will eventually bind to). Shown in the canvas cell chip.

---

### `columnConfig[].caption`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | Field's `defaultCaption` from registry (full mode), `"Placeholder"` (layout mode) |
| **When omitted** | Registry default is used |
| **Mode** | Both |
| **Example** | `"caption": "Party Name"` |

Display label rendered above or beside the value in Flutter cards. User-editable in the property panel.

---

### `columnConfig[].iconCaption`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | Absent / `""` |
| **When omitted** | No icon prefix shown |
| **Allowed values** | `""`, `"location"`, `"amount"`, `"date"`, `"phone"`, `"email"`, `"person"`, `"invoice"`, `"stock"`, `"print"`, `"share"`, `"whatsapp"`, `"copy"` |
| **Validation** | Clamped to `""` if unrecognised |
| **Mode** | Both |
| **Example** | `"iconCaption": "person"` |
| **Impact** | Renders an emoji prefix (📍 ₹ 📅 📞 ✉ 👤 🧾 📦 🖨 📤 💬 ⎘) before the value in preview |

Fixed enum — no free text. Free text would break Flutter icon lookup.

---

### `columnConfig[].textAlign`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Allowed values** | `"left"`, `"center"`, `"right"` |
| **Default** | `"left"` |
| **When omitted** | `"left"` is used |
| **Validation** | Clamped to `"left"` if unrecognised |
| **Emission rule** | Omitted from JSON when `"left"` (default) |
| **Mode** | Both |
| **Example** | `"textAlign": "right"` |

---

### `columnConfig[].maxLine`
| | |
|---|---|
| **Type** | `number` |
| **Required** | No |
| **Range** | 1 to 5 |
| **Default** | `1` |
| **When omitted** | `1` is used |
| **Validation** | Clamped: `Math.max(1, Math.min(5, value))` |
| **Emission rule** | Omitted from JSON when `1` (default) |
| **Mode** | Both |
| **Example** | `"maxLine": 2` |

Max lines the value text is allowed to wrap to in Flutter. Controls text overflow behaviour.

---

### `columnConfig[].colSpan`
| | |
|---|---|
| **Type** | `number` |
| **Required** | No |
| **Range** | 1 to `MAX_COLS` (5) |
| **Default** | `1` |
| **When omitted** | `1` is used |
| **Validation** | Clamped to `1..MAX_COLS`; reduced with toast if overlap detected |
| **Emission rule** | Omitted from JSON when `1` (default) |
| **Mode** | Both |
| **Example** | `"colSpan": 2` |

How many column slots this cell occupies. A cell at col 1 with `colSpan: 2` covers cols 1 and 2. Neighbour slots covered by a span are skipped (not emitted).

---

### `columnConfig[].levelVisibility`
| | |
|---|---|
| **Type** | `string` \| `number[]` |
| **Required** | No |
| **Default** | `"all"` |
| **When omitted** | `"all"` — cell visible at every drill level |
| **Allowed values** | `"all"` or an array of 1-indexed level numbers e.g. `[1, 3]` |
| **Validation** | Clamped: non-array non-"all" → `"all"`; array items below 1 removed |
| **Emission rule** | Omitted from JSON when `"all"` (default) |
| **Mode** | Full only (always `"all"` in layout mode) |
| **Example** | `"levelVisibility": [2, 3]` |

Controls at which drill levels this cell is rendered. Level 1 = top-level group list, last level = detail cards. Used to show different columns at different drill depths.

---

### `columnConfig[].style`
| | |
|---|---|
| **Type** | `object` |
| **Required** | No |
| **Default** | Absent |
| **When omitted** | Flutter uses its own default styling |
| **Emission rule** | Omitted if all sub-properties are default/empty |
| **Mode** | Both |

See [Section 4](#4-style--cell-style-object).

---

### `columnConfig[].display`
| | |
|---|---|
| **Type** | `object` |
| **Required** | No |
| **Default** | Absent / `{}` |
| **When omitted** | Standard `text` variant rendering |
| **Emission rule** | Omitted if cell variant is `"text"` with no customisation |
| **Mode** | Both |

Expanded cell variant configuration. See [Section 5](#5-display--cell-variant-config).

---

### `columnConfig[].totalConfig`
| | |
|---|---|
| **Type** | `object` |
| **Required** | No |
| **Default** | Absent |
| **When omitted** | No total row shown for this field |
| **Mode** | Full only (amount fields only) |

See [Section 11](#11-totalconfig--amount-totals-per-cell).

---

## 4. `style` — Cell Style Object

Nested inside each `columnConfig[]` entry. All properties are optional. Object is omitted entirely from JSON if all are default/empty.

---

### `style.color`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Format** | ARGB string: `"0xFF"` + 6-char hex, e.g. `"0xFF1565C0"` |
| **Default** | `""` (Flutter default text colour) |
| **When omitted / `""`** | Flutter uses theme default |
| **Validation** | Passed through as-is; invalid values may cause Flutter parse error |
| **Example** | `"color": "0xFF1565C0"` |

Text colour. Must be ARGB format for Flutter `Color.fromARGB` compatibility. The designer's color picker stores hex internally and converts via `hexToArgb()` on export.

---

### `style.fontSize`
| | |
|---|---|
| **Type** | `number` |
| **Required** | No |
| **Default** | `""` (Flutter default) |
| **When omitted / `""`** | Flutter uses theme default font size |
| **Example** | `"fontSize": 14` |

Font size in logical pixels.

---

### `style.fontWeight`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Allowed values** | `"normal"`, `"bold"` |
| **Default** | `"normal"` |
| **When omitted** | `"normal"` |
| **Validation** | Clamped to `"normal"` if unrecognised |
| **Example** | `"fontWeight": "bold"` |

---

### `style.fontFamily`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Allowed values** | `""`, `"Quicksand"`, `"Quicksand-Bold"` |
| **Default** | `""` (Flutter default font) |
| **When omitted / `""`** | Flutter theme default |
| **Validation** | Clamped to `""` if unrecognised value |
| **Example** | `"fontFamily": "Quicksand-Bold"` |

---

## 5. `display` — Cell Variant Config

Nested inside each `columnConfig[]` entry. Carries the expanded configuration for cell variants (`metric`, `metaPair`, `iconText`, `emphasis`, `muted`). When the cell variant is plain `text` with no customisation, this object is absent from JSON.

The designer does **not** emit a `cellVariant` key to JSON — the variant is fully described by the properties in `display`.

### Structural properties (from variant `baseDisplay`)

#### `display.layout`
| | |
|---|---|
| **Type** | `string` |
| **Allowed values** | `"inline"`, `"stacked"` |
| **Set by** | Variant definition (`CELL_VARIANT_DEFS[variant].baseDisplay`) |
| **Example** | `"layout": "stacked"` |

`"stacked"` = caption and value on separate lines. `"inline"` = caption and value side by side.

#### `display.captionPosition`
| | |
|---|---|
| **Type** | `string` |
| **Allowed values** | `"above"`, `"below"` |
| **Variants that set this** | `metric` (below), `metaPair` (above) |
| **Example** | `"captionPosition": "below"` |

#### `display.captionTransform`
| | |
|---|---|
| **Type** | `string` |
| **Allowed values** | `"uppercase"`, `"none"` |
| **Variants that set this** | `metric`, `metaPair` |
| **Example** | `"captionTransform": "uppercase"` |

### Control properties (user-adjustable per variant)

| Property | Type | Variants | Default | Description |
|---|---|---|---|---|
| `display.valueFontSize` | `number` | metric (13), metaPair (11), emphasis (12) | varies | Value text size in px |
| `display.valueFontWeight` | `string` | metric (`"bold"`), emphasis (`"bold"`) | `"bold"` | `"normal"` \| `"600"` \| `"bold"` |
| `display.captionFontSize` | `number` | metric (9), metaPair (9) | 9 | Caption label text size |
| `display.captionColor` | `string` | metric (`"#888888"`), metaPair (`"#999999"`) | varies | Caption hex colour |
| `display.valueColor` | `string` | metaPair (`"#1a1a2e"`), muted (`"#999999"`) | varies | Value hex colour |
| `display.accentColor` | `string` | emphasis (`"#1976D2"`) | `"#1976D2"` | Accent hex colour for emphasis variant |
| `display.iconSize` | `number` | iconText (12) | 12 | Icon prefix size in px |
| `display.gap` | `number` | iconText (4) | 4 | Gap between icon and text in px |
| `display.fontStyle` | `string` | muted (`"italic"`) | `"italic"` | `"normal"` \| `"italic"` |

**Example — metric cell:**
```json
"display": {
  "layout": "stacked",
  "captionPosition": "below",
  "captionTransform": "uppercase",
  "valueFontSize": 13,
  "valueFontWeight": "bold",
  "captionFontSize": 9,
  "captionColor": "#888888"
}
```

---

## 6. `rowStyle` — Row Visual Style Object

Nested inside each `fieldConfigs[]` entry. All properties optional. Object is omitted from JSON when all values are default/empty. Row variants (`rowVariant`) and rhythm (`rhythm`) are **not** keys in JSON — their effects are fully expanded into this object during export.

| Property | Type | Default | Description |
|---|---|---|---|
| `background` | `string` | `""` | Hex background colour e.g. `"#e3f0fb"` |
| `borderColor` | `string` | `""` | Hex border colour for all sides |
| `borderWidth` | `number` | `0` | Border width in logical px |
| `cornerRadius` | `number` | `0` | Corner radius in logical px |
| `paddingVertical` | `number` | `4` | Top+bottom inner padding (px) |
| `paddingHorizontal` | `number` | `8` | Left+right inner padding (px) |
| `showDivider` | `boolean` | `false` | Show a divider line below the row |
| `dividerColor` | `string` | `"#e0e0e0"` | Hex colour of the divider line |
| `dividerStyle` | `string` | `"solid"` | `"solid"` or `"dashed"` |
| `textColor` | `string` | `""` | Row-level text colour override (hex) |
| `textFontWeight` | `string` | `""` | Row-level font weight: `"normal"` \| `"600"` \| `"bold"` |
| `textFontSize` | `number` | `""` | Row-level font size override (px) |
| `borderTopColor` | `string` | `""` | Top border colour (overrides `borderColor`) |
| `borderBottomColor` | `string` | `""` | Bottom border colour |

**Rhythm values mapped to padding:**

| `rhythm` (internal) | `paddingVertical` | `paddingHorizontal` |
|---|---|---|
| `compact` | 2 | 8 |
| `normal` | 4 | 8 |
| `spacious` | 8 | 10 |

Explicit `paddingVertical`/`paddingHorizontal` in `rowStyle` always take precedence over rhythm defaults.

**Example:**
```json
"rowStyle": {
  "background": "#e3f0fb",
  "paddingVertical": 6,
  "paddingHorizontal": 8,
  "cornerRadius": 6,
  "borderBottomColor": "#b0cfe8",
  "textColor": "#1565C0",
  "textFontWeight": "600"
}
```

---

## 7. `repeaterConfig` — Repeater Row Config

Present only when `fieldConfigs[].rowType === "repeater"`. Describes the mock data source and display options for repeating sub-rows.

### `repeaterConfig.mockKey`
| | |
|---|---|
| **Type** | `string` |
| **Required** | Yes |
| **Allowed values** | `"transactions"`, `"lineItems"`, `"bills"` |
| **Validation** | Import validates; invalid key → validation error |
| **Example** | `"mockKey": "transactions"` |

Selects the mock dataset to render in the designer preview:
- `"transactions"` — 5 items: date, voucher no, voucher type, debit, credit
- `"lineItems"` — 4 items: product, group, quantity, rate, amount
- `"bills"` — 3 items: bill no, date, amount, due days

---

### `repeaterConfig.maxItems`
| | |
|---|---|
| **Type** | `number` |
| **Required** | No |
| **Range** | 1 to 10 |
| **Default** | `3` |
| **Validation** | Clamped to 1–10 on import |
| **Example** | `"maxItems": 3` |

Maximum number of sub-rows to display. If mock data has more items, excess items are hidden and a "+N more" footer appears (if `showMoreFooter` is true).

---

### `repeaterConfig.showDivider`
| | |
|---|---|
| **Type** | `boolean` |
| **Required** | No |
| **Default** | `false` |
| **Example** | `"showDivider": true` |

When `true`, renders a thin divider line between each repeated sub-row.

---

### `repeaterConfig.showMoreFooter`
| | |
|---|---|
| **Type** | `boolean` |
| **Required** | No |
| **Default** | `false` |
| **Example** | `"showMoreFooter": true` |

When `true` and mock data exceeds `maxItems`, renders a "+N more" footer button below the list.

---

## 8. `groupFields` — Drill-Down Hierarchy

Array at root level. Each entry defines one level of drill-down navigation. Empty array or absent = no drill-down.

### `groupFields[].level`
| | |
|---|---|
| **Type** | `number` |
| **Required** | Yes |
| **Value** | 1-indexed position in the hierarchy |
| **Example** | `"level": 1` |

---

### `groupFields[].fieldId`
| | |
|---|---|
| **Type** | `string` |
| **Required** | Yes |
| **Format** | Internal designer field ID e.g. `"f002"` |
| **Example** | `"fieldId": "f002"` |

---

### `groupFields[].dataField`
| | |
|---|---|
| **Type** | `string` |
| **Required** | Yes |
| **Format** | `R####F####` |
| **Example** | `"dataField": "R0001F0002"` |

Backend key of the field used as the group discriminator.

---

### `groupFields[].label`
| | |
|---|---|
| **Type** | `string` |
| **Required** | No |
| **Default** | Field's `defaultCaption` |
| **Example** | `"label": "City"` |

Display label for this drill level shown in breadcrumbs.

---

## 9. `drillConfig` — Drill Navigation Config

Auto-generated from `groupFields`. Present only when `groupFields` is non-empty.

### `drillConfig.enabled`
| | |
|---|---|
| **Type** | `boolean` |
| **Value** | Always `true` when object is present |

### `drillConfig.levelCount`
| | |
|---|---|
| **Type** | `number` |
| **Value** | `groupFields.length + 1` (groups + terminal detail level) |
| **Example** | `"levelCount": 3` (2 groups → 3 levels) |

### `drillConfig.terminalLevel`
| | |
|---|---|
| **Type** | `number` |
| **Value** | Same as `levelCount` — the last level (where detail cards display) |
| **Example** | `"terminalLevel": 3` |

---

## 10. `indicator` — Colored Side Bar

Optional object at root. When `isShow` is `false`, the entire object is omitted from JSON.

### `indicator.isShow`
| | |
|---|---|
| **Type** | `boolean` |
| **Required** | Yes (within the object) |
| **Default** | `false` (object absent) |
| **Example** | `"isShow": true` |

---

### `indicator.dataField`
| | |
|---|---|
| **Type** | `string` |
| **Required** | When `isShow` is `true` |
| **Format** | `R####F####` |
| **Example** | `"dataField": "R0001F0006"` |

The field whose numeric value determines indicator colour. Positive value → green bar; negative → red bar.

---

## 11. `totalConfig` — Amount Totals (per cell)

Optional object nested inside a `columnConfig[]` entry. Only applicable to amount/numeric fields (`isAmount: true` in the field registry). Omitted when `includeTotal` is `false`.

### `totalConfig.includeTotal`
| | |
|---|---|
| **Type** | `boolean` |
| **Required** | Yes (within the object) |
| **Example** | `"includeTotal": true` |

When `true`, Flutter renders a summary total row for this field.

### `totalConfig.totalScopeLevel`
| | |
|---|---|
| **Type** | `string` \| `number[]` |
| **Allowed values** | `"all"`, `"first"`, or array of level numbers e.g. `[1, 2]` |
| **Default** | `"all"` |
| **Example** | `"totalScopeLevel": "all"` |

Which drill levels the total applies to. `"all"` = every level; `"first"` = top level only.

---

## 12. Minimal Valid JSON Example

The smallest JSON the designer will accept and import without error (full mode):

```json
{
  "layoutType": "grid",
  "gridSize": { "rows": 1 },
  "fieldConfigs": [
    {
      "isExpandedRow": false,
      "columnConfig": [
        {
          "dataField": "R0001F0001",
          "col": 1,
          "caption": "Party Name"
        }
      ]
    }
  ]
}
```

**What defaults apply on import:**
- `mOnTap` → `"expand"`, `mOnDoubleTap` → `""`
- `templateId` → `"R0001"`, `formatId` → `"F0001"`
- `indicator` → `{ isShow: false, dataField: "" }`
- `groupFields` → `[]`
- `textAlign` → `"left"`, `maxLine` → `1`, `colSpan` → `1`
- `levelVisibility` → `"all"`
- `style` → all empty/default
- `rowType` → `"normal"`, `rowStyle` → `{}`

---

## 13. Rich Full Example

A complete JSON demonstrating all supported properties:

```json
{
  "layoutType": "grid",
  "gridSize": { "rows": 3 },
  "templateId": "R0001",
  "formatId": "F0001",
  "reportDisplayName": "Account Ledger",
  "indicator": {
    "isShow": true,
    "dataField": "R0001F0006"
  },
  "mOnTap": "navigate",
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
          "colSpan": 2,
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
      "isExpandedRow": false,
      "columnCount": 2,
      "columnConfig": [
        {
          "dataField": "R0001F0002",
          "col": 1,
          "caption": "City",
          "iconCaption": "location",
          "levelVisibility": [1, 2]
        },
        {
          "dataField": "R0001F0006",
          "col": 2,
          "caption": "Balance",
          "textAlign": "right",
          "display": {
            "layout": "stacked",
            "captionPosition": "below",
            "captionTransform": "uppercase",
            "valueFontSize": 13,
            "valueFontWeight": "bold",
            "captionFontSize": 9,
            "captionColor": "#888888"
          },
          "totalConfig": {
            "includeTotal": true,
            "totalScopeLevel": "all"
          }
        }
      ]
    },
    {
      "isExpandedRow": false,
      "columnCount": 3,
      "columnConfig": [
        { "dataField": "R0001F0010", "col": 1, "caption": "Date", "iconCaption": "date" },
        { "dataField": "R0001F0009", "col": 2, "caption": "Voucher" },
        { "dataField": "R0001F0011", "col": 3, "caption": "DR", "textAlign": "right" }
      ],
      "rowType": "repeater",
      "repeaterConfig": {
        "mockKey": "transactions",
        "maxItems": 3,
        "showDivider": true,
        "showMoreFooter": true
      }
    },
    {
      "isExpandedRow": true,
      "columnCount": 1,
      "columnConfig": [
        {
          "dataField": "R0001F0013",
          "col": 1,
          "caption": "Narration",
          "maxLine": 3
        }
      ]
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

---

## 14. Layout Only Mode Example

```json
{
  "layoutType": "grid",
  "mode": "layout",
  "gridSize": { "rows": 2 },
  "fieldConfigs": [
    {
      "isExpandedRow": false,
      "columnCount": 2,
      "columnConfig": [
        {
          "placeholderId": "ph_1",
          "placeholderLabel": "Party Name",
          "col": 1,
          "caption": "Placeholder",
          "iconCaption": "person",
          "style": {
            "fontWeight": "bold"
          }
        },
        {
          "placeholderId": "ph_2",
          "placeholderLabel": "Balance",
          "col": 2,
          "caption": "Placeholder",
          "textAlign": "right"
        }
      ],
      "rowStyle": {
        "background": "#e3f0fb",
        "paddingVertical": 6,
        "borderBottomColor": "#b0cfe8"
      }
    },
    {
      "isExpandedRow": false,
      "columnCount": 2,
      "columnConfig": [
        {
          "placeholderId": "ph_3",
          "placeholderLabel": "City",
          "col": 1,
          "caption": "Placeholder",
          "iconCaption": "location"
        },
        {
          "placeholderId": "ph_4",
          "placeholderLabel": "Amount",
          "col": 2,
          "caption": "Placeholder",
          "textAlign": "right"
        }
      ]
    }
  ]
}
```

**Key differences from full-template JSON:**
- Top-level `"mode": "layout"` is present
- `dataField` is replaced by `placeholderId` + `placeholderLabel`
- No `indicator`, `mOnTap`, `mOnDoubleTap`, `groupFields`, or `drillConfig`

---

## 15. Backward Compatibility Notes

### Properties added in Phase 1 (2026-04-02)
- `colSpan` — safe to omit; defaults to `1`
- `rowStyle` per fieldConfig — safe to omit; defaults to no styling

### Properties added in Phase 2 (2026-04-03)
- `display` per columnConfig — safe to omit; defaults to plain `text` variant rendering
- `rowStyle` extended with `textColor`, `textFontWeight`, `textFontSize`, `borderTopColor`, `borderBottomColor` — safe to omit
- `rowVariant` and `rhythm` — **these keys are no longer emitted to JSON** (removed in variant refactor). Old JSON with these keys still imports safely: they are used directly for internal state.
- `cellVariant` — **no longer emitted to JSON** (removed in variant refactor). Old JSON with `cellVariant` still imports safely. Old enum values `text|amount|badge|icon|date|link` are no longer valid; any unrecognised value is clamped to `"text"`.

### Properties added in Phase 3 (2026-04-03)
- `rowType` — safe to omit; defaults to `"normal"`
- `repeaterConfig` — only required when `rowType === "repeater"`; safe to omit otherwise

### Mode field (2026-04-03)
- `mode: "layout"` — absent in all pre-Phase 3 JSON; safe (treated as full-template mode)

### Identity fields (2026-03-27)
- `templateId`, `formatId`, `reportDisplayName` — safe to omit; designer uses dummy defaults

### Theme system (2026-04-05)
- `mcloud_designer_theme` localStorage key — no JSON impact; purely a UI preference

---

## 16. Common Mistakes and How Validation Handles Them

| Mistake | What happens |
|---|---|
| `layoutType` missing or not `"grid"` | Import blocked: "The layout type is missing or not 'grid'" |
| `fieldConfigs` missing or empty array | Import blocked: "The layout has no row definitions" |
| `columnConfig` missing or empty on a row | Import blocked: "Row N has no columns defined" |
| `dataField` missing from a cell (full mode) | Import blocked: "Row N, Column M is missing a data field" |
| `textAlign` is `"justify"` or misspelled | Silently clamped to `"left"` |
| `colSpan` is `0`, negative, or > 5 | Silently clamped to `1` |
| `maxLine` is `0`, `6`, or non-number | Silently clamped to `Math.max(1, Math.min(5, value))` |
| `cellVariant` is old enum (`"amount"`, `"badge"`) | Silently clamped to `"text"` |
| `rowType` is unrecognised string | Silently clamped to `"normal"` |
| `repeaterConfig.mockKey` invalid | Import blocked: "Row N repeater has an invalid mock data source" |
| `repeaterConfig.maxItems` out of range | Silently clamped to `1..10` |
| `levelVisibility` is a number (not array) | Silently clamped to `"all"` |
| `style.fontFamily` is unrecognised font name | Silently clamped to `""` |
| `style.fontWeight` is `"600"` or other value | Silently clamped to `"normal"` (only `"normal"` and `"bold"` allowed) |
| JSON syntax error (not parseable) | Import blocked: "The pasted content is not valid JSON — [parser detail]" |
| Paste area is empty | Import blocked: "Please paste a JSON config first" |
| `colSpan` causes cell overlap | Span reduced with toast warning; does not block import |
| `mode: "layout"` present but no `placeholderId` on cells | Layout cells rendered as empty placeholders with auto-generated IDs |
