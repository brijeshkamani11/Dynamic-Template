/**
 * MCloud Mobile Template Card Designer — Application State
 * ────────────────────────────────────────────────────
 * Single source of truth. All modules read/write this object.
 * After mutation, call renderAll() to sync DOM.
 */

// ── CONFIGURABLE CAPS ────────────────────────────────────
const MAX_COLS = 5;               // max columns per row (change here to adjust globally)
const GROUP_LEVEL_WARN = 4;       // warn when group fields exceed this count

// ── DESIGNER MODES ───────────────────────────────────────
// "full"   → full template: real field mapping, group fields, indicator, JSON for Flutter
// "layout" → layout only: placeholder cells, no field binding, reusable layout skeleton
const DESIGNER_MODE_FULL   = "full";
const DESIGNER_MODE_LAYOUT = "layout";

// ── DUMMY IDENTITY (backend provides real IDs later) ─────
const DUMMY_TEMPLATE_ID   = "R0001";
const DUMMY_FORMAT_ID     = "F0001";
const DUMMY_TEMPLATE_NAME = "Account Ledger";

// ── APPLICATION STATE ────────────────────────────────────
let state = {
  templateName : "",
  mOnTap       : "expand",        // auto-managed — NOT user-editable
  mOnDoubleTap : "",              // auto-managed — NOT user-editable
  indicator    : { isShow: false, dataField: "" },

  // ── Designer mode: "full" | "layout" ──────────────────
  // "full"   → real field mapping (existing behavior)
  // "layout" → placeholder-only layout skeleton (new)
  designerMode : DESIGNER_MODE_FULL,

  // ── Template / format identity (read-only in UI; set by caller or dummy) ──
  templateId   : DUMMY_TEMPLATE_ID,
  formatId     : DUMMY_FORMAT_ID,
  reportDisplayName : DUMMY_TEMPLATE_NAME,

  // ── Group fields (ordered) — defines level hierarchy ──
  // Each entry: { fieldId, dataField, label }
  // Only used in full mode; always empty in layout mode.
  groupFields  : [],

  // ── Display column fields (canvas rows) ──
  rows         : [],
  // rows[i] = { id, isExpandedRow, rowStyle, rowVariant, rhythm, rowType, cols: [ null | Cell ] }
  //
  // Full mode cell (FieldCell):
  //   { uid, fieldId, dataField, caption, iconCaption, textAlign, maxLine,
  //     colSpan, cellVariant, levelVisibility, includeTotal?, totalScopeLevel?,
  //     style:{color,fontSize,fontWeight,fontFamily} }
  //
  // Layout mode cell (PlaceholderCell):
  //   { uid, placeholderId, placeholderLabel, caption, iconCaption, textAlign, maxLine,
  //     colSpan, cellVariant, levelVisibility:"all",
  //     style:{color,fontSize,fontWeight,fontFamily} }
  //   NOTE: no fieldId, no dataField
};

// ── UI/transient state (not persisted in JSON) ───────────
let _editTarget = null;           // { rowIdx, colIdx } currently open in prop panel
let _dragFieldId = null;          // field being dragged from palette
let _showExpandedInCanvas = true; // always show all rows in canvas now
let _cellCounter = 0;
let _placeholderCounter = 0;      // auto-increments placeholderId for layout mode cells
let _paletteStage = "group";      // "group" | "column" — two-stage palette flow
let _drillPath = [];              // preview drill state: array of { level, groupValue, groupLabel, dataField }
let _expandedCardIdx = -1;        // index of tapped card in terminal preview (-1 = none expanded)
let _designerMode = "add";        // "add" | "edit" — set by caller or import (NOT the same as state.designerMode)

function uid()              { return "c"  + (++_cellCounter); }
function nextPlaceholderId(){ return "ph_" + (++_placeholderCounter); }

// ── Mode query helpers ────────────────────────────────────
// Use these everywhere instead of raw string comparisons.
function isLayoutMode() { return state.designerMode === DESIGNER_MODE_LAYOUT; }
function isFullMode()   { return state.designerMode === DESIGNER_MODE_FULL; }

