/**
 * MCloud Mobile Template Card Designer — Recovery / Autosave Module
 * ─────────────────────────────────────────────────────────────────
 * Manages draft autosave to localStorage and recovery on startup.
 * Depends on: state.js, utils.js (showToast)
 */

const DRAFT_SCHEMA_VERSION = 1;
const AUTOSAVE_DEBOUNCE_MS = 1000;

let _autosaveTimer = null;
let _isDirty = false;
let _saveStatus = "clean"; // "clean" | "dirty" | "autosaved" | "saved"
let _lastSavedJSON = "";   // snapshot of last official save for dirty comparison
let _bootComplete = false; // guard: no autosave during startup

// ═══════════════════════════════════════════════════════════
// DRAFT KEY HELPERS
// ═══════════════════════════════════════════════════════════
function getDraftKey() {
  if (_designerMode === "edit") {
    return "mcloud_draft_edit_" + (state.templateId || "unknown") + "_" + (state.formatId || "unknown");
  }
  return "mcloud_draft_add_" + (state.templateId || "unknown");
}

// ═══════════════════════════════════════════════════════════
// DRAFT SAVE
// ═══════════════════════════════════════════════════════════
function buildDraftPayload() {
  return {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    mode: _designerMode,
    templateId: state.templateId,
    formatId: state.formatId,
    updatedAt: new Date().toISOString(),
    state: {
      designerMode: state.designerMode,
      templateName: state.templateName,
      mOnTap: state.mOnTap,
      mOnDoubleTap: state.mOnDoubleTap,
      indicator: { ...state.indicator },
      templateId: state.templateId,
      formatId: state.formatId,
      reportDisplayName: state.reportDisplayName,
      groupFields: state.groupFields.map(gf => ({ ...gf })),
      rows: state.rows.map(row => {
        const r = {
          id           : row.id,
          isExpandedRow: row.isExpandedRow,
          rowStyle     : row.rowStyle    ? { ...row.rowStyle }    : {},
          rowVariant   : row.rowVariant  || "default",
          rhythm       : row.rhythm      || "normal",
          rowType      : row.rowType     || "normal",
          cols: row.cols.map(cell => cell ? { ...cell, style: { ...cell.style } } : null)
        };
        if (row.repeaterConfig) r.repeaterConfig = { ...row.repeaterConfig };
        return r;
      })
    }
  };
}

function saveDraftNow() {
  try {
    const payload = buildDraftPayload();
    localStorage.setItem(getDraftKey(), JSON.stringify(payload));
    _saveStatus = "autosaved";
    updateStatusChip();
  } catch (e) {
    console.warn("Draft autosave failed:", e);
  }
}

function scheduleDraftSave() {
  if (!_bootComplete) return; // don't autosave during startup
  _isDirty = true;
  _saveStatus = "dirty";
  updateStatusChip();
  if (_autosaveTimer) clearTimeout(_autosaveTimer);
  _autosaveTimer = setTimeout(saveDraftNow, AUTOSAVE_DEBOUNCE_MS);
}

function markBootComplete() {
  _bootComplete = true;
}

function saveDraftImmediate() {
  if (_autosaveTimer) clearTimeout(_autosaveTimer);
  _isDirty = true;
  saveDraftNow();
}

