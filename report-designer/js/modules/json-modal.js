/**
 * MCloud Report Template Designer — JSON Generation & Modal Module
 * ───────────────────────────────────────────────────────────────
 * Generates the Flutter-consumable JSON and manages the preview modal.
 * Additive-only extensions: groupFields, levelVisibility, drillConfig.
 * Depends on: state.js
 */

// ═══════════════════════════════════════════════════════════
// JSON GENERATION
// ═══════════════════════════════════════════════════════════
function generateJSON() {
  const fieldConfigs = [];

  state.rows.forEach((row, rIdx) => {
    const columnConfig = [];

    row.cols.forEach((cell, cIdx) => {
      if (!cell) return;
      const cfg = {
        dataField : cell.dataField,
        col       : cIdx + 1,
        caption   : cell.caption,
      };
      if (cell.iconCaption)              cfg.iconCaption = cell.iconCaption;
      if (cell.maxLine && cell.maxLine !== 1) cfg.maxLine = cell.maxLine;
      if (cell.textAlign && cell.textAlign !== "left") cfg.textAlign = cell.textAlign;

      // Style — only include if non-default
      const styleObj = {};
      if (cell.style.color && cell.style.color !== "0xFF000000") styleObj.color = cell.style.color;
      if (cell.style.fontSize)  styleObj.fontSize   = cell.style.fontSize;
      if (cell.style.fontWeight && cell.style.fontWeight !== "normal") styleObj.fontWeight = cell.style.fontWeight;
      if (cell.style.fontFamily) styleObj.fontFamily = cell.style.fontFamily;
      if (Object.keys(styleObj).length) cfg.style = styleObj;

      // Level visibility — only include if not "all" (additive)
      if (cell.levelVisibility !== "all" && Array.isArray(cell.levelVisibility)) {
        cfg.levelVisibility = cell.levelVisibility;
      }

      columnConfig.push(cfg);
    });

    if (columnConfig.length === 0) return;

    fieldConfigs.push({
      isExpandedRow: row.isExpandedRow,
      columnCount: row.cols.length,
      columnConfig,
    });
  });

  const layout = {
    layoutType : "grid",
    gridSize   : { rows: state.rows.filter(r => !r.isExpandedRow).length },
    indicator  : {
      isShow    : state.indicator.isShow,
      dataField : state.indicator.dataField || "",
    },
    mOnTap       : state.mOnTap || "",
    mOnDoubleTap : state.mOnDoubleTap || "",
    fieldConfigs,
  };

  // ── ADDITIVE: Group fields / drill config ──
  if (state.groupFields.length > 0) {
    layout.groupFields = state.groupFields.map((gf, idx) => ({
      level     : idx + 1,
      fieldId   : gf.fieldId,
      dataField : gf.dataField,
      label     : gf.label,
    }));

    layout.drillConfig = {
      enabled    : true,
      levelCount : getLevelCount(),
      terminalLevel : getTerminalLevel(),
    };
  }

  return layout;
}

function openJSONModal() {
  const json = generateJSON();
  document.getElementById("jsonOutput").textContent = JSON.stringify(json, null, 2);
  document.getElementById("jsonOverlay").style.display = "flex";
}

function bindJSONModal() {
  document.getElementById("jsonClose").addEventListener("click", () => {
    document.getElementById("jsonOverlay").style.display = "none";
  });
  document.getElementById("jsonOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("jsonOverlay"))
      document.getElementById("jsonOverlay").style.display = "none";
  });
  document.getElementById("btnCopyJSON").addEventListener("click", () => {
    const text = document.getElementById("jsonOutput").textContent;
    navigator.clipboard.writeText(text).then(() => {
      const conf = document.getElementById("copyConfirm");
      conf.style.display = "inline";
      setTimeout(() => conf.style.display = "none", 2000);
    });
  });
}
