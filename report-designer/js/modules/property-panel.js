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

  const field = FIELD_REGISTRY.find(f => f.id === cell.fieldId);
  document.getElementById("propPanelTitle").textContent = field ? field.label : "Field";

  document.getElementById("propCaption").value    = cell.caption || "";
  document.getElementById("propIconCaption").value = cell.iconCaption || "";
  document.getElementById("propMaxLine").value    = cell.maxLine || 1;
  document.getElementById("propFontSize").value   = cell.style.fontSize || "";
  document.getElementById("propFontFamily").value = cell.style.fontFamily || "";
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
  document.getElementById("propColor").value    = hex;
  document.getElementById("propColorHex").textContent = hex;

  // Level visibility
  buildLevelVisibilityUI(cell);

  // Amount total config
  buildAmountTotalUI(cell);

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

  document.getElementById("propApply").addEventListener("click", applyPropPanel);

  document.getElementById("propDelete").addEventListener("click", () => {
    if (!_editTarget) return;
    removeFieldFromCell(_editTarget.rowIdx, _editTarget.colIdx);
    closePropPanel();
  });
}

function applyPropPanel() {
  if (!_editTarget) return;
  const { rowIdx, colIdx } = _editTarget;
  const cell = state.rows[rowIdx].cols[colIdx];
  if (!cell) return;

  cell.caption     = document.getElementById("propCaption").value.trim();
  cell.iconCaption = document.getElementById("propIconCaption").value;
  cell.maxLine     = Math.max(1, Math.min(5, parseInt(document.getElementById("propMaxLine").value) || 1));
  cell.textAlign   = document.querySelector(".align-btn[data-align].active")?.dataset.align || "left";
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
