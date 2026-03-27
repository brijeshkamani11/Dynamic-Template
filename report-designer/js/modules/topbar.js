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
