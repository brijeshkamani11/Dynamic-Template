/**
 * MCloud Mobile Template Card Designer — JSON Generation & Modal Module
 * ───────────────────────────────────────────────────────────────
 * Handles all JSON input/output: generation, validation, hydration, and the
 * import/export UI modals.
 *
 * ═══ GENERATION ═══
 *   generateJSON()         — routes to full or layout based on state.designerMode
 *   generateFullJSON()     — Flutter-consumable full template JSON
 *   generateLayoutJSON()   — layout-only JSON with mode:"layout" marker
 *
 *   Variant expansion (C2 rule):
 *     - rowVariant / rhythm / cellVariant are STRIPPED from JSON output.
 *     - Their visual effects are fully expanded into rowStyle and cell.display.
 *     - Old JSON (with variant keys) is still importable — backward compatible.
 *
 *   JSON omission rules:
 *     - Default values are omitted to keep output compact (e.g. textAlign:"left" → not emitted)
 *     - Empty rowStyle → not emitted
 *     - display:{layout:"inline"} only → not emitted (that's the default)
 *
 * ═══ VALIDATION ═══
 *   validateImportJSON(obj)  — full-mode validator (checks dataField per column)
 *   validateLayoutJSON(obj)  — layout-mode validator (checks placeholderId per column)
 *
 * ═══ HYDRATION ═══
 *   hydrateFromJSON(json)       — auto-detects mode from json.mode, routes accordingly
 *   hydrateFromLayoutJSON(json) — restores layout state, sets DESIGNER_MODE_LAYOUT
 *
 *   Import backward compat:
 *     - Old JSON with cellVariant/rowVariant → used for internal state, display built from defaults
 *     - New JSON without variant keys → variant detected from expanded values via heuristics
 *       (detectCellVariantFromDisplay, detectRowVariantFromStyle)
 *
 * ═══ IMPORT MODAL ═══
 *   Three tabs: Paste JSON | Copy Existing Format | Sample Layouts
 *   Tab visibility is mode-dependent:
 *     - Layout mode hides "Copy Existing Format", shows "Sample Layouts"
 *     - Full mode hides "Sample Layouts", shows "Copy Existing Format"
 *
 * Depends on: state.js (mode, variant defs, MAX_COLS), format-library.js (DUMMY_FORMAT_LIBRARY,
 *             LAYOUT_LIBRARY), recovery.js (saveDraftImmediate), palette.js (renderPalette),
 *             canvas.js (renderAll), topbar.js (syncModeUI)
 * Side effects: mutates state.*, resets transient globals, DOM modal management
 */

// ═══════════════════════════════════════════════════════════
// JSON GENERATION — mode router
// ═══════════════════════════════════════════════════════════
function generateJSON() {
  // Route to mode-specific generator
  return isLayoutMode() ? generateLayoutJSON() : generateFullJSON();
}

