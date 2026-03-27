/**
 * MCloud Mobile Template Card Designer — Shared Utilities
 * ───────────────────────────────────────────────────
 * Functions used by multiple modules.
 */

function renderAll() {
  renderCanvas();
  renderPreview();
  // Trigger debounced autosave on every state render
  if (typeof scheduleDraftSave === "function") scheduleDraftSave();
}

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast show toast-" + type;
  setTimeout(() => toast.className = "toast", 3000);
}

function hexToArgb(hex) {
  const r = hex.slice(1);
  return "0xFF" + r.toUpperCase();
}

function argbToHex(argb) {
  if (!argb || !argb.startsWith("0xFF")) return "#000000";
  return "#" + argb.slice(4).toLowerCase();
}
