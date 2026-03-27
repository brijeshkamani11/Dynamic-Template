/**
 * MCloud Mobile Template Card Designer — JSON Generation & Modal Module
 * ───────────────────────────────────────────────────────────────
 * Generates the Flutter-consumable JSON and manages the preview modal.
 * Additive-only extensions: groupFields, levelVisibility, drillConfig,
 *   totalConfig, format/template identity.
 * Depends on: state.js
 */

// ═══════════════════════════════════════════════════════════
// JSON GENERATION
// ═══════════════════════════════════════════════════════════
function generateJSON() {
  // A) Auto-compute tap values based on current format
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

      // Style — only include if non-default
      const styleObj = {};
      if (cell.style.color && cell.style.color !== "0xFF000000") styleObj.color = cell.style.color;
      if (cell.style.fontSize)  styleObj.fontSize   = cell.style.fontSize;
      if (cell.style.fontWeight && cell.style.fontWeight !== "normal") styleObj.fontWeight = cell.style.fontWeight;
      if (cell.style.fontFamily) styleObj.fontFamily = cell.style.fontFamily;
      if (Object.keys(styleObj).length) cfg.style = styleObj;

      // Level visibility — only include if not "all" (additive)
      if (cell.levelVisibility !== "all" && Array.isArray(cell.levelVisibility)) {
        cfg.levelVisibility = cell.levelVisibility;
      }

      // E) Amount total config — additive
      if (cell.includeTotal) {
        cfg.totalConfig = {
          includeTotal   : true,
          totalScopeLevel: cell.totalScopeLevel || "all",
        };
      }

      columnConfig.push(cfg);
    });

    if (columnConfig.length === 0) return;

    fieldConfigs.push({
      isExpandedRow: row.isExpandedRow,
      columnCount: row.cols.length,
      columnConfig,
    });
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

  // I) Template/format identity — additive
  layout.templateId       = state.templateId || "";
  layout.formatId         = state.formatId || "";
  layout.reportDisplayName = state.reportDisplayName || "";

  // Additive: Group fields / drill config
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