// ── Full Template JSON (original behavior, unchanged) ────────
function generateFullJSON() {
  computeTapValues();

  const fieldConfigs = [];

  state.rows.forEach((row, rIdx) => {
    const columnConfig = [];

    row.cols.forEach((cell, cIdx) => {
      if (!cell) return;
      const cfg = {
        dataField : cell.dataField,
        col       : cIdx + 1,
        caption   : cell.caption,
      };
      if (cell.iconCaption)              cfg.iconCaption = cell.iconCaption;
      if (cell.maxLine && cell.maxLine !== 1) cfg.maxLine = cell.maxLine;
      if (cell.textAlign && cell.textAlign !== "left") cfg.textAlign = cell.textAlign;

      const styleObj = {};
      if (cell.style.color && cell.style.color !== "0xFF000000") styleObj.color = cell.style.color;
      if (cell.style.fontSize)  styleObj.fontSize   = cell.style.fontSize;
      if (cell.style.fontWeight && cell.style.fontWeight !== "normal") styleObj.fontWeight = cell.style.fontWeight;
      if (cell.style.fontFamily) styleObj.fontFamily = cell.style.fontFamily;
      if (Object.keys(styleObj).length) cfg.style = styleObj;

      if (cell.levelVisibility !== "all" && Array.isArray(cell.levelVisibility)) {
        cfg.levelVisibility = cell.levelVisibility;
      }

      // Phase 1: colSpan — omit if default (1)
      if (cell.colSpan && cell.colSpan > 1) cfg.colSpan = cell.colSpan;

      // Variant system: emit expanded display config instead of cellVariant key.
      // Internal state keeps cellVariant for editor/preview; JSON gets display only.
      const cvKey = cell.cellVariant || "text";
      const displayCfg = cell.display
        ? Object.assign({}, cell.display)
        : buildCellDisplayConfig(cvKey, {});
      // Only emit display if it adds info beyond the inline default
      if (displayCfg && Object.keys(displayCfg).length > 0
          && !(Object.keys(displayCfg).length === 1 && displayCfg.layout === "inline")) {
        cfg.display = displayCfg;
      }

      if (cell.includeTotal) {
        cfg.totalConfig = {
          includeTotal   : true,
          totalScopeLevel: cell.totalScopeLevel || "all",
        };
      }

      columnConfig.push(cfg);
    });

    if (columnConfig.length === 0) return;

    const fc = {
      isExpandedRow: row.isExpandedRow,
      columnCount  : row.cols.length,
      columnConfig,
    };

    // Variant system: strip rowVariant + rhythm from JSON output.
    // Their effects are fully expanded into rowStyle below.
    // rowType + repeaterConfig are structural (not variant styling), so kept as-is.
    if (row.rowType && row.rowType !== "normal") {
      fc.rowType = row.rowType;
      if (row.repeaterConfig) fc.repeaterConfig = row.repeaterConfig;
    }

    // Build expanded rowStyle: merge general style + variant defaults + rhythm padding.
    // This captures everything that rowVariant/rhythm used to encode.
    const rs = row.rowStyle || {};
    const variantKey = row.rowVariant || "default";
    const rhythmKey  = row.rhythm     || "normal";
    const varDef     = ROW_VARIANT_DEFS[variantKey];
    const rhythmDef  = RHYTHM_DEFS[rhythmKey];

    const rsOut = {};

    // Start with variant prefill defaults (lowest priority)
    if (varDef && varDef.prefill) {
      Object.entries(varDef.prefill).forEach(([k, v]) => { if (v != null) rsOut[k] = v; });
    }
    // Layer variant control defaults
    if (varDef && varDef.controls) {
      varDef.controls.forEach(c => { if (rsOut[c.key] == null) rsOut[c.key] = c.default; });
    }
    // Layer rhythm padding (if not already set by user rowStyle)
    if (rhythmDef) {
      if (rsOut.paddingVertical == null)   rsOut.paddingVertical   = rhythmDef.paddingVertical;
      if (rsOut.paddingHorizontal == null) rsOut.paddingHorizontal = rhythmDef.paddingHorizontal;
    }
    // Layer actual user rowStyle (highest priority — overwrites variant/rhythm defaults)
    if (rs.background)            rsOut.background        = rs.background;
    if (rs.borderColor)           rsOut.borderColor       = rs.borderColor;
    if (rs.borderWidth > 0)       rsOut.borderWidth       = rs.borderWidth;
    if (rs.cornerRadius > 0)      rsOut.cornerRadius      = rs.cornerRadius;
    if (rs.paddingVertical > 0)   rsOut.paddingVertical   = rs.paddingVertical;
    if (rs.paddingHorizontal > 0) rsOut.paddingHorizontal = rs.paddingHorizontal;
    if (rs.showDivider) {
      rsOut.showDivider = true;
      if (rs.dividerColor) rsOut.dividerColor = rs.dividerColor;
      if (rs.dividerStyle && rs.dividerStyle !== "solid") rsOut.dividerStyle = rs.dividerStyle;
    }
    // Variant extras already in rs (merged by applyRowStyle)
    if (rs.textColor)       rsOut.textColor       = rs.textColor;
    if (rs.textFontWeight)  rsOut.textFontWeight  = rs.textFontWeight;
    if (rs.textFontSize)    rsOut.textFontSize    = rs.textFontSize;
    if (rs.borderTopColor)  rsOut.borderTopColor  = rs.borderTopColor;
    if (rs.borderBottomColor) rsOut.borderBottomColor = rs.borderBottomColor;

    if (Object.keys(rsOut).length > 0) fc.rowStyle = rsOut;

    fieldConfigs.push(fc);
  });

  const layout = {
    layoutType : "grid",
    gridSize   : { rows: state.rows.filter(r => !r.isExpandedRow).length },
    indicator  : {
      isShow    : state.indicator.isShow,
      dataField : state.indicator.dataField || "",
    },
    mOnTap       : state.mOnTap || "",
    mOnDoubleTap : state.mOnDoubleTap || "",
    fieldConfigs,
  };

  layout.templateId        = state.templateId || "";
  layout.formatId          = state.formatId || "";
  layout.reportDisplayName = state.reportDisplayName || "";

  if (state.groupFields.length > 0) {
    layout.groupFields = state.groupFields.map((gf, idx) => ({
      level     : idx + 1,
      fieldId   : gf.fieldId,
      dataField : gf.dataField,
      label     : gf.label,
    }));

    layout.drillConfig = {
      enabled       : true,
      levelCount    : getLevelCount(),
      terminalLevel : getTerminalLevel(),
    };
  }

  return layout;
}

// ── Layout Only JSON ─────────────────────────────────────────
/**
 * Generates a layout-only JSON with mode:"layout" top-level marker.
 * Uses placeholder cells (placeholderId / placeholderLabel) instead of dataField.
 * This JSON can be imported back to restore the layout state without real field binding.
 */
