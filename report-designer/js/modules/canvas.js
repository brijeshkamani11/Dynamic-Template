/**
 * MCloud Report Template Designer — Canvas Module
 * ────────────────────────────────────────────────
 * Row management + canvas DOM rendering.
 * Depends on: state.js, field-registry.js, utils.js, property-panel.js (openPropPanel)
 */

// ═══════════════════════════════════════════════════════════
// ROW MANAGEMENT
// ═══════════════════════════════════════════════════════════
function addRow() {
  state.rows.push({
    id           : "row_" + Date.now(),
    isExpandedRow: false,
    cols         : [null, null, null],  // always 3 col slots, can be null
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

// ═══════════════════════════════════════════════════════════
// FIELD CELL MANAGEMENT
// ═══════════════════════════════════════════════════════════
function addFieldToCell(fieldId, rowIdx, colIdx) {
  const field = FIELD_REGISTRY.find(f => f.id === fieldId);
  if (!field) return;
  state.rows[rowIdx].cols[colIdx] = {
    uid        : uid(),
    fieldId    : field.id,
    dataField  : field.dataField,
    caption    : field.defaultCaption,
    iconCaption: "",
    textAlign  : "left",
    maxLine    : 1,
    style      : { color: "", fontSize: "", fontWeight: "normal", fontFamily: "" },
  };
  renderAll();
}

function addFieldToFirstEmpty(fieldId) {
  for (let r = 0; r < state.rows.length; r++) {
    for (let c = 0; c < MAX_COLS; c++) {
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
  document.getElementById("toggleExpandedView").addEventListener("change", e => {
    _showExpandedInCanvas = e.target.checked;
    renderCanvas();
  });
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

  // Count visible rows (expanded rows hidden when toggle is off)
  const visibleRows = state.rows.filter(r => !r.isExpandedRow || _showExpandedInCanvas);

  if (state.rows.length === 0) {
    emptyMsg.style.display = "flex";
    return;
  }
  // Show hint when all rows are expanded-only and hidden
  if (visibleRows.length === 0) {
    emptyMsg.style.display = "flex";
    emptyMsg.querySelector(".empty-title").textContent = "All rows are expanded-only";
    emptyMsg.querySelector(".empty-sub").innerHTML = 'Enable <strong>Show Expanded Rows</strong> above to see them';
  } else {
    emptyMsg.style.display = "none";
    // Reset to default text
    emptyMsg.querySelector(".empty-title").textContent = "Canvas is empty";
    emptyMsg.querySelector(".empty-sub").innerHTML = 'Click <strong>+ Add Row</strong> to start building your card layout';
  }

  state.rows.forEach((row, rIdx) => {
    if (row.isExpandedRow && !_showExpandedInCanvas) return;

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
        if (a === "up")     moveRow(r, -1);
        if (a === "down")   moveRow(r, 1);
        if (a === "toggle") toggleExpandedRow(r);
        if (a === "del")    deleteRow(r);
      });
    });

    // Cell grid
    const cellGrid = document.createElement("div");
    cellGrid.className = "cell-grid";

    for (let cIdx = 0; cIdx < MAX_COLS; cIdx++) {
      const cell = row.cols[cIdx];
      const cellEl = document.createElement("div");
      cellEl.className = "cell" + (cell ? " cell-filled" : " cell-empty");
      cellEl.dataset.row = rIdx;
      cellEl.dataset.col = cIdx;

      if (cell) {
        const field = FIELD_REGISTRY.find(f => f.id === cell.fieldId);
        const icon  = cell.iconCaption ? (ICON_MAP[cell.iconCaption] || "") : "";
        cellEl.innerHTML = `
          <div class="cell-content">
            <div class="cell-field-name">${icon} ${field ? field.label : "?"}</div>
            <div class="cell-caption">"${cell.caption}"</div>
            <div class="cell-meta">
              ${cell.textAlign !== "left" ? `<span class="tag">${cell.textAlign}</span>` : ""}
              ${cell.style.fontWeight === "bold" ? '<span class="tag">bold</span>' : ""}
              ${cell.style.fontSize ? `<span class="tag">${cell.style.fontSize}px</span>` : ""}
            </div>
          </div>
          <button class="cell-edit-btn" data-row="${rIdx}" data-col="${cIdx}" title="Edit">✎</button>
          <button class="cell-del-btn"  data-row="${rIdx}" data-col="${cIdx}" title="Remove">✕</button>
        `;
        // Click anywhere on the filled cell to open properties
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

      // ── Drag-over / Drop on cell ──
      cellEl.addEventListener("dragover", e => {
        e.preventDefault();
        cellEl.classList.add("drag-over");
      });
      cellEl.addEventListener("dragleave", () => cellEl.classList.remove("drag-over"));
      cellEl.addEventListener("drop", e => {
        e.preventDefault();
        cellEl.classList.remove("drag-over");
        if (_dragFieldId) {
          // Confirm before overwriting an existing field
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
