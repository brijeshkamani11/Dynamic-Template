/**
 * MCloud Report Template Designer — Property Panel Module
 * ───────────────────────────────────────────────────────
 * Slide-in editor for field cell properties.
 * Now includes per-column level visibility control.
 * Depends on: state.js, field-registry.js, utils.js, canvas.js (removeFieldFromCell)
 */

function openPropPanel(rowIdx, colIdx) {
  const cell = state.rows[rowIdx].cols[colIdx];
  if (!cell) return;

  _editTarget = { rowIdx, colIdx };

  // Show cell sections, hide row style section
  document.getElementById("cellPropSections").style.display = "";
  document.getElementById("rowStyleSection").style.display  = "none";
  document.getElementById("propDelete").style.display       = "";

  const field = FIELD_REGISTRY.find(f => f.id === cell.fieldId);
  document.getElementById("propPanelTitle").textContent = field ? field.label : "Field";

  document.getElementById("propCaption").value     = cell.caption || "";
  document.getElementById("propIconCaption").value = cell.iconCaption || "";
  document.getElementById("propMaxLine").value     = cell.maxLine || 1;
  document.getElementById("propColSpan").value     = cell.colSpan || 1;   // Phase 1
  document.getElementById("propCellVariant").value = cell.cellVariant || "text";  // Phase 2
  document.getElementById("propFontSize").value    = cell.style.fontSize || "";
  document.getElementById("propFontFamily").value  = cell.style.fontFamily || "";
  document.getElementById("propIsExpandedRow").checked = !!state.rows[rowIdx].isExpandedRow;

  // Text align buttons
  document.querySelectorAll(".align-btn[data-align]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.align === (cell.textAlign || "left"));
  });
  // Font weight buttons
  document.querySelectorAll(".align-btn[data-fw]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.fw === (cell.style.fontWeight || "normal"));
  });
  // Color
  const hex = cell.style.color ? argbToHex(cell.style.color) : "#000000";
  document.getElementById("propColor").value       = hex;
  document.getElementById("propColorHex").textContent = hex;

  // Level visibility
  buildLevelVisibilityUI(cell);

  // Amount total config
  buildAmountTotalUI(cell);

  document.getElementById("propPanel").classList.add("open");
  document.getElementById("propOverlay").classList.add("show");
}

// ── Phase 1: Row Style Panel ─────────────────────────────────
/**
 * Opens the property panel in row-style mode (colIdx = -1).
 * Shows only row-level style controls (Background, Border, Corner, Padding, Divider).
 */
function openRowStylePanel(rowIdx) {
  const row = state.rows[rowIdx];
  if (!row) return;

  _editTarget = { rowIdx, colIdx: -1 };

  // Show row style section only
  document.getElementById("cellPropSections").style.display = "none";
  document.getElementById("rowStyleSection").style.display  = "";
  document.getElementById("propDelete").style.display       = "none";
  document.getElementById("propResetStyle").style.display   = "";   // Phase 4

  document.getElementById("propPanelTitle").textContent = `Row ${rowIdx + 1} — Style`;

  // Phase 3: row type + repeater config
  const rowType = row.rowType || "normal";
  document.getElementById("rsRowType").value = rowType;
  const rc = row.repeaterConfig || {};
  document.getElementById("rsRepeaterMockKey").value    = rc.mockKey        || "transactions";
  document.getElementById("rsRepeaterMaxItems").value   = rc.maxItems       != null ? rc.maxItems : 3;
  document.getElementById("rsRepeaterDivider").checked  = !!rc.showDivider;
  document.getElementById("rsRepeaterMoreFooter").checked = rc.showMoreFooter !== false;
  document.getElementById("rsRepeaterSection").style.display = rowType === "repeater" ? "" : "none";

  // Phase 2: variant + rhythm
  document.getElementById("rsVariant").value = row.rowVariant || "default";
  document.getElementById("rsRhythm").value  = row.rhythm     || "normal";

  const rs = row.rowStyle || {};
  document.getElementById("rsBgEnable").checked    = !!rs.background;
  document.getElementById("rsBgColor").value       = rs.background   || "#f0f4ff";
  document.getElementById("rsBorderColor").value   = rs.borderColor  || "#cccccc";
  document.getElementById("rsBorderWidth").value   = rs.borderWidth  != null ? rs.borderWidth : 0;
  document.getElementById("rsCornerRadius").value  = rs.cornerRadius != null ? rs.cornerRadius : 0;
  document.getElementById("rsPaddingV").value      = rs.paddingVertical   != null ? rs.paddingVertical   : 0;
  document.getElementById("rsPaddingH").value      = rs.paddingHorizontal != null ? rs.paddingHorizontal : 0;
  document.getElementById("rsShowDivider").checked = !!rs.showDivider;
  document.getElementById("rsDividerColor").value  = rs.dividerColor  || "#e0e0e0";
  document.getElementById("rsDividerStyle").value  = rs.dividerStyle  || "solid";
  document.getElementById("rsDividerOptions").style.display = rs.showDivider ? "" : "none";

  document.getElementById("propPanel").classList.add("open");
  document.getElementById("propOverlay").classList.add("show");
}