function generateLayoutJSON() {
  const fieldConfigs = [];

  state.rows.forEach((row, rIdx) => {
    const columnConfig = [];

    row.cols.forEach((cell, cIdx) => {
      if (!cell) return;

      const cfg = {
        placeholderId   : cell.placeholderId   || ("ph_" + (rIdx * 100 + cIdx + 1)),
        placeholderLabel: cell.placeholderLabel || cell.caption || "",
        col             : cIdx + 1,
        caption         : cell.caption,
      };

      if (cell.iconCaption)               cfg.iconCaption = cell.iconCaption;
      if (cell.maxLine && cell.maxLine !== 1) cfg.maxLine = cell.maxLine;
      if (cell.textAlign && cell.textAlign !== "left") cfg.textAlign = cell.textAlign;
      if (cell.colSpan && cell.colSpan > 1)    cfg.colSpan    = cell.colSpan;

      // Variant system: emit display config, not cellVariant key
      const cvKey = cell.cellVariant || "text";
      const displayCfg = cell.display
        ? Object.assign({}, cell.display)
        : buildCellDisplayConfig(cvKey, {});
      if (displayCfg && Object.keys(displayCfg).length > 0
          && !(Object.keys(displayCfg).length === 1 && displayCfg.layout === "inline")) {
        cfg.display = displayCfg;
      }

      const styleObj = {};
      if (cell.style.color && cell.style.color !== "0xFF000000") styleObj.color = cell.style.color;
      if (cell.style.fontSize)   styleObj.fontSize   = cell.style.fontSize;
      if (cell.style.fontWeight && cell.style.fontWeight !== "normal") styleObj.fontWeight = cell.style.fontWeight;
      if (cell.style.fontFamily) styleObj.fontFamily = cell.style.fontFamily;
      if (Object.keys(styleObj).length) cfg.style = styleObj;

      columnConfig.push(cfg);
    });

    if (columnConfig.length === 0) return;

    const fc = {
      isExpandedRow: row.isExpandedRow,
      columnCount  : row.cols.length,
      columnConfig,
    };

    // Variant system: strip rowVariant/rhythm, expand into rowStyle
    if (row.rowType && row.rowType !== "normal") {
      fc.rowType = row.rowType;
      if (row.repeaterConfig) fc.repeaterConfig = row.repeaterConfig;
    }

    const rs = row.rowStyle || {};
    const variantKey = row.rowVariant || "default";
    const rhythmKey  = row.rhythm     || "normal";
    const varDef     = ROW_VARIANT_DEFS[variantKey];
    const rhythmDef  = RHYTHM_DEFS[rhythmKey];
    const rsOut = {};

    if (varDef && varDef.prefill) {
      Object.entries(varDef.prefill).forEach(([k, v]) => { if (v != null) rsOut[k] = v; });
    }
    if (varDef && varDef.controls) {
      varDef.controls.forEach(c => { if (rsOut[c.key] == null) rsOut[c.key] = c.default; });
    }
    if (rhythmDef) {
      if (rsOut.paddingVertical == null)   rsOut.paddingVertical   = rhythmDef.paddingVertical;
      if (rsOut.paddingHorizontal == null) rsOut.paddingHorizontal = rhythmDef.paddingHorizontal;
    }
    if (rs.background)            rsOut.background        = rs.background;
    if (rs.borderColor)           rsOut.borderColor       = rs.borderColor;
    if (rs.borderWidth > 0)       rsOut.borderWidth       = rs.borderWidth;
    if (rs.cornerRadius > 0)      rsOut.cornerRadius      = rs.cornerRadius;
    if (rs.paddingVertical > 0)   rsOut.paddingVertical   = rs.paddingVertical;
    if (rs.paddingHorizontal > 0) rsOut.paddingHorizontal = rs.paddingHorizontal;
    if (rs.showDivider) {
      rsOut.showDivider = true;
      if (rs.dividerColor) rsOut.dividerColor = rs.dividerColor;
      if (rs.dividerStyle && rs.dividerStyle !== "solid") rsOut.dividerStyle = rs.dividerStyle;
    }
    if (rs.textColor)       rsOut.textColor       = rs.textColor;
    if (rs.textFontWeight)  rsOut.textFontWeight  = rs.textFontWeight;
    if (rs.textFontSize)    rsOut.textFontSize    = rs.textFontSize;
    if (rs.borderTopColor)  rsOut.borderTopColor  = rs.borderTopColor;
    if (rs.borderBottomColor) rsOut.borderBottomColor = rs.borderBottomColor;
    if (Object.keys(rsOut).length > 0) fc.rowStyle = rsOut;

    fieldConfigs.push(fc);
  });

  return {
    layoutType  : "grid",
    mode        : "layout",   // ← marker that identifies this as a layout-only JSON
    gridSize    : { rows: state.rows.filter(r => !r.isExpandedRow).length },
    fieldConfigs,
  };
}

function openJSONModal() {
  const json = generateJSON();
  document.getElementById("jsonOutput").textContent = JSON.stringify(json, null, 2);
  // Update modal title to reflect current mode
  const titleEl = document.querySelector("#jsonOverlay .modal-header span");
  if (titleEl) {
    titleEl.textContent = isLayoutMode()
      ? "Generated JSON — Layout Only"
      : "Generated JSON — Full Template";
  }
  document.getElementById("jsonOverlay").style.display = "flex";
}

