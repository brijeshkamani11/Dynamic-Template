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
    id           : "row_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    isExpandedRow: false,
    cols         : [null],  // start with 1 column; user adds more
    rowStyle     : {},      // Phase 1: row visual style (empty = all defaults)
    rowVariant   : "default",  // Phase 2: default | stripHeader | softPanel | summary | footerActions
    rhythm       : "normal",   // Phase 2: compact | normal | spacious
    rowType      : "normal",   // Phase 3: normal | repeater
    // repeaterConfig (Phase 3) — only present when rowType === "repeater"
    // { mockKey: "transactions"|"lineItems"|"bills", maxItems: 3, showDivider: true, showMoreFooter: true }
  });
  renderAll();
}

function deleteRow(rowIdx) {
  state.rows.splice(rowIdx, 1);
  renderAll();
}

// Phase 4: deep-clone a row and insert it directly after the source row
function duplicateRow(rowIdx) {
  const src = state.rows[rowIdx];
  const clone = JSON.parse(JSON.stringify(src));  // deep clone
  clone.id = "row_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  // Give each cloned cell a fresh uid so nothing shares identity
  clone.cols = clone.cols.map(cell => {
    if (!cell) return null;
    return Object.assign({}, cell, { uid: uid() });
  });
  state.rows.splice(rowIdx + 1, 0, clone);
  renderAll();
  showToast("Row duplicated.", "success");
}