function openJSONModal() {
  const json = generateJSON();
  document.getElementById("jsonOutput").textContent = JSON.stringify(json, null, 2);
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
// J) IMPORT JSON — validate + hydrate state
// ═══════════════════════════════════════════════════════════

/**
 * Validates a parsed JSON object has the required shape for import.
 * Returns { valid: true } or { valid: false, error: "message" }.
 */
function validateImportJSON(obj) {
  if (!obj || typeof obj !== "object") return { valid: false, error: "Not a valid JSON object." };
  if (obj.layoutType !== "grid")       return { valid: false, error: "Missing or invalid layoutType (expected 'grid')." };
  if (!Array.isArray(obj.fieldConfigs)) return { valid: false, error: "Missing fieldConfigs array." };

  for (let i = 0; i < obj.fieldConfigs.length; i++) {
    const fc = obj.fieldConfigs[i];
    if (!Array.isArray(fc.columnConfig)) {
      return { valid: false, error: `fieldConfigs[${i}] missing columnConfig array.` };
    }
    for (let j = 0; j < fc.columnConfig.length; j++) {
      const col = fc.columnConfig[j];
      if (!col.dataField) {
        return { valid: false, error: `fieldConfigs[${i}].columnConfig[${j}] missing dataField.` };
      }
    }
  }
  return { valid: true };
}

/**
 * Hydrates the designer state from a valid JSON layout object.
 * Does NOT mutate state if validation fails.
 */
function hydrateFromJSON(json) {
  const result = validateImportJSON(json);
  if (!result.valid) {
    showToast("Import failed: " + result.error, "warn");
    return false;
  }

  // Build rows from fieldConfigs
  const newRows = [];
  json.fieldConfigs.forEach(fc => {
    const colCount = fc.columnCount || fc.columnConfig.length;
    const cols = new Array(Math.min(colCount, MAX_COLS)).fill(null);

    fc.columnConfig.forEach(cfg => {
      const colIdx = (cfg.col || 1) - 1;
      if (colIdx < 0 || colIdx >= cols.length) return;

      const field = FIELD_REGISTRY.find(f => f.dataField === cfg.dataField);
      const cellObj = {
        uid            : uid(),
        fieldId        : field ? field.id : "unknown",
        dataField      : cfg.dataField,
        caption        : cfg.caption || (field ? field.defaultCaption : ""),
        iconCaption    : cfg.iconCaption || "",
        textAlign      : cfg.textAlign || "left",
        maxLine        : cfg.maxLine || 1,
        levelVisibility: cfg.levelVisibility || "all",
        style          : {
          color      : (cfg.style && cfg.style.color)      || "",
          fontSize   : (cfg.style && cfg.style.fontSize)   || "",
          fontWeight : (cfg.style && cfg.style.fontWeight)  || "normal",
          fontFamily : (cfg.style && cfg.style.fontFamily)  || "",
        },
      };

      // Amount total config
      if (cfg.totalConfig && cfg.totalConfig.includeTotal) {
        cellObj.includeTotal    = true;
        cellObj.totalScopeLevel = cfg.totalConfig.totalScopeLevel || "all";
      }

      cols[colIdx] = cellObj;
    });

    newRows.push({
      id           : "row_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      isExpandedRow: !!fc.isExpandedRow,
      cols         : cols,
    });
  });

  // Apply to state
  state.rows         = newRows;
  state.mOnTap       = json.mOnTap || "expand";
  state.mOnDoubleTap = json.mOnDoubleTap || "";
  state.templateName = json.reportDisplayName || state.templateName || "";
  state.templateId   = json.templateId || state.templateId;
  state.formatId     = json.formatId || state.formatId;
  state.reportDisplayName = json.reportDisplayName || state.reportDisplayName;

  // Indicator
  if (json.indicator) {
    state.indicator.isShow    = !!json.indicator.isShow;
    state.indicator.dataField = json.indicator.dataField || "";
  }

  // Group fields
  if (Array.isArray(json.groupFields)) {
    state.groupFields = json.groupFields.map(gf => ({
      fieldId   : gf.fieldId || "",
      dataField : gf.dataField || "",
      label     : gf.label || "",
    }));
  } else {
    state.groupFields = [];
  }

  // Reset transient state
  _drillPath = [];
  _expandedCardIdx = -1;
  _paletteStage = state.groupFields.length > 0 ? "group" : "column";

  computeTapValues();

  return true;
}

/**
 * Opens import modal, lets user paste JSON, validates, hydrates.
 */
function openImportModal() {
  document.getElementById("importOverlay").style.display = "flex";
  const textarea = document.getElementById("importInput");
  textarea.value = "";
  document.getElementById("importError").textContent = "";
  // Focus textarea so user can paste immediately
  setTimeout(() => textarea.focus(), 50);
}

function closeImportModal() {
  document.getElementById("importOverlay").style.display = "none";
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
    errEl.textContent = "Invalid JSON syntax: " + e.message;
    return;
  }

  const success = hydrateFromJSON(parsed);
  if (success) {
    closeImportModal();
    // Update UI inputs
    document.getElementById("templateName").value = state.templateName;
    document.getElementById("indicatorShow").checked = state.indicator.isShow;
    document.getElementById("indicatorFieldRow").style.display = state.indicator.isShow ? "flex" : "none";
    if (state.indicator.dataField) {
      document.getElementById("indicatorField").value = state.indicator.dataField;
    }
    _designerMode = "edit";
    renderPalette();
    renderAll();
    showToast("JSON imported successfully!", "success");
  }
}

function bindImportModal() {
  document.getElementById("importClose").addEventListener("click", closeImportModal);
  document.getElementById("importOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("importOverlay")) closeImportModal();
  });
  document.getElementById("btnImportSubmit").addEventListener("click", handleImportSubmit);
}

/**
 * J) Caller-provided startup payload for edit mode.
 * Call this from app.js or externally: initDesigner({ mode: "edit", json: {...} })
 */
function initDesigner(payload) {
  if (!payload) return;
  if (payload.mode === "edit" && payload.json) {
    _designerMode = "edit";
    const success = hydrateFromJSON(payload.json);
    if (success) {
      document.getElementById("templateName").value = state.templateName;
      document.getElementById("indicatorShow").checked = state.indicator.isShow;
      document.getElementById("indicatorFieldRow").style.display = state.indicator.isShow ? "flex" : "none";
      renderPalette();
      renderAll();
    }
  } else {
    _designerMode = "add";
  }
}
