/**
 * MCloud Report Template Designer — Preview Module
 * ─────────────────────────────────────────────────
 * Renders the mobile phone preview with drill-down navigation.
 * Supports: group-level cards, terminal detail cards, breadcrumb,
 *           level-filtered columns, expanded content at terminal only.
 * Depends on: state.js, field-registry.js, utils.js (argbToHex)
 */

// ═══════════════════════════════════════════════════════════
// RENDER — MOBILE PREVIEW (entry point)
// ═══════════════════════════════════════════════════════════
function renderPreview() {
  const phoneList = document.getElementById("phoneList");
  phoneList.innerHTML = "";

  if (state.rows.length === 0 && state.groupFields.length === 0) {
    phoneList.innerHTML = '<div class="phone-empty">Add rows to preview</div>';
    renderBreadcrumb();
    return;
  }

  const currentLevel = _drillPath.length + 1;
  const totalLevels  = getLevelCount();

  renderBreadcrumb();

  // If we're at a group level (not terminal), show group cards
  if (state.groupFields.length > 0 && currentLevel <= state.groupFields.length) {
    renderGroupLevel(phoneList, currentLevel);
  } else {
    // Terminal level — show detail cards
    renderTerminalLevel(phoneList);
  }
}

// ═══════════════════════════════════════════════════════════
// BREADCRUMB NAVIGATION
// ═══════════════════════════════════════════════════════════
function renderBreadcrumb() {
  const container = document.getElementById("phoneBreadcrumb");
  if (!container) return;
  container.innerHTML = "";

  if (_drillPath.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";

  // "Home" link
  const homeEl = document.createElement("span");
  homeEl.className = "breadcrumb-item breadcrumb-link";
  homeEl.textContent = "⌂";
  homeEl.title = "Back to top level";
  homeEl.addEventListener("click", () => {
    _drillPath = [];
    renderPreview();
  });
  container.appendChild(homeEl);

  // Each drill step
  _drillPath.forEach((step, idx) => {
    const sep = document.createElement("span");
    sep.className = "breadcrumb-sep";
    sep.textContent = "›";
    container.appendChild(sep);

    const crumb = document.createElement("span");
    crumb.className = "breadcrumb-item" + (idx < _drillPath.length - 1 ? " breadcrumb-link" : " breadcrumb-current");
    crumb.textContent = step.groupValue;
    crumb.title = step.groupLabel + ": " + step.groupValue;

    if (idx < _drillPath.length - 1) {
      crumb.addEventListener("click", () => {
        _drillPath = _drillPath.slice(0, idx + 1);
        renderPreview();
      });
    }
    container.appendChild(crumb);
  });
}

// ═══════════════════════════════════════════════════════════
// GROUP LEVEL — shows group value cards for current level
// ═══════════════════════════════════════════════════════════
function renderGroupLevel(phoneList, level) {
  const groupField = state.groupFields[level - 1];
  const distinctValues = getMockDistinctValues(groupField.dataField, _drillPath);

  if (distinctValues.length === 0) {
    phoneList.innerHTML = '<div class="phone-empty">No data for this group</div>';
    return;
  }

  // Level label
  const levelLabel = document.createElement("div");
  levelLabel.className = "phone-level-label";
  levelLabel.textContent = `L${level}: ${groupField.label}`;
  phoneList.appendChild(levelLabel);

  distinctValues.forEach(val => {
    const card = document.createElement("div");
    card.className = "phone-card phone-card-group";

    // Indicator (optional)
    if (state.indicator.isShow) {
      const ind = document.createElement("div");
      ind.className = "phone-card-indicator ind-green";
      card.appendChild(ind);
      card.classList.add("has-indicator");
    }

    // Group value display
    const body = document.createElement("div");
    body.className = "phone-group-body";

    const valEl = document.createElement("div");
    valEl.className = "phone-group-value";
    valEl.textContent = val;
    body.appendChild(valEl);

    // Show summary row with level-visible columns
    const summaryRow = buildGroupSummaryRow(level);
    if (summaryRow) body.appendChild(summaryRow);

    const chevron = document.createElement("span");
    chevron.className = "phone-group-chevron";
    chevron.textContent = "›";
    body.appendChild(chevron);

    card.appendChild(body);

    // Tap to drill down
    card.addEventListener("click", () => {
      _drillPath.push({
        level: level,
        dataField: groupField.dataField,
        groupValue: val,
        groupLabel: groupField.label,
      });
      renderPreview();
    });

    phoneList.appendChild(card);
  });
}

/**
 * Builds a summary row for group-level cards using columns visible at this level.
 */
function buildGroupSummaryRow(level) {
  const visibleCells = getVisibleCellsForLevel(level);
  if (visibleCells.length === 0) return null;

  const row = document.createElement("div");
  row.className = "preview-row phone-group-summary";

  // Show up to 3 cells in summary
  visibleCells.slice(0, 3).forEach(cell => {
    const cellEl = document.createElement("div");
    cellEl.className = "preview-cell";
    cellEl.style.textAlign = cell.textAlign || "left";

    const val = SAMPLE_DATA[cell.dataField];
    let displayVal = val !== undefined ? val : cell.caption;
    if (typeof displayVal === "number") {
      displayVal = "₹ " + Math.abs(displayVal).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    }

    let style = "font-size:10px;color:#666;";
    cellEl.innerHTML = `<span class="preview-val" style="${style}">${displayVal}</span>`;
    row.appendChild(cellEl);
  });

  return row;
}

// ═══════════════════════════════════════════════════════════
// TERMINAL LEVEL — shows detail cards (like original preview)
// ═══════════════════════════════════════════════════════════
function renderTerminalLevel(phoneList) {
  const terminalLevel = getTerminalLevel();
  const records = getMockRecordsForDrill(_drillPath);
  const showExpanded = _previewTab === "expanded";

  // If no records from drill, show at least 3 sample cards
  const cardCount = records.length > 0 ? Math.min(records.length, 5) : 3;

  if (state.rows.length === 0) {
    phoneList.innerHTML = '<div class="phone-empty">Add rows & columns to preview cards</div>';
    return;
  }

  for (let i = 0; i < cardCount; i++) {
    const record = records.length > 0 ? records[i] : SAMPLE_DATA;
    const card = buildDetailCard(record, terminalLevel, showExpanded);
    phoneList.appendChild(card);
  }
}

function buildDetailCard(record, level, showExpanded) {
  const card = document.createElement("div");
  card.className = "phone-card";

  // Indicator
  if (state.indicator.isShow) {
    const val = record[state.indicator.dataField];
    const isPos = typeof val === "number" ? val >= 0 : true;
    const ind = document.createElement("div");
    ind.className = "phone-card-indicator " + (isPos ? "ind-green" : "ind-red");
    card.appendChild(ind);
    card.classList.add("has-indicator");
  }

  state.rows.forEach(row => {
    // Expanded rows only shown at terminal level when expanded tab is active
    if (row.isExpandedRow && !showExpanded) return;

    const rowEl = document.createElement("div");
    rowEl.className = "preview-row" + (row.isExpandedRow ? " preview-row-expanded" : "");

    const activeCols = row.cols.filter(c => c !== null);
    if (activeCols.length === 0) return;

    // Filter columns by level visibility
    const visibleCols = activeCols.filter(cell => {
      if (cell.levelVisibility === "all") return true;
      if (Array.isArray(cell.levelVisibility)) return cell.levelVisibility.includes(level);
      return true;
    });

    if (visibleCols.length === 0) return;

    visibleCols.forEach(cell => {
      const cellEl = document.createElement("div");
      cellEl.className = "preview-cell";
      cellEl.style.textAlign = cell.textAlign || "left";
      if (visibleCols.length === 1) cellEl.style.flex = "1";

      const icon = cell.iconCaption ? (ICON_MAP[cell.iconCaption] || "") : "";
      let rawVal = record[cell.dataField];

      // Format numbers
      if (typeof rawVal === "number") {
        rawVal = "₹ " + Math.abs(rawVal).toLocaleString("en-IN", { minimumFractionDigits: 2 });
      }

      const val = rawVal !== undefined ? rawVal : cell.caption;

      // Style
      let style = "";
      if (cell.style.fontWeight === "bold") style += "font-weight:700;";
      if (cell.style.fontSize)  style += `font-size:${cell.style.fontSize}px;`;
      if (cell.style.color && cell.style.color !== "0xFF000000") {
        style += `color:${argbToHex(cell.style.color)};`;
      }
      if (cell.maxLine > 1) style += `-webkit-line-clamp:${cell.maxLine};display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;`;

      cellEl.innerHTML = `
        ${icon ? `<span class="preview-icon">${icon}</span>` : ""}
        <span class="preview-val" style="${style}">${val}</span>
      `;
      rowEl.appendChild(cellEl);
    });

    card.appendChild(rowEl);
  });

  return card;
}

// ═══════════════════════════════════════════════════════════
// HELPERS — level-filtered columns
// ═══════════════════════════════════════════════════════════

/**
 * Returns flat array of non-null cells visible at a given level.
 */
function getVisibleCellsForLevel(level) {
  const cells = [];
  state.rows.forEach(row => {
    if (row.isExpandedRow) return; // expanded rows only at terminal
    row.cols.forEach(cell => {
      if (!cell) return;
      if (cell.levelVisibility === "all") { cells.push(cell); return; }
      if (Array.isArray(cell.levelVisibility) && cell.levelVisibility.includes(level)) {
        cells.push(cell);
      }
    });
  });
  return cells;
}

// ═══════════════════════════════════════════════════════════
// PREVIEW TABS
// ═══════════════════════════════════════════════════════════
function bindPreviewTabs() {
  document.querySelectorAll(".preview-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".preview-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _previewTab = tab.dataset.tab;
      renderPreview();
    });
  });
}
