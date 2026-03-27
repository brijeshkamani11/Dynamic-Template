/**
 * MCloud Report Template Designer — Canvas Module
 * ────────────────────────────────────────────────
 * Row management + canvas DOM rendering.
 * Now supports dynamic column count per row (1 to MAX_COLS).
 * Depends on: state.js, field-registry.js, utils.js, property-panel.js (openPropPanel)
 */

// ═══════════════════════════════════════════════════════════
// ROW MANAGEMENT
// ═══════════════════════════════════════════════════════════
function addRow() {
  state.rows.push({
    id           : "row_" + Date.now(),
    isExpandedRow: false,
    cols         : [null],  // start with 1 column; user adds more
  });
  renderAll();
}

function deleteRow(rowIdx) {
  state.rows.splice(rowIdx, 1);
  renderAll();
}

function toggleExpandedRow(rowIdx) {
  state.rows[rowIdx].isExpandedRow = !state.rows[rowIdx].isExpandedRow;
  renderAll();
}

function moveRow(rowIdx, dir) {
  const target = rowIdx + dir;
  if (target < 0 || target >= state.rows.length) return;
  [state.rows[rowIdx], state.rows[target]] = [state.rows[target], state.rows[rowIdx]];
  renderAll();
}

function addColToRow(rowIdx) {
  const row = state.rows[rowIdx];
  if (row.cols.length >= MAX_COLS) {
    showToast(`Max ${MAX_COLS} columns per row.`, "warn");
    return;
  }
  row.cols.push(null);
  renderAll();
}

function removeColFromRow(rowIdx) {
  const row = state.rows[rowIdx];
  if (row.cols.length <= 1) {
    showToast("Row must have at least 1 column.", "warn");
    return;
  }
  // Remove the last column (warn if it has content)
  const lastCol = row.cols[row.cols.length - 1];
  if (lastCol && !confirm("Remove last column? Its field will be lost.")) return;
  row.cols.pop();
  renderAll();
}

// ═══════════════════════════════════════════════════════════
// FIELD CELL MANAGEMENT
// ═══════════════════════════════════════════════════════════
function addFieldToCell(fieldId, rowIdx, colIdx) {
  const field = FIELD_REGISTRY.find(f => f.id === fieldId);
  if (!field) return;
  const cellObj = {
    uid            : uid(),
    fieldId        : field.id,
    dataField      : field.dataField,
    caption        : field.defaultCaption,
    iconCaption    : "",
    textAlign      : "left",
    maxLine        : 1,
    levelVisibility: "all",   // "all" or array of level numbers e.g. [1,3]
    style          : { color: "", fontSize: "", fontWeight: "normal", fontFamily: "" },
  };
  // Amount fields get total config defaults
  if (field.isAmount) {
    cellObj.includeTotal    = false;
    cellObj.totalScopeLevel = "all";  // "all" | "first" | number[]
  }
  state.rows[rowIdx].cols[colIdx] = cellObj;
  renderAll();
}

function addFieldToFirstEmpty(fieldId) {
  for (let r = 0; r < state.rows.length; r++) {
    for (let c = 0; c < state.rows[r].cols.length; c++) {
      if (!state.rows[r].cols[c]) {
        addFieldToCell(fieldId, r, c);
        flashCell(r, c);
        return;
      }
    }
  }
  // No empty cell — add a new row
  addRow();
  addFieldToCell(fieldId, state.rows.length - 1, 0);
}

function removeFieldFromCell(rowIdx, colIdx) {
  state.rows[rowIdx].cols[colIdx] = null;
  renderAll();
}

function flashCell(r, c) {
  setTimeout(() => {
    const el = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (el) { el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 600); }
  }, 50);
}

// ═══════════════════════════════════════════════════════════
// CANVAS TOOLBAR
// ═══════════════════════════════════════════════════════════
function bindCanvasToolbar() {
  document.getElementById("btnAddRow").addEventListener("click", addRow);
  // G) "Show Expanded Rows" toggle removed — all rows always visible in canvas
}

