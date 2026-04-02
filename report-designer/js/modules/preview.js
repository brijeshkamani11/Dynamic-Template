/**
 * MCloud Mobile Template Card Designer — Preview Module
 * ─────────────────────────────────────────────────────
 * Renders the mobile phone preview with drill-down navigation.
 * Supports: group-level cards, terminal detail cards, breadcrumb,
 *           level-filtered columns, expanded content on tap only.
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

  renderBreadcrumb();

  // If we're at a group level (not terminal), show group cards
  if (state.groupFields.length > 0 && currentLevel <= state.groupFields.length) {
    renderGroupLevel(phoneList, currentLevel);
  } else {
    // Terminal level (or flat/no groups) — show detail cards
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
    _expandedCardIdx = -1;
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
        _expandedCardIdx = -1;
        renderPreview();
      });
    }
    container.appendChild(crumb);
  });
}

// ═══════════════════════════════════════════════════════════
// BACK ARROW — functional drill-up
// ═══════════════════════════════════════════════════════════
function bindPhoneBackArrow() {
  const backEl = document.querySelector(".phone-back");
  if (!backEl) return;
  backEl.addEventListener("click", () => {
    if (_drillPath.length > 0) {
      _drillPath.pop();
      _expandedCardIdx = -1;
      renderPreview();
    }
  });
}

// ═══════════════════════════════════════════════════════════
// GROUP LEVEL — renders display-column cards for each group value
// Group field itself is NOT shown unless user added it as a display column.
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

  if (state.rows.length === 0) {
    phoneList.innerHTML += '<div class="phone-empty">Add display columns to see cards</div>';
    return;
  }

  distinctValues.forEach((val, cardIdx) => {
    // Build a mock record filtered to this group value
    const records = getMockRecordsForDrill([
      ..._drillPath,
      { dataField: groupField.dataField, groupValue: val }
    ]);
    const record = records.length > 0 ? records[0] : SAMPLE_DATA;

    // Render card using display columns filtered by this level
    const card = buildDetailCard(record, level, false, -1);
    card.classList.add("phone-card-group");

    // Override click: drill down instead of expand
    // Remove the expand click that buildDetailCard added
    const newCard = card.cloneNode(true);
    newCard.style.cursor = "pointer";
    newCard.addEventListener("click", () => {
      _drillPath.push({
        level: level,
        dataField: groupField.dataField,
        groupValue: val,
        groupLabel: groupField.label,
      });
      _expandedCardIdx = -1;
      renderPreview();
    });

    phoneList.appendChild(newCard);
  });
}

// ═══════════════════════════════════════════════════════════
// TERMINAL LEVEL — shows detail cards with tap-to-expand
// ═══════════════════════════════════════════════════════════
function renderTerminalLevel(phoneList) {
  const terminalLevel = getTerminalLevel();
  const records = getMockRecordsForDrill(_drillPath);

  const cardCount = records.length > 0 ? Math.min(records.length, 5) : 3;

  if (state.rows.length === 0) {
    phoneList.innerHTML = '<div class="phone-empty">Add rows & columns to preview cards</div>';
    return;
  }

  for (let i = 0; i < cardCount; i++) {
    const record = records.length > 0 ? records[i] : SAMPLE_DATA;
    const isExpanded = (_expandedCardIdx === i);
    const card = buildDetailCard(record, terminalLevel, isExpanded, i);
    phoneList.appendChild(card);
  }
}

function buildDetailCard(record, level, showExpanded, cardIdx) {
  const card = document.createElement("div");
  card.className = "phone-card" + (showExpanded ? " phone-card-expanded" : "");

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
    // C) Expanded rows only shown when this card is tapped/expanded
    if (row.isExpandedRow && !showExpanded) return;

    const rowEl = document.createElement("div");
    rowEl.className = "preview-row" + (row.isExpandedRow ? " preview-row-expanded" : "");

    // ── Phase 1: apply row-level visual style ────────────────
    const rs = row.rowStyle || {};
    if (rs.background)        rowEl.style.background    = rs.background;
    if (rs.paddingVertical)   { rowEl.style.paddingTop    = rs.paddingVertical + "px";
                                rowEl.style.paddingBottom = rs.paddingVertical + "px"; }
    if (rs.paddingHorizontal) { rowEl.style.paddingLeft   = rs.paddingHorizontal + "px";
                                rowEl.style.paddingRight  = rs.paddingHorizontal + "px"; }
    if (rs.borderWidth > 0 && rs.borderColor) {
      rowEl.style.border       = `${rs.borderWidth}px solid ${rs.borderColor}`;
      if (rs.cornerRadius)     rowEl.style.borderRadius = rs.cornerRadius + "px";
    }
    if (rs.showDivider) {
      const dvColor = rs.dividerColor || "#e0e0e0";
      const dvStyle = rs.dividerStyle || "solid";
      rowEl.style.borderBottom = `1px ${dvStyle} ${dvColor}`;
    }
    // ─────────────────────────────────────────────────────────

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
      // Phase 1: colSpan → flex-grow proportional to span
      const span = cell.colSpan || 1;
      if (span > 1) cellEl.style.flex = span;

      const icon = cell.iconCaption ? (ICON_MAP[cell.iconCaption] || "") : "";
      let rawVal = record[cell.dataField];

      if (typeof rawVal === "number") {
        rawVal = "₹ " + Math.abs(rawVal).toLocaleString("en-IN", { minimumFractionDigits: 2 });
      }

      const val = rawVal !== undefined ? rawVal : cell.caption;

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

  // C) Tap on detail card toggles expanded rows
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    _expandedCardIdx = (_expandedCardIdx === cardIdx) ? -1 : cardIdx;
    renderPreview();
  });

  return card;
}

// ═══════════════════════════════════════════════════════════
// HELPERS — level-filtered columns
// ═══════════════════════════════════════════════════════════
function getVisibleCellsForLevel(level) {
  const cells = [];
  state.rows.forEach(row => {
    if (row.isExpandedRow) return;
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
// PREVIEW TABS — removed (C). Stub for backward compat boot.
// ═══════════════════════════════════════════════════════════
function bindPreviewTabs() {
  // Old Normal/Expanded tabs removed. Expanded content
  // is now controlled by tap on terminal-level cards.
  // Bind phone back arrow instead.
  bindPhoneBackArrow();
}
