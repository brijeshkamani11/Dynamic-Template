/**
 * MCloud Mobile Template Card Designer — Application Entry Point
 * ─────────────────────────────────────────────────────────
 * Boots all modules on DOMContentLoaded.
 * Supports: DESIGNER_BOOTSTRAP payload, draft recovery, add/edit modes.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ── 1. Bind all UI modules ──
  buildFieldPalette();
  buildIndicatorFieldSelect();
  bindFieldSearch();
  bindTopBar();
  bindCanvasToolbar();
  bindCardSettings();
  bindPropPanel();
  bindJSONModal();
  bindImportModal();
  bindPreviewTabs();
  bindGroupConfigPanel();
  bindKeyboard();
  bindBeforeUnload();
  computeTapValues();

  // ── 2. Read bootstrap payload (from caller or global) ──
  const bootstrap = window.DESIGNER_BOOTSTRAP || window.DESIGNER_INIT || null;

  if (bootstrap) {
    _designerMode           = bootstrap.mode || "add";
    state.templateId        = bootstrap.templateId || state.templateId;
    state.formatId          = bootstrap.formatId || state.formatId;
    state.reportDisplayName = bootstrap.templateName || state.reportDisplayName;
  }

  // ── 3. Check for recovery draft ──
  checkAndPromptRecovery(function(restored) {
    if (restored) {
      markBootComplete();
      return;
    }

    // ── 4. No draft restored — handle bootstrap edit mode ──
    if (bootstrap && bootstrap.mode === "edit" && bootstrap.initialJson) {
      const success = hydrateFromJSON(bootstrap.initialJson);
      if (success) {
        syncUIFromState();
        renderPalette();
        renderAll();
        markBootComplete();
        return;
      }
    }

    // ── 5. Default: fresh start ──
    syncUIFromState();
    renderAll();
    markBootComplete();
  });
});
