/**
 * MCloud Report Template Designer — Field Palette Module
 * ──────────────────────────────────────────────────────
 * Left-hand field palette with a two-stage workflow (full mode only):
 *
 *   Stage A ("group"):  User selects group fields that define the drill-level hierarchy.
 *                        Selected fields get level badges and reorder/remove controls.
 *   Stage B ("column"): User picks display-column fields to drag/click onto the canvas.
 *                        All FIELD_REGISTRY entries are available (grouped by category).
 *
 * Layout mode bypass: when isLayoutMode(), the palette is replaced with a static notice.
 *   Users build the layout by adding rows and clicking empty cells (no field data needed).
 *
 * Side effects on group add/remove:
 *   - _drillPath and _expandedCardIdx are reset (preview drill state is invalidated)
 *   - computeTapValues() recalculates mOnTap/mOnDoubleTap
 *
 * Depends on: state.js, field-registry.js, canvas.js (addFieldToFirstEmpty),
 *             preview.js (renderPreview)
 */

// ═══════════════════════════════════════════════════════════
// STAGE NAVIGATION
// ═══════════════════════════════════════════════════════════
function setPaletteStage(stage) {
  _paletteStage = stage;
  renderPalette();
}

// ═══════════════════════════════════════════════════════════
// MAIN RENDER — dispatches to current stage
// ═══════════════════════════════════════════════════════════
function renderPalette() {
  const list      = document.getElementById("fieldList");
  const searchEl  = document.getElementById("fieldSearch");
  const headerEl  = document.getElementById("paletteHeader");
  const hintEl    = document.getElementById("paletteHint");
  const stageNav  = document.getElementById("stageNav");

  list.innerHTML = "";

  // ── Layout Only mode: field palette is not used ──────────
  // Show an informational notice instead of the field list.
  // The user builds structure by adding rows and clicking empty cells.
  if (isLayoutMode()) {
    headerEl.textContent  = "Layout Only Mode";
    hintEl.textContent    = "No field mapping in this mode";
    searchEl.style.display = "none";
    stageNav.innerHTML    = "";
    list.innerHTML = `
      <div class="layout-mode-notice">
        <div class="layout-mode-notice-icon">⊞</div>
        <div class="layout-mode-notice-title">Layout Only Mode</div>
        <div class="layout-mode-notice-desc">
          Field palette is hidden. Add rows using <strong>+ Add Row</strong>,
          then click any empty cell to add a placeholder.<br><br>
          Placeholders capture visual design without binding to specific data fields.
        </div>
      </div>`;
    return;
  }

  // ── Full Template mode: restore normal palette UI ─────────
  searchEl.style.display = "";

  // Update header
  if (_paletteStage === "group") {
    headerEl.textContent = "① Row Group Fields";
    hintEl.textContent   = "Select fields to group by (order = level order)";
    searchEl.placeholder = "🔍 Search group fields…";
    stageNav.innerHTML   = `<button class="btn btn-sm btn-primary" id="btnToColumnStage">Columns →</button>`;
    stageNav.querySelector("#btnToColumnStage").addEventListener("click", () => setPaletteStage("column"));
  } else {
    headerEl.textContent = "② Display Columns";
    hintEl.textContent   = "Drag or click + to add to canvas";
    searchEl.placeholder = "🔍 Search column fields…";
    stageNav.innerHTML   = `<button class="btn btn-sm btn-secondary" id="btnToGroupStage">← Groups</button>`;
    stageNav.querySelector("#btnToGroupStage").addEventListener("click", () => setPaletteStage("group"));
  }

  if (_paletteStage === "group") {
    renderGroupStage(list);
  } else {
    renderColumnStage(list);
  }
}

