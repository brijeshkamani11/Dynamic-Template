# Project Review — MCloud Report Template Designer

Date: 2026-04-03
Reviewer: Codex (GPT-5.3-Codex)

## Scope Reviewed
- Project documentation and architecture notes.
- HTML entrypoint and CSS/JS module structure.
- Core runtime flow: boot, state, palette, canvas, property panel, preview, JSON import/export, recovery.

## Executive Summary
The project is well-organized for a pure-vanilla JavaScript SPA and has clear module boundaries for a no-build setup. The design workflow (Group Fields → Display Columns → Preview → JSON) is coherent and already includes advanced capabilities such as drill-down levels, autosave recovery, and import-from-library.

Most issues are not foundational; they are correctness and maintainability gaps that can be fixed incrementally. The top priority is consistency between documentation/spec and runtime behavior, plus strengthening validation and recovery completeness.

## What’s Working Well
1. **Clear modular structure for no-framework architecture**
   - Distinct modules for palette, canvas, preview, JSON, topbar, and recovery.
   - App bootstrap cleanly orchestrates bindings and startup modes.
2. **State-first rendering pattern**
   - Shared `state` object and central `renderAll()` reduce accidental UI divergence.
3. **Good UX foundations**
   - Draft autosave + restore, keyboard escape handling, and toast feedback improve resilience.
4. **JSON generation is intentionally sparse/default-aware**
   - Omits default values to keep payload compact.

## Key Findings (Prioritized)

### High Priority
1. **Recovery payload drops newer row-level properties**
   - `buildDraftPayload()` currently persists only `{ id, isExpandedRow, cols }` per row.
   - Runtime rows also include `rowStyle`, `rowVariant`, `rhythm`, `rowType`, and optional `repeaterConfig`; these can be lost after restore.
   - Recommendation: persist all row-level properties used by `generateJSON()` and preview rendering.

2. **Spec/document mismatch on supported columns per row**
   - Runtime allows up to `MAX_COLS = 5`.
   - README JSON rules still state `col` is 1-indexed with values 1/2/3.
   - Recommendation: either reduce runtime to 3 or update spec/docs and any downstream consumer assumptions.

### Medium Priority
3. **Global coupling + strict script order dependency**
   - Modules rely on globals and implicit load order from `index.html`.
   - This is workable for current scale, but fragility grows as features increase.
   - Recommendation: add lightweight namespace/module wrapper or explicit dependency checks for critical globals.

4. **Import validation is structural but shallow**
   - Import checks basic object shape and `dataField` presence but does not validate enums/ranges (e.g., `textAlign`, `colSpan`, `levelVisibility` values, `rowType`, etc.).
   - Recommendation: add strict schema checks before hydrate to prevent invalid state entering editor.

5. **Mock data assumptions are hardcoded**
   - Drill records default to `MOCK_GROUPED_DATA["R0001F0002"]` base records.
   - Recommendation: add guard/fallback path if this key is absent to avoid runtime break in future field registry changes.

### Low Priority
6. **ID generation collision risk (low but real)**
   - Row IDs use `"row_" + Date.now()` in some creation paths.
   - Recommendation: append random suffix consistently (as already done in hydrate path) for collision-proof IDs.

7. **Documentation drift risk due large README journal**
   - README includes architecture + long changelog; easy to desync operational rules.
   - Recommendation: split into `ARCHITECTURE.md` + `CHANGELOG.md` when feasible.

## Suggested Action Plan
1. Patch recovery serialization/deserialization parity for all row fields.
2. Align column-count rules between runtime and docs/consumer contract.
3. Add stricter import schema validation for known enums and numeric limits.
4. Add defensive checks around mock-data base record assumptions.
5. Consider gradual reduction of global coupling (optional, not urgent).

## Quick Health Checks Executed
- JavaScript syntax checks passed across all `report-designer/js/**/*.js` files.