/**
 * Builds the level visibility UI dynamically based on current group field count.
 */
function buildLevelVisibilityUI(cell) {
  const container = document.getElementById("propLevelVisibility");
  container.innerHTML = "";

  const totalLevels = getLevelCount();

  // "All levels" radio
  const allLabel = document.createElement("label");
  allLabel.className = "level-vis-option";
  const allRadio = document.createElement("input");
  allRadio.type = "radio";
  allRadio.name = "levelVisMode";
  allRadio.value = "all";
  allRadio.checked = (cell.levelVisibility === "all");
  allRadio.addEventListener("change", () => {
    document.getElementById("levelCheckboxes").style.display = "none";
  });
  allLabel.appendChild(allRadio);
  allLabel.appendChild(document.createTextNode(" All levels"));
  container.appendChild(allLabel);

  // "Selected levels" radio
  const selLabel = document.createElement("label");
  selLabel.className = "level-vis-option";
  const selRadio = document.createElement("input");
  selRadio.type = "radio";
  selRadio.name = "levelVisMode";
  selRadio.value = "selected";
  selRadio.checked = (cell.levelVisibility !== "all");
  selRadio.addEventListener("change", () => {
    document.getElementById("levelCheckboxes").style.display = "flex";
  });
  selLabel.appendChild(selRadio);
  selLabel.appendChild(document.createTextNode(" Selected levels"));
  container.appendChild(selLabel);

  // Level checkboxes
  const cbWrap = document.createElement("div");
  cbWrap.id = "levelCheckboxes";
  cbWrap.className = "level-checkboxes";
  cbWrap.style.display = (cell.levelVisibility !== "all") ? "flex" : "none";

  const selectedLevels = Array.isArray(cell.levelVisibility) ? cell.levelVisibility : [];

  for (let lv = 1; lv <= totalLevels; lv++) {
    const lvLabel = document.createElement("label");
    lvLabel.className = "level-cb-label";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = lv;
    cb.checked = selectedLevels.includes(lv);
    lvLabel.appendChild(cb);

    // Build level name
    let lvName = `Level ${lv}`;
    if (lv <= state.groupFields.length) {
      lvName = `L${lv}: ${state.groupFields[lv - 1].label}`;
    } else if (lv === totalLevels) {
      lvName = `L${lv}: Detail`;
    }
    lvLabel.appendChild(document.createTextNode(` ${lvName}`));
    cbWrap.appendChild(lvLabel);
  }

  container.appendChild(cbWrap);

  // If only 1 level, just show "All levels" and hide controls
  if (totalLevels <= 1) {
    container.innerHTML = '<span class="toggle-desc">No group fields — single level only</span>';
  }
}

/**
 * Builds the amount total config UI for amount fields.
 */
