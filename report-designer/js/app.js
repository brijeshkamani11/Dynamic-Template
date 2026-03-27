/**
 * MCloud Mobile Template Card Designer — Application Entry Point
 * ─────────────────────────────────────────────────────────
 * Boots all modules on DOMContentLoaded.
 */

document.addEventListener("DOMContentLoaded", () => {
  buildFieldPalette();
  buildIndicatorFieldSelect();
  bindFieldSearch();
  bindTopBar();
  bindCanvasToolbar();
  bindCardSettings();
  bindPropPanel();
  bindJSONModal();
  bindImportModal();
  bindPreviewTabs();       // now binds phone back arrow
  bindGroupConfigPanel();
  bindKeyboard();
  computeTapValues();
  renderAll();

  // J) Check for caller-provided startup payload
  // Usage: set window.DESIGNER_INIT = { mode: "edit", json: {...} } before page load
  if (window.DESIGNER_INIT) {
    initDesigner(window.DESIGNER_INIT);
  }
});
