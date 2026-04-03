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

  // Layout mode: no group fields / drill navigation — always show flat detail cards
  // Full mode: may have group levels and drill navigation
  if (!isLayoutMode() && state.groupFields.length > 0 && currentLevel <= state.groupFields.length) {
    renderGroupLevel(phoneList, currentLevel);
  } else {
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

// ── Phase 2: rhythm → row padding tokens ────────────────────
const RHYTHM_PAD = { compact: "2px 8px", normal: "4px 8px", spacious: "8px 10px" };

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
    // Expanded rows only shown when this card is tapped/expanded
    if (row.isExpandedRow && !showExpanded) return;

    const rowVariant = row.rowVariant || "default";
    const rhythm     = row.rhythm     || "normal";

    const rowEl = document.createElement("div");
    // Phase 2: add variant CSS class alongside existing classes
    rowEl.className = [
      "preview-row",
      row.isExpandedRow ? "preview-row-expanded" : "",
      `pv-row--${rowVariant}`,
    ].filter(Boolean).join(" ");

    // Phase 2: rhythm base padding (overridden below if rowStyle sets explicit padding)
    rowEl.style.padding = RHYTHM_PAD[rhythm] || RHYTHM_PAD.normal;

    // ── Phase 1: apply row-level visual style ────────────────
    const rs = row.rowStyle || {};
    if (rs.background)        rowEl.style.background = rs.background;
    if (rs.paddingVertical) {
      rowEl.style.paddingTop    = rs.paddingVertical + "px";
      rowEl.style.paddingBottom = rs.paddingVertical + "px";
    }
    if (rs.paddingHorizontal) {
      rowEl.style.paddingLeft  = rs.paddingHorizontal + "px";
      rowEl.style.paddingRight = rs.paddingHorizontal + "px";
    }
    if (rs.borderWidth > 0 && rs.borderColor) {
      rowEl.style.border = `${rs.borderWidth}px solid ${rs.borderColor}`;
      if (rs.cornerRadius) rowEl.style.borderRadius = rs.cornerRadius + "px";
    }
    if (rs.showDivider) {
      const dvColor = rs.dividerColor || "#e0e0e0";
      const dvStyle = rs.dividerStyle || "solid";
      rowEl.style.borderBottom = `1px ${dvStyle} ${dvColor}`;
    }
    // ─────────────────────────────────────────────────────────

    // Phase 2: footerActions variant — render icon action placeholders
    if (rowVariant === "footerActions") {
      const activeCells = row.cols.filter(Boolean);
      rowEl.appendChild(buildFooterActionRow(activeCells));
      card.appendChild(rowEl);
      return;
    }

    // Phase 3: repeater row — renders N sub-rows from mock list data
    if ((row.rowType || "normal") === "repeater") {
      const rc       = row.repeaterConfig || {};
      const listKey  = rc.mockKey || "transactions";
      const items    = (MOCK_REPEATER_DATA[listKey] || []);
      const maxItems = rc.maxItems != null ? rc.maxItems : 3;
      const showItems = items.slice(0, maxItems);

      const activeCols = row.cols.filter(c => c !== null);
      const visibleCols = activeCols.filter(cell => {
        if (cell.levelVisibility === "all") return true;
        if (Array.isArray(cell.levelVisibility)) return cell.levelVisibility.includes(level);
        return true;
      });

      if (visibleCols.length === 0) {
        card.appendChild(rowEl); // append placeholder row
        return;
      }

      showItems.forEach((item, itemIdx) => {
        // Merge: card record provides party-level fields; item provides row-level fields
        const mergedRecord = Object.assign({}, record, item);
        const subRowEl = buildRepeaterSubRowEl(row, visibleCols, mergedRecord, rhythm, rs, rowVariant);
        if (rc.showDivider && itemIdx > 0) {
          subRowEl.style.borderTop = "1px solid #e8edf4";
        }
        card.appendChild(subRowEl);
      });

      // "+N more" footer
      if (rc.showMoreFooter !== false && items.length > maxItems) {
        const moreEl = document.createElement("div");
        moreEl.className = "pv-repeater-more";
        moreEl.textContent = `+${items.length - maxItems} more`;
        card.appendChild(moreEl);
      }

      return; // skip normal single-row append
    }

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
      rowEl.appendChild(buildPreviewCellEl(cell, record));
    });

    card.appendChild(rowEl);
  });

  // Tap on detail card toggles expanded rows
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    _expandedCardIdx = (_expandedCardIdx === cardIdx) ? -1 : cardIdx;
    renderPreview();
  });

  return card;
}

