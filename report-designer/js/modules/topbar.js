/**
 * MCloud Mobile Template Card Designer — Topbar Module
 * ────────────────────────────────────────────────────
 * Topbar event bindings, card settings, save, and keyboard shortcuts.
 * Depends on: state.js, utils.js, json-modal.js, recovery.js
 */

function bindTopBar() {
  document.getElementById("templateName").addEventListener("input", e => {
    state.templateName = e.target.value;
    markDirty();
  });

  document.getElementById("btnClearAll").addEventListener("click", () => {
    if (state.rows.length === 0 && state.groupFields.length === 0) return;
    if (!confirm("Clear all rows, fields, and group settings?")) return;
    state.rows = [];
    state.groupFields = [];
    _drillPath = [];
    _expandedCardIdx = -1;
    _paletteStage = "group";
    computeTapValues();
    renderPalette();
    renderAll();
  });

  document.getElementById("btnSave").addEventListener("click", saveTemplate);
  document.getElementById("btnPreviewJSON").addEventListener("click", openJSONModal);
  document.getElementById("btnImportJSON").addEventListener("click", openImportModal);

  // Designer mode selector
  document.getElementById("designerModeSel").addEventListener("change", e => {
    switchDesignerMode(e.target.value);
  });
}

// ═══════════════════════════════════════════════════════════
// DESIGNER MODE SWITCH
// ═══════════════════════════════════════════════════════════
/**
 * Switches between "full" and "layout" designer modes.
 *
 * full → layout : existing filled cells are converted to placeholder cells
 *                 (caption + visual style preserved, dataField dropped).
 *                 Group fields are cleared (not applicable in layout mode).
 *
 * layout → full : placeholder cells are cleared to null because they cannot
 *                 be automatically mapped to real data fields.
 */
function switchDesignerMode(newMode) {
  if (newMode === state.designerMode) {
    // Already in this mode — ensure selector stays in sync
    syncModeUI();
    return;
  }

  const hasContent = state.rows.some(r => r.cols && r.cols.some(c => c !== null));

  if (newMode === DESIGNER_MODE_LAYOUT) {
    // full → layout
    if (hasContent) {
      if (!confirm(
        "Switch to Layout Only mode?\n\n" +
        "Filled cells will be converted to placeholder cells " +
        "(captions and styles are kept, field bindings are removed). " +
        "Group fields will also be cleared.\n\n" +
        "Continue?"
      )) {
        syncModeUI(); // revert selector
        return;
      }
    }
    // Convert filled cells to placeholder cells
    state.rows.forEach(row => {
      row.cols = row.cols.map(cell => {
        if (!cell) return null;
        // Already a placeholder — keep as-is
        if (cell.placeholderId) return cell;
        // Convert: preserve caption + visual style, drop dataField
        return {
          uid             : cell.uid,
          placeholderId   : nextPlaceholderId(),
          placeholderLabel: cell.caption || "",
          caption         : cell.caption || "Placeholder",
          iconCaption     : cell.iconCaption || "",
          textAlign       : cell.textAlign || "left",
          maxLine         : cell.maxLine || 1,
          colSpan         : cell.colSpan || 1,
          cellVariant     : cell.cellVariant || "text",
          levelVisibility : "all",
          style           : { ...cell.style },
        };
      });
    });
    state.groupFields  = [];
    state.designerMode = DESIGNER_MODE_LAYOUT;
    _paletteStage      = "column";

  } else {
    // layout → full
    if (hasContent) {
      if (!confirm(
        "Switch to Full Template mode?\n\n" +
        "Placeholder cells will be cleared — they cannot be " +
        "automatically mapped to real data fields. " +
        "You will need to drag fields onto the canvas again.\n\n" +
        "Continue?"
      )) {
        syncModeUI(); // revert selector
        return;
      }
    }
    // Clear placeholder cells to null
    state.rows.forEach(row => {
      row.cols = row.cols.map(cell => {
        if (!cell) return null;
        if (cell.placeholderId) return null; // clear placeholder
        return cell; // keep any real cells (edge case)
      });
    });
    state.designerMode = DESIGNER_MODE_FULL;
    _paletteStage      = "group";
  }

  syncModeUI();
  renderPalette();
  renderAll();
  markDirty();
}

/**
 * Syncs all mode-dependent UI elements to the current state.designerMode.
 * Call after any mode change or on app init.
 */
function syncModeUI() {
  const isLayout = isLayoutMode();

  // Mode selector value
  const sel = document.getElementById("designerModeSel");
  if (sel) sel.value = state.designerMode;

  // Topbar class for CSS-based mode highlighting
  const topbar = document.querySelector(".topbar");
  if (topbar) topbar.classList.toggle("mode-layout", isLayout);

  // Save button label
  const saveBtn = document.getElementById("btnSave");
  if (saveBtn) saveBtn.textContent = isLayout ? "⬆ Save Layout" : "⬆ Save Template";

  // Import button label
  const importBtn = document.getElementById("btnImportJSON");
  if (importBtn) importBtn.textContent = isLayout ? "⬇ Import Layout" : "⬇ Import";
}

function bindCardSettings() {
  document.getElementById("indicatorShow").addEventListener("change", e => {
    state.indicator.isShow = e.target.checked;
    document.getElementById("indicatorFieldRow").style.display = e.target.checked ? "flex" : "none";
    renderPreview();
    markDirty();
  });
  document.getElementById("indicatorField").addEventListener("change", e => {
    state.indicator.dataField = e.target.value;
    renderPreview();
    markDirty();
  });
}

// ═══════════════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════════════
function saveTemplate() {
  const name = document.getElementById("templateName").value.trim();
  if (!name) { showToast("Please enter a template name first.", "warn"); return; }
  if (state.rows.length === 0) { showToast("Canvas is empty. Add some rows.", "warn"); return; }

  const payload = {
    templateName : name,
    cardLayout   : generateJSON(),
    savedAt      : new Date().toISOString(),
  };

  console.log("SAVE PAYLOAD:", JSON.stringify(payload, null, 2));
  localStorage.setItem("mcloud_template_" + Date.now(), JSON.stringify(payload));
  markSaved();
  showToast(`Template "${name}" saved successfully!`, "success");
}

// ═══════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════
function bindKeyboard() {
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (document.getElementById("recoveryOverlay").style.display !== "none"
        && document.getElementById("recoveryOverlay").style.display !== "") return; // don't dismiss recovery
    if (document.getElementById("groupConfigPanel").classList.contains("open")) {
      closeGroupConfigPanel();
      return;
    }
    if (document.getElementById("propPanel").classList.contains("open")) {
      closePropPanel();
      return;
    }
    if (document.getElementById("jsonOverlay").style.display !== "none") {
      document.getElementById("jsonOverlay").style.display = "none";
      return;
    }
    if (document.getElementById("importOverlay").style.display !== "none") {
      closeImportModal();
    }
  });
}