// ═══════════════════════════════════════════════════════════
// STAGE A — GROUP FIELDS
// ═══════════════════════════════════════════════════════════
function renderGroupStage(list) {
  const searchVal = (document.getElementById("fieldSearch").value || "").toLowerCase();

  // 1. Show selected group fields with reorder/remove
  if (state.groupFields.length > 0) {
    const selLabel = document.createElement("div");
    selLabel.className = "field-category";
    selLabel.textContent = "Selected Groups (Level Order)";
    list.appendChild(selLabel);

    // Warning if > GROUP_LEVEL_WARN
    if (state.groupFields.length > GROUP_LEVEL_WARN) {
      const warn = document.createElement("div");
      warn.className = "group-warn";
      warn.textContent = "⚠ Deep drill-down may hurt usability/performance.";
      list.appendChild(warn);
    }

    state.groupFields.forEach((gf, idx) => {
      const el = document.createElement("div");
      el.className = "field-chip group-selected";
      const canUp   = idx > 0;
      const canDown = idx < state.groupFields.length - 1;
      el.innerHTML = `
        <span class="chip-level">L${idx + 1}</span>
        <span class="chip-label">${gf.label}</span>
        <span class="group-actions">
          <button class="group-btn group-btn-reorder" data-action="up" data-idx="${idx}" title="Move up"${canUp ? "" : " disabled"}>↑</button>
          <button class="group-btn group-btn-reorder" data-action="down" data-idx="${idx}" title="Move down"${canDown ? "" : " disabled"}>↓</button>
          <button class="group-btn group-btn-cfg" data-action="config" data-idx="${idx}" title="Group config">⚙</button>
          <button class="group-btn group-btn-del" data-action="remove" data-idx="${idx}" title="Remove">✕</button>
        </span>
      `;
      el.querySelectorAll(".group-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const i = parseInt(btn.dataset.idx);
          if (action === "up" && i > 0) {
            [state.groupFields[i], state.groupFields[i - 1]] = [state.groupFields[i - 1], state.groupFields[i]];
            _drillPath = []; _expandedCardIdx = -1;
          } else if (action === "down" && i < state.groupFields.length - 1) {
            [state.groupFields[i], state.groupFields[i + 1]] = [state.groupFields[i + 1], state.groupFields[i]];
            _drillPath = []; _expandedCardIdx = -1;
          } else if (action === "remove") {
            state.groupFields.splice(i, 1);
            _drillPath = []; _expandedCardIdx = -1;
            computeTapValues();
          } else if (action === "config") {
            openGroupConfigPanel(i);
            return;
          }
          renderPalette();
          renderPreview();
        });
      });
      list.appendChild(el);
    });

    // Separator
    const sep = document.createElement("div");
    sep.className = "field-category";
    sep.style.borderTop = "1px solid var(--border)";
    sep.style.marginTop = "8px";
    sep.textContent = "Available Group Fields";
    list.appendChild(sep);
  }

  // 2. Show available group-enabled fields (not yet selected)
  const selectedIds = new Set(state.groupFields.map(g => g.fieldId));
  const categories = [...new Set(FIELD_REGISTRY.map(f => f.category))];

  categories.forEach(cat => {
    const fields = FIELD_REGISTRY.filter(f =>
      f.groupable &&
      !selectedIds.has(f.id) &&
      f.category === cat &&
      (f.label.toLowerCase().includes(searchVal) || f.defaultCaption.toLowerCase().includes(searchVal))
    );
    if (!fields.length) return;

    const catEl = document.createElement("div");
    catEl.className = "field-category";
    catEl.textContent = cat;
    list.appendChild(catEl);

    fields.forEach(f => {
      const el = document.createElement("div");
      el.className = "field-chip";
      el.innerHTML = `<span class="chip-label">${f.label}</span><span class="chip-add">+</span>`;

      // Shared handler with idempotency guard
      function addGroupField(e) {
        if (e) e.stopPropagation();
        // Guard: prevent duplicate if already added (race / double-fire)
        if (state.groupFields.some(g => g.fieldId === f.id)) return;
        state.groupFields.push({ fieldId: f.id, dataField: f.dataField, label: f.label });
        _drillPath = []; _expandedCardIdx = -1;
        computeTapValues();
        renderPalette();
        renderPreview();
      }

      el.querySelector(".chip-add").addEventListener("click", addGroupField);
      el.addEventListener("click", addGroupField);
      list.appendChild(el);
    });
  });

  // If no groupable fields available
  if (!list.querySelector(".field-chip:not(.group-selected)") && state.groupFields.length === 0) {
    const empty = document.createElement("div");
    empty.className = "phone-empty";
    empty.textContent = "No groupable fields available";
    list.appendChild(empty);
  }
}

