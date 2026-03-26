/**
 * MCloud Report Template Designer — Application Entry Point
 * ─────────────────────────────────────────────────────────
 * Boots all modules on DOMContentLoaded.
 *
 * Script load order (all via <script> tags in index.html):
 *   1. js/data/field-registry.js  — FIELD_REGISTRY, SAMPLE_DATA, ICON_MAP
 *   2. js/state.js                — state object, constants, globals
 *   3. js/utils.js                — renderAll, showToast, hexToArgb, argbToHex
 *   4. js/modules/palette.js      — buildFieldPalette, buildIndicatorFieldSelect, bindFieldSearch
 *   5. js/modules/canvas.js       — row/cell management, renderCanvas, bindCanvasToolbar
 *   6. js/modules/preview.js      — renderPreview, buildPreviewCard, bindPreviewTabs
 *   7. js/modules/property-panel.js — openPropPanel, closePropPanel, applyPropPanel, bindPropPanel
 *   8. js/modules/json-modal.js   — generateJSON, openJSONModal, bindJSONModal
 *   9. js/modules/topbar.js       — bindTopBar, bindCardSettings, saveTemplate, bindKeyboard
 *  10. js/app.js                  — THIS FILE (boot)
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
  bindPreviewTabs();
  bindKeyboard();
  renderAll();
});
