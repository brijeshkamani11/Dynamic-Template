# MCloud Report Template Designer

> **FOR ANY AI MODEL, IDE, OR DEVELOPER READING THIS:**
> 1. **Read [ARCHITECTURE.md](ARCHITECTURE.md) first** — file structure, state model, JSON format, constraints, key functions.
> 2. **Read [CHANGELOG.md](CHANGELOG.md)** — what has changed and why (newest first).
> 3. **Never recreate the entire project.** Core is built. Only modify what is asked.
> 4. **Never change file structure, naming, or architecture** unless explicitly instructed.
> 5. **If a change is small (one function, one style, one field), generate ONLY that changed part.**
> 6. **After every change, append an entry to [CHANGELOG.md](CHANGELOG.md).**
> 7. **If something is unclear, ask before acting.**

---

## What is this?

A web-based visual designer that lets non-technical users create card-layout templates for reports in the MCloud Flutter mobile app. Users drag fields onto a canvas grid, configure styles, and the tool generates a JSON config consumed by Flutter.

**Open:** `report-designer/index.html` via Live Server or any local HTTP server.

**Stack:** Pure HTML5 + CSS3 + Vanilla JS (ES6+). No build step. No frameworks.

---

## Quick links

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full technical reference — state model, JSON structure, file layout, key functions, constraints |
| [CHANGELOG.md](CHANGELOG.md) | All changes by date (newest first) |
| [PROJECT_REVIEW.md](PROJECT_REVIEW.md) | External code review findings (2026-04-03) |

---

## Current branch state (2026-04-03)

**Branch:** `ui-polish` (from `feature/integrate-all-design`)

All four phases complete:
- **Phase 1** — Row style, column span, advanced format library
- **Phase 2** — Row/cell variants, rhythm, presets
- **Phase 3** — Repeater row blocks (line-item lists, transaction lists)
- **Phase 4** — Duplicate row, reset style, visual polish, plain-language errors, expanded format library
- **Review fixes** — Recovery parity, import validation, mock-data guard, row ID suffix, this doc split