// ═══════════════════════════════════════════════════════════
// VARIANT CONTROL REGISTRIES — centralized definitions
// ═══════════════════════════════════════════════════════════
//
// Each variant has:
//   label    — human-readable name for the dropdown
//   prefill  — values injected into the general row-style / cell-style controls
//              when this variant is first selected (acts like a preset)
//   controls — variant-specific EXTRA controls not in the general panel.
//              Each control: { key, type, label, default, min?, max?, options? }
//              key maps to rowStyle[key] or cell.display[key] in exported JSON.
//
// Runtime state keeps the variant key (row.rowVariant, cell.cellVariant)
// for editor UI + preview rendering, but JSON export STRIPS variant keys
// and emits only expanded style/control values.
// ═══════════════════════════════════════════════════════════

/**
 * ROW_VARIANT_DEFS — row variant definitions.
 * `prefill` values are written into the general row-style form controls.
 * `controls` build a dynamic "Variant Settings" sub-panel.
 */
const ROW_VARIANT_DEFS = {
  default: {
    label: "Default — standard card row",
    prefill: {},
    controls: [],
  },
  stripHeader: {
    label: "Strip Header — tinted header strip",
    prefill: {
      background: "#e3f0fb",
      paddingVertical: 6,
      paddingHorizontal: 8,
      cornerRadius: 6,
    },
    controls: [
      { key: "borderBottomColor", type: "color",  label: "Bottom Border", default: "#b0cfe8" },
      { key: "textColor",         type: "color",  label: "Text Color",    default: "#1565C0" },
      { key: "textFontWeight",    type: "select", label: "Text Weight",   default: "600",
        options: [["normal","Normal"],["600","Semi-Bold"],["bold","Bold"]] },
    ],
  },
  softPanel: {
    label: "Soft Panel — subtle background panel",
    prefill: {
      background: "#f0f4ff",
      cornerRadius: 6,
    },
    controls: [],
  },
  summary: {
    label: "Summary — total / summary band",
    prefill: {
      background: "#fff8e1",
    },
    controls: [
      { key: "borderColor",    type: "color",  label: "Band Border",  default: "#ffe082" },
      { key: "textColor",      type: "color",  label: "Text Color",   default: "#e65100" },
      { key: "textFontWeight", type: "select", label: "Text Weight",  default: "bold",
        options: [["normal","Normal"],["600","Semi-Bold"],["bold","Bold"]] },
    ],
  },
  footerActions: {
    label: "Footer Actions — icon action row",
    prefill: {
      background: "#f5f7fa",
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    controls: [
      { key: "borderTopColor", type: "color", label: "Top Border", default: "#e8edf4" },
    ],
  },
};

/**
 * CELL_VARIANT_DEFS — cell variant definitions.
 * `baseDisplay` — structural layout properties inherent to this variant.
 * `controls` — user-tweakable visual properties; values map to cell.display[key].
 *
 * On JSON export, baseDisplay + control values merge into cell.display.
 * cellVariant key is stripped from output.
 */
const CELL_VARIANT_DEFS = {
  text: {
    label: "Text — standard label + value",
    baseDisplay: { layout: "inline" },
    controls: [],
  },
  iconText: {
    label: "Icon Text — icon prefix + text",
    baseDisplay: { layout: "inline" },
    controls: [
      { key: "iconSize", type: "range", label: "Icon Size", default: 12, min: 8, max: 24 },
      { key: "gap",      type: "range", label: "Gap (px)",  default: 4,  min: 0, max: 12 },
    ],
  },
  metric: {
    label: "Metric — large numeric display",
    baseDisplay: { layout: "stacked", captionPosition: "below", captionTransform: "uppercase" },
    controls: [
      { key: "valueFontSize",   type: "range",  label: "Value Size",    default: 13, min: 8, max: 24 },
      { key: "valueFontWeight", type: "select", label: "Value Weight",  default: "bold",
        options: [["normal","Normal"],["600","Semi-Bold"],["bold","Bold"]] },
      { key: "captionFontSize", type: "range",  label: "Caption Size",  default: 9,  min: 7, max: 14 },
      { key: "captionColor",    type: "color",  label: "Caption Color", default: "#888888" },
    ],
  },
  metaPair: {
    label: "Meta Pair — caption above, value below",
    baseDisplay: { layout: "stacked", captionPosition: "above", captionTransform: "uppercase" },
    controls: [
      { key: "captionFontSize", type: "range",  label: "Caption Size",  default: 9,  min: 7, max: 14 },
      { key: "captionColor",    type: "color",  label: "Caption Color", default: "#999999" },
      { key: "valueFontSize",   type: "range",  label: "Value Size",    default: 11, min: 8, max: 18 },
      { key: "valueColor",      type: "color",  label: "Value Color",   default: "#1a1a2e" },
    ],
  },
  emphasis: {
    label: "Emphasis — bold highlighted value",
    baseDisplay: { layout: "inline" },
    controls: [
      { key: "valueFontSize",   type: "range",  label: "Font Size",    default: 12, min: 8, max: 24 },
      { key: "valueFontWeight", type: "select", label: "Font Weight",  default: "bold",
        options: [["normal","Normal"],["600","Semi-Bold"],["bold","Bold"]] },
      { key: "accentColor",     type: "color",  label: "Accent Color", default: "#1976D2" },
    ],
  },
  muted: {
    label: "Muted — de-emphasised secondary text",
    baseDisplay: { layout: "inline" },
    controls: [
      { key: "valueFontSize", type: "range",  label: "Font Size",  default: 10, min: 8, max: 18 },
      { key: "valueColor",    type: "color",  label: "Text Color", default: "#999999" },
      { key: "fontStyle",     type: "select", label: "Font Style", default: "italic",
        options: [["normal","Normal"],["italic","Italic"]] },
    ],
  },
};

/**
 * RHYTHM_DEFS — rhythm → padding defaults.
 * Rhythm selection pre-fills paddingVertical/paddingHorizontal in rowStyle.
 */
const RHYTHM_DEFS = {
  compact:  { label: "Compact",  paddingVertical: 2, paddingHorizontal: 8 },
  normal:   { label: "Normal",   paddingVertical: 4, paddingHorizontal: 8 },
  spacious: { label: "Spacious", paddingVertical: 8, paddingHorizontal: 10 },
};

/**
 * Returns the default control values for a variant as a flat object.
 * E.g. getVariantControlDefaults(ROW_VARIANT_DEFS, "stripHeader")
 *   => { borderBottomColor: "#b0cfe8", textColor: "#1565C0", textFontWeight: "600" }
 */
function getVariantControlDefaults(defs, variantKey) {
  const def = defs[variantKey];
  if (!def) return {};
  const result = {};
  (def.controls || []).forEach(c => { result[c.key] = c.default; });
  return result;
}

/**
 * Builds the full expanded display object for a cell variant.
 * Merges baseDisplay + control defaults + any user overrides.
 */
function buildCellDisplayConfig(variantKey, userOverrides) {
  const def = CELL_VARIANT_DEFS[variantKey];
  if (!def) return {};
  const base = Object.assign({}, def.baseDisplay || {});
  const defaults = getVariantControlDefaults(CELL_VARIANT_DEFS, variantKey);
  return Object.assign(base, defaults, userOverrides || {});
}

/**
 * Derived helpers
 */
function getLevelCount() {
  // If no group fields, there's exactly 1 level (flat)
  return Math.max(1, state.groupFields.length + 1);
  // e.g. groupFields=[City, Party] → Level 1 (City list), Level 2 (Party list), Level 3 (detail) = 3 levels
  // But per spec: group fields define intermediate levels; terminal = last group level's detail
  // Actually: [City, Party] → L1=City cards, L2=Party cards within City = terminal
  // So levelCount = groupFields.length + 1 when groupFields>0, else 1
  // But terminal is the last level, which shows detail cards
}

function getTerminalLevel() {
  // 1-indexed terminal level number
  return getLevelCount();
}

function isTerminalLevel(level) {
  return level === getTerminalLevel();
}

/**
 * Auto-compute mOnTap / mOnDoubleTap based on current format.
 * Called before JSON generation and whenever groupFields change.
 */
function computeTapValues() {
  if (state.groupFields.length > 0) {
    // Has drill levels → tap navigates, double-tap unused
    state.mOnTap = "navigate";
    state.mOnDoubleTap = "";
  } else {
    // Flat (single level) → tap expands
    state.mOnTap = "expand";
    state.mOnDoubleTap = "";
  }
}