function bindJSONModal() {
  document.getElementById("jsonClose").addEventListener("click", () => {
    document.getElementById("jsonOverlay").style.display = "none";
  });
  document.getElementById("jsonOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("jsonOverlay"))
      document.getElementById("jsonOverlay").style.display = "none";
  });
  document.getElementById("btnCopyJSON").addEventListener("click", () => {
    const text = document.getElementById("jsonOutput").textContent;
    navigator.clipboard.writeText(text).then(() => {
      const conf = document.getElementById("copyConfirm");
      conf.style.display = "inline";
      setTimeout(() => conf.style.display = "none", 2000);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// IMPORT JSON — validate + hydrate state
// ═══════════════════════════════════════════════════════════

// ── Full-mode validator (original, unchanged) ────────────────
function validateImportJSON(obj) {
  // Phase 4: plain-language error messages for non-technical users
  if (!obj || typeof obj !== "object") return { valid: false, error: "The pasted content is not valid JSON. Please copy the full JSON output and try again." };
  if (obj.layoutType !== "grid")       return { valid: false, error: "This JSON doesn't look like a card layout file (missing layoutType: \"grid\"). Make sure you copied the entire JSON." };
  if (!Array.isArray(obj.fieldConfigs) || obj.fieldConfigs.length === 0)
    return { valid: false, error: "The layout has no row definitions (fieldConfigs is missing or empty). The JSON may be incomplete." };

  for (let i = 0; i < obj.fieldConfigs.length; i++) {
    const fc = obj.fieldConfigs[i];
    if (!Array.isArray(fc.columnConfig)) {
      return { valid: false, error: `Row ${i + 1} is missing its column list. The JSON may be truncated.` };
    }
    if (fc.columnConfig.length === 0) {
      return { valid: false, error: `Row ${i + 1} has no columns defined. Remove it or add at least one field.` };
    }
    for (let j = 0; j < fc.columnConfig.length; j++) {
      const col = fc.columnConfig[j];
      if (!col.dataField && !col.display) {
        return { valid: false, error: `Row ${i + 1}, column ${j + 1} is missing a dataField. The JSON may be from an older or incompatible source.` };
      }
    }
    // Phase 4: repeater config validation
    if (fc.rowType === "repeater" && fc.repeaterConfig) {
      const rc = fc.repeaterConfig;
      const validKeys = ["transactions", "lineItems", "bills"];
      if (rc.mockKey && !validKeys.includes(rc.mockKey)) {
        return { valid: false, error: `Row ${i + 1} has an unknown repeater data source "${rc.mockKey}". Valid options are: transactions, lineItems, bills.` };
      }
      if (rc.maxItems != null && (typeof rc.maxItems !== "number" || rc.maxItems < 1)) {
        return { valid: false, error: `Row ${i + 1}: "Items to Show" must be a number between 1 and 10.` };
      }
    }
  }
  return { valid: true };
}

// ── Layout-mode validator ────────────────────────────────────
/**
 * Validates a layout-only JSON object.
 * Requires mode:"layout" and placeholderId on every column.
 */
function validateLayoutJSON(obj) {
  if (!obj || typeof obj !== "object")    return { valid: false, error: "The pasted content is not valid JSON." };
  if (obj.layoutType !== "grid")          return { valid: false, error: "Missing layoutType: \"grid\"." };
  if (obj.mode !== "layout")              return { valid: false, error: "This JSON is not a layout file (missing mode: \"layout\")." };
  if (!Array.isArray(obj.fieldConfigs) || obj.fieldConfigs.length === 0)
    return { valid: false, error: "The layout has no row definitions." };

  for (let i = 0; i < obj.fieldConfigs.length; i++) {
    const fc = obj.fieldConfigs[i];
    if (!Array.isArray(fc.columnConfig)) {
      return { valid: false, error: `Row ${i + 1} is missing its column list.` };
    }
    for (let j = 0; j < fc.columnConfig.length; j++) {
      const col = fc.columnConfig[j];
      if (!col.placeholderId) {
        return { valid: false, error: `Row ${i + 1}, column ${j + 1} is missing a placeholderId. The layout JSON may be incomplete.` };
      }
    }
  }
  return { valid: true };
}

/**
 * Hydrates state from a layout-only JSON.
 * Sets state.designerMode = "layout" and rebuilds rows with placeholder cells.
 * Backward-compatible: rows with only rowStyle/variant but no cells load cleanly.
 */
function hydrateFromLayoutJSON(json) {
  const result = validateLayoutJSON(json);
  if (!result.valid) {
    showToast("Layout import failed: " + result.error, "warn");
    return false;
  }

  const VALID_TEXT_ALIGN   = ["left", "center", "right"];
  const VALID_CELL_VARIANT = ["text", "iconText", "metric", "metaPair", "emphasis", "muted"];
  const VALID_ROW_VARIANT  = Object.keys(ROW_VARIANT_DEFS);
  const VALID_ROW_TYPE     = ["normal", "repeater"];
  function clampTextAlign(v)   { return VALID_TEXT_ALIGN.includes(v)   ? v : "left"; }
  function clampCellVariant(v) { return VALID_CELL_VARIANT.includes(v) ? v : "text"; }
  function clampRowVariant(v)  { return VALID_ROW_VARIANT.includes(v)  ? v : "default"; }
  function clampRowType(v)     { return VALID_ROW_TYPE.includes(v)     ? v : "normal"; }
  function clampColSpan(v)     { const n = parseInt(v, 10); return (!isNaN(n) && n >= 1 && n <= MAX_COLS) ? n : 1; }

  function detectCellVariantFromDisplay(display) {
    if (!display || typeof display !== "object") return "text";
    if (display.layout === "stacked" && display.captionPosition === "below") return "metric";
    if (display.layout === "stacked" && display.captionPosition === "above") return "metaPair";
    if (display.fontStyle === "italic") return "muted";
    if (display.accentColor) return "emphasis";
    if (display.iconSize != null) return "iconText";
    return "text";
  }

  function detectRowVariantFromStyle(rs) {
    if (!rs || typeof rs !== "object") return "default";
    if (rs.textColor === "#1565C0" || rs.borderBottomColor) return "stripHeader";
    if (rs.textColor === "#e65100") return "summary";
    if (rs.borderTopColor) return "footerActions";
    if (rs.background === "#f0f4ff" && !rs.textColor) return "softPanel";
    return "default";
  }

  const newRows = [];
  json.fieldConfigs.forEach(fc => {
    const colCount = fc.columnCount || fc.columnConfig.length;
    const cols = new Array(Math.min(colCount, MAX_COLS)).fill(null);

    fc.columnConfig.forEach(cfg => {
      const colIdx = (cfg.col || 1) - 1;
      if (colIdx < 0 || colIdx >= cols.length) return;

      // Backward compat: old layout JSON may have cellVariant; new has display
      let cellVariant;
      let displayObj = null;
      if (cfg.cellVariant) {
        cellVariant = clampCellVariant(cfg.cellVariant);
        displayObj  = buildCellDisplayConfig(cellVariant, {});
      } else if (cfg.display) {
        cellVariant = detectCellVariantFromDisplay(cfg.display);
        displayObj  = cfg.display;
      } else {
        cellVariant = "text";
      }

      cols[colIdx] = {
        uid             : uid(),
        placeholderId   : cfg.placeholderId   || nextPlaceholderId(),
        placeholderLabel: cfg.placeholderLabel || cfg.caption || "",
        caption         : cfg.caption  || cfg.placeholderLabel || "Placeholder",
        iconCaption     : cfg.iconCaption || "",
        textAlign       : clampTextAlign(cfg.textAlign),
        maxLine         : cfg.maxLine   || 1,
        colSpan         : clampColSpan(cfg.colSpan),
        cellVariant     : cellVariant,
        display         : displayObj || {},
        levelVisibility : "all",
        style: {
          color      : (cfg.style && cfg.style.color)      || "",
          fontSize   : (cfg.style && cfg.style.fontSize)   || "",
          fontWeight : (cfg.style && cfg.style.fontWeight) || "normal",
          fontFamily : (cfg.style && cfg.style.fontFamily) || "",
        },
      };
    });

    // Backward compat: detect row variant from rowStyle if no rowVariant key
    let rowVariant, rhythm;
    if (fc.rowVariant) {
      rowVariant = clampRowVariant(fc.rowVariant);
      rhythm     = fc.rhythm || "normal";
    } else {
      rowVariant = detectRowVariantFromStyle(fc.rowStyle);
      const rs = fc.rowStyle || {};
      if (rs.paddingVertical <= 2)       rhythm = "compact";
      else if (rs.paddingVertical >= 8)  rhythm = "spacious";
      else                               rhythm = "normal";
    }

    const newRow = {
      id           : "row_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      isExpandedRow: !!fc.isExpandedRow,
      rowStyle     : fc.rowStyle   || {},
      rowVariant   : rowVariant,
      rhythm       : rhythm,
      rowType      : clampRowType(fc.rowType),
      cols,
    };
    if (fc.repeaterConfig) newRow.repeaterConfig = fc.repeaterConfig;
    newRows.push(newRow);
  });

  // Apply to state — clear full-mode-only fields
  state.rows         = newRows;
  state.groupFields  = [];         // no group fields in layout mode
  state.mOnTap       = "expand";
  state.mOnDoubleTap = "";
  state.designerMode = DESIGNER_MODE_LAYOUT;

  _drillPath        = [];
  _expandedCardIdx  = -1;
  _paletteStage     = "column";
  computeTapValues();

  return true;
}

/**
 * Main import entry point — auto-detects mode from json.mode marker.
 * Routes to hydrateFromLayoutJSON (layout) or full hydration (full/none).
 * No state mutation happens before validation succeeds.
 */
function hydrateFromJSON(json) {
  // Auto-detect: if the JSON carries a layout mode marker, use layout hydration
  if (json && json.mode === "layout") {
    return hydrateFromLayoutJSON(json);
  }

  // Full mode — validate and hydrate as before
  const result = validateImportJSON(json);
  if (!result.valid) {
    showToast("Import failed: " + result.error, "warn");
    return false;
  }

  // Ensure state is set to full mode after importing a full JSON
  state.designerMode = DESIGNER_MODE_FULL;

  // ── Import validation helpers ────────────────────────────────
  const VALID_TEXT_ALIGN    = ["left", "center", "right"];
  // Fixed: cell variant list now matches actual UI options
  const VALID_CELL_VARIANT  = ["text", "iconText", "metric", "metaPair", "emphasis", "muted"];
  const VALID_ROW_VARIANT   = Object.keys(ROW_VARIANT_DEFS);
  const VALID_ROW_TYPE      = ["normal", "repeater"];

  function clampTextAlign(v)   { return VALID_TEXT_ALIGN.includes(v)   ? v : "left"; }
  function clampCellVariant(v) { return VALID_CELL_VARIANT.includes(v) ? v : "text"; }
  function clampRowVariant(v)  { return VALID_ROW_VARIANT.includes(v)  ? v : "default"; }
  function clampRowType(v)     { return VALID_ROW_TYPE.includes(v)     ? v : "normal"; }
  function clampColSpan(v)     { const n = parseInt(v, 10); return (!isNaN(n) && n >= 1 && n <= MAX_COLS) ? n : 1; }
  function clampLevelVis(v)    { return (v === "all" || Array.isArray(v)) ? v : "all"; }

  /**
   * Detects cell variant from a display config object (for new-format JSON).
   * Matches baseDisplay patterns from CELL_VARIANT_DEFS.
   */
  function detectCellVariantFromDisplay(display) {
    if (!display || typeof display !== "object") return "text";
    // Match by structural layout cues
    if (display.layout === "stacked" && display.captionPosition === "below") return "metric";
    if (display.layout === "stacked" && display.captionPosition === "above") return "metaPair";
    if (display.fontStyle === "italic" || display.valueColor === "#999999") return "muted";
    if (display.accentColor) return "emphasis";
    if (display.iconSize != null) return "iconText";
    return "text";
  }

  /**
   * Detects row variant from an expanded rowStyle (for new-format JSON without rowVariant key).
   * Matches prefill patterns from ROW_VARIANT_DEFS.
   */
  function detectRowVariantFromStyle(rs) {
    if (!rs || typeof rs !== "object") return "default";
    if (rs.textColor === "#1565C0" || rs.borderBottomColor) return "stripHeader";
    if (rs.textColor === "#e65100")  return "summary";
    if (rs.borderTopColor)           return "footerActions";
    if (rs.background === "#f0f4ff" && !rs.textColor) return "softPanel";
    return "default";
  }
  // ────────────────────────────────────────────────────────────

  const newRows = [];
  json.fieldConfigs.forEach(fc => {
    const colCount = fc.columnCount || fc.columnConfig.length;
    const cols = new Array(Math.min(colCount, MAX_COLS)).fill(null);

    fc.columnConfig.forEach(cfg => {
      const colIdx = (cfg.col || 1) - 1;
      if (colIdx < 0 || colIdx >= cols.length) return;

      const field = FIELD_REGISTRY.find(f => f.dataField === cfg.dataField);

      // Backward compat: old JSON has cellVariant; new JSON has display object
      let cellVariant;
      let displayObj = null;
      if (cfg.cellVariant) {
        // Old format: use cellVariant directly
        cellVariant = clampCellVariant(cfg.cellVariant);
        displayObj  = buildCellDisplayConfig(cellVariant, {});
      } else if (cfg.display) {
        // New format: detect variant from display, keep display as-is
        cellVariant = detectCellVariantFromDisplay(cfg.display);
        displayObj  = cfg.display;
      } else {
        cellVariant = "text";
      }

      const cellObj = {
        uid            : uid(),
        fieldId        : field ? field.id : "unknown",
        dataField      : cfg.dataField,
        caption        : cfg.caption || (field ? field.defaultCaption : ""),
        iconCaption    : cfg.iconCaption || "",
        textAlign      : clampTextAlign(cfg.textAlign),
        maxLine        : cfg.maxLine || 1,
        colSpan        : clampColSpan(cfg.colSpan),
        cellVariant    : cellVariant,
        display        : displayObj || {},
        levelVisibility: clampLevelVis(cfg.levelVisibility),
        style          : {
          color      : (cfg.style && cfg.style.color)      || "",
          fontSize   : (cfg.style && cfg.style.fontSize)   || "",
          fontWeight : (cfg.style && cfg.style.fontWeight)  || "normal",
          fontFamily : (cfg.style && cfg.style.fontFamily)  || "",
        },
      };

      if (cfg.totalConfig && cfg.totalConfig.includeTotal) {
        cellObj.includeTotal    = true;
        cellObj.totalScopeLevel = cfg.totalConfig.totalScopeLevel || "all";
      }

      cols[colIdx] = cellObj;
    });

    // Backward compat: old JSON has rowVariant/rhythm; new JSON has expanded rowStyle only
    let rowVariant, rhythm;
    if (fc.rowVariant) {
      // Old format: variant key present
      rowVariant = clampRowVariant(fc.rowVariant);
      rhythm     = fc.rhythm || "normal";
    } else {
      // New format: detect variant from expanded rowStyle
      rowVariant = detectRowVariantFromStyle(fc.rowStyle);
      // Detect rhythm from padding
      const rs = fc.rowStyle || {};
      if (rs.paddingVertical <= 2)       rhythm = "compact";
      else if (rs.paddingVertical >= 8)  rhythm = "spacious";
      else                               rhythm = "normal";
    }

    const newRow = {
      id           : "row_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      isExpandedRow: !!fc.isExpandedRow,
      rowStyle     : fc.rowStyle   || {},
      rowVariant   : rowVariant,
      rhythm       : rhythm,
      rowType      : clampRowType(fc.rowType),
      cols         : cols,
    };
    if (fc.repeaterConfig) newRow.repeaterConfig = fc.repeaterConfig;
    newRows.push(newRow);
  });

  state.rows         = newRows;
  state.mOnTap       = json.mOnTap || "expand";
  state.mOnDoubleTap = json.mOnDoubleTap || "";
  state.templateName = json.reportDisplayName || state.templateName || "";
  state.templateId   = json.templateId || state.templateId;
  state.formatId     = json.formatId || state.formatId;
  state.reportDisplayName = json.reportDisplayName || state.reportDisplayName;

  if (json.indicator) {
    state.indicator.isShow    = !!json.indicator.isShow;
    state.indicator.dataField = json.indicator.dataField || "";
  }

  if (Array.isArray(json.groupFields)) {
    state.groupFields = json.groupFields.map(gf => ({
      fieldId   : gf.fieldId || "",
      dataField : gf.dataField || "",
      label     : gf.label || "",
    }));
  } else {
    state.groupFields = [];
  }

  _drillPath = [];
  _expandedCardIdx = -1;
  _paletteStage = state.groupFields.length > 0 ? "group" : "column";
  computeTapValues();

  return true;
}

// ═══════════════════════════════════════════════════════════
// IMPORT MODAL — tabbed: Paste JSON | Copy Existing Format
// ═══════════════════════════════════════════════════════════
let _importActiveTab = "paste";

function openImportModal() {
  document.getElementById("importOverlay").style.display = "flex";

  // Mode-based tab visibility:
  //   Layout mode  → hide "Copy Existing Format" tab, show "Sample Layouts"
  //   Full mode    → show "Copy Existing Format" tab, hide "Sample Layouts"
  const layout = isLayoutMode();
  document.querySelectorAll(".import-tab").forEach(t => {
    if (t.dataset.tab === "copy")   t.style.display = layout ? "none" : "";
    if (t.dataset.tab === "layout") t.style.display = layout ? ""     : "none";
  });

  // Update modal title based on mode
  const titleEl = document.getElementById("importModalTitle");
  if (titleEl) titleEl.textContent = layout ? "Import Layout" : "Import / Copy Format";

  switchImportTab("paste");
}

function closeImportModal() {
  document.getElementById("importOverlay").style.display = "none";
}

function switchImportTab(tab) {
  _importActiveTab = tab;
  document.querySelectorAll(".import-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tab);
  });
  document.getElementById("importPasteSection").style.display  = tab === "paste"  ? "block" : "none";
  document.getElementById("importCopySection").style.display   = tab === "copy"   ? "block" : "none";
  document.getElementById("importLayoutSection").style.display = tab === "layout" ? "block" : "none";

  if (tab === "paste") {
    const ta = document.getElementById("importInput");
    ta.value = "";
    document.getElementById("importError").textContent = "";
    setTimeout(() => ta.focus(), 50);
  } else if (tab === "copy") {
    populateTemplateDropdown();
    document.getElementById("copyFormatPreview").textContent = "";
    document.getElementById("copyError").textContent = "";
  } else if (tab === "layout") {
    populateLayoutDropdown();
    document.getElementById("layoutPresetPreview").textContent = "";
    document.getElementById("layoutError").textContent = "";
  }
}

function handleImportSubmit() {
  const raw = document.getElementById("importInput").value.trim();
  const errEl = document.getElementById("importError");
  errEl.textContent = "";

  if (!raw) {
    errEl.textContent = "Please paste JSON content.";
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // Phase 4: friendly syntax error message
    errEl.textContent = "The text you pasted isn't valid JSON. Check for missing quotes, brackets, or commas. (Detail: " + e.message + ")";
    return;
  }

  const success = hydrateFromJSON(parsed);
  if (success) {
    closeImportModal();
    _designerMode = "edit";
    syncUIFromState();
    renderPalette();
    renderAll();
    saveDraftImmediate();
    showToast("JSON imported successfully!", "success");
  }
}

// ═══════════════════════════════════════════════════════════
// COPY EXISTING FORMAT — template/format selector
// ═══════════════════════════════════════════════════════════
function populateTemplateDropdown() {
  const sel = document.getElementById("copyTemplateId");
  sel.innerHTML = '<option value="">— Select Template —</option>';
  Object.keys(DUMMY_FORMAT_LIBRARY).forEach(tid => {
    const t = DUMMY_FORMAT_LIBRARY[tid];
    sel.innerHTML += `<option value="${tid}">${tid} — ${t.templateName}</option>`;
  });
  document.getElementById("copyFormatId").innerHTML = '<option value="">— Select Format —</option>';
  document.getElementById("copyFormatPreview").textContent = "";
}

function onTemplateSelect() {
  const tid = document.getElementById("copyTemplateId").value;
  const fmtSel = document.getElementById("copyFormatId");
  fmtSel.innerHTML = '<option value="">— Select Format —</option>';
  document.getElementById("copyFormatPreview").textContent = "";
  document.getElementById("copyError").textContent = "";

  if (!tid || !DUMMY_FORMAT_LIBRARY[tid]) return;

  const formats = DUMMY_FORMAT_LIBRARY[tid].formats;
  Object.keys(formats).forEach(fid => {
    fmtSel.innerHTML += `<option value="${fid}">${fid} — ${formats[fid].formatName}</option>`;
  });
}

function onFormatSelect() {
  const tid = document.getElementById("copyTemplateId").value;
  const fid = document.getElementById("copyFormatId").value;
  const preview = document.getElementById("copyFormatPreview");
  document.getElementById("copyError").textContent = "";

  if (!tid || !fid || !DUMMY_FORMAT_LIBRARY[tid] || !DUMMY_FORMAT_LIBRARY[tid].formats[fid]) {
    preview.textContent = "";
    return;
  }

  const json = DUMMY_FORMAT_LIBRARY[tid].formats[fid].json;
  preview.textContent = JSON.stringify(json, null, 2);
}

function handleCopyFormatLoad() {
  const tid = document.getElementById("copyTemplateId").value;
  const fid = document.getElementById("copyFormatId").value;
  const errEl = document.getElementById("copyError");
  errEl.textContent = "";

  if (!tid || !fid) {
    errEl.textContent = "Please select both Template and Format.";
    return;
  }

  const entry = DUMMY_FORMAT_LIBRARY[tid] && DUMMY_FORMAT_LIBRARY[tid].formats[fid];
  if (!entry) {
    errEl.textContent = "Selected format not found.";
    return;
  }

  const success = hydrateFromJSON(entry.json);
  if (success) {
    closeImportModal();
    _designerMode = "edit";
    syncUIFromState();
    renderPalette();
    renderAll();
    saveDraftImmediate();
    showToast(`Loaded format: ${entry.formatName}`, "success");
  }
}

function handleCopyFormatClipboard() {
  const text = document.getElementById("copyFormatPreview").textContent;
  if (!text) {
    showToast("No format selected to copy.", "warn");
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast("JSON copied to clipboard!", "success");
  });
}

// ═══════════════════════════════════════════════════════════
// SAMPLE LAYOUTS TAB — layout preset browser + loader
// ═══════════════════════════════════════════════════════════
function populateLayoutDropdown() {
  const sel = document.getElementById("layoutPresetId");
  sel.innerHTML = '<option value="">— Select Layout —</option>';
  Object.keys(LAYOUT_LIBRARY).forEach(lid => {
    const entry = LAYOUT_LIBRARY[lid];
    sel.innerHTML += `<option value="${lid}">${lid} — ${entry.layoutName}</option>`;
  });
  // Reset description row
  document.getElementById("layoutPresetDescRow").style.display = "none";
  document.getElementById("layoutPresetDesc").textContent = "";
}

function onLayoutSelect() {
  const lid     = document.getElementById("layoutPresetId").value;
  const preview = document.getElementById("layoutPresetPreview");
  const descRow = document.getElementById("layoutPresetDescRow");
  const descEl  = document.getElementById("layoutPresetDesc");
  document.getElementById("layoutError").textContent = "";

  if (!lid || !LAYOUT_LIBRARY[lid]) {
    preview.textContent = "";
    descRow.style.display = "none";
    return;
  }

  const entry = LAYOUT_LIBRARY[lid];
  descEl.textContent    = entry.description || "";
  descRow.style.display = entry.description ? "flex" : "none";
  preview.textContent   = JSON.stringify(entry.json, null, 2);
}

function handleLayoutLoad() {
  const lid   = document.getElementById("layoutPresetId").value;
  const errEl = document.getElementById("layoutError");
  errEl.textContent = "";

  if (!lid || !LAYOUT_LIBRARY[lid]) {
    errEl.textContent = "Please select a layout preset.";
    return;
  }

  const entry   = LAYOUT_LIBRARY[lid];
  const success = hydrateFromJSON(entry.json);
  if (success) {
    closeImportModal();
    _designerMode = "edit";
    syncModeUI();
    syncUIFromState();
    renderPalette();
    renderAll();
    saveDraftImmediate();
    showToast(`Loaded layout: ${entry.layoutName}`, "success");
  }
}

function handleLayoutClipboard() {
  const text = document.getElementById("layoutPresetPreview").textContent;
  if (!text) {
    showToast("No layout selected to copy.", "warn");
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast("Layout JSON copied to clipboard!", "success");
  });
}

function bindImportModal() {
  document.getElementById("importClose").addEventListener("click", closeImportModal);
  document.getElementById("importOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("importOverlay")) closeImportModal();
  });
  document.getElementById("btnImportSubmit").addEventListener("click", handleImportSubmit);

  // Tab switching
  document.querySelectorAll(".import-tab").forEach(tab => {
    tab.addEventListener("click", () => switchImportTab(tab.dataset.tab));
  });

  // Copy format controls
  document.getElementById("copyTemplateId").addEventListener("change", onTemplateSelect);
  document.getElementById("copyFormatId").addEventListener("change", onFormatSelect);
  document.getElementById("btnCopyFormatLoad").addEventListener("click", handleCopyFormatLoad);
  document.getElementById("btnCopyFormatClip").addEventListener("click", handleCopyFormatClipboard);

  // Sample layouts controls
  document.getElementById("layoutPresetId").addEventListener("change", onLayoutSelect);
  document.getElementById("btnLayoutPresetLoad").addEventListener("click", handleLayoutLoad);
  document.getElementById("btnLayoutPresetClip").addEventListener("click", handleLayoutClipboard);
}

// ═══════════════════════════════════════════════════════════
// DESIGNER INIT — caller-provided startup payload
// ═══════════════════════════════════════════════════════════
function initDesigner(payload) {
  if (!payload) return;

  _designerMode = payload.mode || "add";
  state.templateId        = payload.templateId || state.templateId;
  state.formatId          = payload.formatId || state.formatId;
  state.reportDisplayName = payload.templateName || state.reportDisplayName;

  if (payload.mode === "edit" && payload.initialJson) {
    const success = hydrateFromJSON(payload.initialJson);
    if (success) {
      syncUIFromState();
      renderPalette();
      renderAll();
    }
  }
}
