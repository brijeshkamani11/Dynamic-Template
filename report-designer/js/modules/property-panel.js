/**
 * MCloud Report Template Designer — Property Panel Module
 * ───────────────────────────────────────────────────────
 * Slide-in editor for field cell properties.
 * Depends on: state.js, field-registry.js, utils.js (renderAll, hexToArgb, argbToHex), canvas.js (removeFieldFromCell)
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

  document.getElementById("propPanel").classList.add("open");
  document.getElementById("propOverlay").classList.add("show");
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

  closePropPanel();
  renderAll();
}