// ═══════════════════════════════════════════════════════════
// RENDER — CANVAS
// ═══════════════════════════════════════════════════════════
function renderCanvas() {
  const canvas    = document.getElementById("canvas");
  const emptyMsg  = document.getElementById("canvasEmpty");
  const rowCount  = document.getElementById("rowCount");

  // Remove old rows (keep emptyMsg)
  canvas.querySelectorAll(".canvas-row-wrap").forEach(el => el.remove());

  rowCount.textContent = state.rows.length;

  if (state.rows.length === 0) {
    emptyMsg.style.display = "flex";
    emptyMsg.querySelector(".empty-title").textContent = "Canvas is empty";
    emptyMsg.querySelector(".empty-sub").innerHTML = 'Click <strong>+ Add Row</strong> to start building your card layout';
    return;
  }
  emptyMsg.style.display = "none";

  state.rows.forEach((row, rIdx) => {

    const colCount = row.cols.length;
    const wrap = document.createElement("div");
    wrap.className = "canvas-row-wrap" + (row.isExpandedRow ? " is-expanded" : "");
    wrap.dataset.rowIdx = rIdx;

    // Row header
    const header = document.createElement("div");
    header.className = "row-header";
    header.innerHTML = `
      <div class="row-badge">Row ${rIdx + 1}</div>
      <div class="row-badge-exp ${row.isExpandedRow ? "active" : ""}" title="Toggle expanded row">
        ${row.isExpandedRow ? "⤵ Expanded" : "⊞ Normal"}
      </div>
      <div class="row-col-controls">
        <button class="row-btn row-btn-col" title="Remove column" data-action="remcol" data-row="${rIdx}"${colCount <= 1 ? " disabled" : ""}>−</button>
        <span class="row-col-count">${colCount} col${colCount > 1 ? "s" : ""}</span>
        <button class="row-btn row-btn-col" title="Add column" data-action="addcol" data-row="${rIdx}"${colCount >= MAX_COLS ? " disabled" : ""}>+</button>
      </div>
      <div class="row-actions">
        <button class="row-btn" title="Move up"   data-action="up"  data-row="${rIdx}">↑</button>
        <button class="row-btn" title="Move down" data-action="down" data-row="${rIdx}">↓</button>
        <button class="row-btn row-btn-toggle" title="Toggle expanded" data-action="toggle" data-row="${rIdx}">⤵</button>
        <button class="row-btn row-btn-del" title="Delete row" data-action="del" data-row="${rIdx}">✕</button>
      </div>
    `;
    header.querySelector(".row-badge-exp").addEventListener("click", () => toggleExpandedRow(rIdx));
    header.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", e => {
        const a = e.currentTarget.dataset.action;
        const r = parseInt(e.currentTarget.dataset.row);
        if (a === "up")      moveRow(r, -1);
        if (a === "down")    moveRow(r, 1);
        if (a === "toggle")  toggleExpandedRow(r);
        if (a === "del")     deleteRow(r);
        if (a === "addcol")  addColToRow(r);
        if (a === "remcol")  removeColFromRow(r);
      });
    });

    // Cell grid — dynamic column count
    const cellGrid = document.createElement("div");
    cellGrid.className = "cell-grid";
    cellGrid.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;

    for (let cIdx = 0; cIdx < colCount; cIdx++) {
      const cell = row.cols[cIdx];
      const cellEl = document.createElement("div");
      cellEl.className = "cell" + (cell ? " cell-filled" : " cell-empty");
      cellEl.dataset.row = rIdx;
      cellEl.dataset.col = cIdx;

      if (cell) {
        const field = FIELD_REGISTRY.find(f => f.id === cell.fieldId);
        const icon  = cell.iconCaption ? (ICON_MAP[cell.iconCaption] || "") : "";
        const visTag = cell.levelVisibility === "all"
          ? ""
          : `<span class="tag tag-level">L${cell.levelVisibility.join(",")}</span>`;
        cellEl.innerHTML = `
          <div class="cell-content">
            <div class="cell-field-name">${icon} ${field ? field.label : "?"}</div>
            <div class="cell-caption">"${cell.caption}"</div>
            <div class="cell-meta">
              ${cell.textAlign !== "left" ? `<span class="tag">${cell.textAlign}</span>` : ""}
              ${cell.style.fontWeight === "bold" ? '<span class="tag">bold</span>' : ""}
              ${cell.style.fontSize ? `<span class="tag">${cell.style.fontSize}px</span>` : ""}
              ${visTag}
            </div>
          </div>
          <button class="cell-edit-btn" data-row="${rIdx}" data-col="${cIdx}" title="Edit">✎</button>
          <button class="cell-del-btn"  data-row="${rIdx}" data-col="${cIdx}" title="Remove">✕</button>
        `;
        cellEl.addEventListener("click", () => {
          openPropPanel(rIdx, cIdx);
        });
        cellEl.querySelector(".cell-edit-btn").addEventListener("click", e => {
          e.stopPropagation();
          openPropPanel(parseInt(e.currentTarget.dataset.row), parseInt(e.currentTarget.dataset.col));
        });
        cellEl.querySelector(".cell-del-btn").addEventListener("click", e => {
          e.stopPropagation();
          removeFieldFromCell(parseInt(e.currentTarget.dataset.row), parseInt(e.currentTarget.dataset.col));
        });
      } else {
        cellEl.innerHTML = `
          <div class="cell-drop-hint">
            <span>Drop field here</span>
            <span class="col-label">Col ${cIdx + 1}</span>
          </div>
        `;
      }

      // Drag-over / Drop
      cellEl.addEventListener("dragover", e => {
        e.preventDefault();
        cellEl.classList.add("drag-over");
      });
      cellEl.addEventListener("dragleave", () => cellEl.classList.remove("drag-over"));
      cellEl.addEventListener("drop", e => {
        e.preventDefault();
        cellEl.classList.remove("drag-over");
        if (_dragFieldId) {
          if (row.cols[cIdx] && !confirm("Replace existing field in this cell?")) {
            _dragFieldId = null;
            return;
          }
          addFieldToCell(_dragFieldId, rIdx, cIdx);
          _dragFieldId = null;
        }
      });

      cellGrid.appendChild(cellEl);
    }

    wrap.appendChild(header);
    wrap.appendChild(cellGrid);
    canvas.appendChild(wrap);
  });
}
