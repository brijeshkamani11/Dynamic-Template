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
