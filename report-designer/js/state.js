/**
 * MCloud Report Template Designer — Application State
 * ────────────────────────────────────────────────────
 * Single source of truth. All modules read/write this object.
 * After mutation, call renderAll() to sync DOM.
 */

// ── CONFIGURABLE CAPS ────────────────────────────────────
const MAX_COLS = 5;               // max columns per row (change here to adjust globally)
const GROUP_LEVEL_WARN = 4;       // warn when group fields exceed this count

// ── APPLICATION STATE ────────────────────────────────────
let state = {
  templateName : "",
  mOnTap       : "expand",        // kept for backward compat in JSON; replaced by drill model
  mOnDoubleTap : "",
  indicator    : { isShow: false, dataField: "" },

  // ── Group fields (ordered) — defines level hierarchy ──
  // Each entry: { fieldId, dataField, label }
  // Selection order = level order: index 0 → Level 1, etc.
  groupFields  : [],

  // ── Display column fields (canvas rows) ──
  rows         : [],
  // rows[i] = { id, isExpandedRow, cols: [ null | FieldCell ] }
  // FieldCell = { uid, fieldId, dataField, caption, iconCaption,
  //               textAlign, maxLine,
  //               levelVisibility: "all" | number[],   // NEW: which levels show this column
  //               style:{color,fontSize,fontWeight,fontFamily} }
};

// ── UI/transient state (not persisted in JSON) ───────────
let _editTarget = null;           // { rowIdx, colIdx } currently open in prop panel
let _dragFieldId = null;          // field being dragged from palette
let _previewTab  = "normal";
let _showExpandedInCanvas = false;
let _cellCounter = 0;
let _paletteStage = "group";      // "group" | "column" — two-stage palette flow
let _drillPath = [];              // preview drill state: array of { level, groupValue, groupLabel }

function uid() { return "c" + (++_cellCounter); }

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
