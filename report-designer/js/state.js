/**
 * MCloud Report Template Designer — Application State
 * ────────────────────────────────────────────────────
 * Single source of truth. All modules read/write this object.
 * After mutation, call renderAll() to sync DOM.
 */

const MAX_COLS = 3;

let state = {
  templateName : "",
  mOnTap       : "expand",
  mOnDoubleTap : "",
  indicator    : { isShow: false, dataField: "" },
  rows         : [],
  // rows[i] = { id, isExpandedRow, cols: [ null | FieldCell ] }
  // FieldCell = { uid, fieldId, dataField, caption, iconCaption,
  //               textAlign, maxLine, style:{color,fontSize,fontWeight,fontFamily} }
};

let _editTarget = null;   // { rowIdx, colIdx } currently open in prop panel
let _dragFieldId = null;  // field being dragged from palette
let _previewTab  = "normal";
let _showExpandedInCanvas = false;
let _cellCounter = 0;

function uid() { return "c" + (++_cellCounter); }
