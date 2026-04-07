/**
 * MCloud Mobile Template Card Designer — Application Entry Point
 * ─────────────────────────────────────────────────────────
 * Orchestrates the full boot sequence on DOMContentLoaded:
 *
 *   0. Theme init (visual layer — independent of data)
 *   1. Bind all UI module event listeners (idempotent, no data dependency)
 *   2. Read optional bootstrap payload (DESIGNER_BOOTSTRAP / DESIGNER_INIT)
 *   3. Check localStorage for a recovery draft → prompt user
 *   4. If no draft: use bootstrap.initialJson for edit mode, or start fresh
 *   5. After any path: syncModeUI + markBootComplete to enable autosave
 *
 * Boot-completion guard: markBootComplete() sets _bootComplete=true in recovery.js.
 * Until that flag is set, scheduleDraftSave() is a no-op — preventing autosave
 * from overwriting a draft before the user decides whether to restore it.
 *
 * Depends on: ALL modules (this is the last script loaded).
 * Side effects: DOM event binding, localStorage read, state hydration.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ── 0. Theme (visual only — no data dependency) ──
  initTheme();
  buildThemeSwitcher();

  // ── 1. Bind all UI module listeners ──
  // Order does not matter here; no data flows until bootstrap/recovery below.
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

  // ── 2. Bootstrap payload from host application ──
  // The host page sets window.DESIGNER_BOOTSTRAP before loading the designer.
  // This provides templateId, formatId, workflow mode, and optional initial JSON.
  const bootstrap = window.DESIGNER_BOOTSTRAP || window.DESIGNER_INIT || null;

  if (bootstrap) {
    _designerMode           = bootstrap.mode || "add";   // workflow: "add" or "edit"
    state.templateId        = bootstrap.templateId || state.templateId;
    state.formatId          = bootstrap.formatId || state.formatId;
    state.reportDisplayName = bootstrap.templateName || state.reportDisplayName;
    if (bootstrap.designerMode === DESIGNER_MODE_LAYOUT) {
      state.designerMode = DESIGNER_MODE_LAYOUT;
    }
  }

  // ── 3. Recovery: check for an autosaved draft in localStorage ──
  // checkAndPromptRecovery shows a modal if a draft exists. The callback fires
  // after the user chooses Restore or Discard (or immediately if no draft found).
  checkAndPromptRecovery(function(restored) {
    if (restored) {
      // Draft hydration already called syncUIFromState + renderAll (inside recovery.js).
      // We only need to sync the mode UI and unlock autosave.
      syncModeUI();
      markBootComplete();
      return;
    }

    // ── 4. No draft → try bootstrap edit-mode JSON ──
    if (bootstrap && bootstrap.mode === "edit" && bootstrap.initialJson) {
      const success = hydrateFromJSON(bootstrap.initialJson);
      if (success) {
        syncModeUI();
        syncUIFromState();
        renderPalette();
        renderAll();
        markBootComplete();
        return;
      }
    }

    // ── 5. Default: fresh/empty canvas ──
    syncModeUI();
    syncUIFromState();
    renderAll();
    markBootComplete();
  });
});