// ═══════════════════════════════════════════════════════════
// DRAFT READ / VALIDATE
// ═══════════════════════════════════════════════════════════
function readDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || draft.schemaVersion !== DRAFT_SCHEMA_VERSION) return null;
    if (!draft.state || typeof draft.state !== "object") return null;
    if (!Array.isArray(draft.state.rows)) return null;
    // Skip empty drafts — nothing to recover
    const hasContent = draft.state.rows.length > 0 || (Array.isArray(draft.state.groupFields) && draft.state.groupFields.length > 0);
    if (!hasContent) return null;
    return draft;
  } catch (e) {
    console.warn("Draft read failed:", e);
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(getDraftKey());
  } catch (e) { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════
// DRAFT HYDRATE — restores full state from draft payload
// ═══════════════════════════════════════════════════════════
function hydrateFromDraft(draft) {
  if (!draft || !draft.state) return false;
  const s = draft.state;

  // Validate rows have actual content
  if (!Array.isArray(s.rows)) return false;

  state.designerMode      = (s.designerMode === DESIGNER_MODE_LAYOUT) ? DESIGNER_MODE_LAYOUT : DESIGNER_MODE_FULL;
  state.templateName      = s.templateName || "";
  state.mOnTap            = s.mOnTap || "expand";
  state.mOnDoubleTap      = s.mOnDoubleTap || "";
  state.indicator         = s.indicator ? { isShow: !!s.indicator.isShow, dataField: s.indicator.dataField || "" } : { isShow: false, dataField: "" };
  state.templateId        = s.templateId || DUMMY_TEMPLATE_ID;
  state.formatId          = s.formatId || DUMMY_FORMAT_ID;
  state.reportDisplayName = s.reportDisplayName || DUMMY_TEMPLATE_NAME;
  state.groupFields       = Array.isArray(s.groupFields) ? s.groupFields : [];
  state.rows              = s.rows;

  // Advance _cellCounter and _placeholderCounter past existing IDs to avoid collisions
  state.rows.forEach(row => {
    if (!row.cols) row.cols = [];
    row.cols.forEach(cell => {
      if (!cell) return;
      if (cell.uid) {
        const num = parseInt(cell.uid.replace("c", ""), 10);
        if (!isNaN(num) && num > _cellCounter) _cellCounter = num;
      }
      if (cell.placeholderId) {
        const num = parseInt(cell.placeholderId.replace("ph_", ""), 10);
        if (!isNaN(num) && num > _placeholderCounter) _placeholderCounter = num;
      }
    });
  });

  // Reset transient
  _drillPath = [];
  _expandedCardIdx = -1;
  _paletteStage = state.groupFields.length > 0 ? "group" : "column";
  computeTapValues();

  return true;
}

// ═══════════════════════════════════════════════════════════
// RECOVERY PROMPT — shown at startup if draft exists
// ═══════════════════════════════════════════════════════════
function checkAndPromptRecovery(onComplete) {
  const key = getDraftKey();
  const draft = readDraft(key);

  if (!draft) {
    onComplete(false);
    return;
  }

  // Show recovery modal
  const overlay = document.getElementById("recoveryOverlay");
  const dateEl  = document.getElementById("recoveryDate");
  const modeEl  = document.getElementById("recoveryMode");

  dateEl.textContent = draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : "Unknown";
  modeEl.textContent = (draft.mode === "edit" ? "Edit" : "Add") + " mode";

  overlay.style.display = "flex";

  const restoreBtn = document.getElementById("btnRecoveryRestore");
  const discardBtn = document.getElementById("btnRecoveryDiscard");

  function cleanup() {
    overlay.style.display = "none";
    restoreBtn.removeEventListener("click", handleRestore);
    discardBtn.removeEventListener("click", handleDiscard);
  }

  function handleRestore() {
    cleanup();
    const ok = hydrateFromDraft(draft);
    if (ok) {
      syncUIFromState();
      renderPalette();
      renderAll();
      showToast("Draft restored successfully!", "success");
      _isDirty = true;
      _saveStatus = "dirty";
      updateStatusChip();
    } else {
      showToast("Draft was corrupt. Starting fresh.", "warn");
      clearDraft();
    }
    onComplete(ok);
  }

  function handleDiscard() {
    cleanup();
    clearDraft();
    showToast("Draft discarded.", "success");
    onComplete(false);
  }

  restoreBtn.addEventListener("click", handleRestore);
  discardBtn.addEventListener("click", handleDiscard);
}

// ═══════════════════════════════════════════════════════════
// STATUS CHIP — updates topbar status display
// ═══════════════════════════════════════════════════════════
function updateStatusChip() {
  const chip = document.getElementById("saveStatusChip");
  if (!chip) return;

  if (_saveStatus === "saved") {
    chip.textContent = "Saved";
    chip.className = "status-chip status-saved";
  } else if (_saveStatus === "autosaved") {
    chip.textContent = "Autosaved";
    chip.className = "status-chip status-autosaved";
  } else if (_saveStatus === "dirty") {
    chip.textContent = "Unsaved changes";
    chip.className = "status-chip status-dirty";
  } else {
    chip.textContent = "";
    chip.className = "status-chip";
  }
}

function markSaved() {
  _isDirty = false;
  _saveStatus = "saved";
  _lastSavedJSON = JSON.stringify(generateJSON());
  clearDraft(); // clear recovery draft on official save
  updateStatusChip();
}

function markDirty() {
  _isDirty = true;
  _saveStatus = "dirty";
  updateStatusChip();
  scheduleDraftSave();
}

// ═══════════════════════════════════════════════════════════
// BEFOREUNLOAD — warn on unsaved
// ═══════════════════════════════════════════════════════════
function bindBeforeUnload() {
  window.addEventListener("beforeunload", e => {
    if (_isDirty) {
      // Final autosave attempt
      saveDraftNow();
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

// ═══════════════════════════════════════════════════════════
// SYNC UI — populate UI inputs from current state
// ═══════════════════════════════════════════════════════════
function syncUIFromState() {
  document.getElementById("templateName").value = state.templateName || "";
  document.getElementById("indicatorShow").checked = state.indicator.isShow;
  document.getElementById("indicatorFieldRow").style.display = state.indicator.isShow ? "flex" : "none";
  if (state.indicator.dataField) {
    document.getElementById("indicatorField").value = state.indicator.dataField;
  }
  document.getElementById("displayTemplateId").textContent = state.templateId || "";
  document.getElementById("displayFormatId").textContent = state.formatId || "";
  document.getElementById("displayReportName").textContent = state.reportDisplayName || "";
}
