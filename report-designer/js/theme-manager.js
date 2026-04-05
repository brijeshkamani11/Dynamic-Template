/**
 * MCloud Mobile Template Card Designer — Theme Manager
 * ────────────────────────────────────────────────────
 * Centralized theme switching with localStorage persistence.
 *
 * Architecture:
 * - Themes are defined in css/themes.css as [data-theme="..."] blocks
 * - This module applies/persists the active theme via <html data-theme>
 * - Adding a new theme: (1) add CSS token block, (2) add entry to THEMES array
 *
 * Depends on: nothing (self-contained, loaded before app.js)
 */

/* ── THEME REGISTRY ─────────────────────────────────────────
   Each entry: { id, label, icon }
   id matches the data-theme attribute value in themes.css
   ──────────────────────────────────────────────────────── */
const THEMES = [
  { id: "classic-blue",  label: "Classic Blue",  icon: "◈" },
  { id: "modern-dark",   label: "Modern Dark",   icon: "◉" },
];

const THEME_STORAGE_KEY = "mcloud_designer_theme";
const DEFAULT_THEME     = "classic-blue";

/* ── Core API ───────────────────────────────────────────── */

/** Returns the currently active theme id */
function getTheme() {
  return document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
}

/** Apply a theme by id — updates DOM + persists to localStorage */
function setTheme(themeId) {
  // Validate theme exists in registry
  const valid = THEMES.find(t => t.id === themeId);
  if (!valid) {
    console.warn("[ThemeManager] Unknown theme:", themeId, "— falling back to", DEFAULT_THEME);
    themeId = DEFAULT_THEME;
  }

  document.documentElement.setAttribute("data-theme", themeId);
  localStorage.setItem(THEME_STORAGE_KEY, themeId);

  // Update toggle/dropdown UI if present
  _syncThemeUI(themeId);
}

/** Initialize theme on page load — call once from app.js boot */
function initTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const themeId = saved && THEMES.find(t => t.id === saved) ? saved : DEFAULT_THEME;
  document.documentElement.setAttribute("data-theme", themeId);
  // Don't re-persist on init (already saved or default)
}

/** Cycle to the next theme (for quick toggle) */
function toggleTheme() {
  const current = getTheme();
  const idx = THEMES.findIndex(t => t.id === current);
  const next = THEMES[(idx + 1) % THEMES.length];
  setTheme(next.id);
}

/* ── UI Sync ────────────────────────────────────────────── */

/**
 * Builds the theme switcher controls in the topbar.
 * Called once during bindTopBar() or app boot.
 */
function buildThemeSwitcher() {
  const container = document.getElementById("themeSwitcherWrap");
  if (!container) return;

  const currentTheme = getTheme();
  const currentDef = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  // Single compact toggle button — cycles themes on click
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "theme-toggle-btn";
  toggleBtn.id = "btnThemeToggle";
  toggleBtn.title = currentDef.label + " (click to switch)";
  toggleBtn.innerHTML = '<span id="themeToggleIcon">' + currentDef.icon + '</span>';
  toggleBtn.addEventListener("click", toggleTheme);

  container.appendChild(toggleBtn);
}

/** Sync toggle button title/icon to current theme */
function _syncThemeUI(themeId) {
  const def = THEMES.find(t => t.id === themeId) || THEMES[0];
  const icon = document.getElementById("themeToggleIcon");
  if (icon) icon.textContent = def.icon;
  const btn = document.getElementById("btnThemeToggle");
  if (btn) btn.title = def.label + " (click to switch)";
}