// Phase 4: resets only visual style on a row; keeps field data intact
function resetRowStyle(rowIdx) {
  const row = state.rows[rowIdx];
  row.rowStyle   = {};
  row.rowVariant = "default";
  row.rhythm     = "normal";
  row.rowType    = "normal";
  delete row.repeaterConfig;
  renderAll();
  showToast("Row style reset to defaults.", "info");
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
// PLACEHOLDER CELL MANAGEMENT (Layout Only mode)
// ═══════════════════════════════════════════════════════════
/**
 * Adds a placeholder cell to a specific canvas slot.
 * Used in Layout Only mode instead of dragging real fields.
 * After placing, opens the property panel so the user can set the label immediately.
 */
function addPlaceholderToCell(rowIdx, colIdx) {
  const row = state.rows[rowIdx];
  if (!row) return;

  // Confirm before replacing a filled placeholder
  if (row.cols[colIdx] && !confirm("Replace existing placeholder in this cell?")) return;

  row.cols[colIdx] = {
    uid             : uid(),
    placeholderId   : nextPlaceholderId(),
    placeholderLabel: "",           // user sets this in property panel
    caption         : "Placeholder",
    iconCaption     : "",
    textAlign       : "left",
    maxLine         : 1,
    colSpan         : 1,
    cellVariant     : "text",
    levelVisibility : "all",        // not used in layout mode, but kept for schema parity
    style           : { color: "", fontSize: "", fontWeight: "normal", fontFamily: "" },
  };

  renderAll();
  // Open prop panel immediately so user can name the placeholder
  openPropPanel(rowIdx, colIdx);
}

// ═══════════════════════════════════════════════════════════
// FIELD CELL MANAGEMENT (Full Template mode)
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
    colSpan        : 1,       // Phase 1: column span (default 1 = no spanning)
    cellVariant    : "text",  // Phase 2: text | iconText | metric | metaPair | emphasis | muted
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

  // Update canvas hint text based on current designer mode
  const hintEl = document.getElementById("canvasHintText");
  if (hintEl) {
    hintEl.textContent = isLayoutMode()
      ? "Click empty cells to add placeholders"
      : "Drop fields into cells";
  }

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

    // ── Phase 1: apply row-level visual style to canvas wrap ────
    const rs = row.rowStyle || {};
    if (rs.background)                       wrap.style.background   = rs.background;
    if (rs.borderColor && rs.borderWidth > 0) {
      wrap.style.border       = `${rs.borderWidth}px solid ${rs.borderColor}`;
      wrap.style.borderRadius = rs.cornerRadius ? rs.cornerRadius + "px" : "";
    }

    // Row header
    const header = document.createElement("div");
    header.className = "row-header";
    const hasRowStyle  = Object.keys(rs).length > 0;
    const rowVariant   = row.rowVariant || "default";
    const rhythm       = row.rhythm     || "normal";
    const rowType      = row.rowType    || "normal";
    const variantBadge = rowVariant !== "default"
      ? `<span class="row-variant-badge rv-${rowVariant}" title="Row variant">${rowVariant}</span>`
      : "";
    const rhythmBadge  = rhythm !== "normal"
      ? `<span class="row-rhythm-badge rr-${rhythm}" title="Rhythm">${rhythm}</span>`
      : "";
    const repeaterBadge = rowType === "repeater"
      ? `<span class="row-repeater-badge" title="Repeating list row">⟳ Repeater</span>`
      : "";
    header.innerHTML = `
      <div class="row-badge">Row ${rIdx + 1}</div>
      <div class="row-badge-exp ${row.isExpandedRow ? "active" : ""}" title="Toggle expanded row">
        ${row.isExpandedRow ? "⤵ Expanded" : "⊞ Normal"}
      </div>
      ${variantBadge}${rhythmBadge}${repeaterBadge}
      <div class="row-col-controls">
        <button class="row-btn row-btn-col" title="Remove column" data-action="remcol" data-row="${rIdx}"${colCount <= 1 ? " disabled" : ""}>−</button>
        <span class="row-col-count">${colCount} col${colCount > 1 ? "s" : ""}</span>
        <button class="row-btn row-btn-col" title="Add column" data-action="addcol" data-row="${rIdx}"${colCount >= MAX_COLS ? " disabled" : ""}>+</button>
      </div>
      <div class="row-actions">
        <button class="row-btn row-btn-style${hasRowStyle ? " row-btn-style-active" : ""}" title="Row style &amp; variant" data-action="style" data-row="${rIdx}">⬡</button>
        <button class="row-btn row-btn-dup"   title="Duplicate row" data-action="dup"   data-row="${rIdx}">⧉</button>
        ${hasRowStyle || rowVariant !== "default" || rhythm !== "normal" || rowType !== "normal"
          ? `<button class="row-btn row-btn-reset" title="Reset style" data-action="reset" data-row="${rIdx}">↺</button>`
          : ""}
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
        if (a === "style")   openRowStylePanel(r);
        if (a === "dup")     duplicateRow(r);
        if (a === "reset")   resetRowStyle(r);
      });
    });

    // Cell grid — dynamic column count
    const cellGrid = document.createElement("div");
    cellGrid.className = "cell-grid";
    cellGrid.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;

    // ── Phase 1: apply row padding to cell-grid area ──
    if (rs.paddingVertical || rs.paddingHorizontal) {
      cellGrid.style.padding = `${rs.paddingVertical || 0}px ${rs.paddingHorizontal || 0}px`;
    }

    // ── Phase 1: compute colSpan coverage (auto-correct overlaps) ──
    const coveredCols  = new Set();
    const adjustedSpans = new Array(colCount).fill(1);
    let   spanWarnShown = false;
    for (let cIdx = 0; cIdx < colCount; cIdx++) {
      if (coveredCols.has(cIdx)) continue;
      const cell = row.cols[cIdx];
      const raw  = (cell && cell.colSpan > 1) ? cell.colSpan : 1;
      let   span = Math.min(raw, colCount - cIdx);
      for (let s = 1; s < span; s++) {
        if (cIdx + s < colCount && row.cols[cIdx + s] !== null) {
          span = s;
          if (cell) cell.colSpan = s;
          if (!spanWarnShown) {
            showToast("Column span auto-corrected to avoid overlap.", "warn");
            spanWarnShown = true;
          }
          break;
        }
      }
      adjustedSpans[cIdx] = span;
      for (let s = 1; s < span; s++) coveredCols.add(cIdx + s);
    }

    for (let cIdx = 0; cIdx < colCount; cIdx++) {
      if (coveredCols.has(cIdx)) continue;   // hidden by a spanning neighbour
      const cell = row.cols[cIdx];
      const span = adjustedSpans[cIdx];
      const cellEl = document.createElement("div");
      cellEl.className = "cell" + (cell ? " cell-filled" : " cell-empty");
      cellEl.dataset.row = rIdx;
      cellEl.dataset.col = cIdx;
      if (span > 1) cellEl.style.gridColumn = `span ${span}`;

      if (cell) {
        const layoutMode = isLayoutMode();

        // In full mode, look up the field registry. In layout mode, show placeholder label.
        const field       = layoutMode ? null : FIELD_REGISTRY.find(f => f.id === cell.fieldId);
        const displayName = layoutMode
          ? (cell.placeholderLabel || cell.caption || "Placeholder")
          : (field ? field.label : "?");

        const icon       = cell.iconCaption ? (ICON_MAP[cell.iconCaption] || "") : "";
        const spanTag    = span > 1 ? `<span class="tag tag-span">⊞×${span}</span>` : "";
        const varTag     = (cell.cellVariant && cell.cellVariant !== "text")
          ? `<span class="tag tag-cell-variant">${cell.cellVariant}</span>` : "";
        // Level visibility tag: only meaningful in full mode
        const visTag     = (!layoutMode && cell.levelVisibility !== "all")
          ? `<span class="tag tag-level">L${cell.levelVisibility.join(",")}</span>` : "";
        // Placeholder ID tag in layout mode
        const phTag      = layoutMode
          ? `<span class="tag" style="color:#a78bfa;border-color:rgba(124,58,237,0.3)">${cell.placeholderId || "ph"}</span>` : "";

        // Use different CSS class for placeholder cells in layout mode
        cellEl.className = "cell " + (layoutMode ? "cell-placeholder" : "cell-filled");
        if (span > 1) cellEl.style.gridColumn = `span ${span}`;

        cellEl.innerHTML = `
          <div class="cell-content">
            <div class="cell-field-name">${icon} ${displayName}</div>
            <div class="cell-caption">"${cell.caption}"</div>
            <div class="cell-meta">
              ${cell.textAlign !== "left" ? `<span class="tag">${cell.textAlign}</span>` : ""}
              ${cell.style.fontWeight === "bold" ? '<span class="tag">bold</span>' : ""}
              ${cell.style.fontSize ? `<span class="tag">${cell.style.fontSize}px</span>` : ""}
              ${visTag}${spanTag}${varTag}${phTag}
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
        // Empty cell: layout mode → click to add placeholder; full mode → drop hint
        if (isLayoutMode()) {
          cellEl.classList.add("layout-drop");
          cellEl.innerHTML = `
            <div class="cell-drop-hint">
              <span>+ Click to add</span>
              <span class="col-label">Col ${cIdx + 1}</span>
            </div>
          `;
          cellEl.addEventListener("click", () => addPlaceholderToCell(rIdx, cIdx));
        } else {
          cellEl.innerHTML = `
            <div class="cell-drop-hint">
              <span>Drop field here</span>
              <span class="col-label">Col ${cIdx + 1}</span>
            </div>
          `;
        }
      }

      // Drag-over / Drop — only active in full mode
      if (isFullMode()) {
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
      }

      cellGrid.appendChild(cellEl);
    }

    wrap.appendChild(header);
    wrap.appendChild(cellGrid);
    canvas.appendChild(wrap);
  });
}