function buildAmountTotalUI(cell) {
  const container = document.getElementById("propAmountTotal");
  if (!container) return;
  container.innerHTML = "";

  const field = FIELD_REGISTRY.find(f => f.id === cell.fieldId);
  if (!field || !field.isAmount) {
    container.parentElement.style.display = "none";
    return;
  }
  container.parentElement.style.display = "";

  const includeTotal = cell.includeTotal || false;
  const totalScope   = cell.totalScopeLevel || "all";

  // Include Total checkbox
  const chkWrap = document.createElement("label");
  chkWrap.className = "level-vis-option";
  const chk = document.createElement("input");
  chk.type = "checkbox";
  chk.id = "propIncludeTotal";
  chk.checked = includeTotal;
  chkWrap.appendChild(chk);
  chkWrap.appendChild(document.createTextNode(" Include Total"));
  container.appendChild(chkWrap);

  // Total Scope options (shown only when includeTotal is checked)
  const scopeWrap = document.createElement("div");
  scopeWrap.id = "totalScopeWrap";
  scopeWrap.className = "level-checkboxes";
  scopeWrap.style.display = includeTotal ? "flex" : "none";
  scopeWrap.style.flexDirection = "column";

  ["all", "first"].forEach(v => {
    const lbl = document.createElement("label");
    lbl.className = "level-cb-label";
    const r = document.createElement("input");
    r.type = "radio"; r.name = "totalScope"; r.value = v;
    r.checked = (totalScope === v);
    lbl.appendChild(r);
    lbl.appendChild(document.createTextNode(" " + (v === "all" ? "All levels" : "First level only")));
    scopeWrap.appendChild(lbl);
  });

  // Specific levels option
  const specLbl = document.createElement("label");
  specLbl.className = "level-cb-label";
  const specR = document.createElement("input");
  specR.type = "radio"; specR.name = "totalScope"; specR.value = "specific";
  specR.checked = Array.isArray(totalScope);
  specLbl.appendChild(specR);
  specLbl.appendChild(document.createTextNode(" Specific levels"));
  scopeWrap.appendChild(specLbl);

  // Level checkboxes for specific
  const totalLevels = getLevelCount();
  const specCbWrap = document.createElement("div");
  specCbWrap.id = "totalScopeLevels";
  specCbWrap.className = "level-checkboxes";
  specCbWrap.style.display = Array.isArray(totalScope) ? "flex" : "none";
  specCbWrap.style.paddingLeft = "20px";

  const selectedScopes = Array.isArray(totalScope) ? totalScope : [];
  for (let lv = 1; lv <= totalLevels; lv++) {
    const lvLbl = document.createElement("label");
    lvLbl.className = "level-cb-label";
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.value = lv; cb.checked = selectedScopes.includes(lv);
    lvLbl.appendChild(cb);
    let lvName = lv <= state.groupFields.length ? `L${lv}: ${state.groupFields[lv-1].label}` : `L${lv}: Detail`;
    lvLbl.appendChild(document.createTextNode(` ${lvName}`));
    specCbWrap.appendChild(lvLbl);
  }
  scopeWrap.appendChild(specCbWrap);

  container.appendChild(scopeWrap);

  chk.addEventListener("change", () => {
    scopeWrap.style.display = chk.checked ? "flex" : "none";
  });
  scopeWrap.querySelectorAll('input[name="totalScope"]').forEach(r => {
    r.addEventListener("change", () => {
      specCbWrap.style.display = (r.value === "specific" && r.checked) ? "flex" : "none";
    });
  });
}

function closePropPanel() {
  document.getElementById("propPanel").classList.remove("open");
  document.getElementById("propOverlay").classList.remove("show");
  // Reset sections to default (cell mode) so next open is clean
  document.getElementById("cellPropSections").style.display = "";
  document.getElementById("rowStyleSection").style.display  = "none";
  document.getElementById("propDelete").style.display       = "";
  document.getElementById("propResetStyle").style.display   = "none";  // Phase 4
  _editTarget = null;
}

