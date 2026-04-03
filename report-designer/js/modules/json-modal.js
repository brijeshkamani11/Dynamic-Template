/**
 * MCloud Mobile Template Card Designer — JSON Generation & Modal Module
 * ───────────────────────────────────────────────────────────────
 * Generates the Flutter-consumable JSON and manages the preview modal.
 * Also manages import flow (paste JSON + copy existing format).
 * Depends on: state.js, format-library.js, recovery.js
 */

// ═══════════════════════════════════════════════════════════
// JSON GENERATION
// ═══════════════════════════════════════════════════════════
function generateJSON() {
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
      // Phase 2: cellVariant — omit if default ("text")
      if (cell.cellVariant && cell.cellVariant !== "text") cfg.cellVariant = cell.cellVariant;

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

    // Phase 2: rowVariant + rhythm — omit if defaults
    if (row.rowVariant && row.rowVariant !== "default") fc.rowVariant = row.rowVariant;
    if (row.rhythm     && row.rhythm     !== "normal")  fc.rhythm     = row.rhythm;

    // Phase 3: rowType + repeaterConfig — omit if default (normal)
    if (row.rowType && row.rowType !== "normal") {
      fc.rowType = row.rowType;
      if (row.repeaterConfig) fc.repeaterConfig = row.repeaterConfig;
    }

    // Phase 1: rowStyle — omit entirely if empty (defaults used)
    const rs = row.rowStyle || {};
    if (Object.keys(rs).length > 0) {
      const rsOut = {};
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
      if (Object.keys(rsOut).length > 0) fc.rowStyle = rsOut;
    }

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
// IMPORT JSON — validate + hydrate state
// ═══════════════════════════════════════════════════════════
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
      if (!col.dataField) {
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

function hydrateFromJSON(json) {
  const result = validateImportJSON(json);
  if (!result.valid) {
    showToast("Import failed: " + result.error, "warn");
    return false;
  }

  // ── Import validation helpers ────────────────────────────────
  const VALID_TEXT_ALIGN    = ["left", "center", "right"];
  const VALID_CELL_VARIANT  = ["text", "amount", "badge", "icon", "date", "link"];
  const VALID_ROW_TYPE      = ["normal", "repeater"];

  function clampTextAlign(v)   { return VALID_TEXT_ALIGN.includes(v)   ? v : "left"; }
  function clampCellVariant(v) { return VALID_CELL_VARIANT.includes(v) ? v : "text"; }
  function clampRowType(v)     { return VALID_ROW_TYPE.includes(v)     ? v : "normal"; }
  function clampColSpan(v)     { const n = parseInt(v, 10); return (!isNaN(n) && n >= 1 && n <= MAX_COLS) ? n : 1; }
  function clampLevelVis(v)    { return (v === "all" || Array.isArray(v)) ? v : "all"; }
  // ────────────────────────────────────────────────────────────

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
        textAlign      : clampTextAlign(cfg.textAlign),
        maxLine        : cfg.maxLine || 1,
        colSpan        : clampColSpan(cfg.colSpan),        // Phase 1
        cellVariant    : clampCellVariant(cfg.cellVariant), // Phase 2
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

    const newRow = {
      id           : "row_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      isExpandedRow: !!fc.isExpandedRow,
      rowStyle     : fc.rowStyle   || {},           // Phase 1
      rowVariant   : fc.rowVariant || "default",    // Phase 2
      rhythm       : fc.rhythm     || "normal",     // Phase 2
      rowType      : clampRowType(fc.rowType),       // Phase 3
      cols         : cols,
    };
    // Phase 3: repeaterConfig — only copy when present
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
  document.getElementById("importPasteSection").style.display = tab === "paste" ? "block" : "none";
  document.getElementById("importCopySection").style.display  = tab === "copy"  ? "block" : "none";

  if (tab === "paste") {
    const ta = document.getElementById("importInput");
    ta.value = "";
    document.getElementById("importError").textContent = "";
    setTimeout(() => ta.focus(), 50);
  } else {
    populateTemplateDropdown();
    document.getElementById("copyFormatPreview").textContent = "";
    document.getElementById("copyError").textContent = "";
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