// ── Phase 2: per-cell rendering routed by cellVariant ────────
function buildPreviewCellEl(cell, record) {
  const variant = cell.cellVariant || "text";
  const span    = cell.colSpan || 1;
  const icon    = cell.iconCaption ? (ICON_MAP[cell.iconCaption] || "") : "";

  // ── Layout mode: no dataField — show placeholder label as the preview value ──
  // In layout mode cells only have placeholderId/placeholderLabel, no dataField.
  // Display the placeholder label (or caption) in italic to distinguish from real data.
  let val;
  if (isLayoutMode() || !cell.dataField) {
    val = cell.placeholderLabel || cell.caption || "—";
    // Wrap in an italic indicator so designers know this is placeholder, not real data
    // This is only visual — it does not affect the exported JSON.
    val = `[${val}]`;
  } else {
    let rawVal = record[cell.dataField];
    if (typeof rawVal === "number") {
      rawVal = "₹ " + Math.abs(rawVal).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    }
    val = rawVal !== undefined ? String(rawVal) : cell.caption;
  }

  let inlineStyle = "";
  if (cell.style.fontWeight === "bold") inlineStyle += "font-weight:700;";
  if (cell.style.fontSize)  inlineStyle += `font-size:${cell.style.fontSize}px;`;
  if (cell.style.color && cell.style.color !== "0xFF000000") {
    inlineStyle += `color:${argbToHex(cell.style.color)};`;
  }
  if (cell.maxLine > 1) {
    inlineStyle += `-webkit-line-clamp:${cell.maxLine};display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;`;
  }

  const cellEl = document.createElement("div");
  cellEl.className = `preview-cell pv-cell--${variant}`;
  cellEl.style.textAlign = cell.textAlign || "left";
  if (span > 1) cellEl.style.flex = span;

  switch (variant) {
    case "metric":
      // Large numeric value, caption below
      cellEl.innerHTML = `
        <div class="pv-metric">
          <span class="pv-metric-val" style="${inlineStyle}">${val}</span>
          <span class="pv-metric-cap">${cell.caption}</span>
        </div>`;
      break;

    case "metaPair":
      // Caption label above, value below
      cellEl.innerHTML = `
        <div class="pv-meta-pair">
          <span class="pv-meta-cap">${cell.caption}</span>
          <span class="pv-meta-val" style="${inlineStyle}">${val}</span>
        </div>`;
      break;

    case "iconText":
      // Icon prefix then value
      cellEl.innerHTML = `
        ${icon ? `<span class="preview-icon">${icon}</span>` : ""}
        <span class="pv-icon-val" style="${inlineStyle}">${val}</span>`;
      break;

    case "emphasis":
      // Bold, slightly larger, accent-colored
      cellEl.innerHTML = `
        <span class="pv-emphasis" style="${inlineStyle}">${val}</span>`;
      break;

    case "muted":
      // De-emphasised secondary text
      cellEl.innerHTML = `
        <span class="pv-muted" style="${inlineStyle}">${val}</span>`;
      break;

    default: // "text"
      cellEl.innerHTML = `
        ${icon ? `<span class="preview-icon">${icon}</span>` : ""}
        <span class="preview-val" style="${inlineStyle}">${val}</span>`;
      break;
  }

  return cellEl;
}

// ── Phase 2: footer action row builder ───────────────────────
function buildFooterActionRow(cells) {
  const wrap = document.createElement("div");
  wrap.className = "pv-footer-actions";

  // If cells have iconCaptions, show those; otherwise show defaults
  const icons = cells.length > 0
    ? cells.map(c => ({ icon: ICON_MAP[c.iconCaption] || "●", label: c.caption }))
    : [
        { icon: ICON_MAP.print,    label: "Print"    },
        { icon: ICON_MAP.whatsapp, label: "WhatsApp" },
        { icon: ICON_MAP.share,    label: "Share"    },
        { icon: ICON_MAP.copy,     label: "Copy"     },
      ];

  icons.forEach(({ icon, label }) => {
    const btn = document.createElement("div");
    btn.className = "pv-action-btn";
    btn.innerHTML = `<span class="pv-action-icon">${icon}</span><span class="pv-action-label">${label}</span>`;
    wrap.appendChild(btn);
  });

  return wrap;
}

// ── Phase 3: repeater sub-row builder ────────────────────────
/**
 * Builds a single item sub-row for a repeater row.
 * Reuses the same rhythm/rowStyle/rowVariant as the parent row definition,
 * but renders with item-specific merged record data.
 */
function buildRepeaterSubRowEl(row, visibleCols, mergedRecord, rhythm, rs, rowVariant) {
  const subRowEl = document.createElement("div");
  subRowEl.className = [
    "preview-row",
    "pv-repeater-item",
    `pv-row--${rowVariant}`,
  ].join(" ");

  // Apply rhythm padding
  subRowEl.style.padding = RHYTHM_PAD[rhythm] || RHYTHM_PAD.normal;

  // Apply rowStyle background/padding overrides
  if (rs.background)        subRowEl.style.background    = rs.background;
  if (rs.paddingVertical) {
    subRowEl.style.paddingTop    = rs.paddingVertical + "px";
    subRowEl.style.paddingBottom = rs.paddingVertical + "px";
  }
  if (rs.paddingHorizontal) {
    subRowEl.style.paddingLeft  = rs.paddingHorizontal + "px";
    subRowEl.style.paddingRight = rs.paddingHorizontal + "px";
  }

  visibleCols.forEach(cell => {
    subRowEl.appendChild(buildPreviewCellEl(cell, mergedRecord));
  });

  return subRowEl;
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