function bindPropPanel() {
  document.getElementById("propClose").addEventListener("click", closePropPanel);
  document.getElementById("propOverlay").addEventListener("click", closePropPanel);

  document.querySelectorAll(".align-btn[data-align]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".align-btn[data-align]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.querySelectorAll(".align-btn[data-fw]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".align-btn[data-fw]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("propColor").addEventListener("input", e => {
    document.getElementById("propColorHex").textContent = e.target.value;
  });

  // Phase 1: divider toggle shows/hides divider sub-options
  document.getElementById("rsShowDivider").addEventListener("change", e => {
    document.getElementById("rsDividerOptions").style.display = e.target.checked ? "" : "none";
  });

  // Phase 3: row type toggle shows/hides repeater controls
  document.getElementById("rsRowType").addEventListener("change", e => {
    document.getElementById("rsRepeaterSection").style.display =
      e.target.value === "repeater" ? "" : "none";
  });

  // Phase 2: preset buttons
  document.getElementById("presetGrid").addEventListener("click", e => {
    const btn = e.target.closest("[data-preset]");
    if (btn) applyPreset(btn.dataset.preset);
  });

  document.getElementById("propApply").addEventListener("click", applyPropPanel);

  document.getElementById("propDelete").addEventListener("click", () => {
    if (!_editTarget) return;
    removeFieldFromCell(_editTarget.rowIdx, _editTarget.colIdx);
    closePropPanel();
  });

  // Phase 4: Reset Style — clears rowStyle/variant/rhythm in the open panel without closing
  document.getElementById("propResetStyle").addEventListener("click", () => {
    if (!_editTarget || _editTarget.colIdx !== -1) return;
    resetRowStyle(_editTarget.rowIdx);
    closePropPanel();
  });
}

function applyPropPanel() {
  if (!_editTarget) return;

  // Phase 1: row-style mode
  if (_editTarget.colIdx === -1) {
    applyRowStyle();
    return;
  }

  const { rowIdx, colIdx } = _editTarget;
  const cell = state.rows[rowIdx].cols[colIdx];
  if (!cell) return;

  cell.caption      = document.getElementById("propCaption").value.trim();
  cell.iconCaption  = document.getElementById("propIconCaption").value;
  cell.maxLine      = Math.max(1, Math.min(5, parseInt(document.getElementById("propMaxLine").value) || 1));
  cell.colSpan      = Math.max(1, Math.min(MAX_COLS, parseInt(document.getElementById("propColSpan").value) || 1));  // Phase 1
  cell.cellVariant  = document.getElementById("propCellVariant").value || "text";  // Phase 2
  cell.textAlign    = document.querySelector(".align-btn[data-align].active")?.dataset.align || "left";
  state.rows[rowIdx].isExpandedRow = document.getElementById("propIsExpandedRow").checked;

  const fw = document.querySelector(".align-btn[data-fw].active")?.dataset.fw || "normal";
  const fs = document.getElementById("propFontSize").value;
  const ff = document.getElementById("propFontFamily").value;
  const colorHex = document.getElementById("propColor").value;

  cell.style.fontWeight  = fw;
  cell.style.fontSize    = fs ? parseFloat(fs) : "";
  cell.style.fontFamily  = ff;
  cell.style.color       = colorHex !== "#000000" ? hexToArgb(colorHex) : "0xFF000000";

  // Level visibility
  const modeRadio = document.querySelector('input[name="levelVisMode"]:checked');
  if (modeRadio && modeRadio.value === "selected") {
    const checks = document.querySelectorAll("#levelCheckboxes input[type=checkbox]:checked");
    const levels = [...checks].map(cb => parseInt(cb.value));
    cell.levelVisibility = levels.length > 0 ? levels : "all";
  } else {
    cell.levelVisibility = "all";
  }

  // Amount total config
  const field = FIELD_REGISTRY.find(f => f.id === cell.fieldId);
  if (field && field.isAmount) {
    const inclChk = document.getElementById("propIncludeTotal");
    cell.includeTotal = inclChk ? inclChk.checked : false;
    if (cell.includeTotal) {
      const scopeRadio = document.querySelector('input[name="totalScope"]:checked');
      if (scopeRadio) {
        if (scopeRadio.value === "specific") {
          const scopeCbs = document.querySelectorAll("#totalScopeLevels input[type=checkbox]:checked");
          const scopeLevels = [...scopeCbs].map(cb => parseInt(cb.value));
          cell.totalScopeLevel = scopeLevels.length > 0 ? scopeLevels : "all";
        } else {
          cell.totalScopeLevel = scopeRadio.value; // "all" or "first"
        }
      }
    } else {
      cell.totalScopeLevel = "all";
    }
  }

  closePropPanel();
  renderAll();
}

// ── Phase 1: Apply Row Style ─────────────────────────────────
/**
 * Reads the row-style form and writes to state.rows[rowIdx].rowStyle.
 * Only stores non-default values to keep state clean.
 */
function applyRowStyle() {
  const { rowIdx } = _editTarget;
  const row = state.rows[rowIdx];
  if (!row) return;

  // Phase 3: row type + repeater config
  row.rowType = document.getElementById("rsRowType").value || "normal";
  if (row.rowType === "repeater") {
    row.repeaterConfig = {
      mockKey        : document.getElementById("rsRepeaterMockKey").value || "transactions",
      maxItems       : Math.max(1, Math.min(10, parseInt(document.getElementById("rsRepeaterMaxItems").value) || 3)),
      showDivider    : document.getElementById("rsRepeaterDivider").checked,
      showMoreFooter : document.getElementById("rsRepeaterMoreFooter").checked,
    };
  } else {
    delete row.repeaterConfig;
  }

  // Phase 2: variant + rhythm
  row.rowVariant = document.getElementById("rsVariant").value || "default";
  row.rhythm     = document.getElementById("rsRhythm").value  || "normal";

  const rs = {};

  // Background — only if the enable checkbox is ticked
  if (document.getElementById("rsBgEnable").checked) {
    const bg = document.getElementById("rsBgColor").value;
    if (bg) rs.background = bg;
  }

  // Border — only if width > 0
  const bw = parseFloat(document.getElementById("rsBorderWidth").value) || 0;
  if (bw > 0) {
    rs.borderWidth = bw;
    rs.borderColor = document.getElementById("rsBorderColor").value;
  }

  // Corner radius
  const cr = parseFloat(document.getElementById("rsCornerRadius").value) || 0;
  if (cr > 0) rs.cornerRadius = cr;

  // Padding
  const pv = parseFloat(document.getElementById("rsPaddingV").value) || 0;
  const ph = parseFloat(document.getElementById("rsPaddingH").value) || 0;
  if (pv > 0) rs.paddingVertical   = pv;
  if (ph > 0) rs.paddingHorizontal = ph;

  // Divider
  if (document.getElementById("rsShowDivider").checked) {
    rs.showDivider = true;
    const dc = document.getElementById("rsDividerColor").value;
    const ds = document.getElementById("rsDividerStyle").value;
    if (dc && dc !== "#e0e0e0") rs.dividerColor = dc;
    if (ds && ds !== "solid")   rs.dividerStyle = ds;
  }

  row.rowStyle = rs;
  closePropPanel();
  renderAll();
}

// ── Phase 2/4: Quick Presets ─────────────────────────────────
/**
 * Named presets. Each preset sets rowType, rowVariant, rhythm, rowStyle
 * (and optionally repeaterConfig). Form fields are populated for review
 * before the user hits Apply — no data is destroyed without interaction.
 */
const PRESETS = {
  // ── original 5 (Phase 2) ──────────────────────────────────
  compactLedger: {
    label: "Compact Ledger",
    rowVariant: "default",
    rhythm:     "compact",
    rowStyle:   { showDivider: true },
  },
  headerStrip: {
    label: "Header Strip",
    rowVariant: "stripHeader",
    rhythm:     "normal",
    rowStyle:   { background: "#e3f0fb", paddingVertical: 6, paddingHorizontal: 8, cornerRadius: 6 },
  },
  alertCard: {
    label: "Alert Card",
    rowVariant: "summary",
    rhythm:     "spacious",
    rowStyle:   { background: "#fff3e0", borderColor: "#fb8c00", borderWidth: 1, cornerRadius: 6, paddingVertical: 8, paddingHorizontal: 10 },
  },
  summaryBand: {
    label: "Summary Band",
    rowVariant: "summary",
    rhythm:     "normal",
    rowStyle:   { background: "#e8f5e9", borderColor: "#43a047", borderWidth: 1, cornerRadius: 4, paddingVertical: 6, paddingHorizontal: 8 },
  },
  footerActions: {
    label: "Footer Actions",
    rowVariant: "footerActions",
    rhythm:     "compact",
    rowStyle:   { background: "#f5f7fa", paddingVertical: 4, paddingHorizontal: 8 },
  },
  // ── new 5 (Phase 4) ───────────────────────────────────────
  lineItemList: {
    label: "Line-Item List",
    rowType:    "repeater",
    rowVariant: "default",
    rhythm:     "compact",
    rowStyle:   { showDivider: false },
    repeaterConfig: { mockKey: "lineItems", maxItems: 4, showDivider: true, showMoreFooter: true },
  },
  contactCompact: {
    label: "Contact Compact",
    rowVariant: "default",
    rhythm:     "compact",
    rowStyle:   { paddingVertical: 4, paddingHorizontal: 8 },
  },
  detailExpanded: {
    label: "Detail Expanded",
    rowVariant: "softPanel",
    rhythm:     "spacious",
    rowStyle:   { background: "#f0f4ff", cornerRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  },
  transactionList: {
    label: "Transaction List",
    rowType:    "repeater",
    rowVariant: "default",
    rhythm:     "compact",
    rowStyle:   {},
    repeaterConfig: { mockKey: "transactions", maxItems: 3, showDivider: true, showMoreFooter: true },
  },
  softDetailCard: {
    label: "Soft Panel",
    rowVariant: "softPanel",
    rhythm:     "normal",
    rowStyle:   { background: "#f0f4ff", cornerRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  },
};

function applyPreset(presetName) {
  if (!_editTarget || _editTarget.colIdx !== -1) return;
  const preset = PRESETS[presetName];
  if (!preset) return;

  // Phase 4: confirm before overwriting a row that already has non-default style
  const row = state.rows[_editTarget.rowIdx];
  const hasExistingStyle = Object.keys(row.rowStyle || {}).length > 0
    || (row.rowVariant && row.rowVariant !== "default")
    || (row.rowType    && row.rowType    !== "normal");
  if (hasExistingStyle) {
    if (!confirm(`This row already has a style applied.\nApply preset "${preset.label || presetName}" and replace it?`)) return;
  }

  // Write all preset fields to form so user can review + tweak before clicking Apply
  document.getElementById("rsRowType").value  = preset.rowType    || "normal";
  document.getElementById("rsVariant").value  = preset.rowVariant || "default";
  document.getElementById("rsRhythm").value   = preset.rhythm     || "normal";

  // Show/hide repeater controls
  const isRepeater = (preset.rowType === "repeater");
  document.getElementById("rsRepeaterSection").style.display = isRepeater ? "" : "none";
  if (isRepeater && preset.repeaterConfig) {
    const rc = preset.repeaterConfig;
    document.getElementById("rsRepeaterMockKey").value      = rc.mockKey    || "transactions";
    document.getElementById("rsRepeaterMaxItems").value     = rc.maxItems   != null ? rc.maxItems : 3;
    document.getElementById("rsRepeaterDivider").checked    = !!rc.showDivider;
    document.getElementById("rsRepeaterMoreFooter").checked = rc.showMoreFooter !== false;
  }

  const rs = preset.rowStyle || {};
  document.getElementById("rsBgEnable").checked    = !!rs.background;
  document.getElementById("rsBgColor").value       = rs.background    || "#f0f4ff";
  document.getElementById("rsBorderColor").value   = rs.borderColor   || "#cccccc";
  document.getElementById("rsBorderWidth").value   = rs.borderWidth   != null ? rs.borderWidth : 0;
  document.getElementById("rsCornerRadius").value  = rs.cornerRadius  != null ? rs.cornerRadius : 0;
  document.getElementById("rsPaddingV").value      = rs.paddingVertical   != null ? rs.paddingVertical   : 0;
  document.getElementById("rsPaddingH").value      = rs.paddingHorizontal != null ? rs.paddingHorizontal : 0;
  document.getElementById("rsShowDivider").checked = !!rs.showDivider;
  document.getElementById("rsDividerOptions").style.display = rs.showDivider ? "" : "none";

  // Highlight active preset button
  document.querySelectorAll("#presetGrid .preset-btn").forEach(b => {
    b.classList.toggle("preset-btn-active", b.dataset.preset === presetName);
  });

  showToast(`"${preset.label || presetName}" loaded — click Apply to save.`, "info");
}