// ═══════════════════════════════════════════════════════════
// STAGE B — COLUMN FIELDS (existing field palette, all fields)
// ═══════════════════════════════════════════════════════════
function renderColumnStage(list) {
  const searchVal = (document.getElementById("fieldSearch").value || "").toLowerCase();
  const categories = [...new Set(FIELD_REGISTRY.map(f => f.category))];

  categories.forEach(cat => {
    const fields = FIELD_REGISTRY.filter(f =>
      f.category === cat &&
      (f.label.toLowerCase().includes(searchVal) || f.defaultCaption.toLowerCase().includes(searchVal))
    );
    if (!fields.length) return;

    const catEl = document.createElement("div");
    catEl.className = "field-category";
    catEl.textContent = cat;
    list.appendChild(catEl);

    fields.forEach(f => {
      const el = document.createElement("div");
      el.className = "field-chip";
      el.draggable = true;
      el.dataset.fieldId = f.id;
      el.innerHTML = `<span class="chip-label">${f.label}</span><span class="chip-add">+</span>`;

      el.addEventListener("dragstart", e => {
        _dragFieldId = f.id;
        el.classList.add("dragging");
        e.dataTransfer.effectAllowed = "copy";
      });
      el.addEventListener("dragend", () => {
        _dragFieldId = null;
        el.classList.remove("dragging");
      });
      el.querySelector(".chip-add").addEventListener("click", () => {
        addFieldToFirstEmpty(f.id);
      });
      list.appendChild(el);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// BACKWARD COMPAT — buildFieldPalette alias + indicator
// ═══════════════════════════════════════════════════════════
function buildFieldPalette() {
  renderPalette();
}

function buildIndicatorFieldSelect() {
  const sel = document.getElementById("indicatorField");
  sel.innerHTML = '<option value="">— pick field —</option>';
  FIELD_REGISTRY.filter(f => f.category === "Account" || f.label.toLowerCase().includes("amount") || f.label.toLowerCase().includes("balance"))
    .forEach(f => {
      sel.innerHTML += `<option value="${f.dataField}">${f.label}</option>`;
    });
}

function bindFieldSearch() {
  document.getElementById("fieldSearch").addEventListener("input", renderPalette);
}

// ═══════════════════════════════════════════════════════════
// GROUP CONFIG — placeholder panel per group field
// ═══════════════════════════════════════════════════════════
function openGroupConfigPanel(groupIdx) {
  const gf = state.groupFields[groupIdx];
  if (!gf) return;
  const overlay = document.getElementById("groupConfigOverlay");
  const panel   = document.getElementById("groupConfigPanel");
  const title   = document.getElementById("groupConfigTitle");
  const body    = document.getElementById("groupConfigBody");

  title.textContent = `L${groupIdx + 1}: ${gf.label} — Config`;
  body.innerHTML = `<p style="color:var(--text-muted);font-size:12px;padding:16px 0;">Group-level configuration controls will be added here in a future update.</p>`;

  panel.classList.add("open");
  overlay.classList.add("show");
}

function closeGroupConfigPanel() {
  document.getElementById("groupConfigPanel").classList.remove("open");
  document.getElementById("groupConfigOverlay").classList.remove("show");
}

function bindGroupConfigPanel() {
  document.getElementById("groupConfigClose").addEventListener("click", closeGroupConfigPanel);
  document.getElementById("groupConfigOverlay").addEventListener("click", closeGroupConfigPanel);
}
