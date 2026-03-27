/**
 * MCloud Mobile Template Card Designer — Application State
 * ────────────────────────────────────────────────────
 * Single source of truth. All modules read/write this object.
 * After mutation, call renderAll() to sync DOM.
 */

// ── CONFIGURABLE CAPS ────────────────────────────────────
const MAX_COLS = 5;               // max columns per row (change here to adjust globally)
const GROUP_LEVEL_WARN = 4;       // warn when group fields exceed this count

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

  // ── Template / format identity (read-only in UI; set by caller or dummy) ──
  templateId   : DUMMY_TEMPLATE_ID,
  formatId     : DUMMY_FORMAT_ID,
  reportDisplayName : DUMMY_TEMPLATE_NAME,

  // ── Group fields (ordered) — defines level hierarchy ──
  // Each entry: { fieldId, dataField, label }
  // Selection order = level order: index 0 → Level 1, etc.
  groupFields  : [],

  // ── Display column fields (canvas rows) ──
  rows         : [],
  // rows[i] = { id, isExpandedRow, cols: [ null | FieldCell ] }
  // FieldCell = { uid, fieldId, dataField, caption, iconCaption,
  //               textAlign, maxLine,
  //               levelVisibility: "all" | number[],   // which levels show this column
  //               includeTotal: false,                  // amount fields only
  //               totalScopeLevel: "all",               // "all" | "first" | number[]
  //               style:{color,fontSize,fontWeight,fontFamily} }
};

// ── UI/transient state (not persisted in JSON) ───────────
let _editTarget = null;           // { rowIdx, colIdx } currently open in prop panel
let _dragFieldId = null;          // field being dragged from palette
let _showExpandedInCanvas = true; // always show all rows in canvas now
let _cellCounter = 0;
let _paletteStage = "group";      // "group" | "column" — two-stage palette flow
let _drillPath = [];              // preview drill state: array of { level, groupValue, groupLabel, dataField }
let _expandedCardIdx = -1;        // index of tapped card in terminal preview (-1 = none expanded)
let _designerMode = "add";        // "add" | "edit" — set by caller or import

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
