/**
 * MCloud Report Template Designer — Preview Module
 * ─────────────────────────────────────────────────
 * Renders the mobile phone preview cards.
 * Depends on: state.js, field-registry.js, utils.js (argbToHex)
 */

// ═══════════════════════════════════════════════════════════
// RENDER — MOBILE PREVIEW
// ═══════════════════════════════════════════════════════════
function renderPreview() {
  const phoneList = document.getElementById("phoneList");
  phoneList.innerHTML = "";

  if (state.rows.length === 0) {
    phoneList.innerHTML = '<div class="phone-empty">Add rows to preview</div>';
    return;
  }

  // Render 3 sample cards to simulate a list
  for (let sample = 0; sample < 3; sample++) {
    const card = buildPreviewCard(sample);
    phoneList.appendChild(card);
  }
}

function buildPreviewCard(sampleIdx) {
  const card = document.createElement("div");
  card.className = "phone-card";

  // Indicator
  if (state.indicator.isShow) {
    const val = SAMPLE_DATA[state.indicator.dataField];
    const isPos = typeof val === "number" ? val >= 0 : true;
    const ind = document.createElement("div");
    ind.className = "phone-card-indicator " + (isPos ? "ind-green" : "ind-red");
    card.appendChild(ind);
    card.classList.add("has-indicator");
  }

  const showExpanded = _previewTab === "expanded";

  state.rows.forEach(row => {
    if (row.isExpandedRow && !showExpanded) return;

    const rowEl = document.createElement("div");
    rowEl.className = "preview-row" + (row.isExpandedRow ? " preview-row-expanded" : "");

    const activeCols = row.cols.filter(c => c !== null);
    if (activeCols.length === 0) return;

    activeCols.forEach(cell => {
      if (!cell) return;
      const cellEl = document.createElement("div");
      cellEl.className = "preview-cell";
      cellEl.style.textAlign = cell.textAlign || "left";
      if (activeCols.length === 1) cellEl.style.flex = "1";

      const icon  = cell.iconCaption ? (ICON_MAP[cell.iconCaption] || "") : "";
      let rawVal  = SAMPLE_DATA[cell.dataField];

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
